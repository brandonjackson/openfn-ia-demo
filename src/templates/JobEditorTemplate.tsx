import type { JobNode, RunDetails, Workflow } from "../mock-data/workflow";
import WorkflowTopBar from "../components/workflow/WorkflowTopBar";
import JobEditorView from "../components/workflow/JobEditorView";

/**
 * The standalone expanded job editor page: the workflow top bar above the
 * reusable {@link JobEditorView} (code editor + run inspector + logs).
 *
 * The same view is embedded inside {@link WorkflowEditorTemplate} when a job
 * is expanded from the canvas inspector.
 */
export default function JobEditorTemplate({
  workflow,
  job,
  run,
  onClose,
}: {
  workflow: Workflow;
  job: JobNode;
  run: RunDetails;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <WorkflowTopBar workflow={workflow} runLabel="Run (Retry)" />
      <div className="min-h-0 flex-1">
        <JobEditorView job={job} run={run} onClose={onClose} />
      </div>
    </div>
  );
}
