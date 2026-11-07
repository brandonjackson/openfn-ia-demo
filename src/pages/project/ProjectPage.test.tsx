import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { WorkflowListItem } from "../../model/workflow-list";
import { renderPage } from "../../test/renderPage";
import ProjectPage, { type ProjectPageData, type ProjectPageProps } from "./ProjectPage";

const workflow = (name: string): WorkflowListItem => ({
  id: name,
  name,
  type: "Workflow",
  updatedAt: "2026-10-01T09:00:00Z",
  enabled: true,
  workOrders: 0,
  failedWorkOrders: 0,
});

const frame: Omit<ProjectPageProps, "data" | "onNewWorkflow"> = {
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

const draw = (d: ProjectPageData) => renderPage(ProjectPage, { ...frame, data: d }, ["onNewWorkflow"]);

describe("ProjectPage", () => {
  it("shows the project's numbers and its first five workflows, linking to the rest", () => {
    draw(data({ workflows: ["A", "B", "C", "D", "E", "F"].map(workflow) }));
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("6 workflows in this project.")).toBeTruthy();
    expect(screen.getByText("E")).toBeTruthy();
    expect(screen.queryByText("F")).toBeNull();
    expect(screen.getAllByRole("link", { name: "View all" })[0]!.getAttribute("href")).toBe("/projects/p/workflows");
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
    expect(screen.queryByText("Published services")).toBeNull();
    expect(screen.queryByText("Components")).toBeNull();
  });
});
