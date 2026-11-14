import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken } from "../../api/client";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { projectIdFor } from "../../fake-api/projects";
import { iaTree } from "../../model/ia-tree";
import ProjectSandboxesPageQuery from "./ProjectSandboxesPage.query";
import { AnnouncementsProvider } from "../../app/announcements";

const wait = { timeout: 3000 };

function draw(path = `/projects/${projectIdFor("project-a")}/sandboxes`) {
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <AnnouncementsProvider>
        <MemoryRouter initialEntries={[path]}>
          <ProjectSandboxesPageQuery route={route} />
        </MemoryRouter>
      </AnnouncementsProvider>
    </ApiProvider>,
  );
}

const section = (title: string) => screen.getByRole("heading", { name: title }).closest("section")!;

describe("ProjectSandboxesPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    localStorage.clear();
  });

  it("lists the project's sandboxes from the server, with main selected", async () => {
    draw();
    expect(await screen.findByText("intake-validation-v2", {}, wait)).toBeTruthy();
    expect(screen.getByText("decision-sync-fix")).toBeTruthy();
    expect(within(section("Selected")).getByText("main")).toBeTruthy();
    // What each has changed comes from the server's merge preview.
    expect(await screen.findByText("2 changes", {}, wait)).toBeTruthy();
    expect(screen.getByText("1 change")).toBeTruthy();
  });

  it("makes a sandbox on the server, goes into it, and lists it", async () => {
    draw();
    fireEvent.click(await screen.findByRole("button", { name: "New sandbox" }, wait));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Try a fix" } });
    fireEvent.click(screen.getByRole("button", { name: "Create sandbox" }));
    expect(await screen.findByText("Created try-a-fix from main.", {}, wait)).toBeTruthy();
    await waitFor(() => expect(within(section("Selected")).getByText("try-a-fix")).toBeTruthy(), wait);
    // The others keep what they've changed; the new one has changed nothing.
    expect(screen.getByText("2 changes")).toBeTruthy();
    expect(within(section("Selected")).queryByText(/changes?$/)).toBeNull();
  });

  it("moves a sandbox to another environment on the server", async () => {
    draw();
    fireEvent.click(await screen.findByRole("button", { name: "Actions for decision-sync-fix" }, wait));
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Environment"), { target: { value: "mock" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Saved decision-sync-fix.", {}, wait)).toBeTruthy();
    await waitFor(() => expect(screen.getByText("Mock")).toBeTruthy(), wait);
  });

  it("promotes a sandbox into main on the server, after which it has nothing left to promote", async () => {
    draw();
    // Promote is offered once the merge preview says there's something to promote.
    expect(await screen.findByText("1 change", {}, wait)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Actions for intake-validation-v2" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Promote" }));
    fireEvent.change(screen.getByLabelText("What changed?"), { target: { value: "Stricter intake" } });
    fireEvent.click(screen.getByRole("button", { name: "Promote to main" }));
    expect(await screen.findByText(/Promoted intake-validation-v2 into main/, {}, wait)).toBeTruthy();
    await waitFor(() => expect(screen.queryByText("1 change")).toBeNull(), wait);
  });

  it("deletes a sandbox on the server and takes it off the list", async () => {
    draw();
    fireEvent.click(await screen.findByRole("button", { name: "Actions for decision-sync-fix" }, wait));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete sandbox" }));
    expect(await screen.findByText("Deleted decision-sync-fix.", {}, wait)).toBeTruthy();
    await waitFor(() => expect(screen.queryByText("decision-sync-fix")).toBeNull(), wait);
  });

  it("says why the server refused a delete", async () => {
    failNext("DELETE /api/projects/:id", { status: 403, code: "forbidden", detail: "Only the sandbox's owner can delete it." });
    draw();
    fireEvent.click(await screen.findByRole("button", { name: "Actions for decision-sync-fix" }, wait));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete sandbox" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("decision-sync-fix wasn't deleted"), wait);
    expect(screen.getByRole("alert").textContent).toContain("Only the sandbox's owner can delete it.");
    expect(screen.getByText("decision-sync-fix")).toBeTruthy();
  });

  it("says the page couldn't load when the sandboxes can't be", async () => {
    failNext("GET /api/projects/:project_id/sandboxes", { status: 500, code: "internal", detail: "Something went wrong." });
    draw();
    expect(await screen.findByText("Something went wrong.", {}, wait)).toBeTruthy();
  });

  it("says Not Found for a project the API doesn't have", async () => {
    draw("/projects/00000000-0000-5000-8000-000000000000/sandboxes");
    expect(await screen.findByText("Page Not Found", {}, wait)).toBeTruthy();
  });
});
