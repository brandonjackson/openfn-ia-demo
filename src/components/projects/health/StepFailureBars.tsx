import { formatNumber } from "../../../utils/format";
import type { ErrorSignature } from "../../../types/workflow-health";
import { cn } from "../../../utils/cn";
import { EMPTY, FAILED, UNATTRIBUTED, adaptorLabel } from "./palette";

const NO_STEP = "no-step";

/** One row per job, plus one for failures with no step to blame (StepFailureBars.tsx `groupByStep`). */
function groupByStep(signatures: ErrorSignature[]) {
  const rows = new Map<string, { key: string; label: string; adaptor: string | null; count: number }>();
  for (const { job_id, step_name, adaptor, count } of signatures) {
    const key = job_id ?? NO_STEP;
    const existing = rows.get(key);
    if (existing) existing.count += count;
    else rows.set(key, { key, label: job_id ? step_name || "(unknown step)" : "No failing step", adaptor, count });
  }
  return [...rows.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/**
 * "Steps with failures": which steps the window's failures land on,
 * heaviest first, each with a bar scaled to the heaviest row.
 */
export default function StepFailureBars({
  signatures,
  emptyMessage,
}: {
  signatures: ErrorSignature[];
  emptyMessage: string;
}) {
  const rows = groupByStep(signatures);
  if (rows.length === 0) return <p className={EMPTY}>{emptyMessage}</p>;
  const max = Math.max(...rows.map((r) => r.count));

  return (
    <div className="lg:relative lg:min-h-64 lg:flex-1">
      <ul className="relative -mr-6 flex max-h-64 flex-col gap-6 overflow-y-auto pr-4 lg:absolute lg:inset-0 lg:max-h-none">
        {rows.map(({ key, label, adaptor, count }) => (
          <li key={key} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <div className="flex min-w-0 flex-col gap-1">
                <span className={cn("truncate", key === NO_STEP ? "italic text-gray-500" : "text-gray-900")} title={label}>
                  {label}
                </span>
                {adaptor && <span className="truncate font-mono text-xs text-gray-500">{adaptorLabel(adaptor)}</span>}
              </div>
              <span className="shrink-0 font-medium tabular-nums text-gray-900">{formatNumber(count)}</span>
            </div>
            <div aria-hidden="true" className="h-1.5 rounded-full bg-gray-100">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${(count / max) * 100}%`, backgroundColor: key === NO_STEP ? UNATTRIBUTED : FAILED }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
