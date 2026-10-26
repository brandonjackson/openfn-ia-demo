import { useEffect, useState } from "react";
import { Code2, Sparkles } from "lucide-react";
import type {
  AdaptorKind,
  Dataclip,
  JobNode,
  RunDetails,
  RunStep,
  TriggerNode,
  Workflow,
  WorkflowNode,
  WorkflowVersion,
  WorkOrder,
} from "../mock-data/workflow";
import { defaultWorkflowSettings, workflowToYaml } from "../mock-data/workflow";
import type { WorkflowSettings } from "../mock-data/workflow";
import { shortId, simulateRun } from "../mock-data/runs";
import { adaptorInfo } from "../mock-data/adaptor-reference";
import type { Snippet } from "../mock-data/adaptor-reference";
import type { AssistantConversation, AssistantPlan } from "../mock-data/assistant";
import type { ProjectComponent } from "../mock-data/projects";
import EditorShell from "../components/workflow/EditorShell";
import EditorToolbar from "../components/workflow/EditorToolbar";
import type { EditorView } from "../components/workflow/EditorToolbar";
import type { WorkflowMenuAction } from "../components/workflow/WorkflowFileMenu";
import EditorTray from "../components/workflow/EditorTray";
import EditorPanel from "../components/workflow/EditorPanel";
import { useEditorLayout, resetLayout } from "../editor-layout";
import type { EditorLayout, PanelViewId } from "../editor-layout";
import WorkflowCanvas from "../components/workflow/WorkflowCanvas";
import CodeWorkspace from "../components/workflow/CodeWorkspace";
import type { ExplorerFile } from "../components/workflow/EditorExplorer";
import VersionMismatchBanner from "../components/workflow/VersionMismatchBanner";
import StepRunDetails from "../components/workflow/StepRunDetails";
import RunHistoryList from "../components/workflow/RunHistoryList";
import StepConfigPanel from "../components/workflow/StepConfigPanel";
import type { StepChanges } from "../components/workflow/StepConfigPanel";
import TriggerConfigPanel from "../components/workflow/TriggerConfigPanel";
import AdaptorReferencePanel from "../components/workflow/AdaptorReferencePanel";
import AIAssistantPanel from "../components/workflow/AIAssistantPanel";
import StatusPill from "../components/workflow/StatusPill";
import RunInputModal from "../components/RunInputModal";
import type { RunInput } from "../components/RunInputModal";
import EditInSandboxModal from "../components/EditInSandboxModal";
import type { SandboxStart } from "../components/EditInSandboxModal";
import PromoteSandboxModal from "../components/PromoteSandboxModal";
import ConfirmModal from "../components/ConfirmModal";
import Button from "../components/Button";

/** Who starts runs and retries in the prototype. */
const CURRENT_USER = "Jane Doe";

/** How long a simulated run takes before its results come in. */
const RUN_TIME_MS = 1500;

/** Edits made in this session, on top of the workflow as loaded. */
interface Edits {
  labels: Record<string, string>;
  adaptors: Record<string, AdaptorKind>;
  bodies: Record<string, string>;
  credentials: Record<string, string | undefined>;
  removed: string[];
  added: JobNode[];
}

const noEdits: Edits = { labels: {}, adaptors: {}, bodies: {}, credentials: {}, removed: [], added: [] };

/** The workflow with this session's edits applied. */
function applyEdits(workflow: Workflow, edits: Edits, name: string): Workflow {
  const nodes: WorkflowNode[] = [...workflow.nodes, ...edits.added]
    .filter((n) => !edits.removed.includes(n.id))
    .map((n) => {
      if (n.type !== "job") return n;
      const adaptor = edits.adaptors[n.id] ?? n.adaptor;
      return {
        ...n,
        label: edits.labels[n.id] ?? n.label,
        adaptor,
        adaptorPackage: adaptorInfo[adaptor].package,
        body: edits.bodies[n.id] ?? n.body,
      };
    });
  const ids = new Set(nodes.map((n) => n.id));
  const edges = [
    ...workflow.edges,
    ...edits.added.map((job, i) => {
      const previous = i === 0 ? workflow.nodes.filter((n) => n.type === "job").at(-1) : edits.added[i - 1];
      return { id: `e-${previous?.id}-${job.id}`, source: previous?.id ?? "", target: job.id, condition: "on_success" as const };
    }),
  ].filter((e) => ids.has(e.source) && ids.has(e.target));
  return { ...workflow, name, nodes, edges };
}

