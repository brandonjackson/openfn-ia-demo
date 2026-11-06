import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormError } from "../../model/form-error";
import type { ProjectSummary } from "../../model/projects";
import { renderPage } from "../../test/renderPage";
import ProjectsPage, { type ProjectsPageProps } from "./ProjectsPage";

const project = (name: string, description = ""): ProjectSummary => ({
  id: name,
  name,
  description,
  environment: "main",
  lastActivity: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  memberCount: 3,
  workflowCount: 2,
});

const frame: Omit<ProjectsPageProps, "data" | "onCreateProject"> = {
  node: { id: "projects", label: "Projects", description: "Every integration project in your organization." },
  ancestors: [],
  currentPath: "/projects",
};

const draw = (projects: ProjectSummary[]) => renderPage(ProjectsPage, { ...frame, data: { projects } }, ["onCreateProject"]);

function fillInAndCreate(name: string) {
  fireEvent.click(screen.getAllByRole("button", { name: "New project" })[0]!);
  fireEvent.change(screen.getByLabelText(/^Project name/), { target: { value: name } });
  fireEvent.click(screen.getByRole("button", { name: "Create project" }));
}

describe("ProjectsPage", () => {
  it("lists every project it's given, and narrows them by name or description as you search", () => {
    draw([project("planning-intake", "Applications from the portal"), project("payroll", "Monthly runs")]);
    expect(screen.getByText("2 projects")).toBeTruthy();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search projects" }), { target: { value: "portal" } });
    expect(screen.getByText("1 project")).toBeTruthy();
    expect(screen.getByText("planning-intake")).toBeTruthy();
    expect(screen.queryByText("payroll")).toBeNull();
  });

  it("says how long ago each project was active, or that it hasn't been", () => {
    draw([project("payroll"), { ...project("planning-intake"), lastActivity: null }]);
    expect(screen.getByText("Active 2 days ago")).toBeTruthy();
    expect(screen.getByText("No activity yet")).toBeTruthy();
  });

  it("says when a search matches nothing", () => {
    draw([project("payroll")]);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search projects" }), { target: { value: "zebra" } });
    expect(screen.getByText('No projects match "zebra"')).toBeTruthy();
  });

  it("offers to create the first project when there are none", () => {
    draw([]);
    expect(screen.getByText("No projects yet")).toBeTruthy();
    expect(screen.getByText("Create a project to start building workflows.")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "New project" })).toHaveLength(2);
  });

  it("asks to create the project under its URL-safe name, waits while it's created, then closes the form", async () => {
    const host = draw([]);
    fillInAndCreate("Planning Intake");
    expect(host.calls("onCreateProject")).toEqual([[{ name: "planning-intake", environment: "main", description: "" }]]);
    expect(screen.getByRole("button", { name: "Creating…" })).toBeTruthy();
    await host.resolve("onCreateProject");
    expect(screen.queryByLabelText("Project name")).toBeNull();
  });

  it("says a name is needed, under the field and focused, when Create is pressed without one", () => {
    const host = draw([]);
    fireEvent.click(screen.getAllByRole("button", { name: "New project" })[0]!);
    const create = screen.getByRole("button", { name: "Create project" }) as HTMLButtonElement;
    expect(create.disabled).toBe(false);
    fireEvent.click(create);
    expect(host.calls("onCreateProject")).toEqual([]);
    expect(screen.getByRole("alert").textContent).toBe("Enter a project name");
    expect(document.activeElement).toBe(screen.getByLabelText(/^Project name/));
  });

  it("keeps Tab inside the form both ways, closes on Escape, and gives focus back to New project", () => {
    draw([]);
    const opener = screen.getAllByRole("button", { name: "New project" })[0]!;
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Create project" });
    expect(document.activeElement).toBe(screen.getByLabelText(/^Project name/));
    screen.getByRole("button", { name: "Create project" }).focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close" }));
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Create project" }));
    expect(dialog.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("keeps the form open with the server's reason under the field it names when the create is refused", async () => {
    const host = draw([]);
    fillInAndCreate("payroll");
    await host.reject("onCreateProject", new FormError("The project wasn't valid.", { name: ["has already been taken"] }));
    expect(screen.getByRole("alert").textContent).toBe("has already been taken");
    expect(screen.getByLabelText(/^Project name/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create project" })).toBeTruthy();
  });

  it("shows a refusal that names no field above the form's buttons", async () => {
    const host = draw([]);
    fillInAndCreate("payroll");
    await host.reject("onCreateProject", new FormError("You can't create projects on this instance."));
    expect(screen.getByText("The project wasn't created")).toBeTruthy();
    expect(screen.getByText("You can't create projects on this instance.")).toBeTruthy();
  });
});

