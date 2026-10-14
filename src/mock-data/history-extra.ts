/**
 * Extra fixtures and lookups for History, the run page and the dataclip page,
 * layered on top of the shared `history.ts` (which stays read-only here).
 * Static data only.
 */
import { shortUuid } from "../utils/format";
import {
  dataclips,
  findDataclip,
  runLogs,
  runs,
  steps,
  stepsOf,
  workOrders,
  type LogLine,
  type Run,
  type RunState,
  type Step,
  type WorkOrder,
  type WorkOrderState,
} from "./history";

/**
 * Lightning shows full UUIDs (and their first 8 characters as "short ids").
 * The shared fixtures use readable ids like "run-1", so derive a stable,
 * UUID-shaped id from each one for display.
 */
export function uuidOf(id: string): string {
  let hex = "";
  for (let round = 0; hex.length < 32; round++) {
    let h = 0x811c9dc5 ^ (round * 0x9e3779b9);
    for (let i = 0; i < id.length; i++) {
      h = Math.imul(h ^ id.charCodeAt(i), 0x01000193);
    }
    // murmur3 finaliser, so similar ids give unrelated hex.
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    h ^= h >>> 16;
    hex += (h >>> 0).toString(16).padStart(8, "0");
  }
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

/** Lightning's `display_short_uuid`: the first 8 characters of the UUID. */
export function shortId(id: string): string {
  return shortUuid(uuidOf(id));
}

/**
 * The Work Orders / Channel Logs pill tabs only show when the current user
 * has experimental features on (`channels_enabled` in run_live/index.ex).
 * The demo user doesn't, matching the reference screenshot.
 */
export const historyChannelsEnabled = false;

/** What the demo user may do in the project. */
export const historyPermissions = {
  canRunWorkflow: true,
  canEditDataRetention: true,
};

/** Status filter options (run_live/index.ex `statuses`). */
export const historyStatuses: { id: WorkOrderState | "running"; label: string }[] = [
  { id: "pending", label: "Enqueued" },
  { id: "running", label: "Running" },
  { id: "success", label: "Success" },
  { id: "failed", label: "Failed" },
  { id: "crashed", label: "Crashed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "killed", label: "Killed" },
  { id: "exception", label: "Exception" },
  { id: "lost", label: "Lost" },
  { id: "rejected", label: "Rejected" },
];

export type SearchFieldId = "id" | "dataclip_name" | "body" | "log";

/** The "by" toggles next to the search box (run_live/index.ex `search_fields`). */
export const historySearchFields: { id: SearchFieldId; icon: string; label: string }[] = [
  { id: "id", icon: "hero-finger-print-mini", label: "Include IDs" },
  { id: "dataclip_name", icon: "hero-identification", label: "Include dataclip names" },
  {
    id: "body",
    icon: "hero-document-arrow-down",
    label:
      "Include inputs (note that very large/complex inputs—often around 10MB—may not appear in string search due to a ts_vector index length limit of 1MB)",
  },
  { id: "log", icon: "hero-bars-arrow-down-mini", label: "Include run logs" },
];

/** States in which a work order is still in flight (no retry button). */
export const activeStates: WorkOrderState[] = ["pending", "available", "claimed", "started"];

/** Runs of a work order, newest first (Lightning preloads them in that order). */
export function runsOfWorkOrder(wo: WorkOrder): Run[] {
  return wo.runIds
    .map((id) => runs.find((r) => r.id === id))
    .filter((r): r is Run => Boolean(r))
    .sort((a, b) => b.insertedAt.localeCompare(a.insertedAt));
}

export function lastRunOf(wo: WorkOrder): Run | undefined {
  return runsOfWorkOrder(wo)[0];
}

export function workOrderDataclipAvailable(wo: WorkOrder): boolean {
  return !findDataclip(wo.dataclipId)?.wiped;
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

const levelScore = (l: string) => ({ debug: 0, info: 1, warn: 2, error: 3 })[l] ?? 4;

/** The log lines a level filter lets through: `level` and everything above it. */
export function logsAtLevel<T extends { level: string }>(logs: T[], level: LogLine["level"]): T[] {
  return logs.filter((l) => levelScore(l.level) >= levelScore(level));
}

/** Lightning's `Run.final_states`. */
export const finalRunStates: RunState[] = ["success", "failed", "crashed", "cancelled", "killed", "exception", "lost"];

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
