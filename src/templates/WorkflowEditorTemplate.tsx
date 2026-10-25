import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import type {
  Dataclip,
  JobNode,
  RunDetails,
  RunStep,
  TriggerNode,
  Workflow,
  WorkflowEdge,
  WorkflowNode,
  WorkflowVersion,
  WorkOrder,
} from "../mock-data/workflow";
import { orderedJobs } from "../mock-data/workflow";
import { shortId, simulateRun } from "../mock-data/runs";
import { workflowToYaml } from "../workflow-yaml";
import WorkflowTopBar from "../components/workflow/WorkflowTopBar";
import type { FileMenuAction } from "../components/workflow/WorkflowFileMenu";
import WorkflowCanvas from "../components/workflow/WorkflowCanvas";
import RecentHistoryPanel from "../components/workflow/RecentHistoryPanel";
import VersionMismatchBanner from "../components/workflow/VersionMismatchBanner";
import EditorShell from "../components/workflow/EditorShell";
import EditorLayout from "../components/workflow/EditorLayout";
import Tray, { TrayIconButton } from "../components/workflow/Tray";
import StepExplorer from "../components/workflow/StepExplorer";
import StepInspector from "../components/workflow/StepInspector";
import AdaptorReference from "../components/workflow/AdaptorReference";
import RunOutput, { RunOutputChip, RunOutputHeader } from "../components/workflow/RunOutput";
import type { RunView } from "../components/workflow/RunOutput";
import StepBar from "../components/workflow/StepBar";
import CodeEditor from "../components/workflow/CodeEditor";
import EditorStatusBar from "../components/workflow/EditorStatusBar";
import type { EditorSaveState } from "../components/workflow/EditorStatusBar";
import type { Dock, EditorMode, TrayId, TrayLayout, TrayPlacement } from "../components/workflow/trays";
import { DOCKS, TRAYS, defaultDockSizes, defaultLayout, defaultPlacement } from "../components/workflow/trays";
import RunInputModal from "../components/RunInputModal";
import type { RunInput } from "../components/RunInputModal";
import EditInSandboxModal from "../components/EditInSandboxModal";
import type { SandboxStart } from "../components/EditInSandboxModal";
import PromoteSandboxModal from "../components/PromoteSandboxModal";
import Modal from "../components/Modal";
import Button from "../components/Button";
import AIAssistantPanel from "../components/workflow/AIAssistantPanel";
import type { AssistantConversation } from "../mock-data/assistant";

/** Who starts runs and retries in the prototype. */
const CURRENT_USER = "Jane Doe";

/** How long a simulated run takes before its results come in. */
const RUN_TIME_MS = 1500;

/** How long after an edit the prototype says it's saved. */
const SAVE_DELAY_MS = 800;

/**
 * The workflow editor: a toolbar over two views of the same workflow, the
 * canvas and the code, each with trays around it.
 *
 * **Toolbar.** The "Fn" file menu (back to the project, rename, settings,
 * export, sandbox actions, view and panel toggles, pause, delete), the name
 * and sandbox/version pickers; the Canvas / Code switch; panel toggles, the
 * live/run control, "Edit in sandbox" or "Promote", and the assistant.
 *
 * **Trays.** Steps, History, Settings, Adaptor docs and Run live in three
 * docks (left, right, bottom); see `components/workflow/trays.ts`. Each mode
 * remembers its own layout. Selecting a step opens Settings, selecting or
 * starting a run opens Run. On the canvas the trays float over the diagram;
 * in code they share one card with the code.
 *
 * **Selection** is shared by both views: a step, the trigger, or nothing,
 * which means the workflow itself (its YAML and settings).
 *
 * **Runs.** Selecting a run in History draws it on the canvas and the Run
 * tray follows the open step in it. When the run took place on an older
 * version, the Run tray offers to view the version that ran; the version
 * picker turns yellow while it's shown. With a run selected the run button
 * becomes Retry (from the open step, in code). Steps can be run or retried
 * from themselves via the step bar or Settings.
 *
 * **Editing.** main and earlier versions are read-only; "Edit in sandbox"
 * creates or joins one. In a sandbox, step settings, new steps and adaptor
 * snippets change the workflow, and "Promote" adds a new version to main.
 *
 * The selected run can be controlled by the caller (`runId` + `onRunChange`,
 * e.g. to keep it in the URL) or left to the template, like the sandbox.
 */
