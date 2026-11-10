import { sandboxSlug } from "../model/sandboxes";
import { errorMessageOf, firstProblemOf } from "../model/form-error";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Database, FilePlus, FileText, Sparkles } from "lucide-react";
import type {
  AdaptorKind,
  Dataclip,
  JobNode,
  RunDetails,
  RunStep,
  Workflow,
  WorkflowEdge,
  WorkflowFileContents,
  WorkflowNode,
  WorkflowVersion,
  WorkOrder,
} from "../model/workflow";
import { defaultWorkflowSettings, stepDeleteBlockedReason, workflowToYaml } from "../model/workflow";
import type { WorkflowSettings } from "../model/workflow";
import { componentChanges, workflowChanges } from "../model/workflow-changes";
import type { EnvVar, EnvVarDraft } from "../model/env-vars";
import { failureReasons, filterWorkOrders, runActivity, shortId, workflowHealth } from "../model/runs";
import type { ActivityPeriod, RunProgress, RunRequest } from "../model/runs";
import type { AdaptorInfo, AdaptorReference } from "../model/adaptor-reference";
import type { AdaptorCatalog } from "../model/adaptor-catalog";
import type { ConnectedSystem } from "../model/connected-systems";
import type {
  AssistantConversation,
  AssistantMessage,
  AssistantMode,
  AssistantPlan,
  AssistantReference,
  AssistantSuggestions,
} from "../model/assistant";
import type { ProjectComponent, ProjectService } from "../model/projects";
import EditorShell from "../components/patterns/EditorShell";
import CanvasLayout from "../components/patterns/CanvasLayout";
import CodeLayout from "../components/patterns/CodeLayout";
import EditorTray from "../components/patterns/EditorTray";
import EditorTopBar from "../components/patterns/EditorTopBar";
import EditorToolbar from "../components/domain/EditorToolbar";
import EnvVarsView from "../components/domain/EnvVarsView";
import type { EditorView } from "../components/domain/EditorToolbar";
import type { WorkflowMenuAction } from "../components/domain/WorkflowFileMenu";
import EditorPanel from "../components/patterns/EditorPanel";
import LayoutMenu from "../components/domain/LayoutMenu";
import { useEditorLayout, resetLayout } from "../components/domain/editor-layout";
import type { EditorLayout, PanelViewId } from "../components/domain/editor-layout";
import WorkflowCanvas from "../components/domain/WorkflowCanvas";
import type { NodeAction } from "../components/domain/WorkflowNodeCard";
import CodeWorkspace from "../components/domain/CodeWorkspace";
import type { ExplorerFile, WorkflowFileKind } from "../components/domain/EditorExplorer";
import VersionMismatchBanner from "../components/domain/VersionMismatchBanner";
import StepRunDetails from "../components/domain/StepRunDetails";
import StepInspector from "../components/domain/StepInspector";
import { panelViews, type RunDataSection } from "../components/domain/panel-views";
import CanvasRunsBar from "../components/domain/CanvasRunsBar";
import ReadOnlyNotice from "../components/domain/ReadOnlyNotice";
import FailureBreakdown from "../components/domain/FailureBreakdown";
import type { FailureScope } from "../components/domain/FailureBreakdown";
import RunHistoryList from "../components/domain/RunHistoryList";
import type { StepChanges } from "../components/domain/StepConfigPanel";
import AIAssistantPanel from "../components/domain/AIAssistantPanel";
import RunLabel from "../components/domain/RunLabel";
import RunInputModal from "../components/domain/RunInputModal";
import type { RunInput } from "../components/domain/RunInputModal";
import EditInSandboxModal from "../components/domain/EditInSandboxModal";
import type { SandboxStart } from "../components/domain/EditInSandboxModal";
import PromoteSandboxModal from "../components/domain/PromoteSandboxModal";
import ConfirmModal from "../components/primitives/ConfirmModal";
import Modal from "../components/primitives/Modal";
import type { ProjectComponentType } from "../model/component-types";
import AddComponentPanel, { type AddComponentOption } from "../components/domain/AddComponentPanel";
import SavedDataclipsView from "../components/domain/SavedDataclipsView";
import DataclipFormModal from "../components/domain/DataclipFormModal";
import { runInputName, savedDataclips, untitledDataclipName, type DataclipChanges, type DataclipDraft } from "../model/dataclips";
import WorkflowHealth from "../components/domain/WorkflowHealth";
import ChannelView from "../components/domain/ChannelView";
import ComponentView from "../components/domain/ComponentView";
import CollectionView from "../components/domain/CollectionView";
import ComponentFormModal from "../components/domain/ComponentFormModal";
import ChannelFormModal from "../components/domain/ChannelFormModal";
import CollectionNameModal from "../components/domain/CollectionNameModal";
import { isContentComponentType, type ComponentDraft, type ContentComponentType } from "../model/project-components";
import type { ChannelDraft } from "../model/channels";
import ConnectSystemPicker from "../components/domain/ConnectSystemPicker";
import type { ConnectChoice } from "../components/domain/ConnectSystemPicker";
import { componentTypes } from "../model/component-types";

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
  /** The connected system each step talks to, where it was changed. */
  systems: Record<string, string | undefined>;
  removed: string[];
  added: JobNode[];
  /** The edges into added steps. */
  addedEdges: WorkflowEdge[];
}

const noEdits: Edits = { labels: {}, adaptors: {}, bodies: {}, credentials: {}, systems: {}, removed: [], added: [], addedEdges: [] };

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

