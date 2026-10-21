import { useState } from "react";
import type {
  Dataclip,
  RunDetails,
  RunStep,
  Workflow,
  WorkflowNode,
  WorkflowVersion,
  WorkOrder,
} from "../mock-data/workflow";
import { shortId, simulateRun } from "../mock-data/runs";
import WorkflowTopBar from "../components/workflow/WorkflowTopBar";
import WorkflowCanvas from "../components/workflow/WorkflowCanvas";
import RecentHistoryPanel from "../components/workflow/RecentHistoryPanel";
import VersionMismatchBanner from "../components/workflow/VersionMismatchBanner";
import JobInspectorPanel from "../components/workflow/JobInspectorPanel";
import JobEditorView from "../components/workflow/JobEditorView";
import RunInputModal from "../components/RunInputModal";
import type { RunInput } from "../components/RunInputModal";
import EditInSandboxModal from "../components/EditInSandboxModal";
import type { SandboxStart } from "../components/EditInSandboxModal";

/** Who starts runs and retries in the prototype. */
const CURRENT_USER = "Jane Doe";

/** How long a simulated run takes before its results come in. */
const RUN_TIME_MS = 1500;

/**
 * The full workflow canvas editor: top bar, the diagram surface, the floating
 * Recent History panel and — when a job is selected — the job inspector.
 *
 * Selecting a run in Recent History draws it on the canvas. When the run took
 * place on an older version, a banner offers to view the version that ran;
 * the version picker turns yellow while it's shown. With a run selected the
 * run button becomes Retry, which runs the same input again on the latest
 * version (from the open step, when a job is expanded) and follows the new
 * run as it goes. "Run with custom input" opens a picker for the input.
 *
 * The selected run can be controlled by the caller (`runId` + `onRunChange`,
 * e.g. to keep it in the URL) or left to the template, like the sandbox.
 *
 * "Edit in sandbox" opens a dialog to create a sandbox, optionally starting
 * with the selected run's input or a saved input, or to join one already
 * open. Promoting a sandbox adds a new version to the history and switches
 * back to main, where it's now live.
 *
 * Clicking the inspector's expand button swaps the canvas for the full
 * {@link JobEditorView}, which follows the open job's step in the selected run.
 */
