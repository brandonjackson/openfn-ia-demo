import { useState } from "react";
import type {
  Workflow,
  WorkflowNode,
  RunHistoryEntry,
  RunDetails,
  WorkflowVersion,
} from "../mock-data/workflow";
import { sampleRun } from "../mock-data/workflow";
import WorkflowTopBar from "../components/workflow/WorkflowTopBar";
import WorkflowCanvas from "../components/workflow/WorkflowCanvas";
import RecentHistoryPanel from "../components/workflow/RecentHistoryPanel";
import JobInspectorPanel from "../components/workflow/JobInspectorPanel";
import JobEditorView from "../components/workflow/JobEditorView";

/**
 * The full workflow canvas editor: top bar, the diagram surface, the floating
 * Recent History panel and — when a job is selected — the job inspector.
 *
 * The top bar's sandbox can be controlled by the caller (`sandbox` +
 * `onSelectSandbox`) or left to the template. Promoting a sandbox adds a new
 * version to the history and switches back to main, where it's now live.
 *
 * Clicking the inspector's expand button swaps the canvas for the full
 * {@link JobEditorView} (code + run + logs); the editor's close button returns
 * to the canvas. Selection and expansion are held in local state so the
 * prototype is clickable end to end.
 */
export default function WorkflowEditorTemplate({
  workflow,
  history,
  run = sampleRun,
  initialSelectedId,
  initialExpandedId,
  onBack,
  sandboxes = ["main"],
  sandbox: controlledSandbox,
  onSelectSandbox,
  onViewAllSandboxes,
  versions: initialVersions = [],
}: {
  workflow: Workflow;
  history: RunHistoryEntry[];
  run?: RunDetails;
  initialSelectedId?: string;
  initialExpandedId?: string;
  onBack?: () => void;
  /** Sandboxes of the workflow's project, "main" first. */
  sandboxes?: string[];
  sandbox?: string;
  onSelectSandbox?: (sandbox: string) => void;
  onViewAllSandboxes?: () => void;
  /** Version history on main, newest first. */
  versions?: WorkflowVersion[];
}) {
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);
  const [expandedId, setExpandedId] = useState<string | undefined>(initialExpandedId);

  const [localSandbox, setLocalSandbox] = useState("main");
  const sandbox = controlledSandbox ?? localSandbox;
  const selectSandbox = onSelectSandbox ?? setLocalSandbox;
  const [versions, setVersions] = useState(initialVersions);
  const [version, setVersion] = useState("latest");

  // Editing starts in the first sandbox; with none yet, go make one.
  const editInSandbox = () => {
    const firstSandbox = sandboxes.find((s) => s !== "main");
    if (firstSandbox) selectSandbox(firstSandbox);
    else onViewAllSandboxes?.();
  };

  const promote = (message: string) => {
    setVersions([
      { id: `v${versions.length + 1}`, message, author: "Jane Doe", date: "20 Oct 2026" },
      ...versions,
    ]);
    setVersion("latest");
    selectSandbox("main");
  };

  const selectedNode = workflow.nodes.find((n) => n.id === selectedId);
  const selectedJob = selectedNode?.type === "job" ? selectedNode : undefined;

  const expandedNode = workflow.nodes.find((n) => n.id === expandedId);
  const expandedJob = expandedNode?.type === "job" ? expandedNode : undefined;

  const handleSelect = (node: WorkflowNode) => {
    setSelectedId((current) => (current === node.id ? undefined : node.id));
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <WorkflowTopBar
        workflow={workflow}
        retryStep={expandedJob?.label}
        onBack={onBack}
        sandboxes={sandboxes}
        sandbox={sandbox}
        onSelectSandbox={selectSandbox}
        onViewAllSandboxes={onViewAllSandboxes}
        versions={versions}
        version={version}
        onSelectVersion={setVersion}
        onEditInSandbox={editInSandbox}
        onPromote={promote}
      />

      {expandedJob ? (
        // Expanded job editor replaces the canvas; closing returns you to it.
        <div className="min-h-0 flex-1">
          <JobEditorView
            job={expandedJob}
            run={run}
            onClose={() => setExpandedId(undefined)}
          />
        </div>
      ) : (
        <div className="relative flex-1 overflow-hidden">
          <WorkflowCanvas
            workflow={workflow}
            selectedId={selectedId}
            onSelect={handleSelect}
            height={760}
          />

          {/* Floating Recent History (top-left) */}
          <div className="absolute left-4 top-4 z-40">
            <RecentHistoryPanel entries={history} />
          </div>

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
    </div>
  );
}
