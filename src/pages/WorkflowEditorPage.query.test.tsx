import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../api/ApiProvider";
import { forgetCsrfToken, listAll, request } from "../api/client";
import { setFlag } from "../app/feature-flags";
import { setSandbox } from "../app/sandbox-state";
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

/** Opens the Fn menu once the workflow is in: while it loads, the button is there but doesn't open. */
async function openWorkflowMenu() {
  const button = await waitFor(() => {
    const found = screen.getByRole("button", { name: "Workflow menu" });
    expect(found.getAttribute("aria-disabled")).toBeNull();
    return found;
  }, wait);
  fireEvent.click(button);
}

/** Opens "Connect a system" from a card's +: the last step's, or the first card's (the trigger's). */
async function openStepPicker(which: "last" | "first" = "last") {
  const buttons = await screen.findAllByRole("button", { name: /^Add a step after/ }, wait);
  fireEvent.click(which === "first" ? buttons[0] : buttons.at(-1)!);
  return screen.findByRole("dialog", { name: "Connect a system" }, wait);
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
    setFlag("testCases", true);
  });

  it("opens into the editor's frame while the workflow loads, never Not Found", async () => {
    setWait(50);
    renderEditor(apiWorkflowId("planning-application-workflow"));
    expect(await screen.findByText("Loading workflow…")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Workflow menu" }).getAttribute("aria-disabled")).toBe("true");
    // The project is asked for only once the workflow names it: it loads in turn, rather than reading as missing.
    while (screen.queryByText("Loading workflow…")) {
      expect(screen.queryByText("Page Not Found")).toBeNull();
      await act(() => new Promise((r) => setTimeout(r, 10)));
    }
    expect(screen.queryByText("Page Not Found")).toBeNull();
    expect(await screen.findByRole("button", { name: "main, read-only" }, wait)).toBeTruthy();
  });

  it("links a workflow to the page of the service it backs, from the services API", async () => {
    const service = await backedService();
    renderEditor(service.workflowId);
    await openWorkflowMenu();
    fireEvent.click(await screen.findByRole("menuitem", { name: /See service listing/ }, wait));
    expect(await screen.findByText(`Opened /projects/${service.projectId}/services/${service.id}`, {}, wait)).toBeTruthy();
  });

  it("pauses the workflow from its trigger's switch on main, and the menu follows; pausing from the menu turns the trigger off", async () => {
    const service = await backedService();
    const doc = () =>
      request<{ workflow: { triggers: { enabled: boolean }[] } }>("GET", `/api/projects/${service.projectId}/workflows/${service.workflowId}`).then((a) => a.workflow);
    renderEditor(service.workflowId);
    fireEvent.click(await screen.findByRole("button", { name: /^Select .*trigger/i }, wait));
    // On main the workflow is read-only, but its trigger's switch is its pause.
    fireEvent.click(await screen.findByRole("switch", { name: "Live" }, wait));
    await waitFor(async () => expect((await doc()).triggers.some((t) => t.enabled)).toBe(false), wait);
    await openWorkflowMenu();
    fireEvent.click(await screen.findByRole("menuitem", { name: /Resume workflow/ }, wait));
    await waitFor(async () => expect((await doc()).triggers.some((t) => t.enabled)).toBe(true), wait);
    expect(await screen.findByRole("switch", { name: "Live" }, wait)).toBeTruthy();
  });

  it("pauses and resumes the workflow from the toolbar's Live menu, which says what runs on main use", async () => {
    const service = await backedService();
    const doc = () =>
      request<{ workflow: { triggers: { enabled: boolean }[] } }>("GET", `/api/projects/${service.projectId}/workflows/${service.workflowId}`).then((a) => a.workflow);
    renderEditor(service.workflowId);
    fireEvent.click(await screen.findByRole("button", { name: "Triggers: live" }, wait));
    const panel = await screen.findByRole("dialog", { name: "Triggers" }, wait);
    expect(within(panel).getByText("Runs on main use")).toBeTruthy();
    expect(within(panel).getByText("The project's own")).toBeTruthy();
    fireEvent.click(within(panel).getByRole("switch", { name: "Turn triggers off" }));
    await waitFor(async () => expect((await doc()).triggers.some((t) => t.enabled)).toBe(false), wait);
    expect(await screen.findByRole("button", { name: "Triggers: paused" }, wait)).toBeTruthy();
    fireEvent.click(within(panel).getByRole("switch", { name: "Turn triggers on" }));
    await waitFor(async () => expect((await doc()).triggers.some((t) => t.enabled)).toBe(true), wait);
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

  it("opens code mode on the Overview, whose stages link to the explorer", async () => {
    renderEditor(apiWorkflowId("planning-application-workflow"));
    fireEvent.click(await screen.findByRole("button", { name: "Explorer" }, wait));
    const stages = await screen.findByRole("list", { name: "Stages" }, wait);
    expect(within(stages).getByText("Identify the problem")).toBeTruthy();
    expect(stages.querySelector("[aria-current=step]")).toBeTruthy();
    expect(within(stages).getByText("Build")).toBeTruthy();
    expect(within(stages).getByText("Test")).toBeTruthy();
    fireEvent.click(within(stages).getByRole("button", { name: "Health" }));
    expect(await screen.findByText("Triage", {}, wait)).toBeTruthy();
  });

  it("lists the project's saved dataclips to run, and saves a new title and description", async () => {
    const workflowId = apiWorkflowId("planning-application-workflow");
    renderEditor(workflowId);
    fireEvent.click(await screen.findByRole("button", { name: "Explorer" }, wait));
    const explorer = await screen.findByRole("navigation", { name: "Explorer" }, wait);
    fireEvent.click(await within(explorer).findByRole("button", { name: /Saved dataclips/ }, wait));
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

  it("adds a component to the sandbox's own copy of the project, counted as a change", async () => {
    const projectId = projectIdFor("project-a");
    const sandboxId = crypto.randomUUID();
    await request("PUT", `/api/projects/${projectId}/sandboxes/${sandboxId}`, { name: "add-docs" });
    act(() => setSandbox(projectId, "add-docs"));
    try {
      renderEditor(apiWorkflowId("planning-application-workflow"));
      expect(await screen.findByRole("button", { name: "Sandbox add-docs, no changes" }, wait)).toBeTruthy();

      fireEvent.click(await screen.findByText("Explorer", {}, wait));
      fireEvent.click(await screen.findByRole("button", { name: "Add project component" }, wait));
      fireEvent.click(await screen.findByText("Document", {}, wait));
      const form = await screen.findByRole("dialog", { name: /document/i }, wait);
      fireEvent.change(within(form).getByLabelText(/^Name/), { target: { value: "runbook" } });
      fireEvent.click(screen.getByRole("button", { name: "Create document" }));

      fireEvent.click(await screen.findByRole("button", { name: "Sandbox add-docs, 1 change" }, wait));
      expect(await screen.findByText("Added document runbook", {}, wait)).toBeTruthy();
      const named = (id: string) =>
        request<{ data: { attributes: { name: string } }[] }>("GET", `/api/demo/projects/${id}/components?page_size=100`).then((r) => r.data.map((c) => c.attributes.name));
      expect(await named(sandboxId)).toContain("runbook");
      expect(await named(projectId)).not.toContain("runbook");
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
  });

  it("adds a step that calls another project's Live service from a card's +, in a sandbox", async () => {
    const projectId = projectIdFor("project-a");
    const sandboxId = crypto.randomUUID();
    await request("PUT", `/api/projects/${projectId}/sandboxes/${sandboxId}`, { name: "call-registry" });
    act(() => setSandbox(projectId, "call-registry"));
    try {
      renderEditor(apiWorkflowId("planning-application-workflow"));
      // A sandbox's copy is made with its trigger off: once it's paused, the cards are the copy's, not main's.
      await screen.findByRole("button", { name: "Triggers: paused" }, wait);
      const picker = await openStepPicker();
      fireEvent.click(within(picker).getByRole("button", { name: "Services" }));
      // The workflow backs Submit a planning application, so it isn't offered a step that calls itself.
      expect(within(picker).queryByText("Submit a planning application")).toBeNull();
      fireEvent.click(within(picker).getByText("Look up a client's national ID"));
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "Connect a system" })).toBeNull(), wait);
      // It's an HTTP step named for the service, posting to its address, saved to the sandbox's copy.
      const step = () =>
        request<{ workflows: { jobs: { name: string; adaptor: string; body: string }[] }[] }>("GET", `/api/projects/${sandboxId}/workflows`).then(
          (a) => a.workflows.flatMap((w) => w.jobs).find((j) => j.name === "Look up a client's national ID"),
        );
      await waitFor(async () => expect((await step())?.adaptor).toMatch(/^@openfn\/language-http/), wait);
      expect((await step())?.body).toContain("post('https://app.openfn.org/i/malawi-chw-referrals/client-registry-lookup', {");
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
  });

  it("puts a step added after the trigger between it and the first step, so the trigger keeps one edge and the save goes through", async () => {
    const projectId = projectIdFor("project-a");
    const sandboxId = crypto.randomUUID();
    await request("PUT", `/api/projects/${projectId}/sandboxes/${sandboxId}`, { name: "after-trigger" });
    act(() => setSandbox(projectId, "after-trigger"));
    try {
      renderEditor(apiWorkflowId("planning-application-workflow"));
      await screen.findByRole("button", { name: "Triggers: paused" }, wait);
      type Doc = { triggers: { id: string }[]; jobs: { id: string; name: string }[]; edges: { source_trigger_id: string | null; source_job_id: string | null; target_job_id: string }[] };
      const copies = () => request<{ workflows: Doc[] }>("GET", `/api/projects/${sandboxId}/workflows`).then((a) => a.workflows);
      const before = await copies();
      const picker = await openStepPicker("first");
      fireEvent.click(within(picker).getByRole("button", { name: "AI" }));
      fireEvent.click(within(picker).getByText("Summarize"));

      const doc = await waitFor(async () => {
        const found = (await copies()).find((w) => w.jobs.some((j) => j.name === "Summarize with AI"));
        expect(found).toBeTruthy();
        return found!;
      }, wait);
      const added = doc.jobs.find((j) => j.name === "Summarize with AI")!;
      const fromTrigger = doc.edges.filter((e) => e.source_trigger_id);
      expect(fromTrigger.map((e) => e.target_job_id)).toEqual([added.id]);
      // It leads on to where the trigger used to.
      const was = before.find((w) => w.triggers[0].id === doc.triggers[0].id)!.edges.find((e) => e.source_trigger_id)!.target_job_id;
      expect(doc.edges.some((e) => e.source_job_id === added.id && e.target_job_id === was)).toBe(true);
      expect(screen.queryByText(/Not saved/)).toBeNull();
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
  });

  it("offers no services to call from a step without the catalog", async () => {
    act(() => setFlag("serviceCatalog", false));
    const projectId = projectIdFor("project-a");
    await request("PUT", `/api/projects/${projectId}/sandboxes/${crypto.randomUUID()}`, { name: "no-catalog" });
    act(() => setSandbox(projectId, "no-catalog"));
    try {
      renderEditor(apiWorkflowId("planning-application-workflow"));
      await screen.findByRole("button", { name: "Triggers: paused" }, wait);
      const picker = await openStepPicker();
      expect(within(picker).queryByRole("button", { name: "Services" })).toBeNull();
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
  });

  it("opens a new workflow from Create with the assistant shown, working on the prompt", async () => {
    const prompt = "When a birth is registered in OpenCRVS, open a child benefit application in Salesforce.";
    render(
      <ApiProvider retry={false}>
        <MemoryRouter initialEntries={[{ pathname: "/workflow-editor/new", search: `?project=${projectIdFor("project-a")}`, state: { prompt } }]}>
          <Routes>
            <Route path="/workflow-editor/:workflowId" element={<WorkflowEditorPageQuery />} />
          </Routes>
        </MemoryRouter>
      </ApiProvider>,
    );
    // The prompt goes out as the first message of a new conversation, and the assistant answers it.
    expect(await screen.findByText(prompt, {}, wait)).toBeTruthy();
    expect(await screen.findByText("Here's what I'll change. Nothing is edited until you say so.", {}, wait)).toBeTruthy();
    expect(screen.getAllByText(prompt)).toHaveLength(1);
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
    const explorer = await screen.findByRole("navigation", { name: "Explorer" }, wait);
    await within(explorer).findByRole("button", { name: "Health" }, wait);
    expect(within(explorer).queryByRole("button", { name: "Environment variables" })).toBeNull();
  });
  it("lists the workflow's test cases under Saved dataclips, and runs one", async () => {
    act(() => setFlag("testCases", true));
    renderEditor(apiWorkflowId("apply-national-id"));
    fireEvent.click(await screen.findByText("Explorer", {}, wait));
    fireEvent.click(await within(await screen.findByRole("navigation", { name: "Explorer" }, wait)).findByRole("button", { name: /Test cases/ }, wait));
    expect(await screen.findByText("Near-match goes to a person for review", {}, wait)).toBeTruthy();
    // On main the workflow is read-only: tests run, but aren't written there.
    expect(screen.queryByRole("button", { name: "New test case" })).toBeNull();
    expect(screen.getByRole("button", { name: "Run all tests" })).toBeTruthy();

    expect(screen.getByText("1 not run")).toBeTruthy();
    // The one never run yet passes once the assistant has run it.
    let card = screen.getByText("Identity is down: application is queued").parentElement!;
    while (!within(card).queryByRole("button", { name: "Run" })) card = card.parentElement!;
    fireEvent.click(within(card).getByRole("button", { name: "Run" }));
    expect(await screen.findByText("3 passed", {}, wait)).toBeTruthy();
    expect(screen.queryByText("1 not run")).toBeNull();
  });

  it("opens the test cases from the Overview's Test stage", async () => {
    act(() => setFlag("testCases", true));
    renderEditor(apiWorkflowId("apply-national-id"));
    fireEvent.click(await screen.findByText("Explorer", {}, wait));
    const stages = await screen.findByRole("list", { name: "Stages" }, wait);
    fireEvent.click(within(stages).getByRole("button", { name: "Test cases" }));
    expect(await screen.findByRole("button", { name: "Run all tests" }, wait)).toBeTruthy();
  });

  it("writes tests from the spec in a sandbox", async () => {
    const projectId = projectIdFor("project-a");
    await request("PUT", `/api/projects/${projectId}/sandboxes/${crypto.randomUUID()}`, { name: "more-tests" });
    act(() => setSandbox(projectId, "more-tests"));
    try {
      renderEditor(apiWorkflowId("apply-national-id"));
      fireEvent.click(await screen.findByText("Explorer", {}, wait));
      fireEvent.click(await within(await screen.findByRole("navigation", { name: "Explorer" }, wait)).findByRole("button", { name: /Test cases/ }, wait));
      fireEvent.click(await screen.findByRole("button", { name: "Generate from spec" }, wait));
      expect(await screen.findByText("Synced with spec.md", {}, wait)).toBeTruthy();
      expect(await screen.findByText("Logs never pair a name with a date of birth", {}, wait)).toBeTruthy();
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
  });

  it("has the assistant write tests from the spec, and opens them from its reply", async () => {
    const projectId = projectIdFor("project-a");
    await request("PUT", `/api/projects/${projectId}/sandboxes/${crypto.randomUUID()}`, { name: "assistant-tests" });
    act(() => setSandbox(projectId, "assistant-tests"));
    try {
      renderEditor(apiWorkflowId("apply-national-id"));
      const toggle = await screen.findByRole("button", { name: "Assistant" }, wait);
      if (toggle.getAttribute("aria-pressed") !== "true") fireEvent.click(toggle);
      fireEvent.click(await screen.findByRole("button", { name: "Generate tests from spec" }, wait));
      expect(await screen.findByText(/I read spec.md and wrote 1 new test/, {}, wait)).toBeTruthy();
      expect(screen.getByText("Logs never pair a name with a date of birth")).toBeTruthy();

      fireEvent.click(screen.getByRole("button", { name: "Open test cases" }));
      expect(await screen.findByRole("button", { name: "Run all tests" }, wait)).toBeTruthy();
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
  });

  it("leaves test cases out with the flag off", async () => {
    act(() => setFlag("testCases", false));
    renderEditor(apiWorkflowId("apply-national-id"));
    fireEvent.click(await screen.findByText("Explorer", {}, wait));
    const explorer = await screen.findByRole("navigation", { name: "Explorer" }, wait);
    await within(explorer).findByRole("button", { name: "Health" }, wait);
    expect(within(explorer).queryByRole("button", { name: /Test cases/ })).toBeNull();
    // The Overview's Test stage doesn't point at them either.
    expect(within(screen.getByRole("list", { name: "Stages" })).queryByRole("button", { name: "Test cases" })).toBeNull();
  });
});
