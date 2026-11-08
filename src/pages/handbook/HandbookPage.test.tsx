import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormError } from "../../model/form-error";
import { renderPage } from "../../test/renderPage";
import HandbookPage, { type HandbookPageData, type HandbookPageProps } from "./HandbookPage";

const data: HandbookPageData = {
  updatedAt: "2 Oct 2026",
  updatedBy: "Amina Diallo",
  sections: [{ id: "who-we-are", title: "Who we are", blocks: [{ type: "paragraph", content: ["The Ministry of Health's data team."] }] }],
  files: [{ id: "f1", name: "Data sharing agreement.pdf", kind: "pdf", size: "240 KB", bytes: 245760, addedBy: "Amina Diallo", addedAt: "Yesterday" }],
  capacityBytes: 10_000_000,
};

const actions = ["onSaveArticle", "onUploadFiles", "onRemoveFile"] satisfies (keyof HandbookPageProps)[];

const frame = {
  node: { id: "handbook", label: "Handbook", pageType: "handbook" as const },
  ancestors: [],
  currentPath: "/handbook",
  data,
};

const draw = () => renderPage(HandbookPage, frame, actions);

function edit(markdown: string) {
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  fireEvent.change(screen.getByLabelText("Article"), { target: { value: markdown } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
}

describe("HandbookPage", () => {
  it("shows the article and its files", () => {
    draw();
    expect(screen.getByText("Who we are")).toBeTruthy();
    expect(screen.getByText("Data sharing agreement.pdf")).toBeTruthy();
  });

  it("says when nothing's been written yet, and not who last edited it", () => {
    renderPage(HandbookPage, { ...frame, data: { ...data, sections: [], updatedAt: undefined, updatedBy: undefined } }, actions);
    expect(screen.getByText("Nothing written yet")).toBeTruthy();
    expect(screen.queryByText(/Last edited/)).toBeNull();
  });

  it("saves the edited article as sections, waits while it's saved, then goes back to reading", async () => {
    const host = draw();
    edit("## Who we are\n\nA new first line.");
    expect(host.calls("onSaveArticle")).toEqual([[[{ id: "who-we-are", title: "Who we are", blocks: [{ type: "paragraph", content: ["A new first line."] }] }]]]);
    expect(screen.getByRole("button", { name: "Saving…" }).getAttribute("aria-disabled")).toBe("true");
    await host.resolve("onSaveArticle");
    expect(screen.queryByLabelText("Article")).toBeNull();
  });

  it("keeps the editor open with the server's reason when it refuses the article", async () => {
    const host = draw();
    edit("## Who we are\n\nOne.\n\n## Who we are\n\nTwo.");
    await host.reject("onSaveArticle", new FormError("The article could not be saved.", { sections: ["has a heading used twice"] }));
    expect(screen.getByText("That didn't save")).toBeTruthy();
    expect(screen.getByText(/has a heading used twice/)).toBeTruthy();
    expect(screen.getByLabelText("Article")).toBeTruthy();
  });

  it("uploads the files dropped on it, and says why when the server refuses one", async () => {
    const host = draw();
    const file = new File(["x"], "Contacts.csv", { type: "text/csv" });
    fireEvent.change(document.querySelector("input[type=file]")!, { target: { files: [file] } });
    expect(host.calls("onUploadFiles")).toEqual([[[file]]]);
    await host.reject("onUploadFiles", new FormError("The file could not be added.", { name: ["is already in the handbook"] }));
    expect(screen.getByText("That didn't save")).toBeTruthy();
    expect(screen.getByText(/is already in the handbook/)).toBeTruthy();
  });

  it("removes a file", async () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "Remove Data sharing agreement.pdf" }));
    expect(host.calls("onRemoveFile")).toEqual([["f1"]]);
    await host.resolve("onRemoveFile");
    expect(screen.queryByText("That didn't save")).toBeNull();
  });

  it("reads only, with no Edit, when it's given no actions", () => {
    renderPage(HandbookPage, frame, []);
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Remove Data sharing agreement.pdf" })).toBeNull();
    expect(document.querySelector("input[type=file]")).toBeNull();
  });
});
