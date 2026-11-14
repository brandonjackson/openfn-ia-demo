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
      <AnnouncementsProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/projects/:project/workflows" element={<ProjectWorkflowsPageQuery route={route} />} />
            <Route path="/workflow-editor/:id" element={<Opened />} />
          </Routes>
        </MemoryRouter>
      </AnnouncementsProvider>
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
    expect(await screen.findByText(workflows[0]!.name, {}, wait)).toBeTruthy();
    for (const w of workflows) expect(screen.getByText(w.name)).toBeTruthy();
  });

  it("files a workflow that backs a service under Published services, and doesn't without the catalog", async () => {
    const { data } = await request<Many>("GET", "/api/demo/services?page_size=100");
    const backed = data.find((s) => s.attributes["project_id"] === projectId && s.attributes["workflow_id"])!;
    const workflow = (await serverWorkflows()).find((w) => w.id === backed.attributes["workflow_id"])!;
    renderRoute();
    await row(workflow.name);
    expect(within(screen.getByRole("region", { name: "Published services" })).getByText(workflow.name)).toBeTruthy();

    act(() => setFlag("serviceCatalog", false));
    await waitFor(() => expect(screen.queryByRole("region", { name: "Published services" })).toBeNull(), wait);
    expect(screen.getByText(workflow.name)).toBeTruthy();
  });

  it("swaps a workflow's Live pill for Paused when its switch is flipped off, and back again", async () => {
    const live = (await request<{ workflows: (Workflow & { triggers: { enabled: boolean }[] })[] }>("GET", `/api/projects/${projectId}/workflows`)).workflows.find(
      (w) => w.triggers.some((t) => t.enabled),
    )!;
    renderRoute();
    expect(within(await row(live.name)).getByText("Live")).toBeTruthy();

    fireEvent.click(screen.getByRole("switch", { name: `${live.name} enabled` }));
    await waitFor(() => expect(within(screen.getByText(live.name).closest("a")!).getByText("Paused")).toBeTruthy(), wait);
    expect(within(screen.getByText(live.name).closest("a")!).queryByText("Live")).toBeNull();
    const stored = (await request<{ workflow: { triggers: { enabled: boolean }[] } }>("GET", `/api/workflows/${live.id}`)).workflow;
    expect(stored.triggers.some((t) => t.enabled)).toBe(false);

    fireEvent.click(screen.getByRole("switch", { name: `${live.name} enabled` }));
    await waitFor(() => expect(within(screen.getByText(live.name).closest("a")!).getByText("Live")).toBeTruthy(), wait);
  });

  it("makes a paused copy of a workflow on the server, says so, and lists it", async () => {
    const [first] = await serverWorkflows();
    renderRoute();
    fireEvent.click(within(await row(first!.name)).getByRole("button", { name: `Actions for ${first!.name}` }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Make a copy" }));
    expect(await screen.findByText(`Made "${first!.name} (copy)".`, {}, wait)).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Paused workflows" })).getByText(`${first!.name} (copy)`)).toBeTruthy();
    expect((await serverWorkflows()).some((w) => w.name === `${first!.name} (copy)`)).toBe(true);
  });

  it("publishes a workflow as a service on the server, says so, and files it under Published services", async () => {
    const { data } = await request<Many>("GET", `/api/demo/projects/${projectId}/services?page_size=100`);
    const unpublished = (await serverWorkflows()).find((w) => !data.some((s) => s.attributes["workflow_id"] === w.id))!;
    renderRoute();
    fireEvent.click(within(await row(unpublished.name)).getByRole("button", { name: `Actions for ${unpublished.name}` }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Publish" }));
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Apply for an ID" } });
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    expect(await screen.findByText(`Published "Apply for an ID".`, {}, wait)).toBeTruthy();
    await waitFor(() => expect(within(screen.getByRole("region", { name: "Published services" })).getByText(unpublished.name)).toBeTruthy(), wait);
    const after = await request<Many>("GET", `/api/demo/projects/${projectId}/services?page_size=100`);
    expect(after.data.some((s) => s.attributes["workflow_id"] === unpublished.id && s.attributes["name"] === "Apply for an ID")).toBe(true);
  });

  it("offers no Publish without the service catalog", async () => {
    setFlag("serviceCatalog", false);
    const [first] = await serverWorkflows();
    renderRoute();
    fireEvent.click(within(await row(first!.name)).getByRole("button", { name: `Actions for ${first!.name}` }));
    expect(screen.getByRole("menuitem", { name: "Make a copy" })).toBeTruthy();
    expect(screen.queryByRole("menuitem", { name: "Publish" })).toBeNull();
  });

  it("says why when the server refuses a copy", async () => {
    failNext("POST /api/demo/projects/:project_id/workflows/:id/copies", { status: 403, code: "forbidden", detail: "You can't change workflows in this project." });
    const [first] = await serverWorkflows();
    renderRoute();
    fireEvent.click(within(await row(first!.name)).getByRole("button", { name: `Actions for ${first!.name}` }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Make a copy" }));
    const alert = await screen.findByRole("alert", {}, wait);
    expect(within(alert).getByText(`"${first!.name}" wasn't copied`)).toBeTruthy();
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
    expect(await screen.findByText(`Deleted "${first!.name}".`, {}, wait)).toBeTruthy();
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
