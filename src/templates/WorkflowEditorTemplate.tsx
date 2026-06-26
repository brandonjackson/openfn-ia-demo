import { useState } from "react";
import type { Workflow, WorkflowNode, RunHistoryEntry } from "../mock-data/workflow";
import WorkflowTopBar from "../components/workflow/WorkflowTopBar";
import WorkflowCanvas from "../components/workflow/WorkflowCanvas";
import RecentHistoryPanel from "../components/workflow/RecentHistoryPanel";
import JobInspectorPanel from "../components/workflow/JobInspectorPanel";

/**
 * The full workflow canvas editor: top bar, the diagram surface, the floating
 * Recent History panel and — when a job is selected — the job inspector.
 *
 * Selection is held in local state so the prototype is clickable.
 */
export default function WorkflowEditorTemplate({
  workflow,
  history,
  initialSelectedId,
}: {
  workflow: Workflow;
  history: RunHistoryEntry[];
  initialSelectedId?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);
  const selectedNode = workflow.nodes.find((n) => n.id === selectedId);
  const selectedJob = selectedNode?.type === "job" ? selectedNode : undefined;

  const handleSelect = (node: WorkflowNode) => {
    setSelectedId((current) => (current === node.id ? undefined : node.id));
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <WorkflowTopBar workflow={workflow} />
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
            />
          </div>
        )}
      </div>
    </div>
  );
}
