import { History } from "lucide-react";
import type { RunActivity } from "../../mock-data/runs";

/**
 * The legend for the canvas's activity overlay, pinned to its top-left: the
 * period, how many runs it covers and how many failed, and a way into the
 * run history. The cards and edges carry the per-step numbers.
 */
export default function ActivitySummaryChip({ activity, onViewRuns }: { activity: RunActivity; onViewRuns?: () => void }) {
  const runs = `${activity.runs} ${activity.runs === 1 ? "run" : "runs"}`;
  return (
    <div className="inline-flex h-8 items-center gap-2 rounded-lg border border-gray-200 bg-white pl-3 pr-1 text-xs shadow-sm">
      <span className="text-gray-500">{activity.period}</span>
      <span className="text-gray-300">·</span>
      <span className="font-medium text-gray-800">{runs}</span>
      {activity.failed > 0 && (
        <span className="inline-flex items-center gap-1 font-medium text-red-600">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          {activity.failed} failed
        </span>
      )}
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
