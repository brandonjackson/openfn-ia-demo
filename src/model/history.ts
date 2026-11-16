/**
 * History: every work order a project's workflows received, with the runs
 * made for each, and every request its channels carried, in one list. The
 * vocabulary for filtering them and the columns they can show live here too,
 * since they are the same whatever server sends the records.
 */
import type { ChannelType } from "./channels";
import type { Dataclip, RunDetails, RunStatus, WorkOrder } from "./workflow";
import { activityPeriods, periodStart, stampTime } from "./runs";
import type { OutcomeStatus } from "./step-tools";

/** A work order as History lists it: the order itself and where it belongs. */
export interface HistoryWorkOrder {
  /** The work order, its runs newest first. */
  workOrder: WorkOrder;
  /** The workflow that received it. */
  workflowId: string;
  workflowName: string;
  /** The project the workflow belongs to, for History across every project. */
  projectId: string;
  projectName: string;
  /** What the trigger received, which every run of the order started from unless it was retried from a step. */
  input: Dataclip;
  /** When it was received, as "dd/mm/yyyy, HH:MM:SS". */
  receivedAt: string;
}

/** One request carried by a channel: an event that came in, or a call out to a system. */
export interface ChannelRequest {
  id: string;
  /** The channel's component id and name. */
  channelId: string;
  channelName: string;
  channelType: ChannelType;
  /** The system on the other end. */
  system: string;
  method: "GET" | "POST";
  /** The address called, or listened on. */
  endpoint: string;
  /** The HTTP status it ended with. */
  status: number;
  durationMs: number;
  /** When it happened, as shown, e.g. "20 Oct, 09:52". */
  at: string;
  /** One line on what it was about. */
  summary: string;
  projectId: string;
  projectName: string;
  /** The run it started or came from, and that run's workflow, when there is one. */
  runId?: string;
  workflowId?: string;
}

/** What History can filter work orders by status: Lightning's states, as the demo's runs know them. */
export const historyStatuses: { id: RunStatus; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "running", label: "Running" },
  { id: "waiting", label: "Waiting" },
  { id: "success", label: "Success" },
  { id: "failed", label: "Failed" },
  { id: "cancelled", label: "Cancelled" },
];

/** Where a search looks, as Lightning offers it. */
export type HistorySearchField = "id" | "dataclipName" | "body" | "log";

export const historySearchFields: { id: HistorySearchField; label: string; description: string }[] = [
  { id: "id", label: "IDs", description: "Work order, run and step ids" },
  { id: "dataclipName", label: "Dataclip names", description: "The names given to saved inputs" },
  { id: "body", label: "Inputs", description: "What the trigger received" },
  { id: "log", label: "Run logs", description: "Every line a run logged" },
];

/** Whether `order` matches `term` in any of `fields`. An empty term matches everything. */
export function matchesSearch(order: HistoryWorkOrder, term: string, fields: HistorySearchField[]): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  const has = (value: string | undefined) => !!value && value.toLowerCase().includes(needle);
  const runs: RunDetails[] = order.workOrder.runs;
  return fields.some((field) => {
    switch (field) {
      case "id":
        return has(order.workOrder.id) || runs.some((r) => has(r.runId) || r.steps.some((s) => has(s.id)));
      case "dataclipName":
        return has(order.input.name);
      case "body":
        return has(order.input.body);
      case "log":
        return runs.some((r) => r.logs.some((l) => has(l.message)) || r.steps.some((s) => has(s.error)));
    }
  });
}

/**
 * Everything History is filtered by, as Lightning's History keeps it in its
 * URL: so a link can open it filtered, and Back undoes a change. Dates are
 * datetime-local values ("2026-10-13T09:00"), in local time.
 */
export interface HistoryFilters {
  /** Only workflow runs or only channel logs; null is both. */
  kind: HistoryKind | null;
  /** Words to look for; empty finds everything. */
  search: string;
  /** Where the words are looked for. */
  searchFields: HistorySearchField[];
  /** One project's records, in History across every project. */
  projectId: string | null;
  /** One workflow's work orders (and no channel's requests). */
  workflowId: string | null;
  /** Records that ended in any of these (a work order by its latest run, a request by `requestStatus`); empty is any. */
  statuses: RunStatus[];
  /** Work orders whose latest run reported any of these business outcomes (Report outcome); empty is any. */
  outcomes: OutcomeStatus[];
  receivedAfter: string | null;
  receivedBefore: string | null;
  /** When the latest run started. */
  activityAfter: string | null;
  activityBefore: string | null;
  /** One work order, from a link to it: shown alone, and opened. */
  workOrderId: string | null;
  /** One channel's requests (and no workflow's work orders). */
  channelId: string | null;
}

