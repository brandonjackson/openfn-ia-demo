import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../api/ApiProvider";
import { forgetCsrfToken, request } from "../api/client";
import { setFlag } from "../app/feature-flags";
import { failNext, resetFakeApi, setWait } from "../fake-api";
import WorkflowEditorPageQuery from "./WorkflowEditorPage.query";

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
  });
  afterEach(() => setFlag("serviceCatalog", true));

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
});
