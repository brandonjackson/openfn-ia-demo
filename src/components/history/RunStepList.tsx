import { Link, useNavigate } from "react-router-dom";
import type { Run, Step } from "../../mock-data/history";
import { cn } from "../../utils/cn";
import StepIcon from "./StepIcon";
import { formatElapsed } from "./format";

/**
 * The run page's step list (run_live/components.ex `step_list` +
 * `step_item`): each step links to `?step=`, the selected one gets a
 * primary right border and bold text.
 */
export default function RunStepList({
  run,
  steps,
  selectedStepId,
  projectId,
  workflowId,
}: {
  run: Run;
  steps: Step[];
  selectedStepId: string | null;
  projectId: string;
  workflowId: string;
}) {
  const navigate = useNavigate();
  return (
    <ul role="list" className="-mb-8 flex-1 items-center">
      {steps.map((step) => {
        const selected = step.id === selectedStepId;
        const isClone = step.startedAt < run.insertedAt;
        return (
          <li key={step.id} data-step-id={step.id} className="group p-2">
            <Link to={`?step=${step.id}`}>
              <div
                className={cn(
                  "relative flex space-x-3 border-r-4 items-center",
                  selected ? "border-primary-500 font-semibold" : "border-transparent hover:border-gray-300"
                )}
              >
                <div className="flex items-center">
                  <StepIcon reason={step.exitReason} />
                </div>
                <div className={cn("flex min-w-0 flex-1 space-x-1 pr-1.5 items-center", isClone && "opacity-50")}>
                  {isClone && (
                    <div className="flex">
                      <span
                        className="cursor-pointer"
                        title="This step was originally executed in a previous run. It was skipped in this run; the original output has been used as the starting point for downstream jobs."
                      >
                        <span className="hero-paper-clip-mini mr-1 mt-1 h-3 w-3 flex-shrink-0 text-gray-500" />
                      </span>
                    </div>
                  )}
                  <div className="flex text-sm space-x-1 items-center">
                    <span>{step.jobName}</span>
                    {/* A link inside the step's link in Lightning; a span here so the DOM stays valid. */}
                    <span
                      role="link"
                      className="pl-1 cursor-pointer"
                      title="Inspect Step"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/projects/${projectId}/w/${workflowId}?run=${run.id}&panel=editor&job=${step.jobId}`);
                      }}
                    >
                      <span className="hero-document-magnifying-glass-mini h-5 w-5" />
                    </span>
                  </div>
                  <div className="flex-grow whitespace-nowrap text-right text-sm text-gray-500">
                    {formatElapsed(step.startedAt, step.finishedAt)}
                  </div>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
