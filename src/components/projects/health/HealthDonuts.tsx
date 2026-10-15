import { formatNumber } from "../../../utils/format";
import { FAILURE_STATES, type WorkOrderStateCounts } from "../../../types/workflow-health";
import { failureTotal } from "../../../utils/history";
import Donut from "./Donut";
import { CANCELLED, FAILED, FAILURE_COLORS, SUCCESS, percent } from "./palette";

interface Props {
  counts: WorkOrderStateCounts;
  emptyMessage: string;
  /** History link the legend rows point at. */
  historyHref: string;
}

/**
 * Finished work orders as Success / Failed (/ Cancelled when any), with the
 * success rate in the middle (OutcomesDonut.tsx).
 */
export function OutcomesDonut({ counts, emptyMessage, historyHref }: Props) {
  const failed = failureTotal(counts);
  return (
    <Donut
      slices={[
        { key: "success", label: "Success", color: SUCCESS, value: counts.success, href: historyHref },
        { key: "failed", label: "Failed", color: FAILED, value: failed, href: historyHref },
        ...(counts.cancelled > 0
          ? [{ key: "cancelled", label: "Cancelled", color: CANCELLED, value: counts.cancelled, href: historyHref }]
          : []),
      ]}
      centre={() => {
        const decided = counts.success + failed;
        return { value: decided > 0 ? percent(counts.success, decided) : "–", label: "success" };
      }}
      emptyMessage={emptyMessage}
    />
  );
}

/** Failed work orders split by the state they ended in (FailureBreakdownDonut.tsx). */
export function FailureBreakdownDonut({ counts, emptyMessage, historyHref }: Props) {
  return (
    <Donut
      slices={FAILURE_STATES.filter((s) => counts[s] > 0).map((state) => ({
        key: state,
        label: state,
        color: FAILURE_COLORS[state],
        value: counts[state],
        href: historyHref,
      }))}
      centre={(total) => ({ value: formatNumber(total), label: total === 1 ? "failure" : "failures" })}
      emptyMessage={emptyMessage}
    />
  );
}
