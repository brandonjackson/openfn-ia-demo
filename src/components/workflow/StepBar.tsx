import type { ReactNode } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Play, RotateCcw } from "lucide-react";
import type { WorkflowNode } from "../../mock-data/workflow";
import Button from "../Button";
import AdaptorChip from "./AdaptorChip";

/**
 * The slim bar above the code: where you are and what you can do with the
 * open step. It takes the place of file tabs: the Steps tray already lists
 * every step, so this space goes to context and actions instead.
 *
 * On the left, ‹ › step through the workflow in run order, then a
 * breadcrumb (workflow › Steps › step) and the step's adaptor, which opens
 * its docs. On the right, adaptor docs and running from this step, or
 * retrying from it when the selected run reached it.
 */
export default function StepBar({
  workflowName,
  node,
  onPrev,
  onNext,
  onSelectWorkflow,
  onOpenDocs,
  runFrom,
  onRunFrom,
}: {
  workflowName: string;
  /** The open step or trigger; undefined while the workflow's YAML is open. */
  node?: WorkflowNode;
  /** Open the previous / next step; omitted at either end. */
  onPrev?: () => void;
  onNext?: () => void;
  onSelectWorkflow?: () => void;
  onOpenDocs?: () => void;
  /** "run" starts a run at this step; "retry" re-runs the selected run's input from it. */
  runFrom?: "run" | "retry";
  onRunFrom?: () => void;
}) {
  const job = node?.type === "job" ? node : undefined;
  // Labels and the outer breadcrumb give way as the bar narrows (container queries).
  return (
    <div className="@container flex-none border-b border-gray-100">
      <div className="flex h-11 items-center gap-3 px-3">
        <div className="flex items-center">
          <NavButton label="Previous step" onClick={onPrev}>
            <ChevronLeft size={15} />
          </NavButton>
          <NavButton label="Next step" onClick={onNext}>
            <ChevronRight size={15} />
          </NavButton>
        </div>

        <nav
          aria-label="Breadcrumb"
          className="flex min-w-[6rem] items-center gap-2 font-mono text-[11px] text-gray-500"
        >
          <button
            type="button"
            onClick={onSelectWorkflow}
            className="hidden min-w-0 max-w-[40%] truncate hover:text-gray-900 @2xl:inline"
          >
            {workflowName}
          </button>
          <span className="hidden text-gray-300 @2xl:inline">›</span>
          {node ? (
            <>
              <span className="flex-shrink-0">{node.type === "job" ? "Steps" : "Trigger"}</span>
              <span className="text-gray-300">›</span>
              <span className="min-w-0 truncate text-gray-900" aria-current="page">
                {node.label}
              </span>
            </>
          ) : (
            <span className="text-gray-900" aria-current="page">
              workflow.yaml
            </span>
          )}
        </nav>
        {job && <AdaptorChip adaptor={job.adaptor} showVersion onClick={onOpenDocs} title="Open adaptor docs" />}

        <div className="ml-auto flex flex-shrink-0 items-center gap-1.5">
          {job && onOpenDocs && (
            <Button
              variant="ghost"
              size="xs"
              icon={BookOpen}
              onClick={onOpenDocs}
              aria-label="Adaptor docs"
              title="Adaptor docs"
            >
              <span className="hidden @2xl:inline">Docs</span>
            </Button>
          )}
          {job && runFrom && (
            <Button
              variant="secondary"
              size="xs"
              icon={runFrom === "retry" ? RotateCcw : Play}
              onClick={onRunFrom}
              aria-label={runFrom === "retry" ? "Retry from here" : "Run from here"}
              title={
                runFrom === "retry"
                  ? "Run this step's input from the selected run again, on the latest version"
                  : "Start a run at this step"
              }
            >
              <span className="hidden @xl:inline">{runFrom === "retry" ? "Retry from here" : "Run from here"}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function NavButton({ label, onClick, children }: { label: string; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      title={label}
      aria-label={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