/** History unfiltered, as it opens. */
export const defaultHistoryFilters: HistoryFilters = {
  kind: null,
  search: "",
  searchFields: ["id", "dataclipName"],
  projectId: null,
  workflowId: null,
  statuses: [],
  outcomes: [],
  receivedAfter: null,
  receivedBefore: null,
  activityAfter: null,
  activityBefore: null,
  workOrderId: null,
  channelId: null,
};

/** What Received and Last activity offer before a range of your own: Lightning's quick periods. */
export const historyDatePresets = () => activityPeriods.map((p) => ({ label: p.label, after: periodStart(p.id) }));

const inRange = (time: number, after: string | null, before: string | null) =>
  (!after || time >= new Date(after).getTime()) && (!before || time <= new Date(before).getTime());

/** Orders the newest-received work order first, as History lists them. */
export const newestFirst = (a: { receivedAt: string }, b: { receivedAt: string }) => stampTime(b.receivedAt) - stampTime(a.receivedAt);

/** When the order's latest run started, or when it was received if it has none. */
export const lastActivityTime = (order: HistoryWorkOrder) => stampTime(order.workOrder.runs[0]?.started ?? order.receivedAt);

/**
 * Whether `order` passes `filters`. `ignoring` leaves one filter out, so a
 * filter's options can say how many each would show.
 */
export function matchesFilters(order: HistoryWorkOrder, filters: HistoryFilters, ignoring?: "statuses" | "outcomes"): boolean {
  const f = filters;
  return (
    f.kind !== "channel" &&
    !f.channelId &&
    (!f.projectId || order.projectId === f.projectId) &&
    (!f.workflowId || order.workflowId === f.workflowId) &&
    (!f.workOrderId || order.workOrder.id === f.workOrderId) &&
    (ignoring === "statuses" || f.statuses.length === 0 || f.statuses.includes(order.workOrder.status)) &&
    (ignoring === "outcomes" || f.outcomes.length === 0 || (!!order.workOrder.outcome && f.outcomes.includes(order.workOrder.outcome.status))) &&
    inRange(stampTime(order.receivedAt), f.receivedAfter, f.receivedBefore) &&
    inRange(lastActivityTime(order), f.activityAfter, f.activityBefore) &&
    matchesSearch(order, f.search, f.searchFields)
  );
}

/**
 * Whether a channel request passes `filters`: its project, channel, status,
 * when it happened (for both Received and Last activity) and the search, in
 * any of its words. A filter only work orders have (a workflow, an outcome, a
 * work order) leaves every request out.
 */
export function matchesRequestFilters(request: ChannelRequest, filters: HistoryFilters, ignoring?: "statuses"): boolean {
  const f = filters;
  const needle = f.search.trim().toLowerCase();
  const time = requestTime(request);
  return (
    f.kind !== "workflow" &&
    !f.workflowId &&
    !f.workOrderId &&
    f.outcomes.length === 0 &&
    (!f.projectId || request.projectId === f.projectId) &&
    (!f.channelId || request.channelId === f.channelId) &&
    (ignoring === "statuses" || f.statuses.length === 0 || f.statuses.includes(requestStatus(request))) &&
    inRange(time, f.receivedAfter, f.receivedBefore) &&
    inRange(time, f.activityAfter, f.activityBefore) &&
    (!needle || [request.id, request.channelName, request.endpoint, request.summary, request.runId ?? ""].some((v) => v.toLowerCase().includes(needle)))
  );
}

/** Whether a record passes `filters`, whichever kind it is. */
export function matchesEntry(entry: HistoryEntry, filters: HistoryFilters, ignoring?: "statuses"): boolean {
  return entry.kind === "workflow" ? matchesFilters(entry.order, filters, ignoring) : matchesRequestFilters(entry.request, filters, ignoring);
}

