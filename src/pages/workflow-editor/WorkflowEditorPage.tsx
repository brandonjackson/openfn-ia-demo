import { sandboxSlug, type SandboxDraft } from "../../model/sandboxes";
import { errorMessageOf } from "../../model/form-error";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Database, FilePlus, FileText, FlaskConical, Sparkles } from "lucide-react";
import type {
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
} from "../../model/workflow";
import { defaultWorkflowSettings, stepDeleteBlockedReason, workflowToYaml } from "../../model/workflow";
import type { WorkflowSettings } from "../../model/workflow";
import { counterpartNodeId, workflowChanges, type WorkflowChange } from "../../model/workflow-changes";
import { withCode, withEdge, withStep, withStepAfter, withStepAtEnd, withTool, withoutStep, type NewStep } from "../../model/workflow-edits";
import { useWorkflowEdits } from "./use-workflow-edits";
import { useEditorPanels } from "./use-editor-panels";
import { newDocName } from "../../model/workflow-docs";
import { lifecycleStages, type LifecycleStageId } from "../../model/workflow-lifecycle";
import type { EnvVar, EnvVarDraft } from "../../model/env-vars";
import { failureReasons, filterWorkOrders, runActivity, shortId, workflowHealth } from "../../model/runs";
import type { ActivityPeriod, RunStart } from "../../model/runs";
import type { AdaptorReference } from "../../model/adaptor-reference";
import type { AdaptorCatalog } from "../../model/adaptor-catalog";
import type { ConnectedSystem } from "../../model/connected-systems";
import { ENVIRONMENTS, type CredentialDraft, type CredentialSchema, type CredentialSchemaSummary, type ProjectOption } from "../../model/credentials";
import { stepMissingCredential } from "../../model/step-credentials";
import CredentialFormModal from "../../components/domain/CredentialFormModal";
import { serviceStepBody, type StepService } from "../../model/services";
import type {
  AssistantConversation,
  AssistantMessage,
  AssistantMode,
  AssistantPlan,
  AssistantReference,
  AssistantSuggestions,
} from "../../model/assistant";
import type { ProjectComponent, ProjectService } from "../../model/projects";
import EditorShell from "../../components/patterns/EditorShell";
import CanvasLayout from "../../components/patterns/CanvasLayout";
import CodeLayout from "../../components/patterns/CodeLayout";
import EditorTray from "../../components/patterns/EditorTray";
import EditorTopBar from "../../components/patterns/EditorTopBar";
import EditorToolbar from "../../components/domain/EditorToolbar";
import EnvVarsView from "../../components/domain/EnvVarsView";
import type { EditorView } from "../../components/domain/EditorToolbar";
import type { WorkflowMenuAction } from "../../components/domain/WorkflowFileMenu";
import EditorPanel from "../../components/patterns/EditorPanel";
import LayoutMenu from "../../components/domain/LayoutMenu";
import { resetLayout } from "../../components/domain/editor-layout";
import type { EditorLayout, PanelViewId } from "../../components/domain/editor-layout";
import WorkflowCanvas from "../../components/domain/WorkflowCanvas";
import type { NodeAction } from "../../components/domain/WorkflowNodeCard";
import CodeWorkspace from "../../components/domain/CodeWorkspace";
import type { ExplorerFile, WorkflowFileKind } from "../../components/domain/EditorExplorer";
import VersionMismatchBanner from "../../components/domain/VersionMismatchBanner";
import StepRunDetails from "../../components/domain/StepRunDetails";
import StepInspector from "../../components/domain/StepInspector";
import { panelViews, type RunDataSection } from "../../components/domain/panel-views";
import CanvasRunsBar from "../../components/domain/CanvasRunsBar";
import ReadOnlyNotice from "../../components/domain/ReadOnlyNotice";
import FailureBreakdown from "../../components/domain/FailureBreakdown";
import type { FailureScope } from "../../components/domain/FailureBreakdown";
import RunHistoryList from "../../components/domain/RunHistoryList";
import type { StepChanges } from "../../components/domain/StepConfigPanel";
import EdgeInspector, { type EdgeChanges } from "../../components/domain/EdgeInspector";
import AIAssistantPanel from "../../components/domain/AIAssistantPanel";
import RunLabel from "../../components/domain/RunLabel";
import RunInputModal from "../../components/domain/RunInputModal";
import type { RunInput } from "../../components/domain/RunInputModal";
import SandboxFormModal from "../../components/domain/SandboxFormModal";
import PromoteSandboxModal from "../../components/domain/PromoteSandboxModal";
import ConfirmModal from "../../components/primitives/ConfirmModal";
import Modal from "../../components/primitives/Modal";
import type { ProjectComponentType } from "../../model/component-types";
import AddComponentPanel, { type AddComponentOption } from "../../components/domain/AddComponentPanel";
import SavedDataclipsView from "../../components/domain/SavedDataclipsView";
import DataclipFormModal from "../../components/domain/DataclipFormModal";
import TestCasesView from "../../components/domain/TestCasesView";
import TestCaseFormModal from "../../components/domain/TestCaseFormModal";
import { asksToGenerateTests, draftOf, generateTestsPrompt, testGenerationReply, testTally, untitledTestName, type TestCase, type TestCaseDraft, type TestGeneration, type TestResult } from "../../model/test-cases";
import { savedDataclips, untitledDataclipName, type DataclipChanges, type DataclipDraft } from "../../model/dataclips";
import WorkflowHealth from "../../components/domain/WorkflowHealth";
import WorkflowStages, { type StageLink } from "../../components/domain/WorkflowStages";
import ChannelView from "../../components/domain/ChannelView";
import WorkflowDocView from "../../components/domain/WorkflowDocView";
import ComponentView from "../../components/domain/ComponentView";
import CollectionView from "../../components/domain/CollectionView";
import ComponentFormModal from "../../components/domain/ComponentFormModal";
import ChannelFormModal from "../../components/domain/ChannelFormModal";
import CollectionNameModal from "../../components/domain/CollectionNameModal";
import { isContentComponentType, type ComponentDraft, type ContentComponentType } from "../../model/project-components";
import type { ChannelDraft } from "../../model/channels";
import ConnectSystemPicker from "../../components/domain/ConnectSystemPicker";
import type { ConnectChoice } from "../../components/domain/ConnectSystemPicker";
import AddConnectedSystemFlow, { type NewSystemInput } from "../../components/domain/AddConnectedSystemFlow";
import ReportOutcomeView from "../../components/domain/ReportOutcomeView";
import ApprovalStepView from "../../components/domain/ApprovalStepView";
import { newStepTool, newStepToolLabel, toolBody, toolSummary, type StepTool, type StepToolKind } from "../../model/step-tools";
import type { Adaptor } from "../../model/adaptors";
import { componentTypes } from "../../model/component-types";

