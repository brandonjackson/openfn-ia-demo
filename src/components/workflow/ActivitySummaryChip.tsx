import { History } from "lucide-react";
import type { ActivityPeriod, RunActivity } from "../../mock-data/runs";
import { activityPeriodLabel } from "../../mock-data/runs";
import PeriodPicker from "./PeriodPicker";

/**
 * The legend for the canvas's activity overlay, pinned to its top-left: the
 * period (a picker, when it can be changed), how many runs it covers and how
 * many failed, and a way into the run history. The failed count opens the
 * failures view, where the failures are broken down by reason. The cards
 * and edges carry the per-step numbers.
 */
export default function ActivitySummaryChip({
  activity,
  onPeriodChange,
  onViewRuns,
  onViewFailures,
}: {
  activity: RunActivity;
  /** Lets the period be changed; without it the period is just named. */
  onPeriodChange?: (period: ActivityPeriod) => void;
  onViewRuns?: () => void;
  /** Opens the failures view for the whole workflow. */
  onViewFailures?: () => void;
}) {
  const runs = `${activity.runs} ${activity.runs === 1 ? "run" : "runs"}`;
  const failed = (
    <>
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      {activity.failed} failed
    </>
  );
  return (
    <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white pl-1 pr-1 text-xs shadow-sm">
      {onPeriodChange ? (
        <PeriodPicker value={activity.period} onChange={onPeriodChange} compact />
      ) : (
        <span className="pl-2 text-gray-500">{activityPeriodLabel(activity.period)}</span>
      )}
      <span className="text-gray-300">·</span>
      <span className="font-medium text-gray-800">{runs}</span>
      {activity.failed > 0 &&
        (onViewFailures ? (
          <button
            type="button"
            onClick={onViewFailures}
            title="See why they failed"
            className="inline-flex h-6 items-center gap-1 rounded-md px-1.5 font-medium text-red-600 hover:bg-red-50"
          >
            {failed}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 font-medium text-red-600">{failed}</span>
        ))}
      {onViewRuns && (
        <button
          type="button"
          onClick={onViewRuns}
          className="ml-1 inline-flex h-6 items-center gap-1 rounded-md px-1.5 font-medium text-blue-600 hover:bg-blue-50"
        >
          <History size={13} />
          View runs
        </button>
      )}
    </div>
  );
}
