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

const frame: Omit<ProjectWorkflowsPageProps, "data" | "onNewWorkflow" | "onToggleWorkflow" | "onCopyWorkflow" | "onDeleteWorkflow"> = {
  node: { id: "workflows", label: "Workflows", description: "Every workflow in this project." },
  ancestors: [],
  currentPath: "/projects/p/workflows",
};

const draw = (workflows: WorkflowListItem[]) =>
  renderPage(ProjectWorkflowsPage, { ...frame, data: { projectId: "p", workflows } }, ["onNewWorkflow", "onToggleWorkflow", "onCopyWorkflow", "onDeleteWorkflow"]);

/** A workflow's row, found by its name. */
const row = (name: string) => screen.getByText(name).closest("a")!.parentElement!;

function askToDelete(name: string) {
  fireEvent.click(within(row(name)).getByRole("button", { name: `Actions for ${name}` }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
  fireEvent.click(screen.getByRole("button", { name: "Delete workflow" }));
}

describe("ProjectWorkflowsPage", () => {
  it("lists the workflows it's given and narrows them by name as you search", () => {
    draw([workflow("Intake"), workflow("Payroll")]);
    expect(screen.getByText("Intake")).toBeTruthy();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search workflows" }), { target: { value: "pay" } });
    expect(screen.getByText("Payroll")).toBeTruthy();
    expect(screen.queryByText("Intake")).toBeNull();
  });

  it("draws a row as the API sends it, with no description or members", () => {
    draw([workflow("Intake")]);
    expect(screen.queryByText("Members")).toBeNull();
    expect(screen.getByText("Never run")).toBeTruthy();
  });

  it("shows members when it's given them", () => {
    draw([workflow("Intake", { members: ["Jane Doe"] })]);
    expect(screen.getByText("Members")).toBeTruthy();
  });

  it("files workflows under Published services, Live workflows and Paused workflows, leaving out empty sections", () => {
    draw([workflow("Intake", { published: true }), workflow("Payroll"), workflow("Archive", { enabled: false })]);
    const section = (title: string) => screen.getByRole("region", { name: title });
    expect(within(section("Published services")).getByText("Intake")).toBeTruthy();
    expect(within(section("Live workflows")).getByText("Payroll")).toBeTruthy();
    expect(within(section("Paused workflows")).getByText("Archive")).toBeTruthy();
  });

  it("leaves out a section with nothing in it", () => {
    draw([workflow("Intake")]);
    expect(screen.getByRole("region", { name: "Live workflows" })).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Published services" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Paused workflows" })).toBeNull();
  });

  it("pills a workflow Live when its switch is on, and Paused (in grey) when it's off", () => {
    draw([workflow("Intake"), workflow("Archive", { enabled: false })]);
    expect(within(row("Intake")).getByText("Live")).toBeTruthy();
    expect(within(row("Intake")).queryByText("Paused")).toBeNull();
    const paused = within(row("Archive")).getByText("Paused");
    expect(paused.getAttribute("data-tone")).toBe("gray");
    expect(within(row("Archive")).queryByText("Off")).toBeNull();
  });

  it("makes a copy from a row's menu, ignoring a second press while it runs", async () => {
    const host = draw([workflow("Intake")]);
    const copy = () => {
      fireEvent.click(within(row("Intake")).getByRole("button", { name: "Actions for Intake" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Make a copy" }));
    };
    copy();
    copy();
    expect(host.calls("onCopyWorkflow")).toEqual([["Intake"]]);
    await host.resolve("onCopyWorkflow");
    copy();
    expect(host.calls("onCopyWorkflow")).toHaveLength(2);
    await host.reject("onCopyWorkflow", new FormError("Only an editor can copy workflows."));
    expect(screen.getByText("Intake")).toBeTruthy();
  });

  it("offers to create the first workflow when there are none", () => {
    const host = draw([]);
    fireEvent.click(screen.getByRole("button", { name: "Create one" }));
    expect(host.calls("onNewWorkflow")).toHaveLength(1);
  });

  it("asks to turn a workflow off, and takes a refusal quietly (the wrapper says why)", async () => {
    const host = draw([workflow("Intake")]);
    fireEvent.click(screen.getByRole("switch", { name: "Intake enabled" }));
    expect(host.calls("onToggleWorkflow")).toEqual([["Intake", false]]);
    await host.reject("onToggleWorkflow", new FormError("You can't change workflows in this project."));
    expect(screen.getByRole("switch", { name: "Intake enabled" })).toBeTruthy();
  });

  it("deletes a workflow once confirmed, saying so while it runs", async () => {
    const host = draw([workflow("Intake")]);
    askToDelete("Intake");
    expect(host.calls("onDeleteWorkflow")).toEqual([["Intake"]]);
    expect(screen.getByRole("button", { name: "Deleting…" })).toBeTruthy();
    await host.resolve("onDeleteWorkflow");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes the confirmation when the server refuses a delete (the wrapper says why)", async () => {
    const host = draw([workflow("Intake")]);
    askToDelete("Intake");
    await host.reject("onDeleteWorkflow", new FormError("Only an editor can delete workflows."));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("Intake")).toBeTruthy();
  });

  it("leaves out the switch, Make a copy and Delete when the viewer can't use them", () => {
    renderPage(ProjectWorkflowsPage, { ...frame, data: { projectId: "p", workflows: [workflow("Intake")] } }, ["onNewWorkflow"]);
    expect(screen.queryByRole("switch")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Actions for Intake" }));
    expect(screen.getByRole("menuitem", { name: "Open" })).toBeTruthy();
    expect(screen.queryByRole("menuitem", { name: "Delete" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Make a copy" })).toBeNull();
  });
});
