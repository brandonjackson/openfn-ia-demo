import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { setFlag } from "../../app/feature-flags";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { projectIdFor } from "../../fake-api/projects";
import { iaTree } from "../../model/ia-tree";
import ProjectWorkflowsPageQuery from "./ProjectWorkflowsPage.query";

const wait = { timeout: 3000 };
const projectId = projectIdFor("project-a");
const path = `/projects/${projectId}/workflows`;

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
          <Route path="/projects/:project/workflows" element={<ProjectWorkflowsPageQuery route={route} />} />
          <Route path="/workflow-editor/:id" element={<Opened />} />
        </Routes>
      </MemoryRouter>
    </ApiProvider>,
  );
}

type Workflow = { id: string; name: string; deleted_at?: string | null };
type Many = { data: { id: string; attributes: Record<string, unknown> }[] };

const serverWorkflows = async () =>
  (await request<{ workflows: Workflow[] }>("GET", `/api/projects/${projectId}/workflows`)).workflows.filter((w) => !w.deleted_at);

/** A workflow's row, found by its name. */
const row = async (name: string) => (await screen.findByText(name, {}, wait)).closest("a")!.parentElement!;

describe("ProjectWorkflowsPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    setFlag("serviceCatalog", true);
  });
  afterEach(() => setFlag("serviceCatalog", true));

  it("lists the project's workflows from the server", async () => {
    const workflows = await serverWorkflows();
    renderRoute();
    expect(await screen.findByText(`${workflows.length} workflows`, {}, wait)).toBeTruthy();
    for (const w of workflows) expect(screen.getByText(w.name)).toBeTruthy();
  });

  it("badges a workflow with the status of the service it backs, and leaves badges out without the catalog", async () => {
    const { data } = await request<Many>("GET", "/api/demo/services?page_size=100");
    const backed = data.find((s) => s.attributes["project_id"] === projectId && s.attributes["workflow_id"])!;
    const workflow = (await serverWorkflows()).find((w) => w.id === backed.attributes["workflow_id"])!;
    renderRoute();
    expect(within(await row(workflow.name)).getByText(backed.attributes["status"] as string)).toBeTruthy();

    act(() => setFlag("serviceCatalog", false));
    await waitFor(() => expect(within(screen.getByText(workflow.name).closest("a")!).queryByText(/^(Live|Draft)$/)).toBeNull(), wait);
  });

  it("still lists the workflows when services can't load, without their badges", async () => {
    failNext("GET /api/demo/services", { status: 500, code: "internal", detail: "Something went wrong." });
    const [first] = await serverWorkflows();
    renderRoute();
    expect(await row(first!.name)).toBeTruthy();
  });

  it("shows the server's message in the page's place when the workflows fail to load", async () => {
    failNext("GET /api/projects/:project_id/workflows", { status: 500, code: "internal", detail: "Something went wrong in Lightning." });
    renderRoute();
    expect(await screen.findByText("Something went wrong in Lightning.", {}, wait)).toBeTruthy();
  });

  it("deletes a workflow on the server once confirmed", async () => {
    const [first] = await serverWorkflows();
    renderRoute();
    fireEvent.click(within(await row(first!.name)).getByRole("button", { name: `Actions for ${first!.name}` }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete workflow" }));
    expect(await screen.findByText(`"${first!.name}" deleted`, {}, wait)).toBeTruthy();
    expect((await serverWorkflows()).some((w) => w.id === first!.id)).toBe(false);
  });

  it("makes a new workflow in this project from New workflow", async () => {
    const before = await serverWorkflows();
    renderRoute();
    fireEvent.click(await screen.findByRole("button", { name: "New workflow" }, wait));
    expect(screen.getByText(`Opened /workflow-editor/new?project=${projectId}`)).toBeTruthy();
    expect(await serverWorkflows()).toHaveLength(before.length);
  });
});
