import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/projects/:project" element={<ProjectPageQuery route={route} />} />
          <Route path="/workflow-editor/:id" element={<Opened />} />
        </Routes>
      </MemoryRouter>
    </ApiProvider>,
  );
}

type Many = { data: { id: string; attributes: Record<string, unknown> }[] };

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

  it("lists the project's services from the server, and leaves them out without the catalog", async () => {
    const { data } = await request<Many>("GET", "/api/demo/services?page_size=100");
    const service = data.find((s) => s.attributes["project_id"] === projectId)!;
    renderRoute();
    expect(await screen.findByText(service.attributes["name"] as string, {}, wait)).toBeTruthy();

    act(() => setFlag("serviceCatalog", false));
    await waitFor(() => expect(screen.queryByText("Published services")).toBeNull(), wait);
  });

  it("lists the project's components from the server, and leaves them out without components", async () => {
    const workflows = await serverWorkflows();
    const { data: channels } = await request<Many>("GET", `/api/projects/${projectId}/channels?page_size=100`);
    renderRoute();
    expect(await screen.findByText("Components", {}, wait)).toBeTruthy();
    // Every workflow and channel is one, and the other kinds from the demo's routes come on top.
    const count = Number(screen.getByText(/building blocks? in this project/).textContent!.split(" ")[0]);
    expect(count).toBeGreaterThan(workflows.length + channels.length);

    act(() => setFlag("components", false));
    await waitFor(() => expect(screen.queryByText("Components")).toBeNull(), wait);
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
