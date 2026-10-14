import { Link } from "react-router-dom";
import { stepsOf, type Run, type Step } from "../../mock-data/history";
import { findDataclip } from "../../mock-data/history";
import { shortId, uuidOf } from "../../mock-data/history-extra";
import DateTime from "./DateTime";
import StepIcon from "./StepIcon";
import { formatElapsed } from "./format";

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
    <div id={`step-${step.id}`} role="row" className={isClone ? "flex items-center w-full opacity-50 group" : "flex items-center w-full group"}>
      <div role="cell" className="flex-1 py-2 text-xs font-normal text-gray-500 text-left group-hover:bg-white">
        <div className="flex items-center pl-4">
          <StepIcon reason={step.exitReason} />
          <div className="text-gray-800 flex items-center gap-2 text-xs">
            <Link
              to={`/projects/${projectId}/runs/${run.id}?step=${step.id}`}
              className="cursor-pointer whitespace-nowrap inline-block text-gray-800 font-normal no-underline hover:text-primary-500"
            >
              <span>{step.jobName}</span>
            </Link>
            {isClone && (
              <span
                className="cursor-pointer"
                title="This step was originally executed in a previous run. It was skipped in this run; the original output has been used as the starting point for downstream jobs."
              >
                <span className="hero-paper-clip-mini h-3 w-3 flex-shrink-0 text-gray-500" />
              </span>
            )}
            &bull;
            <span className="text-xs text-gray-500">
              started <DateTime value={step.startedAt} format="time_only" />
            </span>
          </div>
        </div>
      </div>
      <div role="cell" className="flex-shrink-0 py-2 px-4 text-right group-hover:bg-white min-w-[240px]">
        <div className="flex items-center justify-end gap-3 text-xs text-gray-500">
          {canRunWorkflow &&
            step.exitReason &&
            (inputAvailable ? (
              <span title="Run this step with the latest version of this workflow">
                <span className="hero-play-circle-mini h-5 w-5 hover:text-primary-400 cursor-pointer" />
              </span>
            ) : (
              <span
                className="cursor-pointer"
                title="This work order cannot be rerun since no input data has been stored due to the data retention policy set in the project."
              >
                <span className="hero-play-circle-mini h-5 w-5 cursor-not-allowed text-gray-400" />
              </span>
            ))}
          <Link
            title="Inspect this step"
            className="cursor-pointer"
            to={`/projects/${projectId}/w/${workflowId}?run=${run.id}&panel=editor&job=${step.jobId}`}
          >
            <span className="hero-document-magnifying-glass-mini h-5 w-5" />
          </Link>
          <div className="w-16 text-right">{formatElapsed(step.startedAt, step.finishedAt)}</div>
          <span className="font-mono w-24 text-right">{step.exitReason}</span>
        </div>
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
    <div id={`run_${run.id}`} className="w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-200 text-xs flex items-center w-full">
        <div className="flex-1 py-2 text-left">
          <div className="pl-4 flex items-center gap-1">
            Run
            <Link to={`/projects/${projectId}/runs/${run.id}`}>
              <span title={uuidOf(run.id)} className="cursor-pointer underline-offset-2 hover:underline whitespace-nowrap inline-block text-primary-400 hover:text-primary-500 font-mono">
                {shortId(run.id)}
              </span>
            </Link>
            {total > 1 && (
              <>
                ({index}/{total}
                {index !== total && ")"}
                {index === total && (
                  <span>
                    &bull;{" "}
                    <a
                      href="#"
                      className="cursor-pointer underline-offset-2 hover:underline whitespace-nowrap inline-block text-primary-400 hover:text-primary-500"
                      onClick={(e) => {
                        e.preventDefault();
                        onTogglePrevious();
                      }}
                    >
                      {showPrevious ? "hide" : "show"} previous
                    </a>
                    )
                  </span>
                )}
              </>
            )}
            <span>
              &bull; {label} <DateTime value={at} format="relative_detailed" />
            </span>
          </div>
        </div>
        <div className="shrink-0 py-2 px-4 text-right min-w-[240px]">
          <div className="flex items-center justify-end gap-3">
            <div className="w-16 text-right">
              {run.state !== "available" && run.state !== "cancelled" && formatElapsed(run.startedAt, run.finishedAt)}
            </div>
            <span className="font-mono w-24 text-right">{run.state}</span>
            {run.state === "available" && canRunWorkflow && (
              <button
                type="button"
                title="Cancel this run"
                className="inline-flex items-center p-1 text-gray-600 hover:text-red-500 cursor-pointer"
              >
                <span className="hero-x-mark-mini h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div role="rowgroup" id={`run-${run.id}`} className={steps.length ? "bg-gray-100 border-t border-gray-300" : "bg-gray-100"}>
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
    </div>
  );
}
