/** A random 8-character hex id, like the short ids shown in history. */
import type { AdaptorKind, Dataclip, RunDetails, RunStatus, RunStep, Workflow, WorkOrder } from "./workflow";
import type { StatTileData } from "./page-data";
export function shortId(): string {
  return Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, "0");
}

// ---------------------------------------------------------------------------
// Activity: what the run history adds up to, for the canvas overlay.
// ---------------------------------------------------------------------------

/** How far back the canvas's activity overlay looks. */
export type ActivityPeriod = "24h" | "7d" | "30d";

export const activityPeriods: { id: ActivityPeriod; label: string; shortLabel: string; hours: number }[] = [
  { id: "24h", label: "Last 24 hours", shortLabel: "24h", hours: 24 },
  { id: "7d", label: "Last 7 days", shortLabel: "7d", hours: 24 * 7 },
  { id: "30d", label: "Last 30 days", shortLabel: "30d", hours: 24 * 30 },
];

export function activityPeriodLabel(period: ActivityPeriod): string {
  return activityPeriods.find((p) => p.id === period)?.label ?? period;
}

/** "Now" for the mock history, the morning its newest runs happened. */
const MOCK_NOW = new Date(2026, 9, 20, 10, 0, 0).getTime();

/** The time a "dd/mm/yyyy, HH:MM:SS" stamp names, or the mock's "now" if it isn't one. */
export function stampTime(stamp: string): number {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})$/.exec(stamp);
  if (!m) return MOCK_NOW;
  return new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +m[6]).getTime();
}

/** When a run started. */
const startedAt = (run: RunDetails) => stampTime(run.started);

/** Where `period` starts, counting back from the mock's "now", as a datetime-local value ("2026-10-13T10:00"). */
export function periodStart(period: ActivityPeriod): string {
  const hours = activityPeriods.find((p) => p.id === period)?.hours ?? 0;
  const d = new Date(MOCK_NOW - hours * 3600_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** The runs in `workOrders` that started within `period`, newest first. Runs started after the mock's "now" count as just now. */
export function runsInPeriod(workOrders: WorkOrder[], period: ActivityPeriod): RunDetails[] {
  const hours = activityPeriods.find((p) => p.id === period)?.hours ?? Infinity;
  return workOrders.flatMap((o) => o.runs).filter((r) => Math.max(0, MOCK_NOW - startedAt(r)) <= hours * 3600_000);
}

/**
 * A run's "dd/mm/yyyy, HH:MM:SS" stamp as an ISO timestamp, reading the stamp
 * as UTC, as the workflow lists print it.
 */
export function stampIso(stamp: string): string | undefined {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})$/.exec(stamp);
  return m ? new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +m[6])).toISOString() : undefined;
}

/** What a set of work orders adds up to over a period: a workflow's row, or a whole project's. */
export interface WorkOrderActivity {
  /** Work orders received in the period. */
  workOrders: number;
  /** Of those, how many ended in a failed state. */
  failedWorkOrders: number;
  /** Runs started in the period, retries included. */
  runs: number;
  /** Day by day, oldest first, ending today: work orders received, of those failed, and runs started. */
  daily: { workOrders: number; failed: number; runs: number }[];
  /** Status of the most recent run, whenever it was; none if it has never run. */
  latestRun?: RunStatus;
  /** When the most recent run started, as an ISO timestamp. */
  lastRunAt?: string;
}

const DAY = 24 * 3600_000;

/**
 * What `workOrders` add up to over `period`, counting back from the mock's
 * "now". A work order counts on the day it was received (its first run), as
 * History's "Received" filter has it, so these numbers are the ones History
 * lists for the same period.
 */