/** The workflow with this session's edits applied; `info` gives a re-adaptored step its package. */
function applyEdits(workflow: Workflow, edits: Edits, name: string, info: Record<AdaptorKind, AdaptorInfo>): Workflow {
  // Edits already saved are in the workflow too: adding them again changes nothing.
  const added = edits.added.filter((a) => !workflow.nodes.some((n) => n.id === a.id));
  const addedEdges = edits.addedEdges.filter((a) => !workflow.edges.some((e) => e.id === a.id));
  const nodes: WorkflowNode[] = [...workflow.nodes, ...added]
    .filter((n) => !edits.removed.includes(n.id))
    .map((n) => {
      if (n.type !== "job") return n;
      const adaptor = edits.adaptors[n.id] ?? n.adaptor;
      return {
        ...n,
        label: edits.labels[n.id] ?? n.label,
        adaptor,
        adaptorPackage: info[adaptor].package,
        body: edits.bodies[n.id] ?? n.body,
        system: n.id in edits.systems ? edits.systems[n.id] : n.system,
        credentialId: n.id in edits.credentials ? edits.credentials[n.id] : n.credentialId,
      };
    });
  const ids = new Set(nodes.map((n) => n.id));
  const edges = [...workflow.edges, ...addedEdges].filter((e) => ids.has(e.source) && ids.has(e.target));
  return { ...workflow, name, nodes, edges };
}

