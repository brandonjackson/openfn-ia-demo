/**
 * History: every work order a project's workflows received, with the runs
 * made for each, and every request its channels carried. The vocabulary for
 * filtering them lives here too, since it is the same whatever server sends
 * the records.
 */
import type { ChannelType } from "./page-data";
import type { Dataclip, RunDetails, RunStatus, WorkOrder } from "./workflow";
import { activityPeriods, periodStart, stampTime } from "./runs";

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
  tab: "work-orders" | "channels";
  /** Words to look for; empty finds everything. */
  search: string;
  /** Where the words are looked for. */
  searchFields: HistorySearchField[];
  /** One project's records, in History across every project. */
  projectId: string | null;
  /** One workflow's work orders. */
  workflowId: string | null;
  /** Work orders whose latest run ended in any of these; empty is any. */
  statuses: RunStatus[];
  receivedAfter: string | null;
  receivedBefore: string | null;
  /** When the latest run started. */
  activityAfter: string | null;
  activityBefore: string | null;
  /** One work order, from a link to it: shown alone, and opened. */
  workOrderId: string | null;
  /** One channel's requests. */
  channelId: string | null;
  /** Requests that succeeded (under 400) or failed. */
  requestStatus: "ok" | "failed" | null;
}

/** History unfiltered, as it opens. */
export const defaultHistoryFilters: HistoryFilters = {
  tab: "work-orders",
  search: "",
  searchFields: ["id", "dataclipName"],
  projectId: null,
  workflowId: null,
  statuses: [],
  receivedAfter: null,
  receivedBefore: null,
  activityAfter: null,
  activityBefore: null,
  workOrderId: null,
  channelId: null,
  requestStatus: null,
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
export function matchesFilters(order: HistoryWorkOrder, filters: HistoryFilters, ignoring?: "statuses"): boolean {
  const f = filters;
  return (
    (!f.projectId || order.projectId === f.projectId) &&
    (!f.workflowId || order.workflowId === f.workflowId) &&
    (!f.workOrderId || order.workOrder.id === f.workOrderId) &&
    (ignoring === "statuses" || f.statuses.length === 0 || f.statuses.includes(order.workOrder.status)) &&
    inRange(stampTime(order.receivedAt), f.receivedAfter, f.receivedBefore) &&
    inRange(lastActivityTime(order), f.activityAfter, f.activityBefore) &&
    matchesSearch(order, f.search, f.searchFields)
  );
}

/** Whether a channel request passes `filters`: its project, channel, outcome and the search, in any of its words. */
export function matchesRequestFilters(request: ChannelRequest, filters: HistoryFilters): boolean {
  const f = filters;
  const needle = f.search.trim().toLowerCase();
  return (
    (!f.projectId || request.projectId === f.projectId) &&
    (!f.channelId || request.channelId === f.channelId) &&
    (!f.requestStatus || (f.requestStatus === "failed") === request.status >= 400) &&
    (!needle || [request.channelName, request.endpoint, request.summary, request.runId ?? ""].some((v) => v.toLowerCase().includes(needle)))
  );
}

/** How many filters narrow the tab that's showing, the search included, to offer clearing them. */
export function activeFilterCount(filters: HistoryFilters): number {
  const f = filters;
  const shared = [f.search.trim(), f.projectId];
  const own =
    f.tab === "channels"
      ? [f.channelId, f.requestStatus]
      : [f.workflowId, f.workOrderId, f.statuses.length > 0, f.receivedAfter || f.receivedBefore, f.activityAfter || f.activityBefore];
  return [...shared, ...own].filter(Boolean).length;
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
  const finished = (o: HistoryWorkOrder) => !["pending", "running"].includes(o.workOrder.status);
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
