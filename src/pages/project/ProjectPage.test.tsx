import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { WorkflowListItem } from "../../model/workflow-list";
import { renderPage } from "../../test/renderPage";
import ProjectPage, { type ProjectPageData, type ProjectPageProps } from "./ProjectPage";

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

const frame: Omit<ProjectPageProps, "data" | "onNewWorkflow" | "onToggleWorkflow" | "onCopyWorkflow" | "onDeleteWorkflow"> = {
  node: { id: "p", label: "planning-intake", description: "Applications from the portal" },
  ancestors: [],
  currentPath: "/projects/p",
};

const data = (more: Partial<ProjectPageData> = {}): ProjectPageData => ({
  projectId: "p",
  tiles: [{ label: "Work orders", value: "12", detail: "Received in the last 30 days" }],
  workflows: [],
  ...more,
});

const draw = (d: ProjectPageData) => renderPage(ProjectPage, { ...frame, data: d }, ["onNewWorkflow", "onToggleWorkflow", "onCopyWorkflow", "onDeleteWorkflow"]);

describe("ProjectPage", () => {
  it("shows the project's numbers and its workflows, linking to the Workflows page", () => {
    draw(data({ workflows: ["A", "B", "C", "D", "E", "F"].map((n) => workflow(n)) }));
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("6 workflows in this project.")).toBeTruthy();
    expect(screen.getByText("F")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: "View all" })[0]!.getAttribute("href")).toBe("/projects/p/workflows");
  });

  it("lists the workflows as the Workflows page does: in sections, with Live and Paused pills", () => {
    draw(data({ workflows: [workflow("Intake", { published: true }), workflow("Payroll"), workflow("Archive", { enabled: false })] }));
    expect(within(screen.getByRole("region", { name: "Published services" })).getByText("Intake")).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Live workflows" })).getByText("Live")).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Paused workflows" })).getByText("Paused")).toBeTruthy();
  });

  it("makes a copy and flips a switch from the Overview's rows", async () => {
    const host = draw(data({ workflows: [workflow("Intake")] }));
    fireEvent.click(screen.getByRole("button", { name: "Actions for Intake" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Make a copy" }));
    expect(host.calls("onCopyWorkflow")).toEqual([["Intake"]]);
    await host.resolve("onCopyWorkflow");
    fireEvent.click(screen.getByRole("switch", { name: "Intake enabled" }));
    expect(host.calls("onToggleWorkflow")).toEqual([["Intake", false]]);
  });

  it("offers to create the first workflow when there are none", () => {
    const host = draw(data());
    fireEvent.click(screen.getByRole("button", { name: "Create one" }));
    expect(host.calls("onNewWorkflow")).toHaveLength(1);
  });

  it("lists services and components when it's given them, saying so when there are none", () => {
    draw(data({ services: [], components: [{ id: "c", name: "patients", description: "3 keys", type: "Collection" }] }));
    expect(screen.getByText("No published services yet")).toBeTruthy();
    expect(screen.getByText("1 building block in this project.")).toBeTruthy();
    expect(screen.getByText("patients")).toBeTruthy();
  });

  it("leaves out services and components when it isn't given them", () => {
    draw(data());
    expect(screen.queryByText("Service listings")).toBeNull();
    expect(screen.queryByText("Components")).toBeNull();
  });
});
