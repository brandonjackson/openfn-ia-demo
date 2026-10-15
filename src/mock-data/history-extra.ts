/**
 * Extra fixtures and lookups for History, the run page and the dataclip page,
 * layered on top of the shared `history.ts` (which stays read-only here).
 * Static data only.
 */
import { dataclips, findDataclip, runLogs, runs, steps, stepsOf, workOrders } from "./history";
import type { HistoryRun, HistoryWorkOrder, LogLine, Run, Step, WorkOrder } from "../types/history";

/**
 * The Work Orders / Channel Logs pill tabs only show when the current user
 * has experimental features on (`channels_enabled` in run_live/index.ex).
 * The demo user doesn't, matching the reference screenshot.
 */
export const historyChannelsEnabled = false;

/** Runs of a work order, newest first (Lightning preloads them in that order). */
export function runsOfWorkOrder(wo: WorkOrder): Run[] {
  return wo.runIds
    .map((id) => runs.find((r) => r.id === id))
    .filter((r): r is Run => Boolean(r))
    .sort((a, b) => b.insertedAt.localeCompare(a.insertedAt));
}

function workOrderDataclipAvailable(wo: WorkOrder): boolean {
  return !findDataclip(wo.dataclipId)?.wiped;
}

/** A run with its steps, and whether each step's input was wiped. */
export function historyRun(run: Run): HistoryRun {
  return { ...run, steps: stepsOf(run).map((s) => ({ ...s, inputWiped: !!findDataclip(s.inputDataclipId)?.wiped })) };
}

/** A work order with its runs and steps preloaded, as History lists it. */
export function historyWorkOrder(wo: WorkOrder): HistoryWorkOrder {
  return { ...wo, runs: runsOfWorkOrder(wo).map(historyRun), dataclipWiped: !workOrderDataclipAvailable(wo) };
}

export function findStep(id: string | undefined): Step | undefined {
  return steps.find((s) => s.id === id);
}

/** A run's final dataclip: its last step's output. */
export function finalDataclipIdOf(run: Run): string | null {
  const s = stepsOf(run);
  return s.length ? s[s.length - 1].outputDataclipId : null;
}

export function logsOf(run: Run): LogLine[] {
  return runLogs[run.id] ?? [];
}

/**
 * The jobs of each workflow, for the "Retry from" modal. Derived from the
 * steps in the fixtures.
 */
export function workflowJobs(workflowId: string): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const wo of workOrders.filter((w) => w.workflowId === workflowId)) {
    for (const run of runsOfWorkOrder(wo)) {
      for (const step of stepsOf(run)) seen.set(step.jobId, step.jobName);
    }
  }
  return [...seen].map(([id, name]) => ({ id, name }));
}

/** When each dataclip was last updated (Lightning shows Created + Updated). */
export function dataclipUpdatedAt(id: string): string | undefined {
  return dataclips.find((d) => d.id === id)?.insertedAt;
}