export default function WorkflowEditorTemplate({
  workflow,
  workOrders: initialWorkOrders = [],
  dataclips: initialDataclips = [],
  graphForVersion,
  runId: controlledRunId,
  onRunChange,
  initialSelectedId,
  initialMode = "canvas",
  initialLayout = defaultLayout,
  initialPlacement = defaultPlacement,
  initialVersion = "latest",
  onBack,
  sandboxes = ["main"],
  sandbox: controlledSandbox,
  onSelectSandbox,
  onViewAllSandboxes,
  versions: initialVersions = [],
  url,
  onSeeDetails,
  defaultEditInSandboxOpen = false,
  defaultRunInputOpen = false,
  defaultPromoteOpen = false,
  defaultFileMenuOpen = false,
  assistantConversations = [],
  defaultAssistantOpen = false,
}: {
  workflow: Workflow;
  /** Recent work orders, newest first. */
  workOrders?: WorkOrder[];
  /** The project's dataclips: run inputs, step results and saved inputs. */
  dataclips?: Dataclip[];
  /** The workflow's graph at an earlier version, for "View as executed". */
  graphForVersion?: (version: string) => Workflow | undefined;
  /** The selected run, when the caller controls it. */
  runId?: string;
  onRunChange?: (runId: string | undefined) => void;
  /** The open step or trigger; nothing means the workflow itself. */
  initialSelectedId?: string;
  initialMode?: EditorMode;
  /** Which docks start open, and with which tray, in each mode. */
  initialLayout?: TrayLayout;
  /** Which dock each tray starts in. */
  initialPlacement?: TrayPlacement;
  /** "latest" or a version id (useful for stories). */
  initialVersion?: string;
  /** Leaves the editor, from "Back to …" in the file menu. */
  onBack?: () => void;
  /** Sandboxes of the workflow's project, "main" first. */
  sandboxes?: string[];
  sandbox?: string;
  onSelectSandbox?: (sandbox: string) => void;
  onViewAllSandboxes?: () => void;
  /** Version history on main, newest first. */
  versions?: WorkflowVersion[];
  /** The URL that starts the workflow, for "Copy URL". */
  url?: string;
  /** Opens the service listing where the workflow is documented. */
  onSeeDetails?: () => void;
  /** Start with a dialog or menu open (useful for stories). */
  defaultEditInSandboxOpen?: boolean;
  defaultRunInputOpen?: boolean;
  defaultPromoteOpen?: boolean;
  defaultFileMenuOpen?: boolean;
  /** Saved AI Assistant conversations for this workflow. */
  assistantConversations?: AssistantConversation[];
  /** Start with the AI Assistant tray open (useful for stories). */
  defaultAssistantOpen?: boolean;
}) {
  const [mode, setMode] = useState<EditorMode>(initialMode);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);

  // The workflow as edited in a sandbox. main and older versions stay as they were.
  const [draft, setDraft] = useState(workflow);
  const [saveState, setSaveState] = useState<"saved" | "edited">("saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [localSandbox, setLocalSandbox] = useState("main");
  const sandbox = controlledSandbox ?? localSandbox;
  const selectSandbox = onSelectSandbox ?? setLocalSandbox;
  // Sandboxes made from the editor join the project's list for this session.
  const [newSandboxes, setNewSandboxes] = useState<string[]>([]);
  const allSandboxes = [...sandboxes, ...newSandboxes.filter((s) => !sandboxes.includes(s))];

  const [versions, setVersions] = useState(initialVersions);
  const [version, setVersion] = useState(initialVersion);
  const latestVersion = versions[0]?.id;

  const [orders, setOrders] = useState(initialWorkOrders);
  const [clips, setClips] = useState(initialDataclips);
  const [localRunId, setLocalRunId] = useState(controlledRunId);
  const runId = onRunChange ? controlledRunId : localRunId;
  const setRunId = onRunChange ?? setLocalRunId;

  const [live, setLive] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [runInputOpen, setRunInputOpen] = useState(defaultRunInputOpen);
  const [editInSandboxOpen, setEditInSandboxOpen] = useState(defaultEditInSandboxOpen);
  const [promoteOpen, setPromoteOpen] = useState(defaultPromoteOpen);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(defaultAssistantOpen);

  // ---- Trays --------------------------------------------------------------

  const [placement, setPlacement] = useState(initialPlacement);
  const [layout, setLayout] = useState(initialLayout);
  const [sizes, setSizes] = useState(defaultDockSizes);
  const [runView, setRunView] = useState<RunView>("Log");

  const traysIn = (dock: Dock) => TRAYS.filter((t) => placement[t.id] === dock).map((t) => t.id);
  const activeIn = (dock: Dock) => {
    const ids = traysIn(dock);
    return ids.includes(layout[mode][dock].active) ? layout[mode][dock].active : ids[0];
  };
  const dockOpen = (dock: Dock) => layout[mode][dock].open && traysIn(dock).length > 0;
  const openDocks = { left: dockOpen("left"), right: dockOpen("right"), bottom: dockOpen("bottom") };
  const availableDocks = {
    left: traysIn("left").length > 0,
    right: traysIn("right").length > 0,
    bottom: traysIn("bottom").length > 0,
  };
  const visibleTrays = DOCKS.filter((d) => openDocks[d.id]).map((d) => activeIn(d.id));

  const setDock = (dock: Dock, patch: Partial<TrayLayout[EditorMode][Dock]>, inMode: EditorMode = mode) =>
    setLayout((l) => ({ ...l, [inMode]: { ...l[inMode], [dock]: { ...l[inMode][dock], ...patch } } }));
  const toggleDock = (dock: Dock) =>
    setLayout((l) => ({ ...l, [mode]: { ...l[mode], [dock]: { ...l[mode][dock], open: !l[mode][dock].open } } }));
  /** Open a tray's dock on it: in this mode, or in both (e.g. for the run being followed). */
  const showTray = (id: TrayId, inBothModes = false) => {
    setDock(placement[id], { open: true, active: id });
    if (inBothModes) setDock(placement[id], { open: true, active: id }, mode === "canvas" ? "code" : "canvas");
  };
  const toggleTray = (id: TrayId) =>
    visibleTrays.includes(id) ? setDock(placement[id], { open: false }) : showTray(id);
  const moveTray = (id: TrayId, to: Dock) => {
    setPlacement((p) => ({ ...p, [id]: to }));
    setDock(to, { open: true, active: id });
  };

  // Shortcuts: ⌘K assistant, ⌘B / ⌘J / ⌘I docks, ⌘E Canvas ⇄ Code, R rename.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest("input, textarea, select, [contenteditable]");
      const key = e.key.toLowerCase();
      if (e.metaKey || e.ctrlKey) {
        const dock = DOCKS.find((d) => d.key === key);
        if (key === "k") setAssistantOpen((o) => !o);
        else if (key === "e") setMode((m) => (m === "canvas" ? "code" : "canvas"));
        else if (dock) toggleDock(dock.id);
        else return;
        e.preventDefault();
      } else if (key === "r" && !typing && !e.altKey) {
        e.preventDefault();
        setRenaming(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // ---- What's open --------------------------------------------------------

  // The graph shown: the draft, or an earlier version being viewed.
  const graph = version === "latest" ? draft : (graphForVersion?.(version) ?? draft);
  const viewingVersion = version === "latest" ? latestVersion : version;

  const onMain = sandbox === "main";
  const readOnly = onMain || version !== "latest";
  const readOnlyReason = version !== "latest" ? `you're viewing ${version}` : "main is read-only";

  const selectedRun = orders.flatMap((o) => o.runs).find((r) => r.runId === runId);
  const runVersionKnown = selectedRun !== undefined && versions.some((v) => v.id === selectedRun.version);
  const showMismatch = runVersionKnown && viewingVersion !== undefined && selectedRun!.version !== viewingVersion;

  const selectedNode = graph.nodes.find((n) => n.id === selectedId);
  const selectedJob = selectedNode?.type === "job" ? selectedNode : undefined;
  const selectedStep = selectedJob ? selectedRun?.steps.find((s) => s.jobId === selectedJob.id) : undefined;
  // In code, the run button retries from the open step; on the canvas, from the start.
  const retryStep = mode === "code" ? selectedStep : undefined;

  // Step bar order: the workflow, its triggers, then its steps as a run reaches them.
  const navOrder: (string | undefined)[] = [
    undefined,
    ...graph.nodes.filter((n) => n.type === "trigger").map((n) => n.id),
    ...orderedJobs(graph).map((j) => j.id),
  ];
  const navIndex = navOrder.indexOf(selectedNode ? selectedId : undefined);

  const select = (id: string | undefined) => setSelectedId(id);

  const selectOnCanvas = (node: WorkflowNode) => {
    if (selectedId === node.id) {
      setSelectedId(undefined);
      return;
    }
    setSelectedId(node.id);
    showTray("inspect");
  };

  // ---- Editing (sandboxes only) ------------------------------------------

  const edit = (change: (w: Workflow) => Workflow) => {
    setDraft(change);
    setSaveState("edited");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveState("saved"), SAVE_DELAY_MS);
  };

  const updateNode = (id: string, patch: Partial<JobNode> | Partial<TriggerNode>) =>
    edit((w) => ({ ...w, nodes: w.nodes.map((n) => (n.id === id ? ({ ...n, ...patch } as WorkflowNode) : n)) }));

  const updateEdge = (id: string, patch: Partial<WorkflowEdge>) =>
    edit((w) => ({ ...w, edges: w.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));

  const rename = (name: string) => edit((w) => ({ ...w, name }));

  const addStep = () => {
    const last = orderedJobs(draft).at(-1);
    const id = `step-${shortId()}`;
    const job: JobNode = {
      id,
      type: "job",
      label: "Untitled step",
      adaptor: "common",
      adaptorPackage: "@openfn/language-common",
      body: "// Start writing your job here\nfn(state => state);",
      x: last?.x ?? 360,
      y: Math.max(...draft.nodes.map((n) => n.y)) + 170,
    };
    const source = last?.id ?? draft.nodes.find((n) => n.type === "trigger")?.id;
    edit((w) => ({
      ...w,
      nodes: [...w.nodes, job],
      edges: source ? [...w.edges, { id: `e-${source}-${id}`, source, target: id, condition: "on_success" }] : w.edges,
    }));
    setSelectedId(id);
    showTray("inspect");
  };

  const deleteStep = (id: string) => {
    edit((w) => ({
      ...w,
      nodes: w.nodes.filter((n) => n.id !== id),
      edges: w.edges.filter((e) => e.source !== id && e.target !== id),
    }));
    setSelectedId(undefined);
  };

  const insertSnippet = (code: string) => {
    if (!selectedJob) return;
    updateNode(selectedJob.id, { body: `${selectedJob.body.trimEnd()}\n\n${code}` });
  };

  const exportYaml = () => {
    const blob = new Blob([workflowToYaml(graph)], { type: "text/yaml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${graph.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.yaml`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // ---- Runs ---------------------------------------------------------------

  const selectRun = (run: RunDetails) => {
    // Stay on an earlier version only if the new run ran on it too.
    if (version !== "latest" && version !== run.version) setVersion("latest");
    setRunId(run.runId);
    showTray("run", true);
  };

  const deselectRun = () => {
    // Leaving a run you were viewing as executed returns to the latest.
    if (selectedRun && version === selectedRun.version) setVersion("latest");
    setRunId(undefined);
  };

  /** Put a run at the top of its work order, and its work order at the top. */
  const upsertRun = (run: RunDetails) => {
    setOrders((current) => {
      const existing = current.find((o) => o.id === run.workOrderId);
      const runs = [run, ...(existing?.runs.filter((r) => r.runId !== run.runId) ?? [])];
      const order = { id: run.workOrderId, status: run.status, lastActivity: run.when, runs };
      return [order, ...current.filter((o) => o.id !== run.workOrderId)];
    });
  };

  /** Start a run on the latest version, follow it, and fill in its results shortly after. */
  const startRun = ({
    workOrderId,
    input,
    fromJobId,
  }: {
    workOrderId: string;
    input: Dataclip;
    fromJobId?: string;
  }) => {
    const args = {
      workflow: draft,
      version: latestVersion ?? "draft",
      input,
      workOrderId,
      runId: shortId(),
      fromJobId: draft.nodes.some((n) => n.id === fromJobId) ? fromJobId : undefined,
      startedBy: CURRENT_USER,
    };
    upsertRun(simulateRun({ ...args, inProgress: true }).run);
    setVersion("latest");
    setRunId(args.runId);
    showTray("run", true);
    setTimeout(() => {
      const done = simulateRun(args);
      upsertRun(done.run);
      setClips((current) => [...current, ...done.dataclips]);
    }, RUN_TIME_MS);
  };

  /** Keep a new input in the project so it can be picked again. */
  const addInput = (body: string, name?: string): Dataclip => {
    const clip: Dataclip = { id: shortId(), type: "saved_input", body, name, created: "just now" };
    setClips((current) => [clip, ...current]);
    return clip;
  };

  const runFresh = () => startRun({ workOrderId: shortId(), input: addInput("{}") });

  const runWithInput = (input: RunInput) => {
    setRunInputOpen(false);
    const clip =
      input.kind === "existing"
        ? input.dataclip
        : input.kind === "new"
          ? addInput(input.body, input.name)
          : addInput("{}");
    startRun({ workOrderId: shortId(), input: clip });
  };

  /** Run the selected run's input again: from the open step in code, or from the start. */
  const retry = () => {
    if (!selectedRun) return;
    const input = clips.find((d) => d.id === (retryStep ? retryStep.inputId : selectedRun.inputId));
    if (!input) return;
    startRun({ workOrderId: selectedRun.workOrderId, input, fromJobId: retryStep?.jobId });
  };

  // From the open step: retry it with its input in the selected run, or start a run there.
  const canRetryStep = Boolean(selectedRun && selectedStep && selectedRun.status !== "running");
  const runFromStep = () => {
    if (!selectedJob) return;
    const input = canRetryStep ? clips.find((d) => d.id === selectedStep!.inputId) : undefined;
    if (selectedRun && input) startRun({ workOrderId: selectedRun.workOrderId, input, fromJobId: selectedJob.id });
    else startRun({ workOrderId: shortId(), input: addInput("{}"), fromJobId: selectedJob.id });
  };

  const retryControl =
    selectedRun && selectedRun.status !== "running"
      ? {
          step: retryStep ? selectedJob?.label : undefined,
          hint:
            latestVersion && selectedRun.version !== latestVersion
              ? `Runs this input on the latest version (${latestVersion}), not ${selectedRun.version}`
              : undefined,
        }
      : undefined;

  const openStep = (step: RunStep) => {
    if (graph.nodes.some((n) => n.id === step.jobId)) setSelectedId(step.jobId);
  };

  // ---- Sandboxes ----------------------------------------------------------

  const promote = (message: string) => {
    setPromoteOpen(false);
    setVersions([{ id: `v${versions.length + 1}`, message, author: CURRENT_USER, date: "20 Oct 2026" }, ...versions]);
    setVersion("latest");
    selectSandbox("main");
  };

  const createSandbox = ({ name, start }: { name: string; start: SandboxStart }) => {
    // A reviewed copy of a run's input comes along as a named input.
    if (start.kind === "run") addInput(start.body, `Input from run ${start.runId}`);
    setNewSandboxes((current) => [...current, name]);
    setEditInSandboxOpen(false);
    selectSandbox(name);
  };

  const joinSandbox = (name: string) => {
    setEditInSandboxOpen(false);
    selectSandbox(name);
  };

  // ---- File menu ----------------------------------------------------------

  const fileAction = (action: FileMenuAction) => {
    if (action === "back") onBack?.();
    else if (action === "rename") setRenaming(true);
    else if (action === "settings") {
      setSelectedId(undefined);
      showTray("inspect");
    } else if (action === "export") exportYaml();
    else if (action === "edit-in-sandbox") setEditInSandboxOpen(true);
    else if (action === "promote") setPromoteOpen(true);
    else if (action === "run-custom") setRunInputOpen(true);
    else if (action === "mode:canvas") setMode("canvas");
    else if (action === "mode:code") setMode("code");
    else if (action === "assistant") setAssistantOpen((o) => !o);
    else if (action === "toggle-live") setLive((l) => !l);
    else if (action === "delete") setDeleteOpen(true);
    else toggleTray(action.slice("tray:".length) as TrayId);
  };

  // ---- Trays' contents ----------------------------------------------------

  const readOnlyAction = onMain ? { label: "Edit in sandbox", onClick: () => setEditInSandboxOpen(true) } : undefined;

  const renderTray = (id: TrayId) => {
    switch (id) {
      case "steps":
        return {
          actions: !readOnly && (
            <TrayIconButton label="Add step" onClick={addStep}>
              <Plus size={15} />
            </TrayIconButton>
          ),
          body: (
            <StepExplorer
              workflow={graph}
              selectedId={selectedNode ? selectedId : undefined}
              run={selectedRun}
              onSelect={select}
              onAddStep={readOnly ? undefined : addStep}
            />
          ),
        };
      case "history":
        return {
          body: (
            <RecentHistoryPanel
              bare
              workOrders={orders}
              selectedRunId={runId}
              latestVersion={latestVersion}
              onSelectRun={selectRun}
              onDeselectRun={deselectRun}
            />
          ),
        };
      case "inspect":
        return {
          body: (
            <StepInspector
              workflow={graph}
              node={selectedNode}
              readOnly={readOnly}
              readOnlyReason={readOnlyReason}
              readOnlyAction={readOnlyAction}
              url={url}
              onRenameWorkflow={rename}
              onChangeJob={updateNode}
              onChangeTrigger={updateNode}
              onChangeEdge={updateEdge}
              onEditCode={mode === "canvas" ? () => setMode("code") : undefined}
              runFrom={canRetryStep ? "retry" : "run"}
              onRunFrom={runFromStep}
              onDelete={selectedJob ? () => deleteStep(selectedJob.id) : undefined}
            />
          ),
        };
      case "reference":
        return {
          body: (
            <AdaptorReference
              adaptor={selectedJob?.adaptor}
              onInsert={readOnly || !selectedJob ? undefined : insertSnippet}
            />
          ),
        };
      case "run":
        return {
          headerExtra: (
            <RunOutputHeader
              run={selectedRun}
              step={selectedStep}
              stepLabel={selectedJob?.label}
              view={runView}
              onViewChange={setRunView}
            />
          ),
          actions: (
            <RunOutputChip
              run={selectedRun}
              step={selectedStep}
              stepLabel={selectedJob?.label}
              onClearRun={deselectRun}
            />
          ),
          body: (
            <RunOutput
              run={selectedRun}
              step={selectedStep}
              stepOpen={selectedJob !== undefined}
              view={runView}
              dataclips={clips}
              onSelectStep={openStep}
              onRun={runFresh}
              onOpenHistory={() => showTray("history")}
              notice={
                showMismatch && (
                  <VersionMismatchBanner
                    runVersion={selectedRun!.version}
                    viewingVersion={viewingVersion!}
                    onViewAsExecuted={
                      graphForVersion?.(selectedRun!.version) ? () => setVersion(selectedRun!.version) : undefined
                    }
                  />
                )
              }
            />
          ),
        };
    }
  };

  const renderDock = (dock: Dock) => {
    if (!openDocks[dock]) return undefined;
    const active = activeIn(dock);
    const tray = renderTray(active);
    return (
      <Tray
        dock={dock}
        trays={traysIn(dock)}
        active={active}
        onActivate={(id) => setDock(dock, { active: id })}
        headerExtra={"headerExtra" in tray ? tray.headerExtra : undefined}
        actions={"actions" in tray ? tray.actions : undefined}
        onMove={(to) => moveTray(active, to)}
        onClose={() => setDock(dock, { open: false })}
        size={sizes[dock]}
        onResize={(size) => setSizes((s) => ({ ...s, [dock]: size }))}
        floating={mode === "canvas"}
      >
        {tray.body}
      </Tray>
    );
  };

  // ---- Main surface -------------------------------------------------------

  const code = selectedJob ? selectedJob.body : workflowToYaml(graph);
  const editorState: EditorSaveState = readOnly ? "read-only" : saveState;

  const main =
    mode === "canvas" ? (
      <WorkflowCanvas
        workflow={graph}
        selectedId={selectedId}
        onSelect={selectOnCanvas}
        run={selectedRun}
        height={760}
        fill
        transparent
      />
    ) : (
      <div className="flex h-full flex-col">
        <StepBar
          workflowName={graph.name}
          node={selectedNode}
          onPrev={navIndex > 0 ? () => select(navOrder[navIndex - 1]) : undefined}
          onNext={navIndex < navOrder.length - 1 ? () => select(navOrder[navIndex + 1]) : undefined}
          onSelectWorkflow={() => select(undefined)}
          onOpenDocs={() => showTray("reference")}
          runFrom={canRetryStep ? "retry" : "run"}
          onRunFrom={runFromStep}
        />
        <div className="min-h-0 flex-1">
          <CodeEditor code={code} />
        </div>
        <EditorStatusBar
          adaptor={selectedJob?.adaptor}
          file={selectedNode ? selectedNode.label : "workflow.yaml"}
          lines={code.split("\n").length}
          state={editorState}
          readOnlyReason={readOnlyReason}
        />
      </div>
    );

  return (
    <>
      <EditorShell
        mode={mode}
        toolbar={
          <WorkflowTopBar
            workflow={{ ...graph, name: draft.name }}
            projectName={workflow.project}
            renaming={renaming}
            onRename={rename}
            onRenameDone={() => setRenaming(false)}
            mode={mode}
            onModeChange={setMode}
            openDocks={openDocks}
            availableDocks={availableDocks}
            onToggleDock={toggleDock}
            visibleTrays={visibleTrays}
            onFileAction={fileAction}
            retry={retryControl}
            onRun={runFresh}
            onRetry={retry}
            onRunWithCustomInput={() => setRunInputOpen(true)}
            url={url}
            onSeeDetails={onSeeDetails}
            live={live}
            onToggleLive={setLive}
            sandboxes={allSandboxes}
            sandbox={sandbox}
            onSelectSandbox={selectSandbox}
            onViewAllSandboxes={onViewAllSandboxes}
            versions={versions}
            version={version}
            onSelectVersion={setVersion}
            onEditInSandbox={() => setEditInSandboxOpen(true)}
            onPromote={() => setPromoteOpen(true)}
            assistantOpen={assistantOpen}
            onToggleAssistant={() => setAssistantOpen((o) => !o)}
            defaultFileMenuOpen={defaultFileMenuOpen}
          />
        }
        assistant={
          <AIAssistantPanel
            appearance="card"
            open={assistantOpen}
            onClose={() => setAssistantOpen(false)}
            conversations={assistantConversations}
            jobLabel={mode === "code" ? selectedJob?.label : undefined}
            runId={selectedRun?.runId}
            author={CURRENT_USER}
          />
        }
      >
        <EditorLayout
          floating={mode === "canvas"}
          left={renderDock("left")}
          right={renderDock("right")}
          bottom={renderDock("bottom")}
        >
          {main}
        </EditorLayout>
      </EditorShell>

      <RunInputModal
        open={runInputOpen}
        onClose={() => setRunInputOpen(false)}
        dataclips={clips}
        onRun={runWithInput}
      />

      <EditInSandboxModal
        open={editInSandboxOpen}
        onClose={() => setEditInSandboxOpen(false)}
        sandboxes={allSandboxes.filter((s) => s !== "main")}
        run={selectedRun}
        runInput={selectedRun ? clips.find((d) => d.id === selectedRun.inputId) : undefined}
        latestVersion={latestVersion}
        dataclips={clips}
        onCreate={createSandbox}
        onJoin={joinSandbox}
      />

      <PromoteSandboxModal
        open={promoteOpen && !onMain}
        onClose={() => setPromoteOpen(false)}
        sandbox={sandbox}
        workflowName={draft.name}
        nextVersion={`v${versions.length + 1}`}
        onPromote={promote}
      />

      <Modal
        open={deleteOpen}
        title={`Delete ${draft.name}?`}
        onClose={() => setDeleteOpen(false)}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setDeleteOpen(false);
                onBack?.();
              }}
            >
              Delete workflow
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          It stops running and is removed from {draft.project}. This can't be undone.
        </p>
      </Modal>
    </>
  );
}
