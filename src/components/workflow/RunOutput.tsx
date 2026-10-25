import type { ReactNode } from "react";
import { History, Play } from "lucide-react";
import type { Dataclip, RunDetails, RunStep } from "../../mock-data/workflow";
import Button from "../Button";
import EmptyState from "../EmptyState";
import SegmentedControl from "../SegmentedControl";
import CodeEditor from "./CodeEditor";
import LogConsole from "./LogConsole";
import RunChip from "./RunChip";
import RunPanel from "./RunPanel";
import StatusPill from "./StatusPill";

export type RunView = "Summary" | "Log" | "Input" | "Output";

const RUN_VIEWS: RunView[] = ["Summary", "Log", "Input", "Output"];

/**
 * The header of the Run tray: what it's following (the open step, or the
 * whole run) and its status, then the views (Summary / Log / Input / Output).
 * When the open step wasn't part of the run it has no status of its own.
 */
export function RunOutputHeader({
  run,
  step,
  stepLabel,
  view,
  onViewChange,
}: {
  run?: RunDetails;
  /** The open step's part in the run, if it had one. */
  step?: RunStep;
  /** The open step, whether or not the run reached it. */
  stepLabel?: string;
  view: RunView;
  onViewChange: (view: RunView) => void;
}) {
  if (!run) return null;
  const status = step ? step.status : stepLabel ? undefined : run.status;
  return (
    <>
      <span className="flex min-w-0 flex-shrink items-center gap-2">
        <span className="truncate text-sm font-medium text-gray-900">{stepLabel ?? "Whole run"}</span>
        {status && <StatusPill status={status} />}
      </span>
      <SegmentedControl
        appearance="pill"
        options={RUN_VIEWS}
        value={view}
        onChange={(v) => onViewChange(v as RunView)}
      />
    </>
  );
}

/**
 * The selected run's chip for the Run tray's header actions; it flags when
 * the open step wasn't part of the run, and clears the run.
 */
export function RunOutputChip({
  run,
  step,
  stepLabel,
  onClearRun,
}: {
  run?: RunDetails;
  step?: RunStep;
  stepLabel?: string;
  onClearRun?: () => void;
}) {
  if (!run) return null;
  const notInRun = stepLabel !== undefined && !step;
  return (
    <span className="mr-1">
      <RunChip
        run={run}
        onClear={onClearRun}
        tone={notInRun ? "warning" : "default"}
        note={notInRun ? "Step not in this run" : undefined}
      />
    </span>
  );
}

/**
 * The body of the Run tray: the selected run, following the open step.
 *
 * Summary lists the run's steps (picking one opens it); Log shows the lines
 * the open step wrote, or the whole run's; Input and Output show the data the
 * step received and produced. `notice` sits on top, e.g. a version mismatch.
 * With no run selected, it offers to run the workflow or pick a run.
 */
export default function RunOutput({
  run,
  step,
  stepOpen = false,
  view,
  dataclips = [],
  notice,
  onSelectStep,
  onRun,
  onOpenHistory,
}: {
  run?: RunDetails;
  step?: RunStep;
  /** Whether a step is open, so a missing `step` means it wasn't in the run. */
  stepOpen?: boolean;
  view: RunView;
  dataclips?: Dataclip[];
  notice?: ReactNode;
  onSelectStep?: (step: RunStep) => void;
  onRun?: () => void;
  onOpenHistory?: () => void;
}) {
  if (!run) {
    return (
      <div className="p-4">
        <EmptyState
          icon={History}
          title="No run selected"
          description="Run the workflow, or pick a run from History, to see its logs, input and output here."
          action={
            <div className="flex justify-center gap-2">
              {onRun && (
                <Button size="xs" icon={Play} onClick={onRun}>
                  Run
                </Button>
              )}
              {onOpenHistory && (
                <Button variant="secondary" size="xs" icon={History} onClick={onOpenHistory}>
                  Open history
                </Button>
              )}
            </div>
          }
        />
      </div>
    );
  }

  const notInRun = stepOpen && !step;
  const clip = (id?: string) => dataclips.find((d) => d.id === id);

  const dataclipView = (id: string | undefined, missing: string) => {
    if (notInRun) {
      return (
        <div className="p-4">
          <EmptyState
            title={`This step wasn't part of run ${run.runId.slice(0, 6)}.`}
            description="Open a step from Summary to see what it did."
          />
        </div>
      );
    }
    const found = clip(id);
    return found ? (
      <CodeEditor code={found.body} />
    ) : (
      <div className="p-4">
        <EmptyState title={missing} />
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {notice}
      <div className="min-h-0 flex-1 overflow-auto">
        {view === "Summary" && <RunPanel run={run} selectedStepId={step?.id} onSelectStep={onSelectStep} />}
        {view === "Log" && <LogConsole tone="light" lines={step ? run.logs.filter((l) => l.stepId === step.id) : run.logs} />}
        {view === "Input" && dataclipView(step ? step.inputId : run.inputId, "This input wasn't kept.")}
        {view === "Output" &&
          dataclipView(
            step ? step.outputId : run.steps[run.steps.length - 1]?.outputId,
            step?.status === "running" || step?.status === "pending" || run.status === "running"
              ? "This step hasn't finished yet."
              : "This output wasn't kept."
          )}
      </div>
    </div>
  );
}
