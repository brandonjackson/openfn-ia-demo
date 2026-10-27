import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { ListFilter } from "lucide-react";
import type { RunDetails, WorkOrder } from "../../mock-data/workflow";
import type { ActivityPeriod, RunActivity } from "../../mock-data/runs";
import { activityPeriodLabel, filterWorkOrders } from "../../mock-data/runs";
import Button from "../Button";
import PeriodPicker from "./PeriodPicker";
import RunHistoryList from "./RunHistoryList";
import LoadedRunBar from "./LoadedRunBar";

interface Props {
  /** How far back the canvas looks. */
  period: ActivityPeriod;
  onPeriodChange: (period: ActivityPeriod) => void;
  /** Whether run history is laid over the canvas; "Off" in the picker turns it off. */
  showing: boolean;
  onShowingChange: (showing: boolean) => void;
  /** The run history summed up for the period, for the counts. */
  activity?: RunActivity;
  /** Every work order, newest first; the list shows those in the period. */
  workOrders: WorkOrder[];
  /** The loaded run, which takes the counts' place with a way to unload it. */
  run?: RunDetails;
  onUnloadRun?: () => void;
  latestVersion?: string;
  onSelectRun?: (run: RunDetails) => void;
  /** Whether the run list is open under the bar. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Under the run list, e.g. a version mismatch banner. */
  footer?: ReactNode;
}

/**
 * The bar across the top of the canvas that sets what the workflow shows.
 * With no run loaded it picks the period of run history laid over the
 * canvas (or Off, for just the workflow) and sums it up: how many runs and
 * how many failed. With a run loaded it names the run, with a clear way to
 * unload it and go back to the history (and no Filter). Filter opens the run
 * list over the canvas, for the period; picking a run loads it. The failed
 * count opens the list too. The counts take only runs that walked this
 * version from its trigger, so they add up down the graph; the list notes
 * how many of its runs that leaves out.
 */
export default function CanvasRunsBar({
  period,
  onPeriodChange,
  showing,
  onShowingChange,
  activity,
  workOrders,
  run,
  onUnloadRun,
  latestVersion,
  onSelectRun,
  open,
  onOpenChange,
  footer,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  const listed = filterWorkOrders(workOrders, period);
  // Finished runs in the list that the counts leave out: they didn't walk this graph from its trigger.
  const uncounted = activity
    ? listed.flatMap((o) => o.runs).filter((r) => r.status !== "running").length - activity.runs
    : 0;

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      {run ? (
        <LoadedRunBar run={run} detail={run.when} onUnload={onUnloadRun} />
      ) : (
        <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-1.5 text-xs shadow-sm">
          <PeriodPicker
            label="Runs"
            value={period}
            onChange={(p) => {
              onPeriodChange(p);
              if (!showing) onShowingChange(true);
            }}
            off={!showing}
            onOff={() => onShowingChange(false)}
            compact
          />
          {showing && activity && (
            <>
              <span className="text-gray-300">·</span>
              <span className="whitespace-nowrap font-medium text-gray-800">
                {activity.runs} {activity.runs === 1 ? "run" : "runs"}
              </span>
              {activity.failed > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenChange(true)}
                  title="See the runs"
                  className="inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-md px-1.5 font-medium text-red-600 hover:bg-red-50"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  {activity.failed} failed
                </button>
              )}
            </>
          )}
          <span className="h-5 w-px bg-gray-200" aria-hidden />
          <Button
            variant={open ? "outline-primary" : "ghost"}
            size="xs"
            icon={ListFilter}
            onClick={() => onOpenChange(!open)}
            aria-expanded={open}
            aria-haspopup="dialog"
          >
            Filter
          </Button>
        </div>
      )}

      {open && (
        <section
          role="dialog"
          aria-label="Runs"
          className="absolute top-full z-40 mt-2 flex max-h-[min(480px,60vh)] w-[440px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
        >
          <header className="flex flex-none items-center border-b border-gray-100 px-3 py-2">
            <span className="text-xs text-gray-500">{activityPeriodLabel(period)}</span>
            {uncounted > 0 && (
              <span className="ml-auto text-xs text-gray-400">
                {uncounted} not counted: another version or a retry from a step
              </span>
            )}
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <RunHistoryList
              workOrders={listed}
              selectedRunId={run?.runId}
              latestVersion={latestVersion}
              onSelectRun={(r) => {
                onSelectRun?.(r);
                onOpenChange(false);
              }}
              onDeselectRun={onUnloadRun}
              footer={footer}
              empty={
                workOrders.length === 0
                  ? "No runs yet. Run the workflow to see it here."
                  : `No runs in the ${activityPeriodLabel(period).toLowerCase()}.`
              }
            />
          </div>
        </section>
      )}
    </div>
  );
}
