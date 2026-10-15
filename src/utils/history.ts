/**
 * Pure helpers over history records: log filtering, channel request events,
 * failure counts and the workflows-index metric cards. No fixture access.
 */
import type { ChannelEvent, ChannelRequest } from "../types/channels";
import type { LogLine } from "../types/history";
import type { ProjectMetrics, WorkflowStats } from "../types/workflows";
import { FAILURE_STATES, type WorkOrderStateCounts } from "../types/workflow-health";

const levelScore = (l: string) => ({ debug: 0, info: 1, warn: 2, error: 3 })[l] ?? 4;

/** The log lines a level filter lets through: `level` and everything above it. */
export function logsAtLevel<T extends { level: string }>(logs: T[], level: LogLine["level"]): T[] {
  return logs.filter((l) => levelScore(l.level) >= levelScore(level));
}

/** Prefers the destination response event, falls back to the error event. */
export function primaryEvent(cr: ChannelRequest): ChannelEvent | undefined {
  return cr.events.find((e) => e.type === "destination_response") ?? cr.events.find((e) => e.type === "error");
}

export const failureTotal = (counts: WorkOrderStateCounts) =>
  FAILURE_STATES.reduce((sum, state) => sum + counts[state], 0);

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 1000) / 10);

export function projectMetricsFor(stats: WorkflowStats[]): ProjectMetrics {
  const sum = (f: (s: WorkflowStats) => number) => stats.reduce((acc, s) => acc + f(s), 0);
  const woTotal = sum((s) => s.workordersCount);
  const woFailed = sum((s) => s.failedWorkordersCount);
  const runTotal = sum((s) => s.runs.total);
  const runSuccess = sum((s) => s.runs.success);
  return {
    workOrders: {
      total: woTotal,
      pending: sum((s) => s.pendingWorkorders),
      failed: woFailed,
      failedPercentage: pct(woFailed, woTotal),
    },
    runs: {
      total: runTotal,
      pending: sum((s) => s.runs.pending),
      success: runSuccess,
      successRate: pct(runSuccess, runTotal),
    },
  };
}
