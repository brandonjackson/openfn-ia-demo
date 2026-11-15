import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AnnouncementsProvider } from "../../app/announcements";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { setFlag } from "../../app/feature-flags";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { projectIdFor } from "../../fake-api/projects";
import { iaTree } from "../../model/ia-tree";
import ProjectPageQuery from "./ProjectPage.query";

const wait = { timeout: 3000 };
const projectId = projectIdFor("project-a");
const path = `/projects/${projectId}`;

function Opened() {
  const { pathname, search } = useLocation();
  return <p>Opened {pathname + search}</p>;
}

function renderRoute() {
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <AnnouncementsProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/projects/:project" element={<ProjectPageQuery route={route} />} />
            <Route path="/workflow-editor/:id" element={<Opened />} />
          </Routes>
        </MemoryRouter>
      </AnnouncementsProvider>
    </ApiProvider>,
  );
}

const serverWorkflows = async () =>
  (await request<{ workflows: { id: string; name: string; deleted_at?: string | null }[] }>("GET", `/api/projects/${projectId}/workflows`)).workflows.filter(
    (w) => !w.deleted_at,
  );

describe("ProjectPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    setFlag("serviceCatalog", true);
    setFlag("components", true);
  });
  afterEach(() => {
    setFlag("serviceCatalog", true);
    setFlag("components", true);
  });

  it("counts the project's workflows from the server", async () => {
    const workflows = await serverWorkflows();
    renderRoute();
    expect(await screen.findByText(`${workflows.length} workflows in this project.`, {}, wait)).toBeTruthy();
  });

  it("groups the project's published workflows from the server's services, and drops the group without the catalog", async () => {
    renderRoute();
    expect(await screen.findByRole("region", { name: "Published services" }, wait)).toBeTruthy();
    expect(screen.queryByText("Service listings")).toBeNull();

    act(() => setFlag("serviceCatalog", false));
    await waitFor(() => expect(screen.queryByRole("region", { name: "Published services" })).toBeNull(), wait);
  });

  it("makes a copy of a workflow from the Overview, which lists it there at once", async () => {
    const [first] = await serverWorkflows();
    renderRoute();
    const row = (await screen.findByText(first!.name, {}, wait)).closest("a")!.parentElement!;
    fireEvent.click(within(row).getByRole("button", { name: `Actions for ${first!.name}` }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Make a copy" }));
    expect(await screen.findByText(`Made "${first!.name} (copy)".`, {}, wait)).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Paused workflows" })).getByText(`${first!.name} (copy)`)).toBeTruthy();
  });

  it("doesn't list the project's components", async () => {
    renderRoute();
    await screen.findByRole("region", { name: "Live workflows" }, wait);
    expect(screen.queryByText("Components")).toBeNull();
  });

  it("shows the server's message in the page's place when the project fails to load", async () => {
    failNext("GET /api/projects/:id", { status: 500, code: "internal", detail: "Something went wrong in Lightning." });
    renderRoute();
    expect(await screen.findByText("Something went wrong in Lightning.", {}, wait)).toBeTruthy();
  });

  it("starts a new workflow in this project from an empty project", async () => {
    const workflows = await serverWorkflows();
    for (const w of workflows) await request("DELETE", `/api/projects/${projectId}/workflows/${w.id}`);
    renderRoute();
    fireEvent.click(await screen.findByRole("button", { name: "Create one" }, wait));
    expect(screen.getByText(`Opened /workflow-editor/new?project=${projectId}`)).toBeTruthy();
  });
});
