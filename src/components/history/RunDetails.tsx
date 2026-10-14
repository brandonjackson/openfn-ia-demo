import { Link } from "react-router-dom";
import { stepsOf, type Run, type Step } from "../../mock-data/history";
import { findDataclip } from "../../mock-data/history";
import { shortId, uuidOf } from "../../mock-data/history-extra";
import Card from "../Card";
import IconButton from "../IconButton";
import DateTime from "../DateTime";
import TextLink from "../TextLink";
import StepIcon from "./StepIcon";
import { cn } from "../../utils/cn";
import { formatElapsed } from "../../utils/format";

/**
 * One step row inside an expanded work order (run_live/components.ex
 * `step_list_item`): icon, job name, start time, rerun + inspect icons,
 * duration and exit reason.
 */
export function StepListItem({
  step,
  run,
  projectId,
  workflowId,
  canRunWorkflow = true,
}: {
  step: Step;
  run: Run;
  projectId: string;
  workflowId: string;
  canRunWorkflow?: boolean;
}) {
  const isClone = step.startedAt < run.insertedAt;
  const inputAvailable = !findDataclip(step.inputDataclipId)?.wiped;
  return (
    <div id={`step-${step.id}`} role="row" className={cn("flex items-center text-xs text-gray-500 hover:bg-white", isClone && "opacity-50")}>
      <div role="cell" className="flex flex-1 items-center gap-2 py-2 pl-4">
        <StepIcon reason={step.exitReason} />
        <Link to={`/projects/${projectId}/runs/${run.id}?step=${step.id}`} className="whitespace-nowrap text-gray-800 hover:text-primary-500">
          {step.jobName}
        </Link>
        {isClone && (
          <span
            className="hero-paper-clip-mini h-3 w-3"
            title="This step was originally executed in a previous run. It was skipped in this run; the original output has been used as the starting point for downstream jobs."
          />
        )}
        &bull;
        <span>
          started <DateTime value={step.startedAt} format="time_only" />
        </span>
      </div>
      <div role="cell" className="flex min-w-60 shrink-0 items-center justify-end gap-3 px-4 py-2">
        {canRunWorkflow &&
          step.exitReason &&
          (inputAvailable ? (
            <IconButton icon="hero-play-circle-mini" label="Run this step with the latest version of this workflow" />
          ) : (
            <IconButton
              icon="hero-play-circle-mini"
              label="This work order cannot be rerun since no input data has been stored due to the data retention policy set in the project."
              disabled
            />
          ))}
        <IconButton
          icon="hero-document-magnifying-glass-mini"
          label="Inspect this step"
          to={`/projects/${projectId}/w/${workflowId}?run=${run.id}&panel=editor&job=${step.jobId}`}
        />
        <span className="w-16 text-right">{formatElapsed(step.startedAt, step.finishedAt)}</span>
        <span className="w-24 text-right font-mono">{step.exitReason}</span>
      </div>
    </div>
  );
}

function runStatusText(run: Run) {
  switch (run.state) {
    case "available":
      return ["enqueued", run.insertedAt] as const;
    case "claimed":
      return ["claimed", run.startedAt ?? run.insertedAt] as const;
    case "started":
      return ["started", run.startedAt] as const;
    case "cancelled":
      return ["cancelled", run.finishedAt ?? run.insertedAt] as const;
    default:
      return ["finished", run.finishedAt] as const;
  }
}

/**
 * A run card inside an expanded work order (workorder_component.ex): gray
 * header with the run id, "(n/m • show previous)", its status line,
 * duration and state, then its steps.
 */
export function RunCard({
  run,
  index,
  total,
  showPrevious,
  onTogglePrevious,
  projectId,
  workflowId,
  canRunWorkflow = true,
}: {
  run: Run;
  /** 1-based position, oldest first. */
  index: number;
  total: number;
  showPrevious: boolean;
  onTogglePrevious: () => void;
  projectId: string;
  workflowId: string;
  canRunWorkflow?: boolean;
}) {
  const [label, at] = runStatusText(run);
  const steps = stepsOf(run);
  return (
    <Card id={`run_${run.id}`} padding="none" className="overflow-hidden">
      <div className="flex items-center bg-gray-200 text-xs">
        <div className="flex flex-1 items-center gap-1 py-2 pl-4">
          Run
          <TextLink to={`/projects/${projectId}/runs/${run.id}`} title={uuidOf(run.id)} className="font-mono">
            {shortId(run.id)}
          </TextLink>
          {total > 1 && (
            <>
              ({index}/{total}
              {index !== total && ")"}
              {index === total && (
                <span>
                  &bull; <TextLink onClick={onTogglePrevious}>{showPrevious ? "hide" : "show"} previous</TextLink>)
                </span>
              )}
            </>
          )}
          <span>
            &bull; {label} <DateTime value={at} format="relative_detailed" />
          </span>
        </div>
        <div className="flex min-w-60 shrink-0 items-center justify-end gap-3 px-4 py-2">
          <span className="w-16 text-right">
            {run.state !== "available" && run.state !== "cancelled" && formatElapsed(run.startedAt, run.finishedAt)}
          </span>
          <span className="w-24 text-right font-mono">{run.state}</span>
          {run.state === "available" && canRunWorkflow && (
            <IconButton icon="hero-x-mark-mini" label="Cancel this run" size="sm" className="hover:text-red-500" />
          )}
        </div>
      </div>
      <div role="rowgroup" id={`run-${run.id}`} className={cn("bg-gray-100", steps.length && "border-t border-gray-300")}>
        {steps.map((step) => (
          <StepListItem
            key={step.id}
            step={step}
            run={run}
            projectId={projectId}
            workflowId={workflowId}
            canRunWorkflow={canRunWorkflow}
          />
        ))}
      </div>
    </Card>
  );
}