export default function WorkflowEditorTemplate({
  workflow,
  workOrders: initialWorkOrders = [],
  dataclips: initialDataclips = [],
  graphForVersion,
  runId: controlledRunId,
  onRunChange,
  initialSelectedId,
  initialExpandedId,
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
  initialSelectedId?: string;
  initialExpandedId?: string;
  /** "latest" or a version id (useful for stories). */
  initialVersion?: string;
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
  /** Start with a dialog open (useful for stories). */
  defaultEditInSandboxOpen?: boolean;
  defaultRunInputOpen?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);
  const [expandedId, setExpandedId] = useState<string | undefined>(initialExpandedId);

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

  const [runInputOpen, setRunInputOpen] = useState(defaultRunInputOpen);
  const [editInSandboxOpen, setEditInSandboxOpen] = useState(defaultEditInSandboxOpen);

  // The graph on the canvas: the latest, or an earlier version being viewed.
  const graph = version === "latest" ? workflow : (graphForVersion?.(version) ?? workflow);
  const viewingVersion = version === "latest" ? latestVersion : version;

  const selectedRun = orders.flatMap((o) => o.runs).find((r) => r.runId === runId);
  const runVersionKnown = selectedRun !== undefined && versions.some((v) => v.id === selectedRun.version);
  const showMismatch = runVersionKnown && viewingVersion !== undefined && selectedRun!.version !== viewingVersion;

  const selectedNode = graph.nodes.find((n) => n.id === selectedId);
  const selectedJob = selectedNode?.type === "job" ? selectedNode : undefined;

  const expandedNode = graph.nodes.find((n) => n.id === expandedId);
  const expandedJob = expandedNode?.type === "job" ? expandedNode : undefined;
  const expandedStep = expandedJob ? selectedRun?.steps.find((s) => s.jobId === expandedJob.id) : undefined;

  const handleSelect = (node: WorkflowNode) => {
    setSelectedId((current) => (current === node.id ? undefined : node.id));
  };

  // ---- Runs ---------------------------------------------------------------

  const selectRun = (run: RunDetails) => {
    // Stay on an earlier version only if the new run ran on it too.
    if (version !== "latest" && version !== run.version) setVersion("latest");
    setRunId(run.runId);
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
  const startRun = ({ workOrderId, input, fromJobId }: { workOrderId: string; input: Dataclip; fromJobId?: string }) => {
    const args = {
      workflow,
      version: latestVersion ?? "draft",
      input,
      workOrderId,
      runId: shortId(),
      fromJobId: workflow.nodes.some((n) => n.id === fromJobId) ? fromJobId : undefined,
      startedBy: CURRENT_USER,
    };
    upsertRun(simulateRun({ ...args, inProgress: true }).run);
    setVersion("latest");
    setRunId(args.runId);
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
      input.kind === "existing" ? input.dataclip : input.kind === "new" ? addInput(input.body, input.name) : addInput("{}");
    startRun({ workOrderId: shortId(), input: clip });
  };

  /** Run the selected run's input again: from the open step, or from the start. */
  const retry = () => {
    if (!selectedRun) return;
    const input = clips.find((d) => d.id === (expandedStep ? expandedStep.inputId : selectedRun.inputId));
    if (!input) return;
    startRun({ workOrderId: selectedRun.workOrderId, input, fromJobId: expandedStep?.jobId });
  };

  const retryControl =
    selectedRun && selectedRun.status !== "running"
      ? {
          step: expandedStep ? expandedJob?.label : undefined,
          hint:
            latestVersion && selectedRun.version !== latestVersion
              ? `Runs this input on the latest version (${latestVersion}), not ${selectedRun.version}`
              : undefined,
        }
      : undefined;

  const openStep = (step: RunStep) => {
    if (graph.nodes.some((n) => n.id === step.jobId)) setExpandedId(step.jobId);
  };

  // ---- Sandboxes ----------------------------------------------------------

  const promote = (message: string) => {
    setVersions([
      { id: `v${versions.length + 1}`, message, author: CURRENT_USER, date: "20 Oct 2026" },
      ...versions,
    ]);
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

  // ---- Layout -------------------------------------------------------------

  const historyPanel = (
    <RecentHistoryPanel
      workOrders={orders}
      selectedRunId={runId}
      latestVersion={latestVersion}
      onSelectRun={selectRun}
      onDeselectRun={deselectRun}
      footer={
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
  );

  return (
    <div className="flex h-full flex-col bg-white">
      <WorkflowTopBar
        workflow={workflow}
        retry={retryControl}
        onRun={runFresh}
        onRetry={retry}
        onRunWithCustomInput={() => setRunInputOpen(true)}
        url={url}
        onSeeDetails={onSeeDetails}
        onBack={onBack}
        sandboxes={allSandboxes}
        sandbox={sandbox}
        onSelectSandbox={selectSandbox}
        onViewAllSandboxes={onViewAllSandboxes}
        versions={versions}
        version={version}
        onSelectVersion={setVersion}
        onEditInSandbox={() => setEditInSandboxOpen(true)}
        onPromote={promote}
      />

      {expandedJob ? (
        // Expanded job editor replaces the canvas; closing returns you to it.
        <div className="min-h-0 flex-1">
          <JobEditorView
            job={expandedJob}
            run={selectedRun}
            dataclips={clips}
            historyPanel={historyPanel}
            onCloseRun={deselectRun}
            onSelectStep={openStep}
            onRun={runFresh}
            onRetry={retry}
            onClose={() => setExpandedId(undefined)}
          />
        </div>
      ) : (
        <div className="relative flex-1 overflow-hidden">
          <WorkflowCanvas
            workflow={graph}
            selectedId={selectedId}
            onSelect={handleSelect}
            run={selectedRun}
            height={760}
          />

          {/* Floating Recent History (top-left) */}
          <div className="absolute left-4 top-4 z-40">{historyPanel}</div>

          {/* Job inspector (right) */}
          {selectedJob && (
            <div className="absolute right-4 top-4 z-40">
              <JobInspectorPanel
                job={selectedJob}
                onClose={() => setSelectedId(undefined)}
                onExpand={() => setExpandedId(selectedJob.id)}
              />
            </div>
          )}
        </div>
      )}

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
    </div>
  );
}
