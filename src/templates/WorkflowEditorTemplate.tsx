import { useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import type {
  AdaptorKind,
  Dataclip,
  JobNode,
  RunDetails,
  RunStep,
  Workflow,
  WorkflowEdge,
  WorkflowNode,
  WorkflowVersion,
  WorkOrder,
} from "../mock-data/workflow";
import { defaultWorkflowSettings, workflowToYaml } from "../mock-data/workflow";
import type { WorkflowSettings } from "../mock-data/workflow";
import { failureReasons, filterWorkOrders, runActivity, shortId, simulateRun, workflowHealth } from "../mock-data/runs";
import type { ActivityPeriod } from "../mock-data/runs";
import { adaptorInfo, adaptorSnippets } from "../mock-data/adaptor-reference";
import { builtInTools } from "../mock-data/adaptor-catalog";
import { connectedSystems } from "../mock-data/connected-systems";
import type { AssistantConversation, AssistantPlan, AssistantReference } from "../mock-data/assistant";
import type { ProjectComponent, ProjectService } from "../mock-data/projects";
import EditorShell from "../components/workflow/EditorShell";
import EditorToolbar from "../components/workflow/EditorToolbar";
import type { EditorView } from "../components/workflow/EditorToolbar";
import type { WorkflowMenuAction } from "../components/workflow/WorkflowFileMenu";
import EditorTray from "../components/workflow/EditorTray";
import EditorPanel from "../components/workflow/EditorPanel";
import LayoutMenu from "../components/workflow/LayoutMenu";
import { useEditorLayout, resetLayout } from "../editor-layout";
import type { EditorLayout, PanelViewId } from "../editor-layout";
import WorkflowCanvas from "../components/workflow/WorkflowCanvas";
import type { NodeAction } from "../components/workflow/WorkflowNodeCard";
import CodeWorkspace from "../components/workflow/CodeWorkspace";
import type { ExplorerFile } from "../components/workflow/EditorExplorer";
import VersionMismatchBanner from "../components/workflow/VersionMismatchBanner";
import StepRunDetails from "../components/workflow/StepRunDetails";
import StepInspector from "../components/workflow/StepInspector";
import type { InspectorSection } from "../components/workflow/StepInspector";
import Button from "../components/Button";
import CanvasRunsBar from "../components/workflow/CanvasRunsBar";
import ReadOnlyNotice from "../components/workflow/ReadOnlyNotice";
import FailureBreakdown from "../components/workflow/FailureBreakdown";
import type { FailureScope } from "../components/workflow/FailureBreakdown";
import RunHistoryList from "../components/workflow/RunHistoryList";
import type { StepChanges } from "../components/workflow/StepConfigPanel";
import AIAssistantPanel from "../components/workflow/AIAssistantPanel";
import StatusPill from "../components/workflow/StatusPill";
import RunInputModal from "../components/RunInputModal";
import type { RunInput } from "../components/RunInputModal";
import EditInSandboxModal from "../components/EditInSandboxModal";
import type { SandboxStart } from "../components/EditInSandboxModal";
import PromoteSandboxModal from "../components/PromoteSandboxModal";
import ConfirmModal from "../components/ConfirmModal";
import Modal from "../components/Modal";
import AddComponentPanel from "../components/AddComponentPanel";
import WorkflowHealth from "../components/workflow/WorkflowHealth";
import ConnectSystemPicker from "../components/workflow/ConnectSystemPicker";
import type { ConnectChoice } from "../components/workflow/ConnectSystemPicker";
import { componentTypes } from "../component-types";

/** Who starts runs and retries in the prototype. */
const CURRENT_USER = "Jane Doe";

/** How long each step of a simulated run takes, so the run can be watched going. */
const STEP_TIME_MS = 700;

/** Edits made in this session, on top of the workflow as loaded. */
interface Edits {
  labels: Record<string, string>;
  adaptors: Record<string, AdaptorKind>;
  bodies: Record<string, string>;
  credentials: Record<string, string | undefined>;
  removed: string[];
  added: JobNode[];
  /** The edges into added steps. */
  addedEdges: WorkflowEdge[];
}

const noEdits: Edits = { labels: {}, adaptors: {}, bodies: {}, credentials: {}, removed: [], added: [], addedEdges: [] };

/** How far apart steps sit on the canvas: one row down, or one branch across. */
const ROW_GAP = 170;
const BRANCH_GAP = 320;

/** Where a step added after `source` goes: straight below it, or beside its other children as a new branch. */
function placeAfter(workflow: Workflow, source: WorkflowNode): { x: number; y: number } {
  const children = workflow.edges
    .filter((e) => e.source === source.id)
    .map((e) => workflow.nodes.find((n) => n.id === e.target))
    .filter((n): n is WorkflowNode => n !== undefined);
  const y = source.y + ROW_GAP;
  let x = children.length ? Math.max(...children.map((c) => c.x)) + BRANCH_GAP : source.x;
  while (workflow.nodes.some((n) => Math.abs(n.x - x) < BRANCH_GAP - 20 && Math.abs(n.y - y) < ROW_GAP - 40)) x += BRANCH_GAP;
  return { x, y };
}

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
  const edges = [...workflow.edges, ...edits.addedEdges].filter((e) => ids.has(e.source) && ids.has(e.target));
  return { ...workflow, name, nodes, edges };
}

