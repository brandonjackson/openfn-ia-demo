import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { RunDetails } from "../../mock-data/workflow";
import type { ActivityPeriod, FailureReason } from "../../mock-data/runs";
import { activityPeriodLabel } from "../../mock-data/runs";
import SegmentedControl from "../SegmentedControl";
import PeriodPicker from "./PeriodPicker";
import ProgressBar from "../ProgressBar";
import RunRow from "./RunRow";

/** Whose failures the view shows: the step in focus, or the whole workflow. */
export type FailureScope = "step" | "workflow";

/**
 * Why runs failed in a period, as the top reasons ranked by how often each
 * happened, with a share bar. Opening a reason lists the runs behind it, and
 * picking one loads it like any run. In the code view's panel it has a
 * period picker and, with a step in focus, a switch between that step's
 * failures and the whole workflow's; in the inspector it has neither, as
 * the canvas sets the period and the selected node sets the scope.
 */
export default function FailureBreakdown({
  reasons,
  period,
  onPeriodChange,
  stepLabel,
  scope = "workflow",
  onScopeChange,
  selectedRunId,
  latestVersion,
  onSelectRun,
  onDeselectRun,
}: {
  /** Ranked, most frequent first. */
  reasons: FailureReason[];
  period: ActivityPeriod;
  onPeriodChange?: (period: ActivityPeriod) => void;
  /** The step in focus, which enables the scope switch. */
  stepLabel?: string;
  scope?: FailureScope;
  onScopeChange?: (scope: FailureScope) => void;
  selectedRunId?: string;
  latestVersion?: string;
  onSelectRun?: (run: RunDetails) => void;
  onDeselectRun?: () => void;
}) {
  const [open, setOpen] = useState<string[]>(() => reasons.slice(0, 1).map((r) => r.reason));
  const total = reasons.reduce((n, r) => n + r.count, 0);
  const toggle = (reason: string) => setOpen((o) => (o.includes(reason) ? o.filter((r) => r !== reason) : [...o, reason]));
  const where = scope === "step" && stepLabel ? stepLabel : "this workflow";

  return (
    <div className="flex h-full flex-col">
      {((stepLabel && onScopeChange) || onPeriodChange) && (
        <div className="flex flex-none flex-wrap items-center gap-2 border-b border-gray-100 px-3 py-2">
          {stepLabel && onScopeChange && (
            <SegmentedControl
              options={[
                { id: "step", label: "This step" },
                { id: "workflow", label: "Whole workflow" },
              ]}
              value={scope}
              onChange={(v) => onScopeChange(v as FailureScope)}
            />
          )}
          <span className="ml-auto">
            {onPeriodChange && <PeriodPicker value={period} onChange={onPeriodChange} />}
          </span>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {total === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400">
            No failures at {where} in the {activityPeriodLabel(period).toLowerCase()}.
          </p>
        ) : (
          <>
            <p className="px-4 pb-1 pt-3 text-xs text-gray-500">
              <span className="font-medium text-gray-800">
                {total} {total === 1 ? "run" : "runs"} failed
              </span>{" "}
              at {where}, for {reasons.length} {reasons.length === 1 ? "reason" : "reasons"}. Most common first.
            </p>
            <ul className="divide-y divide-gray-50">
              {reasons.map((r) => {
                const expanded = open.includes(r.reason);
                const share = Math.round((r.count / total) * 100);
                return (
                  <li key={r.reason}>
                    <button
                      type="button"
                      onClick={() => toggle(r.reason)}
                      aria-expanded={expanded}
                      className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-gray-50"
                    >
                      {expanded ? (
                        <ChevronDown size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                      ) : (
                        <ChevronRight size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="truncate font-mono text-xs text-gray-900">{r.reason}</span>
                          <span className="flex-shrink-0 text-xs text-gray-500">
                            <span className="font-semibold text-red-600">{r.count}</span> · {share}%
                          </span>
                        </span>
                        <span className="mt-1.5 block">
                          <ProgressBar value={r.count} max={total} tone="red" />
                        </span>
                        {scope !== "step" && (
                          <span className="mt-1 block truncate text-[11px] text-gray-400">at {r.steps.join(", ")}</span>
                        )}
                      </span>
                    </button>
                    {expanded && (
                      <ul className="pb-1">
                        {r.runs.map((run) => (
                          <li key={run.runId}>
                            <RunRow
                              run={run}
                              selected={run.runId === selectedRunId}
                              latestVersion={latestVersion}
                              onSelect={onSelectRun}
                              onDeselect={onDeselectRun}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