export function workOrderActivity(workOrders: WorkOrder[], period: ActivityPeriod): WorkOrderActivity {
  const hours = activityPeriods.find((p) => p.id === period)?.hours ?? 0;
  const days = hours / 24;
  const daily = Array.from({ length: days }, () => ({ workOrders: 0, failed: 0, runs: 0 }));
  const endOfToday = new Date(MOCK_NOW).setHours(24, 0, 0, 0);
  const within = (t: number) => Math.max(0, MOCK_NOW - t) <= hours * 3600_000;
  const dayOf = (t: number) => daily[Math.max(0, days - 1 - Math.floor((endOfToday - 1 - Math.min(t, MOCK_NOW)) / DAY))];
  let received = 0;
  let failed = 0;
  let runs = 0;
  for (const order of workOrders) {
    const first = order.runs[order.runs.length - 1];
    const receivedAt = first ? stampTime(first.started) : MOCK_NOW;
    if (within(receivedAt)) {
      received += 1;
      dayOf(receivedAt).workOrders += 1;
      if (order.status === "failed") {
        failed += 1;
        dayOf(receivedAt).failed += 1;
      }
    }
    for (const run of order.runs) {
      if (!within(startedAt(run))) continue;
      runs += 1;
      dayOf(startedAt(run)).runs += 1;
    }
  }
  const latest = workOrders.flatMap((o) => o.runs).reduce<RunDetails | undefined>((a, r) => (!a || startedAt(r) > startedAt(a) ? r : a), undefined);
  return { workOrders: received, failedWorkOrders: failed, runs, daily, latestRun: latest?.status, lastRunAt: latest && stampIso(latest.started) };
}

/**
 * A project Overview's headline tiles for `activity` over `period`: its work
 * orders, how many failed and the runs they took. Each opens History (at
 * `historyPath`) on the same work orders, so the numbers match it.
 */
export function activityTiles(activity: WorkOrderActivity, period: ActivityPeriod, historyPath: string): StatTileData[] {
  const received = `${historyPath}?${new URLSearchParams({ received_after: periodStart(period) })}`;
  const rate = activity.workOrders ? `${((activity.failedWorkOrders / activity.workOrders) * 100).toFixed(1)}%` : "0.0%";
  const count = (n: number) => n.toLocaleString("en-US");
  return [
    {
      label: "Work orders",
      value: count(activity.workOrders),
      detail: `Received in the ${activityPeriodLabel(period).toLowerCase()}`,
      trend: activity.daily.map((d) => d.workOrders),
      linkTo: received,
    },
    {
      label: "Failed",
      value: count(activity.failedWorkOrders),
      detail: `${rate} of work orders`,
      trend: activity.daily.map((d) => d.failed),
      linkTo: `${received}&status=failed`,
    },
    {
      label: "Runs",
      value: count(activity.runs),
      detail: "Retries included",
      trend: activity.daily.map((d) => d.runs),
      linkTo: received,
    },
  ];
}

/**
 * The work orders with only the runs started within `period`. Work orders
 * left with no runs are dropped.
 */
export function filterWorkOrders(workOrders: WorkOrder[], period: ActivityPeriod): WorkOrder[] {
  const inPeriod = new Set(runsInPeriod(workOrders, period).map((r) => r.runId));
  return workOrders
    .map((o) => ({ ...o, runs: o.runs.filter((r) => inPeriod.has(r.runId)) }))
    .filter((o) => o.runs.length > 0);
}

export interface NodeActivity {
  /** Runs that reached the node. */
  runs: number;
  /** Runs where the node's step failed. */
  failed: number;
  /** The run the step last failed in, to open from a failure count. */
  lastFailure?: RunDetails;
}

/** The run history summed up per node and edge of a workflow. */
export interface RunActivity {
  period: ActivityPeriod;
  runs: number;
  failed: number;
  /** Keyed by node id; the trigger counts every run that started from it. */
  nodes: Record<string, NodeActivity>;
  /** Keyed by edge id: how many runs went along it. */
  edges: Record<string, number>;
  /** The most runs along any one edge, to scale the others against. */
  busiest: number;
}

/**
 * The steps of `run` that it reached along `workflow`'s connectors from the
 * trigger, in order. A run that didn't start at the trigger, such as one on
 * an older version whose first step isn't next to the trigger here, walked
 * none of this graph; one that leaves the graph part-way stops there.
 */
function walkedSteps(workflow: Workflow, run: RunDetails): RunStep[] {
  const trigger = workflow.nodes.find((n) => n.type === "trigger");
  if (!trigger) return [];
  const walked: RunStep[] = [];
  let from = trigger.id;
  for (const step of run.steps) {
    if (!workflow.edges.some((e) => e.source === from && e.target === step.jobId)) break;
    walked.push(step);
    from = step.jobId;
  }
  return walked;
}

/**
 * Sum up `workOrders` over the nodes and edges of `workflow`: how many runs
 * reached each step and how many failed there, and how many went along each
 * edge, taken from the order the steps ran in. Runs still going aren't
 * counted.
 *
 * A run counts only along the path it walked from the trigger (see
 * `walkedSteps`), so the numbers add up down the graph: the trigger counts
 * every run, each connector carries no more runs than reached the step it
 * leaves, and each step counts exactly the runs its incoming connectors
 * carried. Counts never grow as the workflow goes on. Runs that didn't walk
 * this graph from its trigger, such as runs on an older version, are left
 * out of every number here, the totals included.
 */
