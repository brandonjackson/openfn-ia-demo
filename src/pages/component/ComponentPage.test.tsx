import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ProjectComponentItem } from "../../model/component-types";
import { FormError } from "../../model/form-error";
import { renderPage } from "../../test/renderPage";
import ComponentPage, { type ComponentPageData, type ComponentPageProps } from "./ComponentPage";

const document: ProjectComponentItem = { id: "runbook", name: "Runbook", description: "What to do when intake stops.", type: "Document" };
const collection: ProjectComponentItem = { id: "ward-codes", name: "ward-codes", description: "2 keys", type: "Collection" };

const frame: Omit<ComponentPageProps, "data" | `on${string}`> = {
  node: { id: "component", label: "Component" },
  ancestors: [],
  currentPath: "/projects/p/components/c",
  takenNames: [],
};

const documentData: ComponentPageData = {
  projectId: "p",
  component: document,
  content: { content: "# Runbook\n\nRestart the intake.", updatedAt: "3 hours ago" },
};
const collectionData: ComponentPageData = {
  projectId: "p",
  component: collection,
  collection: {
    items: [
      { key: "W01", value: "\"North ward\"", updatedAt: "2 days ago" },
      { key: "W02", value: "\"South ward\"", updatedAt: "2 days ago" },
    ],
    itemCount: 2,
    byteSize: 40,
  },
};

const all = ["onSaveContent", "onEditDetails", "onRenameCollection", "onSaveItem", "onDeleteItem", "onDelete"] as const;
const draw = (data: ComponentPageData, actions: readonly (typeof all)[number][] = all) => renderPage(ComponentPage, { ...frame, data }, [...actions]);

const openMenu = (name: string) => fireEvent.click(screen.getByRole("button", { name: `Actions for ${name}` }));

describe("ComponentPage", () => {
  it("draws a document with its kind, description and file", () => {
    draw(documentData);
    expect(screen.getByRole("heading", { name: "Runbook" })).toBeTruthy();
    expect(screen.getAllByText("Document").length).toBeGreaterThan(0);
    expect(screen.getAllByText("What to do when intake stops.").length).toBeGreaterThan(0);
  });

  it("deletes a document once confirmed, and takes a refusal quietly (the wrapper says why)", async () => {
    const host = draw(documentData);
    openMenu("Runbook");
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete document" }));
    expect(host.calls("onDelete")).toHaveLength(1);
    await host.reject("onDelete", new FormError("You can't delete components in this project."));
    expect(screen.getByRole("heading", { name: "Runbook" })).toBeTruthy();
  });

  it("lists a collection's keys, and asks for its name before deleting it", () => {
    const host = draw(collectionData);
    expect(screen.getByText("W01")).toBeTruthy();
    expect(screen.getByText("W02")).toBeTruthy();
    openMenu("ward-codes");
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete collection" }));
    expect(host.calls("onDelete")).toHaveLength(0);
    fireEvent.change(screen.getByLabelText("Type ward-codes to confirm"), { target: { value: "ward-codes" } });
    fireEvent.click(screen.getByRole("button", { name: "Delete collection" }));
    expect(host.calls("onDelete")).toHaveLength(1);
  });

  it("offers a reader no menu", () => {
    draw(documentData, []);
    expect(screen.queryByRole("button", { name: "Actions for Runbook" })).toBeNull();
  });
});
