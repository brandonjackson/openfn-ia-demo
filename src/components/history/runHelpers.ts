import type { Run, Step } from "../../types/history";

/** Shared by History's work order rows and the run page's step lists. */

/** Tooltip on a rerun control when the input wasn't stored (run_live/components.ex). */
export const zeroPersistenceMessage =
  "This work order cannot be rerun since no input data has been stored due to the data retention policy set in the project.";

/** Tooltip on the paper clip shown next to a step carried over from an earlier run. */
export const clonedStepMessage =
  "This step was originally executed in a previous run. It was skipped in this run; the original output has been used as the starting point for downstream jobs.";

/** A step that ran in an earlier run and was reused by this one. */
export function isClonedStep(step: Step, run: Run): boolean {
  return step.startedAt < run.insertedAt;
}

/** The workflow editor, open on this run with the step's job selected ("Inspect this step"). */
export function inspectStepPath(projectId: string, workflowId: string, run: Run, step: Step): string {
  return `/projects/${projectId}/w/${workflowId}?run=${run.id}&panel=editor&job=${step.jobId}`;
}
