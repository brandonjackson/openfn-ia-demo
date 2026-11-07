import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormError } from "../../model/form-error";
import type { WorkflowListItem } from "../../model/workflow-list";
import { renderPage } from "../../test/renderPage";
import ProjectWorkflowsPage, { type ProjectWorkflowsPageProps } from "./ProjectWorkflowsPage";

const workflow = (name: string, more: Partial<WorkflowListItem> = {}): WorkflowListItem => ({
  id: name,
  name,
  type: "Workflow",
  updatedAt: "2026-10-01T09:00:00Z",
  enabled: true,
  triggerType: "webhook",
  workOrders: 0,
  failedWorkOrders: 0,
  ...more,
});

const frame: Omit<ProjectWorkflowsPageProps, "data" | "onNewWorkflow" | "onToggleWorkflow" | "onDeleteWorkflow"> = {
  node: { id: "workflows", label: "Workflows", description: "Every workflow in this project." },
  ancestors: [],
  currentPath: "/projects/p/workflows",
};

const draw = (workflows: WorkflowListItem[]) =>
  renderPage(ProjectWorkflowsPage, { ...frame, data: { projectId: "p", workflows } }, ["onNewWorkflow", "onToggleWorkflow", "onDeleteWorkflow"]);

/** A workflow's row, found by its name. */
const row = (name: string) => screen.getByText(name).closest("a")!.parentElement!;

function askToDelete(name: string) {
  fireEvent.click(within(row(name)).getByRole("button", { name: `Actions for ${name}` }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
  fireEvent.click(screen.getByRole("button", { name: "Delete workflow" }));
}

describe("ProjectWorkflowsPage", () => {
  it("counts the workflows it's given and narrows them by name as you search", () => {
    draw([workflow("Intake"), workflow("Payroll")]);
    expect(screen.getByText("2 workflows")).toBeTruthy();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search workflows" }), { target: { value: "pay" } });
    expect(screen.getByText("1 of 2 workflows")).toBeTruthy();
    expect(screen.queryByText("Intake")).toBeNull();
  });

  it("draws a row as the API sends it, with no description or members", () => {
    draw([workflow("Intake")]);
    expect(screen.queryByText("Members")).toBeNull();
    expect(screen.getByText("Never run")).toBeTruthy();
  });

  it("shows members and a service's status when it's given them", () => {
    draw([workflow("Intake", { members: ["Jane Doe"], serviceStatus: "Live" })]);
    expect(screen.getByText("Members")).toBeTruthy();
    expect(screen.getByText("Live")).toBeTruthy();
  });

  it("offers to create the first workflow when there are none", () => {
    const host = draw([]);
    fireEvent.click(screen.getByRole("button", { name: "Create one" }));
    expect(host.calls("onNewWorkflow")).toHaveLength(1);
  });

  it("asks to turn a workflow off, and says so when the server refuses", async () => {
    const host = draw([workflow("Intake")]);
    fireEvent.click(screen.getByRole("switch", { name: "Intake enabled" }));
    expect(host.calls("onToggleWorkflow")).toEqual([["Intake", false]]);
    await host.reject("onToggleWorkflow", new FormError("You can't change workflows in this project."));
    expect(screen.getByRole("alert").textContent).toContain("You can't change workflows in this project.");
  });

  it("deletes a workflow once confirmed, saying so while it runs and once it's done", async () => {
    const host = draw([workflow("Intake")]);
    askToDelete("Intake");
    expect(host.calls("onDeleteWorkflow")).toEqual([["Intake"]]);
    expect(screen.getByRole("button", { name: "Deleting…" })).toBeTruthy();
    await host.resolve("onDeleteWorkflow");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText('"Intake" deleted')).toBeTruthy();
  });

  it("says why when the server refuses a delete", async () => {
    const host = draw([workflow("Intake")]);
    askToDelete("Intake");
    await host.reject("onDeleteWorkflow", new FormError("Only an editor can delete workflows."));
    expect(screen.getByRole("alert").textContent).toContain("Only an editor can delete workflows.");
  });

  it("leaves out the switch and menu when the viewer can't use them", () => {
    renderPage(ProjectWorkflowsPage, { ...frame, data: { projectId: "p", workflows: [workflow("Intake")] } }, ["onNewWorkflow"]);
    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.queryByRole("button", { name: "Actions for Intake" })).toBeNull();
  });
});