export function runActivity(workflow: Workflow, workOrders: WorkOrder[], period: ActivityPeriod = "7d"): RunActivity {
  const nodes: Record<string, NodeActivity> = {};
  const edges: Record<string, number> = {};
  for (const node of workflow.nodes) nodes[node.id] = { runs: 0, failed: 0 };
  for (const edge of workflow.edges) edges[edge.id] = 0;
  const trigger = workflow.nodes.find((n) => n.type === "trigger");

  let runs = 0;
  let failed = 0;
  for (const run of runsInPeriod(workOrders, period)) {
    if (run.status === "running") continue;
    const walked = walkedSteps(workflow, run);
    if (!trigger || walked.length === 0) continue;
    runs += 1;
    if (run.status === "failed") failed += 1;
    nodes[trigger.id].runs += 1;
    let from = trigger.id;
    for (const step of walked) {
      const edge = workflow.edges.find((e) => e.source === from && e.target === step.jobId);
      if (edge) edges[edge.id] += 1;
      const node = nodes[step.jobId];
      node.runs += 1;
      if (step.status === "failed") {
        node.failed += 1;
        node.lastFailure ??= run;
      }
      from = step.jobId;
    }
  }

  return {
    period,
    runs,
    failed,
    nodes,
    edges,
    busiest: Math.max(0, ...Object.values(edges)),
  };
}

/** One reason runs failed, with the runs it explains, for the failures view. */
export interface FailureReason {
  reason: string;
  count: number;
  /** Newest first. */
  runs: RunDetails[];
  /** The steps the failure happened at, e.g. "Create new citizen in Identity". */
  steps: string[];
}

/**
 * Why runs failed in `period`, grouped by the error their failing step
 * raised and ranked by how often it happened. With `jobId`, only failures
 * at that step; otherwise every failure in the workflow. Like
 * `runActivity`, only runs that walked this graph from its trigger count,
 * so these add up to the failed counts on the canvas.
 */
export function failureReasons(workflow: Workflow, workOrders: WorkOrder[], period: ActivityPeriod, jobId?: string): FailureReason[] {
  const label = (id: string) => workflow.nodes.find((n) => n.id === id)?.label ?? id;
  const byReason = new Map<string, FailureReason>();
  for (const run of runsInPeriod(workOrders, period)) {
    const step = walkedSteps(workflow, run).find((s) => s.status === "failed" && (jobId === undefined || s.jobId === jobId));
    if (!step) continue;
    const reason = step.error ?? "Failed without an error message";
    const entry = byReason.get(reason) ?? { reason, count: 0, runs: [], steps: [] };
    entry.count += 1;
    entry.runs.push(run);
    if (!entry.steps.includes(label(step.jobId))) entry.steps.push(label(step.jobId));
    byReason.set(reason, entry);
  }
  return [...byReason.values()].sort((a, b) => b.count - a.count);
}

// ---------------------------------------------------------------------------
// Health: the workflow's run history summed up over a period, for the
// editor's Health tab.
// ---------------------------------------------------------------------------

/** How many runs started in one slice of the period, and how many of those failed. */
export interface HealthBucket {
  /** Names the slice in a tooltip, e.g. "Oct 14" or "Oct 19, 10:00 – 12:00". */
  label: string;
  /** Under the bar on the axis; "" where it would crowd its neighbours. */
  tick: string;
  runs: number;
  failed: number;
}

/** A step and how many runs failed there. */
export interface StepFailures {
  jobId: string;
  label: string;
  adaptor?: AdaptorKind;
  failed: number;
}

