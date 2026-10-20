import type { Dataclip, JobNode, RunDetails, Workflow } from "../mock-data/workflow";
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
  dataclips,
  onClose,
}: {
  workflow: Workflow;
  job: JobNode;
  run?: RunDetails;
  dataclips?: Dataclip[];
  onClose?: () => void;
}) {
  const ranThisStep = run?.steps.some((s) => s.jobId === job.id);
  return (
    <div className="flex h-full flex-col bg-white">
      <WorkflowTopBar workflow={workflow} retry={ranThisStep ? { step: job.label } : undefined} />
      <div className="min-h-0 flex-1">
        <JobEditorView job={job} run={run} dataclips={dataclips} onClose={onClose} />
      </div>
    </div>
  );
}