/**
 * The workflow editor: one toolbar, two views, and an IDE-style layout of
 * explorer, panel and assistant.
 *
 * The toolbar's Fn menu holds the workflow's file actions (rename, settings,
 * sandbox and promotion, export, pause, delete) and the way back to the
 * project. The view switcher flips between the canvas and code (explorer,
 * code and the open item's settings). Layout toggles at the right show or
 * hide the explorer (Ctrl/⌘ + B), the panel (Ctrl/⌘ + J) and the assistant
 * (Ctrl/⌘ + K); the layout is remembered across workflows.
 *
 * The panel along the bottom carries the views that aren't canvas or code:
 * Runs (to load one), the selected Step's settings, its Log, Input and
 * Output in the loaded run, and the adaptor Reference. Its ⋯ menu chooses
 * which views it shows. On the canvas it floats; in code mode it sits under
 * the code. The assistant has the right-hand side to itself.
 *
 * On main everything is read-only and the main action is "Edit in sandbox".
 * In a sandbox steps can be renamed, re-adaptored, given credentials, have
 * snippets inserted, be added and deleted, and "Go live" promotes the sandbox
 * to main as a new version.
 *
 * Loading a run from the Runs view draws it on the canvas, marks each step in
 * the explorer and fills the Log, Input and Output views for the step in
 * focus.
 * When the run took place on an older version, a banner offers to view the
 * version that ran. With a run selected the run button becomes Retry.
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
  initialView = "canvas",
  initialSelectedId,
  initialFile,
  initialVersion = "latest",
  initialLayout,
  onBack,
  onDelete,
  projectName,
  components = [],
  onOpenComponent,
  sandboxes = ["main"],
  sandbox: controlledSandbox,
  onSelectSandbox,
  onViewAllSandboxes,
  versions: initialVersions = [],
  url,
  onSeeDetails,
  defaultEditInSandboxOpen = false,
  defaultRunInputOpen = false,
  assistantConversations = [],
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
  initialView?: EditorView;
  /** The node selected on the canvas. */
  initialSelectedId?: string;
  /** What code mode opens on. */
  initialFile?: ExplorerFile;
  /** "latest" or a version id (useful for stories). */
  initialVersion?: string;
  /** Overrides the remembered layout (useful for stories). */
  initialLayout?: Partial<EditorLayout>;
  /** Back to the project's workflows. */
  onBack?: () => void;
  /** The workflow was deleted. */
  onDelete?: () => void;
  /** Named in the file menu's "Back to …" item. */
  projectName?: string;
  /** Project components the workflow uses, listed in the code explorer. */
  components?: ProjectComponent[];
  /** Opens a component's page in the project. */
  onOpenComponent?: (componentId: string) => void;
  /** Sandboxes of the workflow's project, "main" first. */
  sandboxes?: string[];
  sandbox?: string;
  onSelectSandbox?: (sandbox: string) => void;
  onViewAllSandboxes?: () => void;
  /** Version history on main, newest first. */
  versions?: WorkflowVersion[];
  /** The URL that starts the workflow, for "Copy webhook URL". */
  url?: string;
  /** Opens the service listing where the workflow is documented. */
  onSeeDetails?: () => void;
  /** Start with a dialog open (useful for stories). */
  defaultEditInSandboxOpen?: boolean;
  defaultRunInputOpen?: boolean;
  /** Saved assistant conversations for this workflow. */
  assistantConversations?: AssistantConversation[];
}) {
  // ---- Where we are ---------------------------------------------------------

  const [view, setView] = useState<EditorView>(initialView);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);
  const [file, setFile] = useState<ExplorerFile>(initialFile ?? (initialSelectedId ? { stepId: initialSelectedId } : "workflow"));

  const [localSandbox, setLocalSandbox] = useState("main");
  const sandbox = controlledSandbox ?? localSandbox;
  const selectSandbox = onSelectSandbox ?? setLocalSandbox;
  const onMain = sandbox === "main";
  // Sandboxes made from the editor join the project's list for this session.
  const [newSandboxes, setNewSandboxes] = useState<string[]>([]);
  const allSandboxes = [...sandboxes, ...newSandboxes.filter((s) => !sandboxes.includes(s))];

  const [versions, setVersions] = useState(initialVersions);
  const [version, setVersion] = useState(initialVersion);
  const latestVersion = versions[0]?.id;

  // ---- Edits ----------------------------------------------------------------

  const [live, setLive] = useState(true);
  const [name, setName] = useState(workflow.name);
  const [settings, setSettings] = useState<WorkflowSettings>(() => defaultWorkflowSettings(workflow));
  const [edits, setEdits] = useState<Edits>(noEdits);
  const [statusNote, setStatusNote] = useState<string>();
  const edit = (patch: (e: Edits) => Partial<Edits>) => setEdits((e) => ({ ...e, ...patch(e) }));

  // The graph on the canvas: the latest with this session's edits, or an earlier version being viewed.
  const graph =
    version === "latest" ? applyEdits(workflow, edits, name) : (graphForVersion?.(version) ?? applyEdits(workflow, edits, name));
  const viewingVersion = version === "latest" ? latestVersion : version;

  // ---- Runs -----------------------------------------------------------------

  const [orders, setOrders] = useState(initialWorkOrders);
  const [clips, setClips] = useState(initialDataclips);
  const [localRunId, setLocalRunId] = useState(controlledRunId);
  const runId = onRunChange ? controlledRunId : localRunId;
  const setRunId = onRunChange ?? setLocalRunId;

  const selectedRun = orders.flatMap((o) => o.runs).find((r) => r.runId === runId);
  const runVersionKnown = selectedRun !== undefined && versions.some((v) => v.id === selectedRun.version);
  const showMismatch = runVersionKnown && viewingVersion !== undefined && selectedRun!.version !== viewingVersion;

  // The step in focus: the selected node on the canvas, or the open file in code mode.
  const focusId =
    view === "code"
      ? typeof file === "object"
        ? "stepId" in file
          ? file.stepId
          : undefined
        : file === "trigger"
          ? "trigger"
          : undefined
      : selectedId;
  const focusNode = graph.nodes.find((n) => n.id === focusId);
  const focusJob = focusNode?.type === "job" ? focusNode : undefined;
  const focusTrigger = focusNode?.type === "trigger" ? (focusNode as TriggerNode) : undefined;
  const focusStep = focusJob ? selectedRun?.steps.find((s) => s.jobId === focusJob.id) : undefined;

  // ---- Layout ---------------------------------------------------------------

  const [savedLayout, setLayout] = useEditorLayout();
  // Stories pin a layout; the app remembers the reader's.
  const [override, setOverride] = useState<Partial<EditorLayout>>(initialLayout ?? {});
  const layout: EditorLayout = { ...savedLayout, ...override };
  const updateLayout = (patch: Partial<EditorLayout>) => {
    setLayout(patch);
    setOverride((o) => {
      const next = { ...o };
      for (const key of Object.keys(patch) as (keyof EditorLayout)[]) delete next[key];
      return next;
    });
  };
  const [docsAdaptor, setDocsAdaptor] = useState<AdaptorKind | undefined>();

  /** Show the panel on a view, e.g. a step's log when a run is loaded. */
  const showPanel = (panelView: PanelViewId) => updateLayout({ panel: true, panelView });
  const togglePanel = () => updateLayout({ panel: !layout.panel });
  const toggleAssistant = () => updateLayout({ assistant: !layout.assistant });
  const toggleExplorer = () => updateLayout({ explorer: !layout.explorer });

  // IDE-style shortcuts: Ctrl/⌘ + B explorer, J panel, K assistant.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const key = e.key.toLowerCase();
      if (key === "k") toggleAssistant();
      else if (key === "j") togglePanel();
      else if (key === "b" && view === "code") toggleExplorer();
      else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, view]);

  const selectNode = (node: WorkflowNode) => {
    const next = selectedId === node.id ? undefined : node.id;
    setSelectedId(next);
    // Selecting a step brings its settings up, or its log when a run is loaded.
    if (next) showPanel(selectedRun?.steps.some((s) => s.jobId === next) ? "log" : "step");
  };

  const openInCode = (stepId?: string) => {
    setFile(stepId ? { stepId } : "workflow");
    setView("code");
  };

  const [runInputOpen, setRunInputOpen] = useState(defaultRunInputOpen);
  const [editInSandboxOpen, setEditInSandboxOpen] = useState(defaultEditInSandboxOpen);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ---- Running --------------------------------------------------------------

  const selectRun = (run: RunDetails) => {
    // Stay on an earlier version only if the new run ran on it too.
    if (version !== "latest" && version !== run.version) setVersion("latest");
    setRunId(run.runId);
    // The panel follows the run for whatever's in focus.
    if (focusJob && run.steps.some((s) => s.jobId === focusJob.id)) showPanel("log");
  };

  const deselectRun = () => {
    // Leaving a run you were viewing as executed returns to the latest.
    if (selectedRun && version === selectedRun.version) setVersion("latest");
    setRunId(undefined);
    if (["log", "input", "output"].includes(layout.panelView)) updateLayout({ panelView: "runs" });
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
  const startRun = ({ workOrderId, input, fromJobId }: { workOrderId: string; input: Dataclip; fromJobId?: string }) => {
    const latest = applyEdits(workflow, edits, name);
    const args = {
      workflow: latest,
      version: latestVersion ?? "draft",
      input,
      workOrderId,
      runId: shortId(),
      fromJobId: latest.nodes.some((n) => n.id === fromJobId) ? fromJobId : undefined,
      startedBy: CURRENT_USER,
    };
    upsertRun(simulateRun({ ...args, inProgress: true }).run);
    setVersion("latest");
    setRunId(args.runId);
    if (focusJob) showPanel("log");
    setTimeout(() => {
      const done = simulateRun(args);
      upsertRun(done.run);
      setClips((current) => [...current, ...done.dataclips]);
    }, RUN_TIME_MS);
  };

  /** Keep a new input in the project so it can be picked again. */
  const addInput = (body: string, inputName?: string): Dataclip => {
    const clip: Dataclip = { id: shortId(), type: "saved_input", body, name: inputName, created: "just now" };
    setClips((current) => [clip, ...current]);
    return clip;
  };

  const runFresh = (fromJobId?: string) => startRun({ workOrderId: shortId(), input: addInput("{}"), fromJobId });

  const runWithInput = (input: RunInput) => {
    setRunInputOpen(false);
    const clip =
      input.kind === "existing" ? input.dataclip : input.kind === "new" ? addInput(input.body, input.name) : addInput("{}");
    startRun({ workOrderId: shortId(), input: clip });
  };

  /** Run the selected run's input again: from the step in focus, or from the start. */
  const retry = () => {
    if (!selectedRun) return;
    const input = clips.find((d) => d.id === (focusStep ? focusStep.inputId : selectedRun.inputId));
    if (!input) return;
    startRun({ workOrderId: selectedRun.workOrderId, input, fromJobId: focusStep?.jobId });
  };

  const retryControl =
    selectedRun && selectedRun.status !== "running"
      ? {
          step: focusStep ? focusJob?.label : undefined,
          hint:
            latestVersion && selectedRun.version !== latestVersion
              ? `Runs this input on the latest version (${latestVersion}), not ${selectedRun.version}`
              : undefined,
        }
      : undefined;

  const openStep = (step: RunStep) => {
    if (!graph.nodes.some((n) => n.id === step.jobId)) return;
    if (view === "code") setFile({ stepId: step.jobId });
    else setSelectedId(step.jobId);
  };

  // ---- Sandboxes ------------------------------------------------------------

  const promote = (message: string) => {
    setPromoteOpen(false);
    setVersions([{ id: `v${versions.length + 1}`, message, author: CURRENT_USER, date: "20 Oct 2026" }, ...versions]);
    setVersion("latest");
    selectSandbox("main");
  };

  const createSandbox = ({ name: sandboxName, start }: { name: string; start: SandboxStart }) => {
    // A reviewed copy of a run's input comes along as a named input.
    if (start.kind === "run") addInput(start.body, `Input from run ${start.runId}`);
    setNewSandboxes((current) => [...current, sandboxName]);
    setEditInSandboxOpen(false);
    selectSandbox(sandboxName);
  };

  const joinSandbox = (sandboxName: string) => {
    setEditInSandboxOpen(false);
    selectSandbox(sandboxName);
  };

  // ---- Editing --------------------------------------------------------------

  const changeStep = (stepId: string, changes: StepChanges) =>
    edit((e) => ({
      labels: changes.label !== undefined ? { ...e.labels, [stepId]: changes.label } : e.labels,
      adaptors: changes.adaptor !== undefined ? { ...e.adaptors, [stepId]: changes.adaptor } : e.adaptors,
      credentials: "credentialId" in changes ? { ...e.credentials, [stepId]: changes.credentialId } : e.credentials,
    }));

  const insertSnippet = (stepId: string, snippet: Snippet) => {
    const current = graph.nodes.find((n): n is JobNode => n.type === "job" && n.id === stepId)?.body ?? "";
    edit((e) => ({ bodies: { ...e.bodies, [stepId]: `${current.trimEnd()}\n\n${snippet.code}` } }));
  };

  const addStep = () => {
    const id = `step-${shortId().slice(0, 4)}`;
    const last = graph.nodes.filter((n): n is JobNode => n.type === "job").at(-1);
    const job: JobNode = {
      id,
      type: "job",
      label: "Untitled step",
      adaptor: "common",
      adaptorPackage: adaptorInfo.common.package,
      body: "// Start writing your step here\nfn(state => state);",
      x: last?.x ?? 360,
      y: (last?.y ?? 70) + 170,
    };
    edit((e) => ({ added: [...e.added, job] }));
    setFile({ stepId: id });
    setView("code");
  };

  const deleteStep = (stepId: string) => {
    edit((e) => ({ removed: [...e.removed, stepId] }));
    if (selectedId === stepId) setSelectedId(undefined);
    if (typeof file === "object" && "stepId" in file && file.stepId === stepId) setFile("workflow");
    if (layout.panelView === "step") updateLayout({ panelView: "runs" });
  };

  /** A plan the assistant carried out: note it on the step it was about. */
  const applyPlan = (plan: AssistantPlan) => {
    const target = focusJob ?? graph.nodes.find((n): n is JobNode => n.type === "job");
    if (!target) return;
    edit((e) => ({
      bodies: { ...e.bodies, [target.id]: `// Assistant: ${plan.steps[0]}\n${e.bodies[target.id] ?? target.body}` },
    }));
    setStatusNote("Tested by the assistant");
  };

  const exportYaml = () => {
    const blob = new Blob([workflowToYaml(graph)], { type: "text/yaml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${graph.id}.yaml`;
    a.click();
    URL.revokeObjectURL(a.href);
    openInCode();
  };

  const onMenuAction = (action: WorkflowMenuAction) => {
    switch (action) {
      case "back":
        return onBack?.();
      case "settings":
        return openInCode();
      case "edit-in-sandbox":
        return setEditInSandboxOpen(true);
      case "promote":
        return setPromoteOpen(true);
      case "export-yaml":
        return exportYaml();
      case "copy-url":
        return void navigator.clipboard?.writeText(url ?? "");
      case "see-details":
        return onSeeDetails?.();
      case "toggle-live":
        return setLive((l) => !l);
      case "delete":
        return setDeleteOpen(true);
    }
  };

  const runFooter = showMismatch && (
    <VersionMismatchBanner
      runVersion={selectedRun!.version}
      viewingVersion={viewingVersion!}
      onViewAsExecuted={graphForVersion?.(selectedRun!.version) ? () => setVersion(selectedRun!.version) : undefined}
    />
  );

  // ---- Panel and assistant --------------------------------------------------

  // In code mode the step's settings are already beside its code.
  const disabledViews: PanelViewId[] = [
    ...(focusJob && view === "canvas" ? [] : (["step"] as PanelViewId[])),
    ...(selectedRun ? [] : (["log", "input", "output"] as PanelViewId[])),
  ];
  const visibleViews = (["runs", "step", "log", "input", "output", "reference"] as PanelViewId[]).filter(
    (v) => !layout.hiddenViews.includes(v) && !disabledViews.includes(v)
  );
  const panelView = visibleViews.includes(layout.panelView) ? layout.panelView : (visibleViews[0] ?? "runs");

  const panelContext = (() => {
    if (panelView === "runs" || panelView === "log" || panelView === "input" || panelView === "output") {
      return selectedRun ? (
        <>
          <StatusPill status={selectedRun.status} variant="dot" />
          <span className="truncate">
            Run <code className="font-mono">{selectedRun.runId.slice(0, 6)}</code>
            {focusJob && panelView !== "runs" ? ` · ${focusJob.label}` : panelView !== "runs" ? " · whole run" : ` · ${selectedRun.when}`}
            {focusStep?.duration && panelView !== "runs" ? ` · ${focusStep.duration}` : ""}
          </span>
          <button
            type="button"
            onClick={deselectRun}
            className="rounded px-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
          >
            Unload
          </button>
        </>
      ) : (
        <span>No run loaded</span>
      );
    }
    if (panelView === "step" && focusNode) {
      return (
        <>
          <span className="truncate">{focusNode.label}</span>
          {focusJob && (
            <Button variant="ghost" size="xs" icon={Code2} onClick={() => openInCode(focusJob.id)}>
              Open code
            </Button>
          )}
        </>
      );
    }
    return undefined;
  })();

  const panelBody = (() => {
    switch (panelView) {
      case "runs":
        return (
          <RunHistoryList
            workOrders={orders}
            selectedRunId={runId}
            latestVersion={latestVersion}
            onSelectRun={selectRun}
            onDeselectRun={deselectRun}
            footer={runFooter}
          />
        );
      case "step":
        return focusJob ? (
          <StepConfigPanel
            key={focusJob.id}
            step={focusJob}
            workflow={graph}
            credentialId={edits.credentials[focusJob.id]}
            readOnly={onMain}
            onChange={(c) => changeStep(focusJob.id, c)}
            onInsertSnippet={(s) => insertSnippet(focusJob.id, s)}
            onOpenReference={() => showPanel("reference")}
            onDelete={() => deleteStep(focusJob.id)}
            showHeader={false}
          />
        ) : focusTrigger ? (
          <TriggerConfigPanel trigger={focusTrigger} url={url} readOnly={onMain} live={live} onToggleLive={setLive} />
        ) : null;
      case "reference":
        return (
          <AdaptorReferencePanel
            adaptor={docsAdaptor ?? focusJob?.adaptor ?? "common"}
            onChangeAdaptor={setDocsAdaptor}
            onInsert={!onMain && focusJob ? (s) => insertSnippet(focusJob.id, s) : undefined}
            stepLabel={focusJob?.label}
          />
        );
      default:
        return selectedRun ? (
          <StepRunDetails
            run={selectedRun}
            step={focusStep}
            wholeRun={!focusJob}
            dataclips={clips}
            tab={panelView}
            onSelectStep={openStep}
          />
        ) : null;
    }
  })();

  const panel = layout.panel ? (
    <EditorPanel
      view={panelView}
      onViewChange={(v) => updateLayout({ panelView: v })}
      disabledViews={disabledViews}
      hiddenViews={layout.hiddenViews}
      onToggleView={(v) =>
        updateLayout({
          hiddenViews: layout.hiddenViews.includes(v) ? layout.hiddenViews.filter((h) => h !== v) : [...layout.hiddenViews, v],
        })
      }
      onResetViews={resetLayout}
      maximized={layout.panelMaximized}
      onToggleMaximized={() => updateLayout({ panelMaximized: !layout.panelMaximized })}
      onClose={togglePanel}
      context={panelContext}
      floating={view === "canvas"}
    >
      {panelBody}
    </EditorPanel>
  ) : undefined;

  const rightTray = layout.assistant ? (
    <EditorTray title="Assistant" icon={Sparkles} placement="right" onClose={toggleAssistant}>
      <AIAssistantPanel
        conversations={assistantConversations}
        jobLabel={focusJob?.label}
        runId={selectedRun?.runId}
        author={CURRENT_USER}
        onOpenRuns={() => showPanel("runs")}
        onAskToMerge={onMain ? undefined : () => setPromoteOpen(true)}
        onPlanAccepted={onMain ? undefined : applyPlan}
      />
    </EditorTray>
  ) : undefined;


  // ---- Layout ---------------------------------------------------------------

  const toolbar = (
    <EditorToolbar
      name={name}
      onRename={setName}
      onMenuAction={onMenuAction}
      projectName={projectName}
      url={url}
      hasDetails={onSeeDetails !== undefined}
      sandboxes={allSandboxes}
      sandbox={sandbox}
      onSelectSandbox={selectSandbox}
      onNewSandbox={() => setEditInSandboxOpen(true)}
      onViewAllSandboxes={onViewAllSandboxes}
      versions={versions}
      version={version}
      onSelectVersion={setVersion}
      live={live}
      view={view}
      onViewChange={setView}
      retry={retryControl}
      onRun={() => runFresh()}
      onRetry={retry}
      onRunWithCustomInput={() => setRunInputOpen(true)}
      explorerOpen={view === "code" ? layout.explorer : undefined}
      onToggleExplorer={view === "code" ? toggleExplorer : undefined}
      panelOpen={layout.panel}
      onTogglePanel={togglePanel}
      assistantOpen={layout.assistant}
      onToggleAssistant={toggleAssistant}
    />
  );

  return (
    <EditorShell
      toolbar={toolbar}
      sandboxed={!onMain}
      rightTray={rightTray}
      bottomTray={view === "canvas" ? panel : undefined}
      overlays={
        <>
          <RunInputModal open={runInputOpen} onClose={() => setRunInputOpen(false)} dataclips={clips} onRun={runWithInput} />
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
            workflowName={name}
            nextVersion={`v${versions.length + 1}`}
            onPromote={promote}
          />
          <ConfirmModal
            open={deleteOpen}
            title="Delete workflow?"
            confirmLabel="Delete workflow"
            onClose={() => setDeleteOpen(false)}
            onConfirm={() => {
              setDeleteOpen(false);
              (onDelete ?? onBack)?.();
            }}
          >
            <p>
              <strong>{name}</strong> and its run history will be removed{projectName ? ` from ${projectName}` : ""}.
            </p>
            <p>This can't be undone.</p>
          </ConfirmModal>
        </>
      }
    >
      {view === "canvas" && (
        <WorkflowCanvas workflow={graph} selectedId={selectedId} onSelect={selectNode} run={selectedRun} height={760} />
      )}
      {view === "code" && (
        <div className="h-full p-4 pt-3">
          <CodeWorkspace
            workflow={graph}
            file={file}
            onOpen={(f) => {
              setFile(f);
              if (typeof f === "object" && "stepId" in f && selectedRun?.steps.some((s) => s.jobId === f.stepId)) {
                if (!["input", "output"].includes(layout.panelView)) showPanel("log");
              }
            }}
            run={selectedRun}
            components={components}
            onOpenComponent={onOpenComponent}
            readOnly={onMain}
            url={url}
            live={live}
            onToggleLive={setLive}
            settings={settings}
            onSettingsChange={(s) => {
              setSettings(s);
              if (s.name.trim()) setName(s.name);
            }}
            credentials={edits.credentials}
            onStepChange={onMain ? undefined : changeStep}
            onInsertSnippet={onMain ? undefined : insertSnippet}
            onOpenReference={() => showPanel("reference")}
            onDeleteStep={onMain ? undefined : deleteStep}
            onAddStep={onMain ? undefined : addStep}
            onRunFromStep={(id) => runFresh(id)}
            onRetryFromStep={() => retry()}
            bottomTray={panel}
            showExplorer={layout.explorer}
            statusNote={statusNote}
          />
        </div>
      )}
    </EditorShell>
  );
}