/**
 * The workflow editor: one toolbar, two views, and an IDE-style layout of
 * explorer, panel and assistant.
 *
 * The toolbar's Fn menu holds the workflow's file actions (rename, settings,
 * sandbox and promotion, export, pause, delete) and the way back to the
 * project. The view switcher flips between the canvas and code (explorer,
 * code and the open item's settings). In code mode the explorer also lists
 * Health under service.yaml: the workflow's run history summed up over the
 * canvas's period (outcomes, runs and failures over time, the steps runs
 * fail at, and failures by reason), shown in the main pane in place of the
 * code. Picking a run there loads it and opens the step it failed at. The assistant toggle sits on its own
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
 * node card's ⋮ menu runs from that step, opens it in code (Edit, as does
 * double-clicking the card), opens
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
 * snippets inserted, be added and deleted, the sandbox chip counts and
 * lists what's changed against main (components added here included), and its "Go live" promotes the sandbox to
 * main as a new version.
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
export default function WorkflowEditorPage({
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
  componentTypeOptions,
  onCreateChannel,
  onCreateCollection,
  onCreateComponent,
  onDraftComponentWithAI,
  channelCredentials = [],
  channelAddress = (name) => name,
  onSaveComponent,
  onSaveCollectionItem,
  onDeleteCollectionItem,
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
  defaultAddFileOpen = false,
  assistantConversations = [],
  adaptors,
  catalog,
  systems = [],
  showWorkflowFiles = true,
  showComponents = true,
  publishesServices = true,
  contents,
  codeSummary,
  onRun,
  assistantSuggestions,
  onAssistantSend,
  onAssistantCarryOutPlan,
  assistantPrompt,
  onSaveWorkflow,
  onRunFinished,
  live: controlledLive,
  onToggleLive,
  onPromote,
  onCreateSandbox,
  onCreateDataclip,
  onSaveDataclip,
  baseline,
  environment,
  envVars,
  onCreateEnvVar,
  onUpdateEnvVar,
  onDeleteEnvVar,
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
  /** The kinds of component that can be added. Defaults to every kind but Workflow. */
  componentTypeOptions?: ProjectComponentType[];
  /** Makes a channel from the code explorer's +; resolves with its id, and it opens. Left out where you can't. */
  onCreateChannel?: (draft: ChannelDraft) => Promise<string>;
  /** Makes a collection with a URL-safe name from the code explorer's +; resolves with its id, and it opens. Left out where you can't. */
  onCreateCollection?: (name: string) => Promise<string>;
  /** Makes a form, artifact, AI skill, document or static website from the code explorer's +; resolves with its id, and it opens. Left out where you can't. */
  onCreateComponent?: (type: ContentComponentType, draft: ComponentDraft) => Promise<string>;
  /** Hands a kind of component to AI to draft from a description instead. Left out without Build with AI. */
  onDraftComponentWithAI?: (type: ProjectComponentType) => void;
  /** The project's credentials, by name, that a new channel can sign in with. */
  channelCredentials?: string[];
  /** Where an event channel with a given name would listen. */
  channelAddress?: (name: string) => string;
  /** Saves a form's, artifact's, AI skill's, document's or static website's new content, opened from the explorer. Left out where you can't. */
  onSaveComponent?: (componentId: string, content: string) => Promise<void>;
  /** Writes a key's value in a collection opened from the explorer. Left out where you can't. */
  onSaveCollectionItem?: (componentId: string, key: string, value: string) => Promise<void>;
  /** Deletes a key from a collection opened from the explorer. Left out where you can't. */
  onDeleteCollectionItem?: (componentId: string, key: string) => Promise<void>;
  /** Sandboxes of the workflow's project, "main" first. */
  sandboxes?: string[];
  sandbox?: string;
  onSelectSandbox?: (sandbox: string) => void;
  onViewAllSandboxes?: () => void;
  /** Version history on main, newest first. */
  versions?: WorkflowVersion[];
  /** The URL that starts the workflow, for "Copy webhook URL". */
  url?: string;
  /** The published service the workflow backs; its listing shows as service.yaml in code mode. */
  service?: ProjectService;
  /** Opens the service listing where the workflow is documented. */
  onSeeDetails?: () => void;
  /** Start with a dialog open (useful for stories). */
  defaultEditInSandboxOpen?: boolean;
  defaultRunInputOpen?: boolean;
  /** Start with the canvas's run list open (useful for stories). */
  defaultRunsFilterOpen?: boolean;
  /** Start with the Workflow group's "Add to workflow" open, in code mode (useful for stories). */
  defaultAddFileOpen?: boolean;
  /** Saved assistant conversations for this workflow. */
  assistantConversations?: AssistantConversation[];
  /** What the editor knows about each adaptor a step can use (name, version, snippets), and the project's credentials. */
  adaptors: AdaptorReference;
  /** Every adaptor by category, with the built-in tools and AI actions, for "Connect a system". */
  catalog: AdaptorCatalog;
  /** The project's connected systems. */
  systems?: ConnectedSystem[];
  /** List the workflow's own files (workflow.yaml, docs, service.yaml, Health) in the explorer. Defaults to true; off, code mode falls back to the trigger. */
  showWorkflowFiles?: boolean;
  /** List the project components the workflow uses in the explorer. Defaults to true. */
  showComponents?: boolean;
  /** Whether a workflow can be published as a service, from its webhook trigger. Defaults to true. */
  publishesServices?: boolean;
  /** What the workflow's docs, service listing and project components hold, for opening them in code mode. */
  contents?: WorkflowFileContents;
  /** What the assistant says a step's code does, one point per thing it does, for the inspector. */
  codeSummary?: (step: JobNode) => string[];
  /**
   * Runs the workflow: the run as it stands once `progress` steps have finished, or done when
   * `progress` is unset. Called to start a run and again for each step, to follow it live.
   * Synchronous, so a run shows the moment it's started. Without it nothing runs.
   */
  onRun?: (request: RunRequest) => RunProgress;
  /** Suggested first questions for the assistant. */
  assistantSuggestions?: AssistantSuggestions;
  /** Sends a message to the assistant; resolves with its reply. */
  onAssistantSend?: (prompt: string, jobLabel: string | undefined, mode: AssistantMode) => Promise<AssistantMessage>;
  /** Carries out a plan the assistant proposed; resolves with its message saying how it went. */
  onAssistantCarryOutPlan?: (plan: AssistantPlan) => Promise<AssistantMessage>;
  /** What the editor was opened to build, e.g. from Create: the assistant opens and starts on it. */
  assistantPrompt?: string;
  /**
   * Saves the graph as edited (renames, steps added or removed, code,
   * adaptors), a moment after each change in a sandbox. Once it resolves,
   * `workflow` holds the change. Rejects with why the server refused it,
   * which the status bar shows; the edit stays, to be saved with the next.
   * Without it, edits last as long as the page.
   */
  onSaveWorkflow?: (graph: Workflow) => Promise<void>;
  /**
   * A run started here has finished: the run, the dataclips it used and made
   * (its input first), and whether it's another run of a work order that was
   * already there (a retry). The caller keeps it, so History has it too.
   */
  onRunFinished?: (run: RunDetails, dataclips: Dataclip[], retryOf?: string) => void;
  /** Whether the workflow's trigger is on, when the caller holds it. */
  live?: boolean;
  /** Turns the workflow's trigger on or off. */
  onToggleLive?: (live: boolean) => Promise<void>;
  /**
   * Promotes the sandbox's changes to main as a new version, with what was
   * said about them. Once it resolves, `versions` has the new one. Without
   * it, promoting adds a version for the session.
   */
  onPromote?: (message: string) => Promise<void>;
  /**
   * Makes a sandbox with this name from the one selected, with the data it
   * starts with: a saved dataclip it brings across, or a reviewed copy of a
   * run's input, saved in it under the run's name. Once it resolves,
   * `sandboxes` lists it and, selected, its `dataclips` hold what came across.
   */
  onCreateSandbox?: (name: string, start: SandboxStart) => Promise<void>;
  /** Saves a new dataclip in the project, to run with; resolves with it. Without it, it lasts as long as the page. */
  onCreateDataclip?: (draft: DataclipDraft) => Promise<Dataclip>;
  /** Changes a saved dataclip's title and description. Without it, the change lasts as long as the page. */
  onSaveDataclip?: (id: string, changes: DataclipChanges) => Promise<void>;
  /**
   * In a sandbox, the workflow where going live would merge it (its parent's
   * copy), to say what's changed; left out when the workflow is new in the
   * sandbox.
   */
  baseline?: Workflow;
  /** The environment the selected sandbox (or main) loads credentials from, e.g. "production". */
  environment?: string;
  /** The project's environment variables, listed under Workflow in the explorer. Left out, the explorer doesn't list them. */
  envVars?: EnvVar[];
  /** Makes a project environment variable. Left out where you can't. */
  onCreateEnvVar?: (draft: EnvVarDraft) => Promise<void>;
  /** Changes one; a secret's blank value keeps the stored one. Left out where you can't. */
  onUpdateEnvVar?: (id: string, draft: EnvVarDraft) => Promise<void>;
  /** Deletes one. Left out where you can't. */
  onDeleteEnvVar?: (id: string) => Promise<void>;
}) {
  // ---- Where we are ---------------------------------------------------------

  const [view, setView] = useState<EditorView>(initialView);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);
  // With nothing chosen, code mode opens workflow.yaml, or the trigger when the explorer doesn't list the workflow's files.
  const fallbackFile: ExplorerFile = showWorkflowFiles ? "workflow" : "trigger";
  const [file, setFile] = useState<ExplorerFile>(initialFile ?? (initialSelectedId ? { stepId: initialSelectedId } : fallbackFile));

  const [localSandbox, setLocalSandbox] = useState("main");
  const sandbox = controlledSandbox ?? localSandbox;
  const selectSandbox = onSelectSandbox ?? setLocalSandbox;
  const onMain = sandbox === "main";
  // Sandboxes made from the editor join the project's list for this session.
  const [newSandboxes, setNewSandboxes] = useState<string[]>([]);
  const allSandboxes = [...sandboxes, ...newSandboxes.filter((s) => !sandboxes.includes(s))];

  const [localVersions, setVersions] = useState(initialVersions);
  const versions = onPromote ? initialVersions : localVersions;
  const [version, setVersion] = useState(initialVersion);
  const latestVersion = versions[0]?.id;

  // ---- Edits ----------------------------------------------------------------

  const [localLive, setLocalLive] = useState(true);
  const live = controlledLive ?? localLive;
  const setLive = (next: boolean | ((l: boolean) => boolean)) => {
    const value = typeof next === "function" ? next(live) : next;
    if (onToggleLive) void onToggleLive(value).catch((e: unknown) => setStatusNote(errorMessageOf(e)));
    else setLocalLive(value);
  };
  const [name, setName] = useState(workflow.name);
  const [settings, setSettings] = useState<WorkflowSettings>(() => defaultWorkflowSettings(workflow));
  const [edits, setEdits] = useState<Edits>(noEdits);
  const [statusNote, setStatusNote] = useState<string>();
  const edit = (patch: (e: Edits) => Partial<Edits>) => setEdits((e) => ({ ...e, ...patch(e) }));

  // The graph on the canvas: the latest with this session's edits, or an earlier version being viewed.
  const graph =
    version === "latest"
      ? applyEdits(workflow, edits, name, adaptors.info)
      : (graphForVersion?.(version) ?? applyEdits(workflow, edits, name, adaptors.info));
  const viewingVersion = version === "latest" ? latestVersion : version;

  // Another copy of the workflow (another sandbox, or main): its own edits start afresh.
  const [shownId, setShownId] = useState(workflow.id);
  if (shownId !== workflow.id) {
    setShownId(workflow.id);
    setEdits(noEdits);
    setName(workflow.name);
  }

  // In a sandbox, edits are saved a moment after they're made. Once saved they're in `workflow`,
  // so they're cleared here unless more were made meanwhile.
  useEffect(() => {
    if (!onSaveWorkflow || onMain || (edits === noEdits && name === workflow.name)) return;
    const timer = setTimeout(() => {
      const saving = edits;
      onSaveWorkflow(applyEdits(workflow, saving, name, adaptors.info)).then(
        () => {
          setStatusNote(undefined);
          setEdits((current) => (current === saving ? noEdits : current));
        },
        (e: unknown) => setStatusNote(`Not saved: ${firstProblemOf(e)}`),
      );
    }, 700);
    return () => clearTimeout(timer);
  }, [edits, name, workflow, onMain, onSaveWorkflow, adaptors.info]);

  // ---- Runs -----------------------------------------------------------------

  const [orders, setOrders] = useState(initialWorkOrders);
  const [clips, setClips] = useState(initialDataclips);
  // When the caller's history changes (a run recorded, a retry from History, another copy shown), it's the truth again.
  const [givenOrders, setGivenOrders] = useState(initialWorkOrders);
  if (givenOrders !== initialWorkOrders) {
    setGivenOrders(initialWorkOrders);
    setOrders(initialWorkOrders);
  }
  const [givenClips, setGivenClips] = useState(initialDataclips);
  if (givenClips !== initialDataclips) {
    setGivenClips(initialDataclips);
    setClips(initialDataclips);
  }
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
  // Opened to build something (from Create), the assistant is shown, already working on it.
  const [override, setOverride] = useState<Partial<EditorLayout>>(() => ({ ...(assistantPrompt && { assistant: true }), ...initialLayout }));
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

  // A page in the code view's main pane (Health, Saved dataclips, Environment variables) opens with the bottom and right panels
  // hidden, so it has the room. Showing them there lasts until you leave the page, and leaves the
  // remembered layout alone, so opening a code item brings the panels back as they were.
  const isPage = (f: ExplorerFile) => f === "health" || f === "dataclips" || f === "envVars";
  const onPage = view === "code" && isPage(file);
  const [pagePanels, setPagePanels] = useState({ panel: false, details: false });
  const shownLayout: EditorLayout = onPage ? { ...layout, ...pagePanels } : layout;
  const changeLayout = (patch: Partial<EditorLayout>) => {
    if (!onPage) return updateLayout(patch);
    const { panel, details, ...rest } = patch;
    if (panel !== undefined || details !== undefined) {
      setPagePanels((p) => ({ panel: panel ?? p.panel, details: details ?? p.details }));
    }
    if (Object.keys(rest).length > 0) updateLayout(rest);
  };
  const openFile = (f: ExplorerFile) => {
    if (isPage(f) && f !== file) setPagePanels({ panel: false, details: false });
    setFile(f);
  };

  /** Show the panel on a view, e.g. a step's log when a run is loaded. */
  const showPanel = (panelView: PanelViewId) => changeLayout({ panel: true, panelView });
  const togglePanel = () => changeLayout({ panel: !shownLayout.panel });
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
  }, [layout, view, file, pagePanels]);

  const selectNode = (node: WorkflowNode) => setSelectedId(selectedId === node.id ? undefined : node.id);

  /** Open a step's code, the trigger's settings, or the workflow's YAML. */
  const openInCode = (nodeId?: string) => {
    const node = graph.nodes.find((n) => n.id === nodeId);
    setFile(node ? (node.type === "trigger" ? "trigger" : { stepId: node.id }) : fallbackFile);
    setView("code");
  };

  /** Open a node in code from the canvas (its Edit, or a double-click), keeping it selected. */
  const openNode = (node: WorkflowNode) => {
    setSelectedId(node.id);
    openInCode(node.id);
  };

  const [runInputOpen, setRunInputOpen] = useState(defaultRunInputOpen);
  const [editInSandboxOpen, setEditInSandboxOpen] = useState(defaultEditInSandboxOpen);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addComponentOpen, setAddComponentOpen] = useState(false);
  // The kind picked from "Add project component", whose form is open.
  const [creatingComponent, setCreatingComponent] = useState<ProjectComponentType>();
  const addableTypes = componentTypes.filter(
    (t) =>
      t.type !== "Workflow" &&
      (!componentTypeOptions || componentTypeOptions.includes(t.type)) &&
      (t.type === "Channel" ? !!onCreateChannel : t.type === "Collection" ? !!onCreateCollection : isContentComponentType(t.type) && !!onCreateComponent),
  );
  // Components made here, by sandbox: each counts as a change in that sandbox, though it's the project's.
  const [addedComponents, setAddedComponents] = useState<Record<string, string[]>>({});
  /** Once a new component is made, count it as a change and open it in the code view. */
  const openCreated = (id: string) => {
    setCreatingComponent(undefined);
    if (!onMain) setAddedComponents((current) => ({ ...current, [sandbox]: [...(current[sandbox] ?? []), id] }));
    setFile({ componentId: id });
  };

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
    if (!onRun) return;
    const retryOf = orders.some((o) => o.id === workOrderId) ? workOrderId : undefined;
    const made: Dataclip[] = [];
    const latest = applyEdits(workflow, edits, name, adaptors.info);
    const args = {
      workflow: latest,
      version: latestVersion ?? "draft",
      input,
      workOrderId,
      runId: shortId(),
      fromJobId: latest.nodes.some((n) => n.id === fromJobId) ? fromJobId : undefined,
      startedBy: CURRENT_USER,
    };
    const started = onRun({ ...args, progress: 0 });
    upsertRun(started.run);
    setVersion("latest");
    setRunId(args.runId);
    updateLayout({ detailsView: "io" });
    if (view === "code" && layout.panel && focusJob) showPanel("log");
    let progress = 0;
    const timer = setInterval(() => {
      progress += 1;
      const next = progress < started.run.steps.length ? onRun({ ...args, progress }) : onRun(args);
      upsertRun(next.run);
      addClips(next.dataclips);
      made.push(...next.dataclips.filter((d) => !made.some((m) => m.id === d.id)));
      if (next.run.status !== "running") {
        clearInterval(timer);
        runTimers.current = runTimers.current.filter((t) => t !== timer);
        onRunFinished?.(next.run, [input, ...made.filter((d) => d.id !== input.id)], retryOf);
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

  const promote = async (message: string) => {
    setPromoteOpen(false);
    if (onPromote) {
      try {
        await onPromote(message);
      } catch (e) {
        setStatusNote(errorMessageOf(e));
        return;
      }
    } else {
      setVersions([{ id: `v${versions.length + 1}`, message, author: CURRENT_USER, date: "20 Oct 2026" }, ...versions]);
    }
    setVersion("latest");
    selectSandbox("main");
  };

  const createSandbox = ({ name: typed, start }: { name: string; start: SandboxStart }) => {
    // Named by its slug, as the Sandboxes page names them.
    const sandboxName = sandboxSlug(typed);
    setEditInSandboxOpen(false);
    // What it brings across shows in the sandbox's Saved dataclips.
    if (start.kind !== "nothing") addFile("dataclips");
    if (onCreateSandbox) {
      void onCreateSandbox(sandboxName, start).then(
        () => selectSandbox(sandboxName),
        (e: unknown) => setStatusNote(`Sandbox not made: ${firstProblemOf(e)}`),
      );
      return;
    }
    // A reviewed copy of a run's input comes along as a named input.
    if (start.kind === "run") addInput(start.body, runInputName(start.runId));
    setNewSandboxes((current) => [...current, sandboxName]);
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
      systems: "system" in changes ? { ...e.systems, [stepId]: changes.system } : e.systems,
    }));

  const changeCode = (stepId: string, body: string) => edit((e) => ({ bodies: { ...e.bodies, [stepId]: body } }));

  const addStep = () => {
    const id = crypto.randomUUID();
    const last = graph.nodes.filter((n): n is JobNode => n.type === "job").at(-1);
    const job: JobNode = {
      id,
      type: "job",
      label: "Untitled step",
      adaptor: "common",
      adaptorPackage: adaptors.info.common.package,
      body: "// Start writing your step here\nfn(state => state);",
      x: last?.x ?? 490,
      y: (last?.y ?? 70) + 170,
    };
    edit((e) => ({
      added: [...e.added, job],
      addedEdges: last ? [...e.addedEdges, { id: crypto.randomUUID(), source: last.id, target: id, condition: "on_success" }] : e.addedEdges,
    }));
    setFile({ stepId: id });
    setView("code");
  };

  // Adding a step after a node from the + on its card: pick what it connects to first.
  const [addAfterId, setAddAfterId] = useState<string>();
  const connectedAdaptors = [
    ...new Set([
      ...systems.map((s) => s.adaptor),
      ...graph.nodes.flatMap((n) => (n.type === "job" ? [n.adaptor] : [])),
    ]),
  ].filter((a) => !catalog.builtInTools.includes(a));

  const addStepAfter = (sourceId: string, choice: ConnectChoice) => {
    const source = graph.nodes.find((n) => n.id === sourceId);
    if (!source) return;
    const id = crypto.randomUUID();
    const adaptor = choice.kind === "ai" ? "claude" : choice.adaptor;
    const info = adaptors.info[adaptor];
    const firstSnippet = adaptors.snippets[adaptor]?.[0]?.code;
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
        { id: crypto.randomUUID(), source: source.id, target: id, condition: source.type === "trigger" ? "always" : "on_success" },
      ],
    }));
    setAddAfterId(undefined);
    setSelectedId(id);
  };

  // ---- Workflow files -------------------------------------------------------

  // Docs added from the explorer, kept for this session.
  const [docs, setDocs] = useState<string[]>([]);
  const addDoc = () => {
    const taken = new Set(["context.md", "spec.md", ...docs]);
    let name = "untitled.md";
    for (let n = 2; taken.has(name); n++) name = `untitled-${n}.md`;
    setDocs([...docs, name]);
    setFile({ docName: name });
  };

  // The workflow's optional files: the ones it has, and any added from the Workflow group's + this session.
  const saved = savedDataclips(clips);
  const [addedFiles, setAddedFiles] = useState<WorkflowFileKind[]>([]);
  const addFile = (kind: WorkflowFileKind) => setAddedFiles((current) => (current.includes(kind) ? current : [...current, kind]));
  const has: Record<WorkflowFileKind, boolean> = {
    context: !contents || contents.docs.context !== "",
    spec: !contents || contents.docs.spec !== "",
    service: service !== undefined,
    dataclips: saved.length > 0,
  };
  const workflowFiles = (["context", "spec", "service", "dataclips"] as const).filter((k) => has[k] || addedFiles.includes(k));
  const [addFileOpen, setAddFileOpen] = useState(defaultAddFileOpen);
  const [newDataclipOpen, setNewDataclipOpen] = useState(false);
  const added = (kind: WorkflowFileKind) => (workflowFiles.includes(kind) ? "Added" : undefined);
  const fileOptions: (AddComponentOption & { kind: WorkflowFileKind | "doc" })[] = [
    ...(publishesServices
      ? [{ kind: "service" as const, type: "Service manifest", icon: BookOpen, tag: added("service"), description: "service.yaml: how the workflow is listed as a service, and how other teams call it." }]
      : []),
    { kind: "spec", type: "Spec", icon: FileText, tag: added("spec"), description: "spec.md: what goes in, what each step writes, and when a run counts as done." },
    { kind: "dataclips", type: "Saved dataclip", icon: Database, tag: saved.length > 0 ? `${saved.length} saved` : undefined, description: "An input kept in the project to run the workflow with again." },
    { kind: "context", type: "Context", icon: FileText, tag: added("context"), description: "context.md: the legislation and people behind the workflow, for the assistant to read." },
    { kind: "doc", type: "Doc", icon: FilePlus, description: "A blank Markdown doc kept alongside the workflow." },
  ];
  const pickFile = (kind: WorkflowFileKind | "doc") => {
    setAddFileOpen(false);
    if (kind === "doc") return addDoc();
    if (kind === "dataclips") return setNewDataclipOpen(true);
    addFile(kind);
    openFile(kind);
  };

  /** Save a new dataclip in the project and open Saved dataclips, where it now shows. */
  const createDataclip = async (draft: DataclipDraft) => {
    const made: Dataclip = onCreateDataclip
      ? await onCreateDataclip(draft)
      : { id: shortId(), type: "saved_input", created: "just now", ...draft, description: draft.description || undefined };
    setClips((current) => [made, ...current.filter((c) => c.id !== made.id)]);
    addFile("dataclips");
    openFile("dataclips");
  };

  const saveDataclip = async (id: string, changes: DataclipChanges) => {
    await onSaveDataclip?.(id, changes);
    setClips((current) => current.map((c) => (c.id === id ? { ...c, name: changes.name, description: changes.description || undefined } : c)));
  };

  /** Run the workflow with a saved dataclip, and show its log under the list. */
  const runSaved = (clip: Dataclip) => {
    startRun({ workOrderId: shortId(), input: clip });
    showPanel("log");
  };

  /** Why a step can't be deleted, as Lightning has it: other steps run after it, or it's the first. */
  const deleteBlocked = (stepId: string) => stepDeleteBlockedReason(graph, stepId);

  const deleteStep = (stepId: string) => {
    if (deleteBlocked(stepId)) return;
    edit((e) => ({ removed: [...e.removed, stepId] }));
    if (selectedId === stepId) setSelectedId(undefined);
    if (typeof file === "object" && "stepId" in file && file.stepId === stepId) setFile(fallbackFile);
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
        return openNode(node);
      case "improve":
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
    const referenced = assistantReference?.kind === "step" ? assistantReference.id : undefined;
    const target =
      graph.nodes.find((n): n is JobNode => n.type === "job" && n.id === referenced) ??
      focusJob ??
      graph.nodes.find((n): n is JobNode => n.type === "job");
    if (!target) return;
    edit((e) => ({
      bodies: { ...e.bodies, [target.id]: `// Assistant: ${plan.steps[0]}\n${e.bodies[target.id] ?? target.body}` },
    }));
    setStatusNote("Tested by the assistant");
  };

  const exportYaml = () => {
    const blob = new Blob([workflowToYaml(graph, { enabled: live })], { type: "text/yaml" });
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
        <RunLabel
          run={selectedRun}
          detail={
            panelView === "runs"
              ? selectedRun.when
              : [focusJob?.label ?? "whole run", focusStep?.duration].filter(Boolean).join(" · ")
          }
          onUnload={deselectRun}
        />
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

  // Health, opened from the explorer, takes the code's place in the main pane. Picking a run
  // loads it and opens the step it failed at, with its log in the panel.
  const healthPane = (
    <WorkflowHealth
      health={workflowHealth(graph, orders, period)}
      onPeriodChange={setPeriod}
      selectedRunId={runId}
      latestVersion={latestVersion}
      onSelectRun={(r) => {
        selectRun(r);
        const failed = r.steps.find((s) => s.status === "failed");
        if (failed && graph.nodes.some((n) => n.id === failed.jobId)) {
          // Leaving the page for the step, so the log opens in the remembered layout.
          setFile({ stepId: failed.jobId });
          updateLayout({ panel: true, panelView: "log" });
        }
      }}
    />
  );

  // The project's environment variables, opened from the explorer's Workflow section.
  const envVarsPane = envVars && (
    <EnvVarsView variables={envVars} projectName={projectName} onCreate={onCreateEnvVar} onUpdate={onUpdateEnvVar} onDelete={onDeleteEnvVar} />
  );

  // A component, opened from the explorer's Components, shows in the code's place: the same view as
  // its page in the project. A channel shows its traffic, where a message from a run loads that run;
  // a collection its keys; anything else the file it is, to edit and save.
  const openComponent =
    typeof file === "object" && "componentId" in file ? components.find((c) => c.id === file.componentId) : undefined;
  const openChannelDetails = openComponent?.type === "Channel" ? contents?.channels[openComponent.id] : undefined;
  const openCollection = openComponent?.type === "Collection" ? contents?.collections[openComponent.id] : undefined;
  const openContent = openComponent && isContentComponentType(openComponent.type) ? contents?.componentContents[openComponent.id] : undefined;
  const componentPane = !openComponent ? undefined : openChannelDetails ? (
    <ChannelView
      key={openComponent.id}
      name={openComponent.name}
      description={openComponent.description}
      channel={openChannelDetails}
      onOpenRun={(id) => {
        const r = orders.flatMap((o) => o.runs).find((run) => run.runId === id);
        if (r) selectRun(r);
      }}
    />
  ) : openCollection ? (
    <CollectionView
      key={openComponent.id}
      name={openComponent.name}
      items={openCollection.items}
      itemCount={openCollection.itemCount}
      byteSize={openCollection.byteSize}
      onSaveItem={onSaveCollectionItem && ((key, value) => onSaveCollectionItem(openComponent.id, key, value))}
      onDeleteItem={onDeleteCollectionItem && ((key) => onDeleteCollectionItem(openComponent.id, key))}
    />
  ) : openContent && isContentComponentType(openComponent.type) ? (
    <ComponentView
      key={openComponent.id}
      name={openComponent.name}
      description={openComponent.description}
      type={openComponent.type}
      content={openContent}
      onSave={onSaveComponent && ((content) => onSaveComponent(openComponent.id, content))}
    />
  ) : undefined;

  // Saved dataclips, opened from the explorer's Workflow group, also take the code's place.
  const dataclipsPane = (
    <SavedDataclipsView
      dataclips={saved}
      onRun={onRun ? runSaved : undefined}
      onSave={saveDataclip}
      onCreate={() => setNewDataclipOpen(true)}
    />
  );

  const layoutMenu = <LayoutMenu layout={shownLayout} onChange={changeLayout} onReset={resetLayout} />;

  /** From a snippet in the inspector: open the node in the code view, with that section in the panel. */
  const expandInCode = (section: RunDataSection) => {
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
        adaptor={focusJob ? adaptors.info[focusJob.adaptor] : undefined}
        credentials={focusJob ? adaptors.credentials.filter((c) => c.adaptor === focusJob.adaptor) : undefined}
        system={focusJob?.system ? systems.find((s) => s.id === focusJob.system) : undefined}
        codeSummary={focusJob ? codeSummary?.(focusJob) : undefined}
        credentialId={focusJob?.credentialId}
        readOnly={onMain}
        url={url}
        live={live}
        onToggleLive={setLive}
        onChange={focusJob && !onMain ? (c) => changeStep(focusJob.id, c) : undefined}
        onOpenCode={focusJob ? () => openInCode(focusJob.id) : undefined}
        onRunFromHere={focusJob ? () => runFresh(focusJob.id) : undefined}
        onDelete={focusJob && !onMain ? () => deleteStep(focusJob.id) : undefined}
        deleteBlockedReason={focusJob && !onMain ? deleteBlocked(focusJob.id) : undefined}
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
  const panel = shownLayout.panel ? (
    <EditorPanel
      views={panelViews}
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

  // Always rendered so the shell can slide it out; `sideOpen` shows it.
  const assistant = (
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
      suggestions={assistantSuggestions}
      onSend={onAssistantSend}
      onCarryOutPlan={onAssistantCarryOutPlan}
      initialPrompt={assistantPrompt}
    />
  );


  // ---- Layout ---------------------------------------------------------------

  // What going live would carry over: the copy on the canvas, edits and all, against where it merges.
  // Plus the components added from here, once the list has them (a deleted one drops out).
  const changes = onMain
    ? []
    : [
        ...workflowChanges(baseline, graph),
        ...componentChanges((addedComponents[sandbox] ?? []).flatMap((id) => components.filter((c) => c.id === id))),
      ];

  const toolbar = (
    <EditorToolbar
      name={name}
      onRename={onMain ? undefined : setName}
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
      changes={changes}
      environment={environment}
      components={components}
      onOpenComponent={(id) => {
        setFile({ componentId: id });
        setView("code");
      }}
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
    >
      {(bar) => <EditorTopBar {...bar} />}
    </EditorToolbar>
  );

  return (
    <EditorShell
      toolbar={toolbar}
      floatToolbar={view === "canvas"}
      accentEdge={!onMain}
      side={assistant}
      sideTitle="Assistant"
      sideIcon={Sparkles}
      sideOpen={layout.assistant}
      onCloseSide={toggleAssistant}
      overlays={
        <>
          <RunInputModal open={runInputOpen} onClose={() => setRunInputOpen(false)} dataclips={clips} onRun={runWithInput} />
          <EditInSandboxModal
            open={editInSandboxOpen}
            onClose={() => setEditInSandboxOpen(false)}
            sandboxes={allSandboxes.filter((s) => s !== "main")}
            reservedNames={["main"]}
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
          <Modal open={addFileOpen} title="Add to workflow" onClose={() => setAddFileOpen(false)} widthClass="max-w-2xl">
            <AddComponentPanel options={fileOptions} columns={2} bare onSelect={(type) => pickFile(fileOptions.find((o) => o.type === type)!.kind)} />
          </Modal>
          <DataclipFormModal
            open={newDataclipOpen}
            defaultName={untitledDataclipName(saved)}
            onClose={() => setNewDataclipOpen(false)}
            onSubmit={createDataclip}
          />
          <Modal open={addComponentOpen} title="Add project component" onClose={() => setAddComponentOpen(false)} widthClass="max-w-2xl">
            <AddComponentPanel
              options={addableTypes}
              columns={2}
              bare
              onSelect={(type) => {
                setAddComponentOpen(false);
                setCreatingComponent(type as ProjectComponentType);
              }}
            />
          </Modal>
          {onCreateChannel && (
            <ChannelFormModal
              open={creatingComponent === "Channel"}
              takenNames={components.filter((c) => c.type === "Channel").map((c) => c.name)}
              credentials={channelCredentials}
              eventAddress={channelAddress}
              onClose={() => setCreatingComponent(undefined)}
              onSubmit={async (draft) => openCreated(await onCreateChannel(draft))}
            />
          )}
          {onCreateCollection && (
            <CollectionNameModal
              open={creatingComponent === "Collection"}
              takenNames={components.filter((c) => c.type === "Collection").map((c) => c.name)}
              onClose={() => setCreatingComponent(undefined)}
              onSave={async (name) => openCreated(await onCreateCollection(name))}
            />
          )}
          {onCreateComponent && creatingComponent && isContentComponentType(creatingComponent) && (
            <ComponentFormModal
              open
              type={creatingComponent}
              takenNames={components.filter((c) => c.type === creatingComponent).map((c) => c.name)}
              onClose={() => setCreatingComponent(undefined)}
              onSubmit={async (draft) => openCreated(await onCreateComponent(creatingComponent, draft))}
              onDraftWithAI={onDraftComponentWithAI ? () => onDraftComponentWithAI(creatingComponent) : undefined}
            />
          )}
          <Modal open={addAfterId !== undefined} title="Connect a system" onClose={() => setAddAfterId(undefined)} widthClass="max-w-3xl">
            <ConnectSystemPicker
              catalog={catalog}
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
        <CanvasLayout
          bottom={onMain && <ReadOnlyNotice onEditInSandbox={() => setEditInSandboxOpen(true)} />}
          rightOverlay={inspector}
        >
          <WorkflowCanvas
            workflow={graph}
            adaptors={adaptors.info}
            systems={systems}
            selectedId={selectedId}
            onSelect={selectNode}
            onOpen={openNode}
            onNodeAction={onNodeAction}
            readOnly={onMain}
            deleteBlockedReason={onMain ? undefined : deleteBlocked}
            run={selectedRun}
            activity={activity}
            onShowFailures={setSelectedId}
            height={760}
            header={runsBar}
            onAddAfter={onMain || version !== "latest" || selectedRun ? undefined : setAddAfterId}
          />
        </CanvasLayout>
      )}
      {view === "code" && (
        <CodeWorkspace
          workflow={graph}
          adaptors={adaptors}
          systems={systems}
          contents={contents}
          file={file}
          onOpen={(f) => {
            openFile(f);
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
          showWorkflowFiles={showWorkflowFiles}
          showEnvVars={envVars !== undefined}
          showComponents={showComponents}
          publishesServices={publishesServices}
          url={url}
          live={live}
          onToggleLive={setLive}
          settings={settings}
          onSettingsChange={(s) => {
            setSettings(s);
            if (s.name.trim()) setName(s.name);
          }}
          credentials={Object.fromEntries(graph.nodes.flatMap((n) => (n.type === "job" ? [[n.id, n.credentialId]] : [])))}
          onStepChange={onMain ? undefined : changeStep}
          onCodeChange={onMain ? undefined : changeCode}
          onDeleteStep={onMain ? undefined : deleteStep}
          deleteStepBlockedReason={onMain ? undefined : deleteBlocked}
          onAddStep={onMain ? undefined : addStep}
          files={workflowFiles}
          savedDataclipCount={saved.length}
          docs={docs}
          onAddFile={onMain ? undefined : () => setAddFileOpen(true)}
          onAddComponent={onMain || addableTypes.length === 0 ? undefined : () => setAddComponentOpen(true)}
          pane={file === "health" ? healthPane : file === "dataclips" ? dataclipsPane : file === "envVars" ? envVarsPane : componentPane}
          showExplorer={layout.explorer}
          showDetails={shownLayout.details}
          detailsView={layout.detailsView}
          onDetailsViewChange={(v) => changeLayout({ details: true, detailsView: v })}
          layoutMenu={layoutMenu}
          onClose={() => setView("canvas")}
          statusNote={statusNote}
          dirtyStepIds={[
            ...new Set([...Object.keys(edits.bodies), ...Object.keys(edits.labels), ...Object.keys(edits.adaptors), ...edits.added.map((j) => j.id)]),
          ]}
        >
          {(code) => (
            <CodeLayout
              nav={code.nav}
              header={code.header}
              footer={code.footer}
              bottomTray={panel}
              rightTray={
                code.details && (
                  <EditorTray placement="right" tabs={code.details.tabs} actions={code.details.actions}>
                    {code.details.body}
                  </EditorTray>
                )
              }
            >
              {code.main}
            </CodeLayout>
          )}
        </CodeWorkspace>
      )}
    </EditorShell>
  );
}

/**
 * The editor while its workflow is on its way: the same frame, with the Fn
 * button and a spinner where the workflow's name goes over the empty canvas,
 * so opening a workflow goes straight into the editor and fills in as it loads.
 */
export function WorkflowEditorLoading() {
  return (
    <EditorShell
      floatToolbar
      toolbar={
        <EditorToolbar loading name="" onMenuAction={() => undefined} view="canvas" onViewChange={() => undefined}>
          {(bar) => <EditorTopBar {...bar} />}
        </EditorToolbar>
      }
    >
      {null}
    </EditorShell>
  );
}