/**
 * The workflow editor: one toolbar, three views, and an IDE-style layout of
 * explorer, panel and assistant.
 *
 * The toolbar's Fn menu holds the workflow's file actions (rename, settings,
 * sandbox and promotion, export, pause, delete) and the way back to the
 * project. The view switcher flips between the canvas, code (explorer,
 * code and the open item's settings) and Health, the workflow's run history
 * summed up over the canvas's period: outcomes, runs and failures over
 * time, the steps runs fail at, and failures by reason, where picking a run
 * loads it on the canvas. The assistant toggle sits on its own
 * at the far right (Ctrl/⌘ + K). Everything else about the layout is set
 * from the ⋯ menu: at the top-right corner of the code area, or on the
 * canvas in the panel header (or the canvas corner while the panel is
 * closed). Ctrl/⌘ + B and J toggle the explorer and panel. The layout is
 * remembered across workflows.
 *
 * On the canvas, the runs bar over the top sets what the workflow shows: run
 * history over a period (run and failure counts on cards, volume on edges),
 * nothing but the workflow (Off), or a loaded run, with a clear way to
 * unload it. Its Filter opens the run list over the canvas; picking a run
 * loads it. Selecting a node
 * brings up the inspector, a card over the right edge that follows the
 * same three states: the node's config and the assistant's summary of its
 * code; its runs, failures and why they failed (the whole workflow's, on
 * the trigger); or its log, input and output in the loaded run, which open
 * in full in the code view's panel. A card's failed count selects it. Each
 * node card's ⋮ menu runs from that step, opens the inspector (Edit), opens
 * the assistant with the step loaded as context (Improve) or deletes it.
 *
 * In code mode the panel under the code carries the views that aren't code:
 * Runs (to load one), Failures (why runs failed, by reason), and the step's
 * Log, Input and Output in the loaded run. Its ⋯ menu chooses which views it
 * shows. The canvas has no panel. The assistant takes the outermost
 * right-hand column.
 *
 * On main everything is read-only and the main action is "Edit in sandbox".
 * In a sandbox steps can be renamed, re-adaptored, given credentials, have
 * snippets inserted, be added and deleted, and "Go live" promotes the sandbox
 * to main as a new version.
 *
 * Loading a run draws it on the canvas, marks each step in
 * the explorer and fills the Log, Input and Output views for the step in
 * focus. A run started from the editor is drawn live, one step at a time.
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
  onAddComponent,
  sandboxes = ["main"],
  sandbox: controlledSandbox,
  onSelectSandbox,
  onViewAllSandboxes,
  versions: initialVersions = [],
  url,
  service,
  onSeeDetails,
  defaultEditInSandboxOpen = false,
  defaultRunInputOpen = false,
  defaultRunsFilterOpen = false,
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
  /** Starts a new project component of this type, picked from the code explorer. */
  onAddComponent?: (type: string) => void;
  /** Sandboxes of the workflow's project, "main" first. */
  sandboxes?: string[];
  sandbox?: string;
  onSelectSandbox?: (sandbox: string) => void;
  onViewAllSandboxes?: () => void;
  /** Version history on main, newest first. */
  versions?: WorkflowVersion[];
  /** The URL that starts the workflow, for "Copy webhook URL". */
  url?: string;
  /** The published service the workflow backs; its listing shows as service.md in code mode. */
  service?: ProjectService;
  /** Opens the service listing where the workflow is documented. */
  onSeeDetails?: () => void;
  /** Start with a dialog open (useful for stories). */
  defaultEditInSandboxOpen?: boolean;
  defaultRunInputOpen?: boolean;
  /** Start with the canvas's run list open (useful for stories). */
  defaultRunsFilterOpen?: boolean;
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
  const focusStep = focusJob ? selectedRun?.steps.find((s) => s.jobId === focusJob.id) : undefined;

  // ---- Layout ---------------------------------------------------------------

  const [savedLayout, setLayout] = useEditorLayout();
  // Stories pin a layout; the app remembers the reader's.
  const [override, setOverride] = useState<Partial<EditorLayout>>(initialLayout ?? {});
  const layout: EditorLayout = { ...savedLayout, ...override };
  const updateLayout = (requested: Partial<EditorLayout>) => {
    // The panel always opens at its smaller size on the runs tab; it's maximised, or on another view, only on request.
    const patch = requested.panel && !layout.panel ? { panelMaximized: false, panelView: "runs" as const, ...requested } : requested;
    setLayout(patch);
    setOverride((o) => {
      const next = { ...o };
      for (const key of Object.keys(patch) as (keyof EditorLayout)[]) delete next[key];
      return next;
    });
  };

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

  const selectNode = (node: WorkflowNode) => setSelectedId(selectedId === node.id ? undefined : node.id);

  /** Open a step's code, the trigger's settings, or the workflow's YAML. */
  const openInCode = (nodeId?: string) => {
    const node = graph.nodes.find((n) => n.id === nodeId);
    setFile(node ? (node.type === "trigger" ? "trigger" : { stepId: node.id }) : "workflow");
    setView("code");
  };

  const [runInputOpen, setRunInputOpen] = useState(defaultRunInputOpen);
  const [editInSandboxOpen, setEditInSandboxOpen] = useState(defaultEditInSandboxOpen);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addComponentOpen, setAddComponentOpen] = useState(false);

  // ---- Running --------------------------------------------------------------

  const selectRun = (run: RunDetails) => {
    // Stay on an earlier version only if the new run ran on it too.
    if (version !== "latest" && version !== run.version) setVersion("latest");
    setRunId(run.runId);
    // The details column in code mode shows the step's input and output while a run is loaded.
    updateLayout({ detailsView: "io" });
    // In code mode an open panel follows the run for the step in focus; the inspector does on its own.
    if (view === "code" && layout.panel && focusJob && run.steps.some((s) => s.jobId === focusJob.id)) showPanel("log");
  };

  const deselectRun = () => {
    // Leaving a run you were viewing as executed returns to the latest.
    if (selectedRun && version === selectedRun.version) setVersion("latest");
    setRunId(undefined);
    // Back to the run history: on the canvas it's laid over the workflow again, in code mode the panel lists it.
    updateLayout({
      canvasActivity: true,
      ...(layout.detailsView === "io" ? { detailsView: "snippets" as const } : {}),
      ...(["log", "input", "output"].includes(layout.panelView) ? { panelView: "runs" as PanelViewId } : {}),
    });
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

  /** Dataclips a running run has produced so far join the project as they arrive. */
  const addClips = (incoming: Dataclip[]) =>
    setClips((current) => [...current, ...incoming.filter((d) => !current.some((c) => c.id === d.id))]);

  // Timers advancing simulated runs, stopped if the editor goes away mid-run.
  const runTimers = useRef<ReturnType<typeof setInterval>[]>([]);
  useEffect(() => () => runTimers.current.forEach(clearInterval), []);

  /** Start a run on the latest version and follow it live, a step at a time, until its results are in. */
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
    const started = simulateRun({ ...args, progress: 0 });
    upsertRun(started.run);
    setVersion("latest");
    setRunId(args.runId);
    updateLayout({ detailsView: "io" });
    if (view === "code" && layout.panel && focusJob) showPanel("log");
    let progress = 0;
    const timer = setInterval(() => {
      progress += 1;
      const next = progress < started.run.steps.length ? simulateRun({ ...args, progress }) : simulateRun(args);
      upsertRun(next.run);
      addClips(next.dataclips);
      if (next.run.status !== "running") {
        clearInterval(timer);
        runTimers.current = runTimers.current.filter((t) => t !== timer);
      }
    }, STEP_TIME_MS);
    runTimers.current.push(timer);
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

  // How far back the canvas's run history and the failures view look.
  const [period, setPeriod] = useState<ActivityPeriod>("7d");
  const [runsFilterOpen, setRunsFilterOpen] = useState(defaultRunsFilterOpen);
  const canvasOrders = filterWorkOrders(orders, period);
  // The run history summed up over the graph, laid over the canvas while no run is loaded.
  const activity = layout.canvasActivity && view === "canvas" ? runActivity(graph, canvasOrders, period) : undefined;

  // Whose failures the code view's Failures view shows: the step in focus or the whole workflow.
  const [failureScope, setFailureScope] = useState<FailureScope>("workflow");

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

  const changeCode = (stepId: string, body: string) => edit((e) => ({ bodies: { ...e.bodies, [stepId]: body } }));

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
      x: last?.x ?? 490,
      y: (last?.y ?? 70) + 170,
    };
    edit((e) => ({
      added: [...e.added, job],
      addedEdges: last ? [...e.addedEdges, { id: `e-${last.id}-${id}`, source: last.id, target: id, condition: "on_success" }] : e.addedEdges,
    }));
    setFile({ stepId: id });
    setView("code");
  };

  // Adding a step after a node from the + on its card: pick what it connects to first.
  const [addAfterId, setAddAfterId] = useState<string>();
  const connectedAdaptors = [
    ...new Set([
      ...connectedSystems.map((s) => s.adaptor),
      ...graph.nodes.flatMap((n) => (n.type === "job" ? [n.adaptor] : [])),
    ]),
  ].filter((a) => !builtInTools.includes(a));

  const addStepAfter = (sourceId: string, choice: ConnectChoice) => {
    const source = graph.nodes.find((n) => n.id === sourceId);
    if (!source) return;
    const id = `step-${shortId().slice(0, 4)}`;
    const adaptor = choice.kind === "ai" ? "claude" : choice.adaptor;
    const info = adaptorInfo[adaptor];
    const firstSnippet = adaptorSnippets[adaptor]?.[0]?.code;
    const job: JobNode = {
      id,
      type: "job",
      label: choice.kind === "ai" ? `${choice.action.label} with AI` : `New ${info.name} step`,
      adaptor,
      adaptorPackage: info.package,
      body: choice.kind === "ai" ? choice.action.body : `// Connect to ${info.name}\n${firstSnippet ?? "fn(state => state);"}\n`,
      ...placeAfter(graph, source),
    };
    edit((e) => ({
      added: [...e.added, job],
      addedEdges: [
        ...e.addedEdges,
        { id: `e-${source.id}-${id}`, source: source.id, target: id, condition: source.type === "trigger" ? "always" : "on_success" },
      ],
    }));
    setAddAfterId(undefined);
    setSelectedId(id);
  };

  // Docs added from the explorer, kept for this session.
  const [docs, setDocs] = useState<string[]>([]);
  const addDoc = () => {
    const taken = new Set(["context.md", "spec.md", ...docs]);
    let name = "untitled.md";
    for (let n = 2; taken.has(name); n++) name = `untitled-${n}.md`;
    setDocs([...docs, name]);
    setFile({ docName: name });
  };

  const deleteStep = (stepId: string) => {
    edit((e) => ({ removed: [...e.removed, stepId] }));
    if (selectedId === stepId) setSelectedId(undefined);
    if (typeof file === "object" && "stepId" in file && file.stepId === stepId) setFile("workflow");
  };

  // What the assistant's chat input is about, loaded from a card's Improve.
  const [assistantReference, setAssistantReference] = useState<AssistantReference>();

  /** An item picked from a node card's ⋮ menu. */
  const onNodeAction = (node: WorkflowNode, action: NodeAction) => {
    const job = node.type === "job" ? node : undefined;
    switch (action) {
      case "run":
        return runFresh(job?.id);
      case "edit":
        return setSelectedId(node.id);
      case "improve":
        setSelectedId(node.id);
        setAssistantReference(
          job
            ? { kind: "step", id: job.id, label: job.label, adaptor: job.adaptor }
            : { kind: "trigger", id: node.id, label: node.label }
        );
        if (!layout.assistant) updateLayout({ assistant: true });
        return;
      case "delete":
        return job && !onMain ? deleteStep(job.id) : undefined;
    }
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

  const disabledViews: PanelViewId[] = selectedRun ? [] : ["log", "input", "output"];
  const visibleViews = (["runs", "failures", "log", "input", "output"] as PanelViewId[]).filter(
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
          <Button variant="secondary" size="xs" icon={X} onClick={deselectRun}>
            Unload run
          </Button>
        </>
      ) : (
        <span>No run loaded</span>
      );
    }
    if (panelView === "failures") {
      return <span className="truncate">{failureScope === "step" && focusJob ? focusJob.label : "Whole workflow"}</span>;
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
      case "failures": {
        const scope: FailureScope = focusJob ? failureScope : "workflow";
        return (
          <FailureBreakdown
            key={`${scope}-${focusJob?.id ?? ""}-${period}`}
            reasons={failureReasons(graph, orders, period, scope === "step" ? focusJob?.id : undefined)}
            period={period}
            onPeriodChange={setPeriod}
            stepLabel={focusJob?.label}
            scope={scope}
            onScopeChange={setFailureScope}
            selectedRunId={runId}
            latestVersion={latestVersion}
            onSelectRun={selectRun}
            onDeselectRun={deselectRun}
          />
        );
      }
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

  const layoutMenu = <LayoutMenu layout={layout} onChange={updateLayout} onReset={resetLayout} />;

  /** From a snippet in the inspector: open the node in the code view, with that section in the panel. */
  const expandInCode = (section: InspectorSection) => {
    openInCode(focusNode?.id);
    showPanel(section);
  };

  // What the inspector says about the node's run history: the step's, or the whole workflow's on the trigger.
  const inspectorStats =
    activity && focusNode
      ? {
          period,
          runs: focusJob ? (activity.nodes[focusJob.id]?.runs ?? 0) : activity.runs,
          failed: focusJob ? (activity.nodes[focusJob.id]?.failed ?? 0) : activity.failed,
          reasons: failureReasons(graph, canvasOrders, period, focusJob?.id),
        }
      : undefined;

  // The canvas's side UI for the selected node: config, run history or the loaded run.
  const inspector =
    view === "canvas" && focusNode ? (
      <StepInspector
        key={focusNode.id}
        node={focusNode}
        credentialId={focusJob ? edits.credentials[focusJob.id] : undefined}
        readOnly={onMain}
        url={url}
        live={live}
        onToggleLive={setLive}
        onChange={focusJob && !onMain ? (c) => changeStep(focusJob.id, c) : undefined}
        onOpenCode={focusJob ? () => openInCode(focusJob.id) : undefined}
        onRunFromHere={focusJob ? () => runFresh(focusJob.id) : undefined}
        onDelete={focusJob && !onMain ? () => deleteStep(focusJob.id) : undefined}
        onClose={() => setSelectedId(undefined)}
        stats={inspectorStats}
        run={selectedRun}
        dataclips={clips}
        onUnloadRun={deselectRun}
        onExpand={expandInCode}
        onSelectRun={selectRun}
        latestVersion={latestVersion}
      />
    ) : undefined;

  // The panel lives under the code; the canvas has none.
  const panel = layout.panel ? (
    <EditorPanel
      view={panelView}
      onViewChange={(v) => updateLayout({ panelView: v })}
      disabledViews={disabledViews}
      hiddenViews={layout.hiddenViews}
      maximized={layout.panelMaximized}
      onToggleMaximized={() => updateLayout({ panelMaximized: !layout.panelMaximized })}
      onClose={togglePanel}
      context={panelContext}
    >
      {panelBody}
    </EditorPanel>
  ) : undefined;

  const runsBar =
    view === "canvas" ? (
      <CanvasRunsBar
        period={period}
        onPeriodChange={setPeriod}
        showing={layout.canvasActivity}
        onShowingChange={(showing) => updateLayout({ canvasActivity: showing })}
        activity={activity}
        workOrders={orders}
        run={selectedRun}
        onUnloadRun={deselectRun}
        latestVersion={latestVersion}
        onSelectRun={selectRun}
        open={runsFilterOpen}
        onOpenChange={setRunsFilterOpen}
        footer={runFooter}
      />
    ) : undefined;

  // Always rendered so the shell can slide it out; `rightTrayOpen` shows it.
  const rightTray = (
    <EditorTray title="Assistant" icon={Sparkles} placement="right" onClose={toggleAssistant}>
      <AIAssistantPanel
        conversations={assistantConversations}
        jobLabel={focusJob?.label}
        runId={selectedRun?.runId}
        author={CURRENT_USER}
        onOpenRuns={() => (view === "canvas" ? setRunsFilterOpen(true) : showPanel("runs"))}
        onAskToMerge={onMain ? undefined : () => setPromoteOpen(true)}
        onPlanAccepted={onMain ? undefined : applyPlan}
        reference={assistantReference}
        onClearReference={() => setAssistantReference(undefined)}
      />
    </EditorTray>
  );


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
      run={selectedRun}
      onCloseRun={deselectRun}
      live={live}
      view={view}
      onViewChange={(next) => (next === "code" && view === "canvas" && focusNode ? openInCode(focusNode.id) : setView(next))}
      retry={retryControl}
      fromStep={focusJob?.label}
      onRun={() => runFresh()}
      onRunFromStep={focusJob ? () => runFresh(focusJob.id) : undefined}
      onRetry={retry}
      onRunWithCustomInput={() => setRunInputOpen(true)}
      assistantOpen={layout.assistant}
      onToggleAssistant={toggleAssistant}
    />
  );

  return (
    <EditorShell
      toolbar={toolbar}
      sandboxed={!onMain}
      bottom={view === "canvas" && onMain ? <ReadOnlyNotice onEditInSandbox={() => setEditInSandboxOpen(true)} /> : undefined}
      rightTray={rightTray}
      rightTrayOpen={layout.assistant}
      rightOverlay={inspector}
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
          <Modal open={addComponentOpen} title="Add project component" onClose={() => setAddComponentOpen(false)} widthClass="max-w-2xl">
            <AddComponentPanel
              options={componentTypes.filter((t) => t.type !== "Workflow")}
              columns={2}
              bare
              onSelect={(type) => {
                setAddComponentOpen(false);
                onAddComponent?.(type);
              }}
            />
          </Modal>
          <Modal open={addAfterId !== undefined} title="Connect a system" onClose={() => setAddAfterId(undefined)} widthClass="max-w-3xl">
            <ConnectSystemPicker
              connected={connectedAdaptors}
              onSelect={(choice) => addAfterId && addStepAfter(addAfterId, choice)}
            />
          </Modal>
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
        <WorkflowCanvas
          workflow={graph}
          selectedId={selectedId}
          onSelect={selectNode}
          onNodeAction={onNodeAction}
          readOnly={onMain}
          run={selectedRun}
          activity={activity}
          onShowFailures={setSelectedId}
          height={760}
          header={runsBar}
          onAddAfter={onMain || version !== "latest" || selectedRun ? undefined : setAddAfterId}
        />
      )}
      {view === "health" && (
        <WorkflowHealth
          health={workflowHealth(graph, orders, period)}
          onPeriodChange={setPeriod}
          selectedRunId={runId}
          latestVersion={latestVersion}
          onSelectRun={(r) => {
            selectRun(r);
            setView("canvas");
          }}
        />
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
            dataclips={clips}
            onExpandRunData={showPanel}
            components={components}
            onOpenComponent={onOpenComponent}
            service={service}
            onOpenService={onSeeDetails}
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
            onCodeChange={onMain ? undefined : changeCode}
            onDeleteStep={onMain ? undefined : deleteStep}
            onAddStep={onMain ? undefined : addStep}
            docs={docs}
            onAddDoc={onMain ? undefined : addDoc}
            onAddComponent={onMain ? undefined : () => setAddComponentOpen(true)}
            bottomTray={panel}
            showExplorer={layout.explorer}
            showDetails={layout.details}
            detailsView={layout.detailsView}
            onDetailsViewChange={(v) => updateLayout({ details: true, detailsView: v })}
            layoutMenu={layoutMenu}
            onClose={() => setView("canvas")}
            statusNote={statusNote}
            dirtyStepIds={[
              ...new Set([...Object.keys(edits.bodies), ...Object.keys(edits.labels), ...Object.keys(edits.adaptors), ...edits.added.map((j) => j.id)]),
            ]}
          />
        </div>
      )}
    </EditorShell>
  );
}
