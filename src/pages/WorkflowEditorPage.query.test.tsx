import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../api/ApiProvider";
import { forgetCsrfToken, listAll, request } from "../api/client";
import { setFlag } from "../app/feature-flags";
import { failNext, resetFakeApi, setWait } from "../fake-api";
import WorkflowEditorPageQuery from "./WorkflowEditorPage.query";
import { apiWorkflowId } from "../fixtures/ids";
import { projectIdFor } from "../fake-api/projects";

const wait = { timeout: 5000 };

function Opened() {
  const { pathname } = useLocation();
  return <p>Opened {pathname}</p>;
}

function renderEditor(workflowId: string) {
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[`/workflow-editor/${workflowId}`]}>
        <Routes>
          <Route path="/workflow-editor/:workflowId" element={<WorkflowEditorPageQuery />} />
          <Route path="/projects/*" element={<Opened />} />
        </Routes>
      </MemoryRouter>
    </ApiProvider>,
  );
}

type Many = { data: { id: string; attributes: Record<string, unknown> }[] };

/** A service on the server that a workflow backs. */
async function backedService() {
  const { data } = await request<Many>("GET", "/api/demo/services?page_size=100");
  const s = data.find((x) => x.attributes["workflow_id"])!;
  return { id: s.id, projectId: s.attributes["project_id"] as string, workflowId: s.attributes["workflow_id"] as string };
}

async function openWorkflowMenu() {
  fireEvent.click(await screen.findByRole("button", { name: "Workflow menu" }, wait));
}

// The canvas measures itself and the assistant scrolls its thread; jsdom does neither.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.scrollTo ??= () => {};
});

describe("WorkflowEditorPageQuery", { timeout: 15000 }, () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    setFlag("serviceCatalog", true);
    setFlag("workflowDocs", true);
  });
  afterEach(() => {
    setFlag("serviceCatalog", true);
    setFlag("envVars", true);
  });

  it("links a workflow to the page of the service it backs, from the services API", async () => {
    const service = await backedService();
    renderEditor(service.workflowId);
    await openWorkflowMenu();
    fireEvent.click(await screen.findByRole("menuitem", { name: /See service listing/ }, wait));
    expect(await screen.findByText(`Opened /projects/${service.projectId}/services/${service.id}`, {}, wait)).toBeTruthy();
  });

  it("offers no service listing without the catalog", async () => {
    act(() => setFlag("serviceCatalog", false));
    const service = await backedService();
    renderEditor(service.workflowId);
    await openWorkflowMenu();
    await waitFor(() => expect(screen.getByRole("menuitem", { name: /Export as YAML/ })).toBeTruthy(), wait);
    expect(screen.queryByRole("menuitem", { name: /See service listing/ })).toBeNull();
  });

  it("keeps a run it started loaded when the server has no dataclips and won't record the run, as on Lightning", async () => {
    // Lightning answers a project's dataclips 404 and refuses the run the editor made (docs/api-gaps.md).
    failNext("GET /api/projects/:project_id/dataclips", { status: 404, code: "not_found", detail: "Not found." });
    failNext("POST /api/projects/:project_id/workflows/:workflow_id/work_orders", {
      status: 422,
      code: "invalid",
      detail: "The request is not valid. See errors.",
    });
    const service = await backedService();
    renderEditor(service.workflowId);
    fireEvent.click(await screen.findByRole("button", { name: "Run" }, wait));
    // Loaded while it runs, and still loaded once it's finished and the record is refused.
    expect(await screen.findByRole("button", { name: "Unload run" }, wait)).toBeTruthy();
    await waitFor(() => expect(screen.queryAllByLabelText("Running")).toHaveLength(0), { timeout: 10000 });
    // Give the refused record time to come back.
    await act(() => new Promise((resolve) => setTimeout(resolve, 200)));
    expect(screen.getByRole("button", { name: "Unload run" })).toBeTruthy();
  });

  it("lists the project's saved dataclips to run, and saves a new title and description", async () => {
    const workflowId = apiWorkflowId("planning-application-workflow");
    renderEditor(workflowId);
    fireEvent.click(await screen.findByRole("button", { name: "Explorer" }, wait));
    fireEvent.click(await screen.findByRole("button", { name: /Saved dataclips/ }, wait));
    expect(await screen.findByText("Sample application: new citizen", {}, wait)).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Run" }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Edit Sample application: new citizen" }));
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "First-time applicant" } });
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: "Not in the registry yet" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("First-time applicant", {}, wait)).toBeTruthy();
    const data = await listAll<{ id: string; name?: string; description?: string }>(`/api/projects/${projectIdFor("project-a")}/dataclips`);
    expect(data.find((d) => d.id === "saved-new-citizen")).toMatchObject({ name: "First-time applicant", description: "Not in the registry yet" });
  });

  it("lists the project's environment variables under Workflow in the explorer, and adds one", async () => {
    act(() => setFlag("envVars", true));
    const projectId = projectIdFor("project-a");
    const { workflows } = await request<{ workflows: { id: string }[] }>("GET", `/api/projects/${projectId}/workflows`);
    renderEditor(workflows[0]!.id);
    fireEvent.click(await screen.findByText("Explorer", {}, wait));
    fireEvent.click(await screen.findByRole("button", { name: "Environment variables" }, wait));
    expect((await screen.findAllByText("DHIS2_BASE_URL", {}, wait)).length).toBe(2);

    fireEvent.change(screen.getByLabelText("Key 1"), { target: { value: "RETRY_LIMIT" } });
    fireEvent.change(screen.getByLabelText("Value 1"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Saved 1 variable.", {}, wait)).toBeTruthy();
    const { data } = await request<Many>("GET", `/api/demo/projects/${projectId}/env_vars?page_size=100`);
    expect(data.find((v) => v.attributes["key"] === "RETRY_LIMIT")?.attributes).toMatchObject({ value: "3", environments: ["production", "staging", "mock"] });
    expect(await screen.findByText("RETRY_LIMIT", {}, wait)).toBeTruthy();
  });

  it("says under the key where it's already set", async () => {
    act(() => setFlag("envVars", true));
    const projectId = projectIdFor("project-a");
    const { workflows } = await request<{ workflows: { id: string }[] }>("GET", `/api/projects/${projectId}/workflows`);
    renderEditor(workflows[0]!.id);
    fireEvent.click(await screen.findByText("Explorer", {}, wait));
    fireEvent.click(await screen.findByRole("button", { name: "Environment variables" }, wait));
    fireEvent.change(await screen.findByLabelText("Key 1", {}, wait), { target: { value: "LOG_LEVEL" } });
    fireEvent.change(screen.getByLabelText("Value 1"), { target: { value: "debug" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Already set in production, staging and mock", {}, wait)).toBeTruthy();
  });

  it("leaves environment variables out with the flag off", async () => {
    act(() => setFlag("envVars", false));
    const projectId = projectIdFor("project-a");
    const { workflows } = await request<{ workflows: { id: string }[] }>("GET", `/api/projects/${projectId}/workflows`);
    renderEditor(workflows[0]!.id);
    fireEvent.click(await screen.findByText("Explorer", {}, wait));
    await screen.findByRole("button", { name: "Health" }, wait);
    expect(screen.queryByRole("button", { name: "Environment variables" })).toBeNull();
  });
});
