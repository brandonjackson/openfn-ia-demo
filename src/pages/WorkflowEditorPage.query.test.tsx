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

/** Opens "Add a step" from a card's +: the last step's, or the first card's (the trigger's). */
async function openStepPicker(which: "last" | "first" = "last") {
  const buttons = await screen.findAllByRole("button", { name: /^Add a step after/ }, wait);
  fireEvent.click(which === "first" ? buttons[0] : buttons.at(-1)!);
  return screen.findByRole("dialog", { name: "Add a step" }, wait);
}

// The canvas measures itself and the assistant scrolls its thread; jsdom does neither.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.scrollTo ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
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

  it("shows spec.md drawn as it reads on main, with Edit in sandbox in Edit's place", async () => {
    renderEditor(apiWorkflowId("planning-application-workflow"));
    fireEvent.click(await screen.findByRole("button", { name: "Explorer" }, wait));
    fireEvent.click((await screen.findAllByRole("button", { name: /^spec\.md/ }, wait))[0]!);
    expect(await screen.findByRole("heading", { name: "Spec", level: 1 }, wait)).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Adaptor" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: "Edit in sandbox" }).at(-1)!);
    expect(await screen.findByRole("dialog", {}, wait)).toBeTruthy();
  });

  it("makes a sandbox from Edit in sandbox in the environment picked, with main's saved dataclips, and goes into it", async () => {
    const projectId = projectIdFor("project-a");
    try {
      renderEditor(apiWorkflowId("planning-application-workflow"));
      fireEvent.click((await screen.findAllByRole("button", { name: "Edit in sandbox" }, wait))[0]!);
      const form = await screen.findByRole("dialog", { name: "Edit in sandbox" }, wait);
      expect(within(form).queryByText(/saved input/i)).toBeNull();
      fireEvent.change(within(form).getByLabelText("Name"), { target: { value: "On mock" } });
      fireEvent.change(within(form).getByLabelText("Environment"), { target: { value: "mock" } });
      fireEvent.click(within(form).getByRole("button", { name: "Create sandbox" }));
      await screen.findByRole("button", { name: /^Sandbox on-mock/ }, wait);
      const all = await listAll<{ id: string; attributes: { name: string; env: string } }>(`/api/projects/${projectId}/sandboxes?depth=all`);
      const made = all.find((p) => p.attributes.name === "on-mock")!;
      expect(made.attributes.env).toBe("mock");
      const clips = await listAll<{ name?: string }>(`/api/projects/${made.id}/dataclips`);
      expect(clips.some((d) => d.name === "Sample application: existing citizen")).toBe(true);
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
  });

  it("edits context.md in a sandbox from Edit, saves it in the sandbox and counts it as a change", async () => {
    const projectId = projectIdFor("project-a");
    const sandboxId = crypto.randomUUID();
    await request("PUT", `/api/projects/${projectId}/sandboxes/${sandboxId}`, { name: "context-notes" });
    act(() => setSandbox(projectId, "context-notes"));
    try {
      renderEditor(apiWorkflowId("planning-application-workflow"));
      await screen.findByRole("button", { name: "Triggers: paused" }, wait);
      expect(await screen.findByRole("button", { name: "Sandbox context-notes, no changes" }, wait)).toBeTruthy();
      fireEvent.click(await screen.findByRole("button", { name: "Explorer" }, wait));
      fireEvent.click((await screen.findAllByRole("button", { name: /^context\.md/ }, wait))[0]!);
      expect(await screen.findByRole("heading", { name: "Legislation", level: 2 }, wait)).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      fireEvent.change(screen.getByLabelText("context.md"), { target: { value: "# Context\n\n## Who it serves\n\n- Applicants" } });
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      expect(await screen.findByRole("heading", { name: "Who it serves", level: 2 }, wait)).toBeTruthy();
      expect(screen.getByText("Applicants").closest("li")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Edit" })).toBeTruthy();

      // It's a file the sandbox keeps: saved there, not on main, and one of the sandbox's changes.
      const contextOf = (id: string) =>
        request<{ data: { attributes: { name: string; content: string; workflow_id: string } }[] }>("GET", `/api/demo/projects/${id}/workflow_docs`).then(
          (r) => r.data.filter((d) => d.attributes.name === "context.md").map((d) => d.attributes.content),
        );
      expect(await contextOf(sandboxId)).toContain("# Context\n\n## Who it serves\n\n- Applicants");
      expect(await contextOf(projectId)).not.toContain("# Context\n\n## Who it serves\n\n- Applicants");
      fireEvent.click(await screen.findByRole("button", { name: "Sandbox context-notes, 1 change" }, wait));
      expect(await screen.findByText("Changed context.md", {}, wait)).toBeTruthy();
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
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

  it("lists main's versions in the title's picker, even when there's only one", async () => {
    renderEditor(apiWorkflowId("planning-application-workflow"));
    const picker = await screen.findByRole("button", { name: "Switch version" }, wait);
    expect(picker.textContent).toContain("v2");
    fireEvent.click(picker);
    const list = await screen.findByRole("listbox", { name: "Switch version" }, wait);
    expect(within(list).getByText("Promoted sandbox adding duplicate-application check")).toBeTruthy();
    expect(within(list).getByText("Initial go-live")).toBeTruthy();
  });

  it("shows the new version in the title on main once a sandbox is promoted, with its message first in the picker", async () => {
    const projectId = projectIdFor("project-a");
    const sandboxId = crypto.randomUUID();
    await request("PUT", `/api/projects/${projectId}/sandboxes/${sandboxId}`, { name: "dedupe" });
    type Docs = { workflows: { id: string; name: string; jobs: { body: string }[] }[] };
    const copy = (await request<Docs>("GET", `/api/projects/${sandboxId}/workflows`)).workflows.find((w) => w.name === "planning-application-workflow")!;
    await request("PATCH", `/api/projects/${sandboxId}/workflows/${copy.id}`, { jobs: copy.jobs.map((j, i) => (i === 0 ? { ...j, body: "fn(s => s) // dedupe" } : j)) });
    act(() => setSandbox(projectId, "dedupe"));
    try {
      renderEditor(apiWorkflowId("planning-application-workflow"));
      fireEvent.click(await screen.findByRole("button", { name: /^Sandbox dedupe, 1 change/ }, wait));
      fireEvent.click(await screen.findByRole("button", { name: "Create promotion request" }, wait));
      const form = await screen.findByRole("dialog", { name: "Create promotion request" }, wait);
      expect(within(form).getByText(/v3/)).toBeTruthy();
      fireEvent.change(within(form).getByLabelText(/What changed/), { target: { value: "Adds a duplicate check" } });
      fireEvent.click(within(form).getByRole("button", { name: "Promote to main" }));

      // Back on main, at the new version, without a reload.
      await waitFor(() => expect(screen.getByRole("button", { name: "Switch version" }).textContent).toContain("v3"), wait);
      fireEvent.click(screen.getByRole("button", { name: "Switch version" }));
      const options = within(await screen.findByRole("listbox", { name: "Switch version" }, wait)).getAllByRole("option");
      expect(options[0]!.textContent).toContain("Adds a duplicate check");
      expect(options[0]!.textContent).toContain("Latest");
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
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

  it("counts a new workflow in a sandbox as a change, and adding a step to it as one more", async () => {
    const projectId = projectIdFor("project-a");
    await request("PUT", `/api/projects/${projectId}/sandboxes/${crypto.randomUUID()}`, { name: "new-flow" });
    act(() => setSandbox(projectId, "new-flow"));
    try {
      renderEditor(`new?project=${projectId}`);
      const chip = await screen.findByRole("button", { name: /^Sandbox new-flow, \d+ changes?$/ }, wait);
      const count = () => Number(/(\d+) change/.exec(chip.getAttribute("aria-label") ?? "")?.[1] ?? 0);
      const before = count();
      expect(before).toBeGreaterThan(0);

      fireEvent.click(screen.getByText("Explorer"));
      fireEvent.click(await screen.findByRole("button", { name: "Add step" }, wait));
      await waitFor(() => expect(screen.getByRole("button", { name: /^Sandbox new-flow/ }).getAttribute("aria-label")).toBe(`Sandbox new-flow, ${before + 1} changes`), wait);
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
  });

  it("keeps the open step, component or file when switching sandbox from the chip, falling back where it isn't", async () => {
    const projectId = projectIdFor("project-a");
    await request("PUT", `/api/projects/${projectId}/sandboxes/${crypto.randomUUID()}`, { name: "switch-here" });
    renderEditor(apiWorkflowId("planning-application-workflow"));
    fireEvent.click(await screen.findByRole("button", { name: "Explorer" }, wait));
    const explorer = await screen.findByRole("navigation", { name: "Explorer" }, wait);
    const open = () => explorer.querySelector("[aria-current]")?.textContent ?? "";
    const switchTo = async (name: string) => {
      fireEvent.click(screen.getByRole("button", { name: /^main, read-only$|^Sandbox / }));
      fireEvent.click(within(await screen.findByRole("dialog", {}, wait)).getByRole("button", { name: new RegExp(`^${name}`) }));
    };

    // A step: the sandbox's copy has the same step under another id.
    // The Steps group: its heading's row, then the group around it.
    const steps = within(explorer).getByText("Steps").parentElement!.parentElement!;
    const step = within(steps).getAllByRole("button").find((b) => b.textContent && !/trigger|Add step/i.test(b.textContent + (b.getAttribute("aria-label") ?? "")))!;
    const stepName = step.textContent!;
    fireEvent.click(step);
    await switchTo("switch-here");
    await screen.findByRole("button", { name: "Triggers: paused" }, wait);
    await waitFor(() => expect(open()).toBe(stepName), wait);

    // A component: found again by its kind and name in the sandbox's copy of the project.
    const component = within(explorer).getAllByRole("button").find((b) => /channel$/.test(b.textContent ?? ""))!;
    const componentName = component.textContent!;
    fireEvent.click(component);
    await waitFor(() => expect(open()).toBe(componentName), wait);
    await switchTo("main");
    await waitFor(() => expect(open()).toBe(componentName), wait);

    // A file: Health is the same wherever you are.
    fireEvent.click(within(explorer).getByRole("button", { name: /^Health/ }));
    await switchTo("switch-here");
    await screen.findByRole("button", { name: "Triggers: paused" }, wait);
    await waitFor(() => expect(open()).toMatch(/^Health/), wait);
    act(() => setSandbox(projectId, "main"));
  });

  it("won't make a sandbox whose name, once made a slug, is taken elsewhere in the project", async () => {
    // Names are unique only among a parent's own sandboxes, and from inside a sandbox a new one is made
    // under it. The form checked the name as typed ("Decision Sync Fix"), not the slug it becomes, so a
    // sandbox of a sandbox could take a name already in the tree and the picker listed it twice.
    const projectId = projectIdFor("project-a");
    await request("PUT", `/api/projects/${projectId}/sandboxes/${crypto.randomUUID()}`, { name: "nested-parent" });
    act(() => setSandbox(projectId, "nested-parent"));
    try {
      renderEditor(apiWorkflowId("planning-application-workflow"));
      fireEvent.click(await screen.findByRole("button", { name: /^Sandbox nested-parent/ }, wait));
      fireEvent.click(within(await screen.findByRole("dialog", {}, wait)).getByRole("button", { name: "New sandbox…" }));
      fireEvent.change(await screen.findByLabelText("Name", {}, wait), { target: { value: "Decision Sync Fix" } });
      fireEvent.click(screen.getByRole("button", { name: "Create sandbox" }));
      expect(screen.getByText("There's already a sandbox called decision-sync-fix.")).toBeTruthy();

      const all = await listAll<{ attributes: { name: string } }>(`/api/projects/${projectId}/sandboxes?depth=all`);
      expect(all.filter((s) => s.attributes.name === "decision-sync-fix")).toHaveLength(1);
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
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "Add a step" })).toBeNull(), wait);
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

  it("names each step by its connected system, with its adaptor's logo", async () => {
    setFlag("connectedSystems", true);
    renderEditor(apiWorkflowId("planning-application-workflow"));
    await screen.findByRole("button", { name: "Select Search for duplicate citizens in Identity" }, wait);
    // The Identity steps are HTTP steps, named by the system they reach rather than "HTTP".
    expect((await screen.findAllByText("Identity", {}, wait)).length).toBe(2);
    expect(screen.getAllByText("Twilio").length).toBe(2);
    expect(screen.queryByText("HTTP")).toBeNull();
    // On main nothing can be changed, so a step without a credential offers no Connect.
    expect(screen.queryByRole("button", { name: /^Connect / })).toBeNull();
  });

  it("connects a step from its card in a sandbox: its config opens at the credential, and Add gives it one in a click", async () => {
    setFlag("connectedSystems", true);
    const projectId = projectIdFor("project-a");
    const sandboxId = crypto.randomUUID();
    await request("PUT", `/api/projects/${projectId}/sandboxes/${sandboxId}`, { name: "connect-identity" });
    act(() => setSandbox(projectId, "connect-identity"));
    try {
      renderEditor(apiWorkflowId("planning-application-workflow"));
      await screen.findByRole("button", { name: "Triggers: paused" }, wait);
      fireEvent.click(await screen.findByRole("button", { name: "Connect Search for duplicate citizens in Identity" }, wait));
      // Code mode, on the step, with Config showing its system and the credentials that fit it in the sandbox's environment, staging.
      const system = (await screen.findByLabelText("System", {}, wait)) as HTMLSelectElement;
      expect(system.value).toBe("Identity");
      expect(screen.getByText(/Adaptor: HTTP/)).toBeTruthy();
      expect(screen.queryByLabelText("Adaptor")).toBeNull();
      expect(screen.queryByRole("button", { name: "Add Identity API (production)" })).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Add Identity API (staging)" }));
      expect(await screen.findByRole("button", { name: "Remove Identity API (staging)" }, wait)).toBeTruthy();
      // Saved to the sandbox's copy of the step. (Other workflows in the project borrow the same steps, so look for any that has it.)
      const connected = () =>
        request<{ workflows: { jobs: { name: string; project_credential_id: string | null }[] }[] }>("GET", `/api/projects/${sandboxId}/workflows?page_size=100`).then(
          (a) => a.workflows.flatMap((w) => w.jobs).some((j) => j.name === "Search for duplicate citizens in Identity" && j.project_credential_id),
        );
      await waitFor(async () => expect(await connected()).toBe(true), wait);
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
  });

  it("makes a new credential for a step's system, shared with the project, and gives it to the step", async () => {
    setFlag("connectedSystems", true);
    const projectId = projectIdFor("project-a");
    const sandboxId = crypto.randomUUID();
    await request("PUT", `/api/projects/${projectId}/sandboxes/${sandboxId}`, { name: "new-credential" });
    act(() => setSandbox(projectId, "new-credential"));
    try {
      renderEditor(apiWorkflowId("planning-application-workflow"));
      await screen.findByRole("button", { name: "Triggers: paused" }, wait);
      fireEvent.click(await screen.findByRole("button", { name: "Connect Verify birth registration in OpenCRVS" }, wait));
      fireEvent.click(await screen.findByRole("button", { name: "New credential" }, wait));
      const form = await screen.findByRole("dialog", { name: /credential/i }, wait);
      fireEvent.change(await within(form).findByLabelText(/^Name/, {}, wait), { target: { value: "OpenCRVS for the sandbox" } });
      fireEvent.change(within(form).getByLabelText(/^Domain/), { target: { value: "https://gateway.example.org" } });
      fireEvent.change(within(form).getByLabelText(/^Client ID/), { target: { value: "sandbox" } });
      fireEvent.change(within(form).getByLabelText(/^Client secret/), { target: { value: "s3cret" } });
      fireEvent.click(within(form).getByRole("button", { name: "Save credential" }));
      expect(await screen.findByRole("button", { name: "Remove OpenCRVS for the sandbox" }, wait)).toBeTruthy();
      const linked = await listAll<{ name: string; schema: string }>(`/api/projects/${projectId}/credentials`, "credentials");
      expect(linked.find((c) => c.name === "OpenCRVS for the sandbox")?.schema).toMatch(/opencrvs/);
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
  });

  it("adds a system the project isn't connected to before its step, when its adaptor is picked from a category", async () => {
    const projectId = projectIdFor("project-a");
    const sandboxId = crypto.randomUUID();
    await request("PUT", `/api/projects/${projectId}/sandboxes/${sandboxId}`, { name: "new-system" });
    act(() => setSandbox(projectId, "new-system"));
    try {
      renderEditor(apiWorkflowId("planning-application-workflow"));
      await screen.findByRole("button", { name: "Triggers: paused" }, wait);
      const picker = await openStepPicker();
      fireEvent.change(within(picker).getByRole("searchbox"), { target: { value: "Mailchimp" } });
      fireEvent.click(within(picker).getByText("Mailchimp"));
      // The picker gives way to adding the system, with Mailchimp already picked.
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "Add a step" })).toBeNull(), wait);
      await screen.findByRole("dialog", { name: "Connect Mailchimp" }, wait);
      fireEvent.click(screen.getByRole("button", { name: "Add connected system" }));
      type Systems = { data: { id: string; attributes?: { name: string }; name?: string }[] };
      const added = async () => {
        const answer = await request<Systems>("GET", "/api/demo/connected_systems");
        return answer.data.find((s) => (s.attributes?.name ?? s.name) === "Mailchimp");
      };
      await waitFor(async () => expect(await added()).toBeDefined(), wait);
      const systemId = (await added())!.id;
      // The step is added on the new system, and saved to the sandbox's copy.
      const step = () =>
        request<{ workflows: { jobs: { name: string; system_id?: string | null }[] }[] }>("GET", `/api/projects/${sandboxId}/workflows`).then(
          (a) => a.workflows.flatMap((w) => w.jobs).find((j) => j.name === "New mailchimp step" || j.name === "New Mailchimp step"),
        );
      await waitFor(async () => expect((await step())?.system_id).toBe(systemId), wait);
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
  });

  it("adds a Report outcome from the Tools tab, saved as a tool job with its settings", async () => {
    const projectId = projectIdFor("project-a");
    const sandboxId = crypto.randomUUID();
    await request("PUT", `/api/projects/${projectId}/sandboxes/${sandboxId}`, { name: "add-outcome" });
    act(() => setSandbox(projectId, "add-outcome"));
    try {
      renderEditor(apiWorkflowId("planning-application-workflow"));
      await screen.findByRole("button", { name: "Triggers: paused" }, wait);
      const picker = await openStepPicker();
      fireEvent.click(within(picker).getByRole("button", { name: "Tools" }));
      fireEvent.click(within(picker).getByText("Report outcome"));
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "Add a step" })).toBeNull(), wait);
      type Job = { name: string; kind?: string; config?: { status?: string } };
      const step = () =>
        request<{ workflows: { jobs: Job[] }[] }>("GET", `/api/projects/${sandboxId}/workflows`).then((a) =>
          a.workflows.flatMap((w) => w.jobs).find((j) => j.name === "Report outcome"),
        );
      await waitFor(async () => expect((await step())?.kind).toBe("report_outcome"), wait);
      expect((await step())?.config?.status).toBe("success");
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
  });

  it("opens a path from its badge, and in a sandbox saves its label, condition and switch as Lightning's edge does", async () => {
    const projectId = projectIdFor("project-a");
    const sandboxId = crypto.randomUUID();
    await request("PUT", `/api/projects/${projectId}/sandboxes/${sandboxId}`, { name: "edit-paths" });
    act(() => setSandbox(projectId, "edit-paths"));
    try {
      renderEditor(apiWorkflowId("planning-application-workflow"));
      await screen.findByRole("button", { name: "Triggers: paused" }, wait);
      // Failures at the search and at the create both go to the queue: take the first.
      fireEvent.click((await screen.findAllByRole("button", { name: "On failure path" }, wait))[0]);
      const inspector = await screen.findByRole("region", { name: "Path inspector" }, wait);
      fireEvent.change(within(inspector).getByLabelText(/^Label/), { target: { value: "Identity is down" } });
      fireEvent.click(within(inspector).getByRole("switch", { name: /Enabled/ }));
      // Off, the path is drawn dashed and its badge says so.
      expect(await screen.findByRole("button", { name: "On failure path: Identity is down (off)" }, wait)).toBeTruthy();
      type Edges = { workflows: { edges: { condition_type: string; condition_label: string | null; enabled: boolean }[] }[] };
      const saved = () =>
        request<Edges>("GET", `/api/projects/${sandboxId}/workflows?page_size=100`).then((a) =>
          a.workflows.flatMap((w) => w.edges).some((e) => e.condition_type === "on_job_failure" && e.condition_label === "Identity is down" && !e.enabled),
        );
      await waitFor(async () => expect(await saved()).toBe(true), wait);
    } finally {
      act(() => setSandbox(projectId, "main"));
    }
  });

  it("shows a path read-only on main", async () => {
    renderEditor(apiWorkflowId("planning-application-workflow"));
    fireEvent.click(await screen.findByRole("button", { name: "On match path: Exact match" }, wait));
    const inspector = await screen.findByRole("region", { name: "Path inspector" }, wait);
    expect((within(inspector).getByLabelText(/^Label/) as HTMLInputElement).disabled).toBe(true);
    expect((within(inspector).getByLabelText("JavaScript expression") as HTMLTextAreaElement).value).toBe("state.exactMatch === true");
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