/** Who starts runs and retries in the prototype. */
const CURRENT_USER = "Jane Doe";

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
 * lists what's changed against main (components added here included), and its "Create promotion request" promotes the sandbox to
 * main as a new version.
 *
 * Loading a run draws it on the canvas, marks each step in
 * the explorer and fills the Log, Input and Output views for the step in
 * focus. A run started from the editor is the server's to run: the page asks
 * for it (`onRun`), loads the run it's told was started, and draws it as
 * `workOrders` brings each step in.
 * When the run took place on an older version, a banner offers to view the
 * version that ran. With a run selected the run button becomes Retry.
 *
 * The selected run, the selected sandbox and whether the workflow is live are
 * the caller's: the page shows what it's given and asks for a change through
 * `onRunChange`, `onSelectSandbox` and `onToggleLive`.
 */
export default function WorkflowEditorPage({
  workflow,
  workOrders: orders = [],
  dataclips: clips = [],
  graphForVersion,
  runId,
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
  componentsLoading = false,
  onOpenComponent,
  componentTypeOptions,
  fileChanges = [],
  onSaveDoc,
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
  sandbox,
  onSelectSandbox,
  onViewAllSandboxes,
  versions = [],
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
  systemAdaptors,
  onAddSystem,
  tools,
  stepServices,
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
  onRetryRun,
  live,
  onToggleLive,
  onPromote,
  onCreateSandbox,
  promoteTarget,
  onCreateDataclip,
  onSaveDataclip,
  baseline,
  environment,
  envVars,
  onCreateEnvVar,
  onUpdateEnvVar,
  onDeleteEnvVar,
  testCases,
  onRunTestCase,
  onCreateTestCase,
  onUpdateTestCase,
  onDeleteTestCase,
  onGenerateTestCases,
  credentialSchemas,
  onLoadCredentialSchema,
  credentialProjects = [],
  onCreateCredential,
}: {
  workflow: Workflow;
  /** Recent work orders, newest first. */
  workOrders?: WorkOrder[];
  /** The project's dataclips: run inputs, step results and saved inputs. */
  dataclips?: Dataclip[];
  /** The workflow's graph at an earlier version, for "View as executed". */
  graphForVersion?: (version: string) => Workflow | undefined;
  /** The run that's loaded, if any. */
  runId?: string;
  /** Loads a run, or unloads it with undefined. */
  onRunChange: (runId: string | undefined) => void;
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
  /** While the components are still loading, e.g. just after switching sandbox: what was open waits for them. */
  componentsLoading?: boolean;
  /** Opens a component's page in the project. */
  onOpenComponent?: (componentId: string) => void;
  /** The kinds of component that can be added. Defaults to every kind but Workflow. */
  componentTypeOptions?: ProjectComponentType[];
  /**
   * In a sandbox, what it changes in the files it keeps against where it merges, listed with the workflow's
   * changes: this workflow's docs and test cases, and the project's saved dataclips, components and
   * environment variables. Left out on main.
   */
  fileChanges?: WorkflowChange[];
  /**
   * Saves one of the workflow's docs (context.md, spec.md or one added beside them) by file name, making it if
   * it's new; `contents` then holds what was saved. Left out where you can't change them: they're drawn to read.
   */
  onSaveDoc?: (name: string, content: string) => Promise<void>;
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
  /** The sandbox being shown, or "main". */
  sandbox: string;
  /** Shows another sandbox, or main. */
  onSelectSandbox: (sandbox: string) => void;
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
  /** Every adaptor by category, with the built-in tools and AI actions, for "Add a step". */
  catalog: AdaptorCatalog;
  /** The project's connected systems. */
  systems?: ConnectedSystem[];
  /** Every adaptor a new connected system can use, for adding one from "Add a step". */
  systemAdaptors?: Adaptor[];
  /**
   * Adds a connected system from an adaptor picked in "Add a step" that the project has no system for yet;
   * resolves with its id, and the new step is added on it. Left out (no connected systems, or not
   * yours to add), picking any adaptor adds its step straight away.
   */
  onAddSystem?: (system: NewSystemInput) => Promise<string>;
  /** The tools a new step can be, offered in "Add a step" under Tools. Left out, the picker has no Tools tab. */
  tools?: StepToolKind[];
  /** Published services a new step can call, offered in "Add a step" under Services. Left out, the picker has no Services tab. */
  stepServices?: StepService[];
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
   * Starts a run of the workflow as it's saved: from the start or from a step, on a dataclip, a new
   * input or `{}`. Resolves with the run the server started, which the page loads; `workOrders` and
   * `dataclips` then bring it in, a step at a time. Rejects when it couldn't start; the caller has
   * said why. Without it nothing runs.
   */
  onRun?: (start: RunStart) => Promise<{ runId?: string }>;
  /**
   * Runs a run's input again, as another run of its work order: from one of its steps (by the step's
   * job) or from the start. Resolves and rejects as `onRun` does.
   */
  onRetryRun?: (runId: string, fromJobId?: string) => Promise<{ runId?: string }>;
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
  /** Whether the workflow's trigger is on. */
  live: boolean;
  /** Turns the workflow's trigger on or off. A refusal shows in the status bar. */
  onToggleLive: (live: boolean) => Promise<void>;
  /**
   * Promotes the sandbox's changes to main as a new version, with what was
   * said about them. Once it resolves, `versions` has the new one. Left out
   * where there's nothing to promote from (main).
   */
  onPromote?: (message: string) => Promise<void>;
  /**
   * Makes a sandbox, from New sandbox or "Edit in sandbox": its name (the
   * slug of what was typed), environment and the sandbox it's made from, and
   * with a run loaded, maybe a reviewed copy of the run's input, saved in it
   * under the run's name. Once it resolves, `sandboxes` lists it and,
   * selected, its `dataclips` hold the input. A refusal shows under the
   * form's field.
   */
  onCreateSandbox: (draft: SandboxDraft) => Promise<void>;
  /** Where promoting the selected sandbox takes its changes: its parent. Main when left out. */
  promoteTarget?: string;
  /** Saves a new dataclip in the project, to run with; resolves with it, and `dataclips` then has it. Left out where you can't. */
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
  /** The workflow's test cases, listed under Workflow in the explorer below Saved dataclips. Left out, the explorer doesn't list them. */
  testCases?: TestCase[];
  /** Has the assistant run one; resolves with how it went. Left out where tests can't be run. */
  onRunTestCase?: (id: string) => Promise<TestResult>;
  /** Adds a test case to the workflow. Left out where you can't, e.g. on main. */
  onCreateTestCase?: (draft: TestCaseDraft) => Promise<void>;
  /** Changes one. Left out where you can't. */
  onUpdateTestCase?: (id: string, draft: TestCaseDraft) => Promise<void>;
  /** Deletes one. Left out where you can't. */
  onDeleteTestCase?: (id: string) => Promise<void>;
  /** Has the assistant sync the tests with spec.md, writing deterministic tests for what nothing covers. Left out where you can't. */
  onGenerateTestCases?: () => Promise<TestGeneration>;
  /** Every kind of credential, for the form a step's New credential opens. Left out, a step has no New credential. */
  credentialSchemas?: CredentialSchemaSummary[];
  /** Fetches one kind of credential in full, with its fields, for that form. */
  onLoadCredentialSchema?: (id: string) => Promise<CredentialSchema>;
  /** The projects a new credential can be shared with; the first, the workflow's project, is ticked to start. */
  credentialProjects?: ProjectOption[];
  /**
   * Makes a credential from a step's New credential; resolves with its link
   * to the workflow's project, which the step is then given, or nothing when
   * it wasn't shared there. Left out, a step has no New credential.
   */
  onCreateCredential?: (draft: CredentialDraft) => Promise<string | undefined>;
}) {
  // ---- Where we are ---------------------------------------------------------

  const [view, setView] = useState<EditorView>(initialView);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);
  // With nothing chosen, code mode opens the workflow's Overview (where it is in its life), or the trigger when the
  // explorer doesn't list the workflow's files. Its settings live with workflow.yaml.
  const fallbackFile: ExplorerFile = showWorkflowFiles ? "overview" : "trigger";
  const settingsFile: ExplorerFile = showWorkflowFiles ? "workflow" : "trigger";
  const [file, setFile] = useState<ExplorerFile>(initialFile ?? (initialSelectedId ? { stepId: initialSelectedId } : fallbackFile));

  const onMain = sandbox === "main";

  // The versions are the caller's: on main they arrive once the history loads, and a promotion's lands there once it's merged.
  const nextVersion = `v${Math.max(0, ...versions.map((v) => Number(v.id.replace(/^v/, "")) || 0)) + 1}`;
  const [version, setVersion] = useState(initialVersion);
  const latestVersion = versions[0]?.id;

  // ---- Edits ----------------------------------------------------------------

  const setLive = (next: boolean | ((l: boolean) => boolean)) => {
    const value = typeof next === "function" ? next(live) : next;
    void onToggleLive(value).catch((e: unknown) => setStatusNote(errorMessageOf(e)));
  };
  const [settings, setSettings] = useState<WorkflowSettings>(() => defaultWorkflowSettings(workflow));
  const [statusNote, setStatusNote] = useState<string>();
  // Unsaved work: in a sandbox it's saved a moment after each change. On another copy of the workflow (another
  // sandbox, or main), what's open stays open: the same step (or trigger) in the new copy, found by name since
  // ids differ between copies, or the default where the new copy hasn't got it.
  const { edits, change, name, setName, latest, saveNow } = useWorkflowEdits({
    workflow,
    info: adaptors.info,
    onSave: onMain ? undefined : onSaveWorkflow,
    onNote: setStatusNote,
    onOtherCopy: (previous) => {
      const counterpart = (id: string) => counterpartNodeId(previous, workflow, id);
      if (typeof file === "object" && "stepId" in file) {
        const id = counterpart(file.stepId);
        setFile(id ? { stepId: id } : fallbackFile);
      }
      if (selectedId) setSelectedId(counterpart(selectedId));
    },
  });

  // The graph on the canvas: the latest with this session's edits, or an earlier version being viewed.
  const graph = version === "latest" ? latest : (graphForVersion?.(version) ?? latest);
  const viewingVersion = version === "latest" ? latestVersion : version;

  // ---- Runs -----------------------------------------------------------------

  const setRunId = onRunChange;
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

  // A page in the code view's main pane (Overview, Health, Saved dataclips, Test cases, Environment variables).
  const isPage = (f: ExplorerFile) => f === "overview" || f === "health" || f === "dataclips" || f === "testCases" || f === "envVars";
  // Stories pin a layout; the app remembers the reader's. Opened to build something (from Create), the
  // assistant is shown, already working on it.
  const { layout, shownLayout, updateLayout, changeLayout, showPanel, togglePanel, toggleAssistant, hidePagePanels } = useEditorPanels({
    initial: { ...(assistantPrompt && { assistant: true }), ...initialLayout },
    onPage: view === "code" && isPage(file),
    inCode: view === "code",
  });
  const openFile = (f: ExplorerFile) => {
    if (isPage(f) && f !== file) hidePagePanels();
    setFile(f);
  };

  const selectNode = (node: WorkflowNode) => {
    setSelectedEdgeId(undefined);
    setSelectedId(selectedId === node.id ? undefined : node.id);
  };
  // The path open in the inspector, picked from its badge on the canvas; a node and a path aren't both open.
  const [selectedEdgeId, setSelectedEdgeId] = useState<string>();
  const selectEdge = (edge: WorkflowEdge) => {
    setSelectedId(undefined);
    setSelectedEdgeId(selectedEdgeId === edge.id ? undefined : edge.id);
  };

  /** Open a step's code, the trigger's settings, or the workflow's YAML and settings. */
  const openInCode = (nodeId?: string) => {
    const node = graph.nodes.find((n) => n.id === nodeId);
    setFile(node ? (node.type === "trigger" ? "trigger" : { stepId: node.id }) : settingsFile);
    setView("code");
  };

  /** Open a node in code from the canvas (its Edit, or a double-click), keeping it selected. */
  const openNode = (node: WorkflowNode) => {
    setSelectedId(node.id);
    openInCode(node.id);
  };

  // Connect, on a step that needs a credential and has none: its code, with the details column on Config, scrolled to the credential.
  const [focusCredential, setFocusCredential] = useState(0);
  const connectStep = (jobId: string) => {
    setSelectedId(jobId);
    openInCode(jobId);
    changeLayout({ details: true, detailsView: "config" });
    setFocusCredential((n) => n + 1);
  };
  // The step whose New credential opened the credential form.
  const [newCredentialFor, setNewCredentialFor] = useState<string>();

  const [runInputOpen, setRunInputOpen] = useState(defaultRunInputOpen);
  // The sandbox form, as New sandbox (from the chip) or "Edit in sandbox" (from main), or closed.
  const [sandboxForm, setSandboxForm] = useState<"new" | "editInSandbox" | undefined>(defaultEditInSandboxOpen ? "editInSandbox" : undefined);
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
  /** Once a new component is made, open it in the code view. */
  const openCreated = (id: string) => {
    setCreatingComponent(undefined);
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

  // A run being started: a second press waits for the first, and the save that goes before it is the only one.
  const starting = useRef(false);

  /**
   * Starts a run and loads it. Edits not yet saved go first, since the server runs the workflow as
   * it's saved: a refused save shows in the status bar, as any does, and nothing runs. A refused run
   * loads nothing; the caller says why.
   */
  const startRun = async (ask: () => Promise<{ runId?: string }> | undefined) => {
    if (starting.current) return;
    starting.current = true;
    try {
      if (!(await saveNow())) return;
      const started = await ask();
      if (!started) return;
      setVersion("latest");
      if (started.runId) setRunId(started.runId);
      updateLayout({ detailsView: "io" });
      if (view === "code" && layout.panel && focusJob) showPanel("log");
    } catch {
      // Refused: the caller said why, and no run is loaded.
    } finally {
      starting.current = false;
    }
  };

  const runFresh = (fromJobId?: string) => void startRun(() => onRun?.({ fromJobId: graph.nodes.some((n) => n.id === fromJobId) ? fromJobId : undefined }));

  const runWithInput = (input: RunInput) => {
    setRunInputOpen(false);
    void startRun(() =>
      onRun?.({ input: input.kind === "existing" ? { dataclipId: input.dataclip.id } : input.kind === "new" ? { body: input.body, name: input.name } : undefined }),
    );
  };

  /** Run the selected run's input again: from the step in focus, or from the start. */
  const retry = () => {
    if (!selectedRun) return;
    const run = selectedRun;
    void startRun(() => onRetryRun?.(run.runId, focusStep?.jobId));
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

  // Rejects with the server's reason, which the promotion request shows under its message.
  const promote = async (message: string) => {
    if (!onPromote) return;
    await onPromote(message);
    setPromoteOpen(false);
    setVersion("latest");
    onSelectSandbox("main");
  };

  const createSandbox = async (draft: SandboxDraft) => {
    // Named by its slug, as the Sandboxes page names them.
    const sandboxName = sandboxSlug(draft.name);
    // A refusal rejects, and the form shows it under its field.
    await onCreateSandbox({ ...draft, parent: draft.parent ?? sandbox });
    // What it brings across shows in the sandbox's Saved dataclips.
    if (draft.runInput) addFile("dataclips");
    onSelectSandbox(sandboxName);
  };

  // ---- Editing --------------------------------------------------------------

  const changeStep = (stepId: string, changes: StepChanges) => change((e) => withStep(e, stepId, changes));
  const changeEdge = (edgeId: string, changes: EdgeChanges) => change((e) => withEdge(e, edgeId, changes));
  const changeCode = (stepId: string, body: string) => change((e) => withCode(e, stepId, body));
  const changeTool = (stepId: string, tool: StepTool) => change((e) => withTool(e, stepId, tool));

  const addStep = () => {
    const id = crypto.randomUUID();
    const step: NewStep = {
      id,
      type: "job",
      label: "Untitled step",
      adaptor: "common",
      adaptorPackage: adaptors.info.common.package,
      body: "// Start writing your step here\nfn(state => state);",
    };
    change((e) => withStepAtEnd(e, graph, step, () => crypto.randomUUID()));
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

  // An adaptor the project has no system for yet: add the system first, then the step on it.
  const [newSystem, setNewSystem] = useState<{ afterId: string; adaptor: string }>();

  const addStepAfter = (sourceId: string, choice: ConnectChoice, system?: string) => {
    if (!graph.nodes.some((n) => n.id === sourceId)) return;
    const id = crypto.randomUUID();
    // A tool runs on the common adaptor, with settings in place of code.
    const tool = choice.kind === "tool" ? newStepTool(choice.tool) : undefined;
    // A service is called over HTTP, so its step is an HTTP step named for what the service does.
    const adaptor = choice.kind === "ai" ? "claude" : choice.kind === "service" ? "http" : choice.kind === "tool" ? "common" : choice.adaptor;
    // An adaptor the editor has no reference for (one picked while adding a system) still gets a step.
    const info = adaptors.info[adaptor] ?? { ...adaptors.info.common, name: adaptor, package: `@openfn/language-${adaptor}` };
    const firstSnippet = adaptors.snippets[adaptor]?.[0]?.code;
    const step: NewStep = {
      id,
      type: "job",
      label:
        choice.kind === "ai"
          ? `${choice.action.label} with AI`
          : choice.kind === "service"
            ? choice.service.name
            : choice.kind === "tool"
              ? newStepToolLabel(choice.tool)
              : `New ${info.name} step`,
      adaptor,
      adaptorPackage: info.package,
      ...(tool && { tool, summary: toolSummary(tool) }),
      body: tool
        ? toolBody(tool)
        : choice.kind === "ai"
          ? choice.action.body
          : choice.kind === "service"
            ? serviceStepBody(choice.service)
            : `// Connect to ${info.name}\n${firstSnippet ?? "fn(state => state);"}\n`,
      ...(system && { system }),
    };
    // Where it goes, and what moves to make room, is the model's (`withStepAfter`).
    change((e) => withStepAfter(e, graph, sourceId, step, () => crypto.randomUUID()) ?? e);
    setAddAfterId(undefined);
    setSelectedId(id);
  };

  // ---- Workflow files -------------------------------------------------------

  // The workflow's Markdown files (context.md, spec.md and added docs), opened from the explorer: drawn as they
  // read, with Edit in a sandbox. Each is a file the sandbox keeps, so a save goes to the server (`onSaveDoc`),
  // where it's one of the sandbox's changes, and `contents` brings it back.
  const docText = (name: string) => contents?.docs[name] ?? (/^(context|spec)\.md$/.test(name) ? "" : `# ${name.replace(/\.md$/, "")}\n`);
  const saveDoc = async (name: string, text: string) => void (await onSaveDoc?.(name, text));
  // Docs beside context.md and spec.md: the workflow's own, and any added this session that aren't saved yet.
  const [addedDocs, setAddedDocs] = useState<string[]>([]);
  const docs = [...new Set([...Object.keys(contents?.docs ?? {}), ...addedDocs])].filter((n) => n !== "context.md" && n !== "spec.md");
  const addDoc = () => {
    const name = newDocName(["context.md", "spec.md", ...docs]);
    setAddedDocs([...addedDocs, name]);
    setFile({ docName: name });
    // Adding a doc makes the file, so it's kept, and counted, before anything is written in it.
    if (!onMain) void saveDoc(name, docText(name)).catch((e: unknown) => setStatusNote(errorMessageOf(e)));
  };
  const openDoc =
    file === "context" || file === "spec" ? `${file}.md` : typeof file === "object" && "docName" in file ? file.docName : undefined;
  const docAbout: Record<string, string> = {
    "context.md": "The legislation behind the workflow and the groups of citizens it affects. The assistant reads it before proposing changes.",
    "spec.md": "What goes in, what each step writes, and when a run counts as done.",
  };
  const docPane = openDoc && (
    <WorkflowDocView
      key={`${sandbox}/${openDoc}`}
      name={openDoc}
      description={docAbout[openDoc] ?? "A doc kept alongside the workflow. The assistant reads it with the context and spec."}
      content={docText(openDoc)}
      onSave={onMain || !onSaveDoc ? undefined : (text) => saveDoc(openDoc, text)}
      onEditInSandbox={onMain ? () => setSandboxForm("editInSandbox") : undefined}
    />
  );

  // The workflow's optional files: the ones it has, and any added from the Workflow group's + this session.
  const saved = savedDataclips(clips);
  const [addedFiles, setAddedFiles] = useState<WorkflowFileKind[]>([]);
  const addFile = (kind: WorkflowFileKind) => setAddedFiles((current) => (current.includes(kind) ? current : [...current, kind]));
  const has: Record<WorkflowFileKind, boolean> = {
    context: !contents || "context.md" in contents.docs,
    spec: !contents || "spec.md" in contents.docs,
    service: service !== undefined,
    dataclips: saved.length > 0,
  };
  // The one open stays listed too, e.g. Saved dataclips after switching to a sandbox that has none yet.
  const workflowFiles = (["context", "spec", "service", "dataclips"] as const).filter((k) => has[k] || addedFiles.includes(k) || file === k);
  const [addFileOpen, setAddFileOpen] = useState(defaultAddFileOpen);
  const [newDataclipOpen, setNewDataclipOpen] = useState(false);
  // The test case form: a new one, or the one being edited.
  const [testForm, setTestForm] = useState<"new" | TestCase>();
  const added = (kind: WorkflowFileKind) => (workflowFiles.includes(kind) ? "Added" : undefined);
  const fileOptions: (AddComponentOption & { kind: WorkflowFileKind | "doc" | "test" })[] = [
    ...(publishesServices
      ? [{ kind: "service" as const, type: "Service manifest", icon: BookOpen, tag: added("service"), description: "service.yaml: how the workflow is listed as a service, and how other teams call it." }]
      : []),
    { kind: "spec", type: "Spec", icon: FileText, tag: added("spec"), description: "spec.md: what goes in, what each step writes, and when a run counts as done." },
    { kind: "dataclips", type: "Saved dataclip", icon: Database, tag: saved.length > 0 ? `${saved.length} saved` : undefined, description: "An input kept in the project to run the workflow with again." },
    ...(testCases && onCreateTestCase
      ? [{ kind: "test" as const, type: "Test case", icon: FlaskConical, tag: testCases.length > 0 ? `${testCases.length} tests` : undefined, description: "A scenario in plain words that the assistant runs and checks." }]
      : []),
    { kind: "context", type: "Context", icon: FileText, tag: added("context"), description: "context.md: the legislation and people behind the workflow, for the assistant to read." },
    { kind: "doc", type: "Doc", icon: FilePlus, description: "A blank Markdown doc kept alongside the workflow." },
  ];
  const pickFile = (kind: WorkflowFileKind | "doc" | "test") => {
    setAddFileOpen(false);
    if (kind === "doc") return addDoc();
    if (kind === "test") {
      openFile("testCases");
      return setTestForm("new");
    }
    if (kind === "dataclips") return setNewDataclipOpen(true);
    // context.md and spec.md are files the sandbox keeps: adding one makes it, so it's counted before it's written.
    if ((kind === "context" || kind === "spec") && !has[kind] && !onMain) {
      void saveDoc(`${kind}.md`, "").catch((e: unknown) => setStatusNote(errorMessageOf(e)));
    }
    addFile(kind);
    openFile(kind);
  };

  /** Save a new dataclip in the project and open Saved dataclips, where it now shows. */
  const createDataclip = async (draft: DataclipDraft) => {
    if (!onCreateDataclip) return;
    await onCreateDataclip(draft);
    addFile("dataclips");
    openFile("dataclips");
  };

  const saveDataclip = async (id: string, changes: DataclipChanges) => {
    await onSaveDataclip?.(id, changes);
  };

  /** Run the workflow with a saved dataclip, and show its log under the list. */
  const runSaved = (clip: Dataclip) => {
    void startRun(() => onRun?.({ input: { dataclipId: clip.id } }));
    showPanel("log");
  };

  /** Why a step can't be deleted, as Lightning has it: other steps run after it, or it's the first. */
  const deleteBlocked = (stepId: string) => stepDeleteBlockedReason(graph, stepId);

  // A step that needs a credential and has none offers Connect on its card, in a sandbox.
  const missingCredential = (stepId: string) => {
    const job = graph.nodes.find((n): n is JobNode => n.type === "job" && n.id === stepId);
    const system = job?.system ? systems.find((s) => s.id === job.system) : undefined;
    return !!job && stepMissingCredential(adaptors.info[job.adaptor], system, job.credentialId);
  };
  // The environment a step's credential needs values for: the sandbox's, or production where it names none of them (main).
  const credentialEnvironment = ENVIRONMENTS.find((e) => e === environment) ?? "production";
  const newCredentialStep = graph.nodes.find((n): n is JobNode => n.type === "job" && n.id === newCredentialFor);

  const deleteStep = (stepId: string) => {
    if (deleteBlocked(stepId)) return;
    change((e) => withoutStep(e, stepId));
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
    change((e) => withCode(e, target.id, `// Assistant: ${plan.steps[0]}\n${e.bodies[target.id] ?? target.body}`));
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
        return setSandboxForm("editInSandbox");
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

  // The Overview, which code mode opens on: where the workflow is in its life, each stage linking
  // to where in the explorer it's done.
  const firstStep = graph.nodes.find((n): n is JobNode => n.type === "job");
  const graphTrigger = graph.nodes.find((n) => n.type === "trigger");
  const stages = lifecycleStages({
    hasContext: workflowFiles.includes("context"),
    hasSpec: workflowFiles.includes("spec"),
    stepCount: graph.nodes.filter((n) => n.type === "job").length,
    tests: testCases && { total: testCases.length, passed: testCases.filter((t) => t.lastResult?.status === "passed").length },
    testedOk: orders.some((o) => o.runs.some((r) => r.status === "success")),
    onMain,
    live,
    hasRuns: orders.length > 0,
    published: service !== undefined,
    canPublish: publishesServices,
  });
  const currentStage = stages.findIndex((s) => s.state === "current");
  const open = (label: string, f: ExplorerFile): StageLink => ({ label, onOpen: () => openFile(f) });
  // In a sandbox, a file the workflow doesn't have yet is added from the Workflow group's +.
  const addable = (label: string): StageLink | undefined => (onMain ? undefined : { label, onOpen: () => setAddFileOpen(true) });
  const stageLinks: Partial<Record<LifecycleStageId, StageLink>> = {
    problem: workflowFiles.includes("context") ? open("context.md", "context") : addable("Add context"),
    proposal: workflowFiles.includes("spec") ? open("spec.md", "spec") : addable("Add spec"),
    build: firstStep ? open(firstStep.label, { stepId: firstStep.id }) : onMain ? undefined : { label: "Add a step", onOpen: addStep },
    test: testCases
      ? open("Test cases", "testCases")
      : !onMain && onRun
        ? { label: "Run it", onOpen: () => setRunInputOpen(true) }
        : undefined,
    live: onMain
      ? graphTrigger && open(graphTrigger.label, "trigger")
      : { label: "Create promotion request", onOpen: () => setPromoteOpen(true) },
    evaluate: open("Health", "health"),
    share: workflowFiles.includes("service") ? open("service.yaml", "service") : addable("Add service.yaml"),
  };
  const overviewPane = <WorkflowStages stages={stages} links={stageLinks} onMain={onMain} testCases={testCases !== undefined} />;

  // The project's environment variables, opened from the explorer's Workflow section.
  const envVarsPane = envVars && (
    <EnvVarsView variables={envVars} projectName={projectName} onCreate={onCreateEnvVar} onUpdate={onUpdateEnvVar} onDelete={onDeleteEnvVar} />
  );

  // A component, opened from the explorer's Components, shows in the code's place: the same view as
  // its page in the project. A channel shows its traffic, where a message from a run loads that run;
  // a collection its keys; anything else the file it is, to edit and save.
  const openComponent =
    typeof file === "object" && "componentId" in file ? components.find((c) => c.id === file.componentId) : undefined;
  // Switching sandbox swaps the components for the new project's copies, under new ids: the one that was
  // open is found again by its kind and name once the new list is in, or the default opens where it has none.
  const openComponentKey = useRef<{ type: string; name: string }>(undefined);
  useEffect(() => {
    if (openComponent) openComponentKey.current = { type: openComponent.type, name: openComponent.name };
  }, [openComponent]);
  const [componentSandbox, setComponentSandbox] = useState(sandbox);
  const [carriedComponent, setCarriedComponent] = useState<{ type: string; name: string }>();
  if (componentSandbox !== sandbox) {
    setComponentSandbox(sandbox);
    setCarriedComponent(typeof file === "object" && "componentId" in file ? openComponentKey.current : undefined);
  }
  useEffect(() => {
    if (!carriedComponent || componentsLoading) return;
    const same = components.find((c) => c.type === carriedComponent.type && c.name === carriedComponent.name);
    setFile(same ? { componentId: same.id } : fallbackFile);
    setCarriedComponent(undefined);
  }, [carriedComponent, components, componentsLoading, fallbackFile]);
  const openChannelDetails = openComponent?.type === "Channel" ? contents?.channels[openComponent.id] : undefined;
  const openCollection = openComponent?.type === "Collection" ? contents?.collections[openComponent.id] : undefined;
  const openContent = openComponent && isContentComponentType(openComponent.type) ? contents?.componentContents[openComponent.id] : undefined;
  // A tool step's settings, in place of its code: edited in a sandbox, read on main.
  const openTool = view === "code" ? focusJob?.tool : undefined;
  const toolPane =
    focusJob && openTool?.kind === "outcome" ? (
      <ReportOutcomeView key={focusJob.id} tool={openTool} onChange={onMain ? undefined : (tool) => changeTool(focusJob.id, tool)} />
    ) : focusJob && openTool?.kind === "approval" ? (
      <ApprovalStepView key={focusJob.id} tool={openTool} onChange={onMain ? undefined : (tool) => changeTool(focusJob.id, tool)} />
    ) : undefined;

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

  // The workflow's test cases, opened from the explorer's Workflow group, take the code's place too.
  const jobSteps = graph.nodes.flatMap((n) => (n.type === "job" ? [{ id: n.id, label: n.label }] : []));
  const testCasesPane = testCases && (
    <TestCasesView
      tests={testCases}
      steps={jobSteps}
      onRun={onRunTestCase}
      onCreate={onCreateTestCase && (() => setTestForm("new"))}
      onEdit={onUpdateTestCase && ((t) => setTestForm(t))}
      onDelete={onDeleteTestCase}
      onGenerate={onGenerateTestCases}
    />
  );
  const tally = testCases && testTally(testCases);
  // What a test can run with: the saved dataclips, and the one the test being edited uses, which a
  // test copied into a sandbox can name without the sandbox listing it.
  const editedInput = typeof testForm === "object" ? testForm.input : undefined;
  const testDataclips = [
    ...saved.map((d) => ({ id: d.id, name: d.name ?? d.id })),
    ...(editedInput?.kind === "dataclip" && !saved.some((d) => d.id === editedInput.dataclipId)
      ? [{ id: editedInput.dataclipId, name: editedInput.dataclipName ?? editedInput.dataclipId }]
      : []),
  ];

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

  // The canvas's side UI for the selected path: its condition, label and switch, read-only on main.
  const focusEdge = graph.edges.find((e) => e.id === selectedEdgeId);
  const nodeLabel = (id: string) => graph.nodes.find((n) => n.id === id)?.label ?? id;
  const edgeInspector = focusEdge && (
    <EdgeInspector
      key={focusEdge.id}
      edge={focusEdge}
      sourceLabel={nodeLabel(focusEdge.source)}
      targetLabel={nodeLabel(focusEdge.target)}
      fromTrigger={graph.nodes.some((n) => n.id === focusEdge.source && n.type === "trigger")}
      onChange={onMain || version !== "latest" ? undefined : (c) => changeEdge(focusEdge.id, c)}
      onClose={() => setSelectedEdgeId(undefined)}
    />
  );

  // The canvas's side UI for the selected node: config, run history or the loaded run.
  const inspector =
    view === "canvas" && edgeInspector ? (
      edgeInspector
    ) : view === "canvas" && focusNode ? (
      <StepInspector
        key={focusNode.id}
        node={focusNode}
        adaptor={focusJob ? adaptors.info[focusJob.adaptor] : undefined}
        credentials={focusJob ? adaptors.credentials : undefined}
        system={focusJob?.system ? systems.find((s) => s.id === focusJob.system) : undefined}
        codeSummary={focusJob ? codeSummary?.(focusJob) : undefined}
        credentialId={focusJob?.credentialId}
        readOnly={onMain}
        url={url}
        live={live}
        onToggleLive={setLive}
        onChange={focusJob && !onMain ? (c) => changeStep(focusJob.id, c) : undefined}
        onConnect={focusJob && !onMain ? () => connectStep(focusJob.id) : undefined}
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

  // Writing the workflow's tests from its spec is one more thing to ask the
  // assistant: a suggestion like any other, and a message answered by Generate
  // from spec, the same as in Test cases.
  const generateTests = testCases && onGenerateTestCases;
  const suggestions = generateTests
    ? { job: assistantSuggestions?.job ?? [], workflow: [...(assistantSuggestions?.workflow ?? []), generateTestsPrompt] }
    : assistantSuggestions;
  const sendToAssistant: typeof onAssistantSend =
    generateTests
      ? async (prompt, jobLabel, mode) => {
          if (!jobLabel && asksToGenerateTests(prompt)) return { id: shortId(), role: "assistant", ...testGenerationReply(await generateTests()) };
          if (onAssistantSend) return onAssistantSend(prompt, jobLabel, mode);
          throw new Error("the assistant isn't available");
        }
      : onAssistantSend;

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
      suggestions={suggestions}
      onSend={sendToAssistant}
      onCarryOutPlan={onAssistantCarryOutPlan}
      initialPrompt={assistantPrompt}
      onOpenTests={
        testCases
          ? () => {
              openFile("testCases");
              setView("code");
            }
          : undefined
      }
    />
  );


  // ---- Layout ---------------------------------------------------------------

  // What going live would carry over: the copy on the canvas, edits and all, against where it merges,
  // and the sandbox's new and changed files (docs, tests, saved dataclips, components, variables), which go with it.
  const changes = onMain ? [] : [...workflowChanges(baseline, graph), ...fileChanges];

  const toolbar = (
    <EditorToolbar
      name={name}
      onRename={onMain ? undefined : setName}
      onMenuAction={onMenuAction}
      projectName={projectName}
      url={url}
      hasDetails={onSeeDetails !== undefined}
      sandboxes={sandboxes}
      sandbox={sandbox}
      onSelectSandbox={onSelectSandbox}
      onNewSandbox={() => setSandboxForm("new")}
      onViewAllSandboxes={onViewAllSandboxes}
      versions={versions}
      version={version}
      onSelectVersion={setVersion}
      run={selectedRun}
      onCloseRun={deselectRun}
      changes={changes}
      environment={environment}
      showEnvVars={envVars !== undefined}
      live={live}
      onToggleLive={setLive}
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
          <SandboxFormModal
            open={sandboxForm !== undefined}
            title={sandboxForm === "editInSandbox" ? "Edit in sandbox" : undefined}
            onClose={() => setSandboxForm(undefined)}
            sandboxes={sandboxes}
            defaultParent={sandbox}
            // Only "Edit in sandbox" offers to start with the loaded run's input.
            run={
              sandboxForm === "editInSandbox" && selectedRun
                ? { runId: selectedRun.runId, version: selectedRun.version, input: selectedRun ? clips.find((d) => d.id === selectedRun.inputId)?.body : undefined }
                : undefined
            }
            latestVersion={latestVersion}
            onSubmit={createSandbox}
          />
          <PromoteSandboxModal
            open={promoteOpen && !onMain}
            onClose={() => setPromoteOpen(false)}
            sandbox={sandbox}
            target={promoteTarget}
            changes={changes}
            nextVersion={nextVersion}
            onPromote={promote}
          />
          <Modal open={addFileOpen} title="Add to workflow" onClose={() => setAddFileOpen(false)} widthClass="max-w-2xl">
            <AddComponentPanel options={fileOptions} columns={2} bare onSelect={(type) => pickFile(fileOptions.find((o) => o.type === type)!.kind)} />
          </Modal>
          <TestCaseFormModal
            open={testForm !== undefined}
            initial={typeof testForm === "object" ? draftOf(testForm) : undefined}
            defaultName={untitledTestName(testCases ?? [])}
            steps={jobSteps}
            dataclips={testDataclips}
            onClose={() => setTestForm(undefined)}
            onSubmit={async (draft) => {
              if (typeof testForm === "object") await onUpdateTestCase?.(testForm.id, draft);
              else await onCreateTestCase?.(draft);
            }}
          />
          {newCredentialStep && credentialSchemas && onLoadCredentialSchema && onCreateCredential && (
            <CredentialFormModal
              open
              schemas={credentialSchemas}
              onLoadSchema={onLoadCredentialSchema}
              projects={credentialProjects}
              // Set to the system's kind of credential; where there's no such kind, the form starts by picking one.
              initialSchema={credentialSchemas.some((k) => k.id === newCredentialStep.adaptor) ? newCredentialStep.adaptor : undefined}
              initialProjectIds={credentialProjects.slice(0, 1).map((p) => p.id)}
              initialEnvironment={credentialEnvironment}
              onClose={() => setNewCredentialFor(undefined)}
              onSave={async (draft) => {
                const linkId = await onCreateCredential(draft);
                if (linkId) changeStep(newCredentialStep.id, { credentialId: linkId });
                setNewCredentialFor(undefined);
              }}
            />
          )}
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
          <Modal open={addAfterId !== undefined} title="Add a step" onClose={() => setAddAfterId(undefined)} widthClass="max-w-3xl">
            <ConnectSystemPicker
              catalog={catalog}
              connected={connectedAdaptors}
              services={stepServices}
              tools={tools}
              onSelect={(choice) => addAfterId && addStepAfter(addAfterId, choice)}
              onConnectNew={
                onAddSystem && systemAdaptors
                  ? (adaptor) => {
                      if (!addAfterId) return;
                      setNewSystem({ afterId: addAfterId, adaptor });
                      setAddAfterId(undefined);
                    }
                  : undefined
              }
            />
          </Modal>
          {onAddSystem && systemAdaptors && (
            <AddConnectedSystemFlow
              open={newSystem !== undefined}
              onClose={() => setNewSystem(undefined)}
              catalog={catalog}
              preselectedAdaptor={newSystem?.adaptor}
              onAdd={async (input) => {
                const id = await onAddSystem(input);
                if (newSystem) addStepAfter(newSystem.afterId, { kind: "adaptor", adaptor: input.adaptor }, id);
                setNewSystem(undefined);
              }}
            />
          )}
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
          bottom={onMain && <ReadOnlyNotice onEditInSandbox={() => setSandboxForm("editInSandbox")} />}
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
            onConnect={onMain || version !== "latest" ? undefined : connectStep}
            selectedEdgeId={focusEdge?.id}
            onSelectEdge={selectEdge}
            needsCredential={missingCredential}
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
          environment={credentialEnvironment}
          focusCredential={focusCredential}
          onNewCredential={onMain || !credentialSchemas || !onCreateCredential ? undefined : setNewCredentialFor}
          onStepChange={onMain ? undefined : changeStep}
          onCodeChange={onMain ? undefined : changeCode}
          onDeleteStep={onMain ? undefined : deleteStep}
          deleteStepBlockedReason={onMain ? undefined : deleteBlocked}
          onAddStep={onMain ? undefined : addStep}
          files={workflowFiles}
          savedDataclipCount={saved.length}
          testSummary={tally && testCases && { total: testCases.length, failed: tally.failed }}
          docs={docs}
          onAddFile={onMain ? undefined : () => setAddFileOpen(true)}
          onAddComponent={onMain || addableTypes.length === 0 ? undefined : () => setAddComponentOpen(true)}
          stage={currentStage >= 0 ? `${currentStage + 1} of ${stages.length}` : undefined}
          pane={
            file === "overview"
              ? overviewPane
              : file === "health"
                ? healthPane
                : file === "dataclips"
                  ? dataclipsPane
                  : file === "testCases"
                    ? testCasesPane
                    : file === "envVars"
                      ? envVarsPane
                      : (docPane || toolPane || componentPane)
          }
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
