import { useEffect, useState } from "react";
import { BookOpen, Code2, Sparkles } from "lucide-react";
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
import type { TrayPlacement } from "../components/workflow/EditorTray";
import WorkflowCanvas from "../components/workflow/WorkflowCanvas";
import CodeWorkspace from "../components/workflow/CodeWorkspace";
import type { ExplorerFile } from "../components/workflow/EditorExplorer";
import VersionMismatchBanner from "../components/workflow/VersionMismatchBanner";
import StepRunDetails from "../components/workflow/StepRunDetails";
import { stepRunTabs } from "../components/workflow/step-run-tabs";
import type { StepRunTab } from "../components/workflow/step-run-tabs";
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

/** The trays the editor can show. */
export type TrayId = "step" | "docs" | "assistant";

/**
 * Where each tray docks. The assistant has the right-hand dock to itself;
 * the step tray and the adaptor reference share the bottom dock.
 */
const placements: Record<TrayId, TrayPlacement> = {
  step: "bottom",
  docs: "bottom",
  assistant: "right",
};

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
 * The workflow editor: one toolbar, two views and a set of trays.
 *
 * The toolbar's Fn menu holds the workflow's file actions (rename, settings,
 * sandbox and promotion, export, pause, delete) and the way back to the
 * project. The view switcher flips between the canvas and code (explorer,
 * code and the open item's settings). The run picker loads a run into
 * whichever view is showing.
 *
 * The assistant is the only tray on the right, toggled from the toolbar or
 * Ctrl/⌘ + K. The bottom dock holds the step tray (opened by selecting a
 * step) or the adaptor reference (opened from a step's settings), one at a
 * time. On the canvas the bottom tray floats over it; in code mode it sits
 * under the code.
 *
 * On main everything is read-only and the main action is "Edit in sandbox".
 * In a sandbox steps can be renamed, re-adaptored, given credentials, have
 * snippets inserted, be added and deleted, and "Go live" promotes the sandbox
 * to main as a new version.
 *
 * Loading a run draws it on the canvas, marks each step in the explorer and
 * fills the step tray with that step's log, input and output.
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
  initialTrays = [],
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
  /** Trays open to start with (useful for stories). */
  initialTrays?: TrayId[];
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

  // ---- Trays ----------------------------------------------------------------

  const [openTrays, setOpenTrays] = useState<TrayId[]>(initialTrays);
  const [stepTab, setStepTab] = useState<"configure" | StepRunTab>("configure");
  const [docsAdaptor, setDocsAdaptor] = useState<AdaptorKind | undefined>();

  const isOpen = (id: TrayId) => openTrays.includes(id);
  /** Open a tray in its dock, closing whatever was there. */
  const openTray = (id: TrayId) =>
    setOpenTrays((open) => [...open.filter((t) => placements[t] !== placements[id] && t !== id), id]);
  const closeTray = (id: TrayId) => setOpenTrays((open) => open.filter((t) => t !== id));
  const toggleTray = (id: TrayId) => (isOpen(id) ? closeTray(id) : openTray(id));
  // In code mode the step's settings are already beside its code, so the step
  // tray only has something to show once a run is loaded.
  const showable = (id: TrayId) => !(id === "step" && view === "code" && !selectedRun);
  const trayIn = (placement: TrayPlacement) => openTrays.find((t) => placements[t] === placement && showable(t));

  // Ctrl/⌘ + K toggles the assistant, as in Lightning.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleTray("assistant");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTrays]);

  const selectNode = (node: WorkflowNode) => {
    const next = selectedId === node.id ? undefined : node.id;
    setSelectedId(next);
    if (next) {
      setStepTab("configure");
      openTray("step");
    } else closeTray("step");
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
    // The step tray follows the run for whatever's in focus.
    if (focusJob) {
      if (stepTab === "configure") setStepTab("log");
      openTray("step");
    }
  };

  const deselectRun = () => {
    // Leaving a run you were viewing as executed returns to the latest.
    if (selectedRun && version === selectedRun.version) setVersion("latest");
    setRunId(undefined);
    if (stepTab !== "configure") setStepTab("configure");
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
    if (focusJob) {
      setStepTab("log");
      openTray("step");
    }
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
    closeTray("step");
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

  // ---- Trays: content -------------------------------------------------------

  const stepTabs = [
    ...(view === "canvas" ? [{ id: "configure", label: "Configure" }] : []),
    ...(focusStep !== undefined || (selectedRun && view === "code")
      ? stepRunTabs.map((t) => ({ ...t, disabled: !focusStep && t.id !== "run" }))
      : []),
  ];
  const effectiveStepTab = stepTabs.some((t) => t.id === stepTab) ? stepTab : (stepTabs[0]?.id ?? "configure");

  const renderTray = (id: TrayId) => {
    const common = {
      placement: placements[id],
      floating: view === "canvas",
      onClose: () => closeTray(id),
    };
    switch (id) {
      case "docs": {
        const adaptor = docsAdaptor ?? focusJob?.adaptor ?? "common";
        return (
          <EditorTray key={id} title="Adaptor reference" icon={BookOpen} {...common}>
            <AdaptorReferencePanel
              adaptor={adaptor}
              onChangeAdaptor={setDocsAdaptor}
              onInsert={!onMain && focusJob ? (s) => insertSnippet(focusJob.id, s) : undefined}
              stepLabel={focusJob?.label}
            />
          </EditorTray>
        );
      }
      case "assistant":
        return (
          <EditorTray key={id} title="Assistant" icon={Sparkles} {...common}>
            <AIAssistantPanel
              conversations={assistantConversations}
              jobLabel={focusJob?.label}
              runId={selectedRun?.runId}
              author={CURRENT_USER}
              onOpenRuns={() => {
                const latest = orders[0]?.runs[0];
                if (latest) selectRun(latest);
              }}
              onAskToMerge={onMain ? undefined : () => setPromoteOpen(true)}
              onPlanAccepted={onMain ? undefined : applyPlan}
            />
          </EditorTray>
        );
      case "step": {
        if (!focusNode) return null;
        const inRun = selectedRun !== undefined && focusStep !== undefined;
        return (
          <EditorTray
            key={id}
            title={focusNode.label}
            badge={inRun ? <StatusPill status={focusStep!.status} /> : undefined}
            tabs={
              stepTabs.length > 1 ? { options: stepTabs, value: effectiveStepTab, onChange: (t) => setStepTab(t as typeof stepTab) } : undefined
            }
            meta={selectedRun ? `Run ${selectedRun.runId.slice(0, 6)}${focusStep?.duration ? ` · ${focusStep.duration}` : ""}` : undefined}
            actions={
              view === "canvas" && focusJob ? (
                <Button variant="ghost" size="xs" icon={Code2} onClick={() => openInCode(focusJob.id)}>
                  Open code
                </Button>
              ) : undefined
            }
            heightClass={view === "canvas" ? "h-72" : "h-56"}
            {...common}
          >
            {effectiveStepTab === "configure" ? (
              focusJob ? (
                <StepConfigPanel
                  key={focusJob.id}
                  step={focusJob}
                  workflow={graph}
                  credentialId={edits.credentials[focusJob.id]}
                  readOnly={onMain}
                  onChange={(c) => changeStep(focusJob.id, c)}
                  onInsertSnippet={(s) => insertSnippet(focusJob.id, s)}
                  onOpenReference={() => openTray("docs")}
                  onDelete={() => deleteStep(focusJob.id)}
                  showHeader={false}
                />
              ) : (
                focusTrigger && (
                  <TriggerConfigPanel trigger={focusTrigger} url={url} readOnly={onMain} live={live} onToggleLive={setLive} />
                )
              )
            ) : (
              selectedRun && (
                <StepRunDetails
                  run={selectedRun}
                  step={focusStep}
                  dataclips={clips}
                  tab={effectiveStepTab as StepRunTab}
                  onSelectStep={openStep}
                />
              )
            )}
          </EditorTray>
        );
      }
    }
  };

  const rightTray = isOpen("assistant") ? renderTray("assistant") : undefined;
  // In code mode, the bottom tray sits under the code; on the canvas it floats.
  const bottomTrayId = trayIn("bottom");
  const bottomTray = bottomTrayId ? renderTray(bottomTrayId) : undefined;

  const runFooter = showMismatch && (
    <VersionMismatchBanner
      runVersion={selectedRun!.version}
      viewingVersion={viewingVersion!}
      onViewAsExecuted={graphForVersion?.(selectedRun!.version) ? () => setVersion(selectedRun!.version) : undefined}
    />
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
      live={live}
      view={view}
      onViewChange={setView}
      retry={retryControl}
      onRun={() => runFresh()}
      onRetry={retry}
      onRunWithCustomInput={() => setRunInputOpen(true)}
      workOrders={orders}
      selectedRun={selectedRun}
      onSelectRun={selectRun}
      onDeselectRun={deselectRun}
      runFooter={runFooter}
      assistantOpen={isOpen("assistant")}
      onToggleAssistant={() => toggleTray("assistant")}
    />
  );

  return (
    <EditorShell
      toolbar={toolbar}
      sandboxed={!onMain}
      rightTray={rightTray}
      bottomTray={view === "canvas" ? bottomTray : undefined}
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
              if (typeof f === "object" && "stepId" in f && selectedRun) {
                setStepTab((t) => (t === "configure" ? "log" : t));
                openTray("step");
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
            onOpenReference={() => openTray("docs")}
            onDeleteStep={onMain ? undefined : deleteStep}
            onAddStep={onMain ? undefined : addStep}
            onRunFromStep={(id) => runFresh(id)}
            onRetryFromStep={() => retry()}
            bottomTray={bottomTray}
            statusNote={statusNote}
          />
        </div>
      )}
    </EditorShell>
  );
}
