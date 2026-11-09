import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../api/ApiProvider";
import { forgetCsrfToken, request } from "../api/client";
import { setFlag } from "../app/feature-flags";
import { resetFakeApi, setWait } from "../fake-api";
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

  it("lists the project's saved dataclips to run, and saves a new title and description", async () => {
    const workflowId = apiWorkflowId("planning-application-workflow");
    renderEditor(workflowId);
    fireEvent.click(await screen.findByRole("button", { name: "Code" }, wait));
    fireEvent.click(await screen.findByRole("button", { name: /Saved dataclips/ }, wait));
    expect(await screen.findByText("Sample application: new citizen", {}, wait)).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Run" }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Edit Sample application: new citizen" }));
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "First-time applicant" } });
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: "Not in the registry yet" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("First-time applicant", {}, wait)).toBeTruthy();
    const { data } = await request<{ data: { id: string; name?: string; description?: string }[] }>(
      "GET",
      `/api/projects/${projectIdFor("project-a")}/dataclips?page_size=100`,
    );
    expect(data.find((d) => d.id === "saved-new-citizen")).toMatchObject({ name: "First-time applicant", description: "Not in the registry yet" });
  });
});
