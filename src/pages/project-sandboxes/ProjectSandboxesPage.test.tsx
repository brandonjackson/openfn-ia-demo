import { fireEvent, screen, within } from "@testing-library/react";
import { FormError } from "../../model/form-error";
import { describe, expect, it } from "vitest";
import type { SandboxItem } from "../../model/sandboxes";
import { renderPage } from "../../test/renderPage";
import ProjectSandboxesPage, { type ProjectSandboxesPageProps } from "./ProjectSandboxesPage";

const sandbox = (name: string, over: Partial<SandboxItem> = {}): SandboxItem => ({
  name,
  isMain: false,
  createdBy: "Amina Diallo",
  lastActivity: new Date().toISOString(),
  env: "staging",
  parent: "main",
  changes: [],
  ...over,
});

const main = sandbox("main", { isMain: true, parent: undefined, env: "production" });
const sandboxes = [
  main,
  sandbox("intake-v2", {
    changes: [
      { kind: "changed", summary: "Changed the workflow Intake" },
      { kind: "added", summary: "Added collection applicants" },
    ],
  }),
  sandbox("dedup"),
];

const actions = ["onSelectSandbox", "onCreateSandbox", "onEditSandbox", "onPromoteSandbox", "onDeleteSandbox"] satisfies (keyof ProjectSandboxesPageProps)[];

const draw = (selectedSandbox = "main") =>
  renderPage(
    ProjectSandboxesPage,
    { node: { id: "sandboxes", label: "Sandboxes" }, ancestors: [], currentPath: "/projects/p1/sandboxes", data: { sandboxes }, selectedSandbox },
    actions,
  );

const section = (title: string) => screen.getByRole("region", { name: title });

describe("ProjectSandboxesPage", () => {
  it("puts the selected sandbox on its own at the top, the rest below, with what each has changed", () => {
    draw("intake-v2");
    expect(within(section("Selected")).getByText("intake-v2")).toBeTruthy();
    expect(within(section("Selected")).getByText("2 changes")).toBeTruthy();
    expect(within(section("Active")).getByText("main")).toBeTruthy();
    expect(within(section("Active")).getByText("dedup")).toBeTruthy();
  });

  it("switches to a sandbox from its row or its Switch, which the one you're in doesn't have", () => {
    const host = draw("intake-v2");
    fireEvent.click(screen.getByText("dedup"));
    fireEvent.click(screen.getByRole("button", { name: "Switch to main" }));
    expect(host.calls("onSelectSandbox")).toEqual([["dedup"], ["main"]]);
    expect(screen.queryByRole("button", { name: "Switch to intake-v2" })).toBeNull();
  });

  it("offers main nothing but Open, and never deleting the sandbox you're in", () => {
    draw("intake-v2");
    fireEvent.click(screen.getByRole("button", { name: "Actions for main" }));
    expect(screen.getAllByRole("menuitem").map((m) => m.textContent)).toEqual(["Open"]);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Actions for intake-v2" }));
    expect(screen.queryByRole("menuitem", { name: "Delete" })).toBeNull();
  });

  it("makes a sandbox from the one you're in, in the environment picked, then closes the form", async () => {
    const host = draw("intake-v2");
    fireEvent.click(screen.getByRole("button", { name: "New sandbox" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Try a fix" } });
    fireEvent.change(screen.getByLabelText("Environment"), { target: { value: "mock" } });
    fireEvent.click(screen.getByRole("button", { name: "Create sandbox" }));
    expect(host.calls("onCreateSandbox")[0]![0]).toMatchObject({ name: "Try a fix", env: "mock", parent: "intake-v2" });
    expect(screen.getByRole("button", { name: "Creating…" }).getAttribute("aria-disabled")).toBe("true");
    await host.resolve("onCreateSandbox");
    expect(screen.queryByRole("button", { name: "Create sandbox" })).toBeNull();
  });

  it("says what's missing under the name rather than disabling Create, and a name already taken", () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "New sandbox" }));
    fireEvent.click(screen.getByRole("button", { name: "Create sandbox" }));
    expect(screen.getByText("Give the sandbox a name.")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Intake v2" } });
    fireEvent.click(screen.getByRole("button", { name: "Create sandbox" }));
    expect(screen.getByText("There's already a sandbox called intake-v2.")).toBeTruthy();
    expect(host.calls("onCreateSandbox")).toEqual([]);
  });

  it("shows a refused name under the field and keeps the form open", async () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "New sandbox" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Try a fix" } });
    fireEvent.click(screen.getByRole("button", { name: "Create sandbox" }));
    await host.reject("onCreateSandbox", new FormError("Invalid", { name: ["has already been taken"] }));
    expect(screen.getByText("has already been taken")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create sandbox" })).toBeTruthy();
  });

  it("edits a sandbox's name and environment", async () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "Actions for dedup" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect((screen.getByLabelText("Environment") as HTMLSelectElement).value).toBe("staging");
    fireEvent.change(screen.getByLabelText("Environment"), { target: { value: "production" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(host.calls("onEditSandbox")[0]).toEqual(["dedup", expect.objectContaining({ name: "dedup", env: "production" })]);
    await host.resolve("onEditSandbox");
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });

  it("promotes a sandbox with changes through the promotion request, and offers it only where there are changes", async () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "Actions for dedup" }));
    expect(screen.queryByRole("menuitem", { name: "Promote" })).toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Actions for intake-v2" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Promote" }));
    expect(screen.getByText("Added collection applicants")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Promote to main" }));
    expect(screen.getByText("Say what changed")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("What changed?"), { target: { value: "Stricter intake" } });
    fireEvent.click(screen.getByRole("button", { name: "Promote to main" }));
    expect(host.calls("onPromoteSandbox")).toEqual([["intake-v2", "Stricter intake"]]);
    await host.reject("onPromoteSandbox", new FormError("Main has changed since."));
    expect(screen.getByText("Main has changed since.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Promote to main" }));
    await host.resolve("onPromoteSandbox");
    expect(screen.queryByRole("button", { name: "Promote to main" })).toBeNull();
  });

  it("deletes a sandbox once it's confirmed", async () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "Actions for dedup" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete sandbox" }));
    expect(host.calls("onDeleteSandbox")).toEqual([["dedup"]]);
    await host.resolve("onDeleteSandbox");
    expect(screen.queryByRole("button", { name: "Delete sandbox" })).toBeNull();
  });

  it("keeps the sandbox when a delete is refused (the wrapper says why)", async () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "Actions for dedup" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete sandbox" }));
    await host.reject("onDeleteSandbox", new FormError("You can't delete a sandbox you didn't make."));
    expect(screen.getByText("dedup")).toBeTruthy();
  });
});