/** How many filters narrow History, the search included, to offer clearing them. */
export function activeFilterCount(filters: HistoryFilters): number {
  const f = filters;
  return [
    f.search.trim(),
    f.kind,
    f.projectId,
    f.workflowId,
    f.channelId,
    f.workOrderId,
    f.statuses.length > 0,
    f.outcomes.length > 0,
    f.receivedAfter || f.receivedBefore,
    f.activityAfter || f.activityBefore,
  ].filter(Boolean).length;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "13 Oct", or "13 Oct, 09:30" when the time isn't midnight. */
function filterDate(value: string): string {
  const d = new Date(value);
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${d.getDate()} ${months[d.getMonth()]}${time === "00:00" ? "" : `, ${time}`}`;
}

/** A date filter in words, to follow its name: "any time", "in the last 7 days", "after 13 Oct", "13 Oct to 19 Oct". */
export function describeDateRange(after: string | null, before: string | null): string {
  const preset = !before && historyDatePresets().find((p) => p.after === after);
  if (preset) return `in the ${preset.label.toLowerCase()}`;
  if (after && before) return `${filterDate(after)} to ${filterDate(before)}`;
  if (after) return `after ${filterDate(after)}`;
  if (before) return `before ${filterDate(before)}`;
  return "any time";
}

/** Where the search looks, in words: "everything", or "IDs and dataclip names". */
export function describeSearchFields(fields: HistorySearchField[]): string {
  if (fields.length === historySearchFields.length) return "everything";
  const labels = historySearchFields.filter((f) => fields.includes(f.id)).map((f, i) => (i === 0 ? f.label : f.label.toLowerCase()));
  return labels.length > 1 ? `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}` : (labels[0] ?? "nothing");
}

/** Which actions a set of selected work orders allows, by Lightning's rules. */
export function bulkActions(selected: HistoryWorkOrder[]): { retry: boolean; retryFrom: boolean; cancel: boolean } {
  // A run waiting on someone hasn't finished either: answer it, rather than start another.
  const finished = (o: HistoryWorkOrder) => !["pending", "running", "waiting"].includes(o.workOrder.status);
  const sameWorkflow = new Set(selected.map((o) => o.workflowId)).size === 1;
  return {
    // Retry needs every order to have finished running.
    retry: selected.length > 0 && selected.every(finished),
    // Retrying from a step needs them all to be of one workflow, so there is one list of steps to pick from.
    retryFrom: selected.length > 0 && sameWorkflow && selected.every(finished),
    // Only orders still waiting to start can be cancelled.
    cancel: selected.length > 0 && selected.every((o) => o.workOrder.status === "pending"),
  };
}

/** A workflow History can filter by, with its steps for retrying from one. */
export interface HistoryWorkflowOption {
  id: string;
  name: string;
  /** The project it belongs to, for History across every project. */
  projectId: string;
  /** Its steps in the order they run, to pick one to retry from. */
  steps: { id: string; label: string }[];
  /** Its latest version, so runs on an older one can be told apart. */
  latestVersion: string;
}

/** What made a record in History: a workflow's run, or a channel's request. */
export type HistoryKind = "workflow" | "channel";

/**
 * One row of History, as the database holds it: a work order, or a request
 * a channel carried. They're separate records, even when a request started a
 * run, so History lists them side by side.
 */
export type HistoryEntry =
  | { kind: "workflow"; key: string; order: HistoryWorkOrder }
  | { kind: "channel"; key: string; request: ChannelRequest };

/** When a channel request happened. */
export const requestTime = (request: ChannelRequest) => stampTime(request.at);

/** A channel request's status in History's words: under 400 it succeeded, otherwise it failed. */
export const requestStatus = (request: ChannelRequest): RunStatus => (request.status < 400 ? "success" : "failed");

/** When a record last moved: a work order's latest run, or the request itself. */
export const entryTime = (entry: HistoryEntry) => (entry.kind === "workflow" ? lastActivityTime(entry.order) : requestTime(entry.request));

/** A record's status: a work order's latest run's, or a request's (`requestStatus`). */
export const entryStatus = (entry: HistoryEntry): RunStatus =>
  entry.kind === "workflow" ? entry.order.workOrder.status : requestStatus(entry.request);

/** Work orders and channel requests in one list, the most recently active first. */
export function historyEntries(workOrders: HistoryWorkOrder[], requests: ChannelRequest[]): HistoryEntry[] {
  return [
    ...workOrders.map((order): HistoryEntry => ({ kind: "workflow", key: `workflow:${order.workOrder.id}`, order })),
    ...requests.map((request): HistoryEntry => ({ kind: "channel", key: `channel:${request.id}`, request })),
  ].sort((a, b) => entryTime(b) - entryTime(a));
}

/** The columns History can add beyond its own two (the name and the status, which always show). */
export type HistoryColumnId = "project" | "received" | "outcome" | "runs" | "input" | "system" | "endpoint" | "duration";

/** History's optional columns, grouped by the records that have a value in them. */
export const historyColumns: { id: HistoryColumnId; label: string; group?: "Workflows" | "Channels" }[] = [
  { id: "project", label: "Project" },
  { id: "received", label: "Received" },
  { id: "outcome", label: "Outcome", group: "Workflows" },
  { id: "runs", label: "Runs", group: "Workflows" },
  { id: "input", label: "Input", group: "Workflows" },
  { id: "system", label: "System", group: "Channels" },
  { id: "endpoint", label: "Endpoint", group: "Channels" },
  { id: "duration", label: "Duration", group: "Channels" },
];

/** A time as History's columns show it, the same for both kinds of record: "20 Oct, 09:40". */
export function shortTime(time: number): string {
  const d = new Date(time);
  return `${d.getDate()} ${months[d.getMonth()]}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** When a record came in: a work order's received time, or the request's. */
export const receivedTime = (entry: HistoryEntry) => (entry.kind === "workflow" ? stampTime(entry.order.receivedAt) : requestTime(entry.request));