/** The workflow's health over a period: every run of it, on any version. */
export interface WorkflowHealth {
  period: ActivityPeriod;
  /** Work orders by the outcome of their latest run in the period. */
  workOrders: { total: number; succeeded: number; failed: number; running: number };
  runs: { total: number; failed: number };
  /** What each bucket covers, e.g. "2 hours" or "day". */
  per: string;
  buckets: HealthBucket[];
  /** Steps with failures, most first. */
  steps: StepFailures[];
  /** Why runs failed, most common first. */
  reasons: FailureReason[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabel = (t: number) => {
  const d = new Date(t);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
};
const hourLabel = (t: number) => `${String(new Date(t).getHours()).padStart(2, "0")}:00`;

/**
 * Sum up every run of the workflow in `period`, whatever version it ran on
 * and wherever it started: work orders by outcome, runs over time, the steps
 * runs failed at and why. Unlike the canvas's counts (`runActivity`), which
 * follow one version's graph, this is the whole workflow's history, so its
 * totals match the run history list.
 */
export function workflowHealth(workflow: Workflow, workOrders: WorkOrder[], period: ActivityPeriod): WorkflowHealth {
  const orders = filterWorkOrders(workOrders, period);
  const runs = orders.flatMap((o) => o.runs);
  const latest = orders.map((o) => o.runs[0].status);

  // 24 hours in 2-hour bars, 7 days in days, 30 days in days with a tick every fifth.
  const hours = activityPeriods.find((p) => p.id === period)!.hours;
  const size = period === "24h" ? 2 : 24;
  const count = hours / size;
  const hour = 3600_000;
  // Bars end at the mock's "now", rounded up to a whole bar.
  const end = period === "24h" ? Math.ceil(MOCK_NOW / (size * hour)) * size * hour : new Date(MOCK_NOW).setHours(24, 0, 0, 0);
  const buckets: HealthBucket[] = Array.from({ length: count }, (_, i) => {
    const from = end - (count - i) * size * hour;
    return period === "24h"
      ? {
          label: `${dayLabel(from)}, ${hourLabel(from)} – ${hourLabel(from + size * hour)}`,
          tick: i % 2 === 0 ? hourLabel(from) : "",
          runs: 0,
          failed: 0,
        }
      : { label: dayLabel(from), tick: period === "30d" && (count - 1 - i) % 5 !== 0 ? "" : dayLabel(from), runs: 0, failed: 0 };
  });
  for (const run of runs) {
    const i = Math.floor((Math.min(startedAt(run), end - 1) - (end - count * size * hour)) / (size * hour));
    const bucket = buckets[Math.max(0, i)];
    bucket.runs += 1;
    if (run.status === "failed") bucket.failed += 1;
  }

  const steps = new Map<string, StepFailures>();
  for (const run of runs) {
    for (const step of run.steps.filter((s) => s.status === "failed")) {
      const node = workflow.nodes.find((n) => n.id === step.jobId);
      const entry = steps.get(step.jobId) ?? {
        jobId: step.jobId,
        label: node?.label ?? step.label,
        adaptor: node?.type === "job" ? node.adaptor : undefined,
        failed: 0,
      };
      entry.failed += 1;
      steps.set(step.jobId, entry);
    }
  }

  const byReason = new Map<string, FailureReason>();
  for (const run of runs) {
    const step = run.steps.find((s) => s.status === "failed");
    if (!step) continue;
    const reason = step.error ?? "Failed without an error message";
    const entry = byReason.get(reason) ?? { reason, count: 0, runs: [], steps: [] };
    entry.count += 1;
    entry.runs.push(run);
    const label = workflow.nodes.find((n) => n.id === step.jobId)?.label ?? step.label;
    if (!entry.steps.includes(label)) entry.steps.push(label);
    byReason.set(reason, entry);
  }

  return {
    period,
    workOrders: {
      total: orders.length,
      succeeded: latest.filter((s) => s === "success").length,
      failed: latest.filter((s) => s === "failed").length,
      running: latest.filter((s) => s === "running").length,
    },
    runs: { total: runs.length, failed: runs.filter((r) => r.status === "failed").length },
    per: period === "24h" ? "2 hours" : "day",
    buckets,
    steps: [...steps.values()].sort((a, b) => b.failed - a.failed || a.label.localeCompare(b.label)),
    reasons: [...byReason.values()].sort((a, b) => b.count - a.count),
  };
}

// ---------------------------------------------------------------------------
// Starting runs from the editor.
// ---------------------------------------------------------------------------

/** A run the editor starts, and how far along it is. */
export interface RunRequest {
  /** The workflow as it stands, edits included. */
  workflow: Workflow;
  version: string;
  input: Dataclip;
  workOrderId: string;
  runId: string;
  /** The step to start from when retrying from a step; the trigger otherwise. */
  fromJobId?: string;
  startedBy: string;
  /** How many steps have finished (0 when it has only just started); unset once the run is over. */
  progress?: number;
}

/** A run as it stands, with the dataclips it has produced so far. */
export interface RunProgress {
  run: RunDetails;
  dataclips: Dataclip[];
}
