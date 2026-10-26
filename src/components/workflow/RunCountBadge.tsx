import type { NodeActivity } from "../../mock-data/runs";

/**
 * A node's share of the run history, on its canvas card: how many runs
 * reached it and, in red, how many failed there. The failed count is a
 * button that opens the failures view, broken down by reason; with nothing
 * failed the badge is plain text.
 */
export default function RunCountBadge({
  activity,
  onShowFailures,
}: {
  activity: NodeActivity;
  /** Opens the failures at this node, by reason. */
  onShowFailures?: () => void;
}) {
  const runs = `${activity.runs} ${activity.runs === 1 ? "run" : "runs"}`;
  if (activity.failed === 0) {
    return (
      <span className={`whitespace-nowrap text-[11px] ${activity.runs === 0 ? "text-gray-300" : "text-gray-400"}`} title={`${runs} reached this step`}>
        {runs}
      </span>
    );
  }
  const failed = `${activity.failed} failed`;
  const inner = (
    <>
      <span className="text-gray-400">{runs}</span>
      <span className="inline-flex items-center gap-1 text-red-600">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        {failed}
      </span>
    </>
  );
  if (!onShowFailures) {
    return <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px]">{inner}</span>;
  }
  return (
    <button
      type="button"
      onClick={onShowFailures}
      title={`${failed} here; see why`}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium hover:bg-red-50"
    >
      {inner}
    </button>
  );
}
