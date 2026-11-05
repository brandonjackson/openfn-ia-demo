/**
 * History: every work order a project's workflows received, with the runs
 * made for each, and every request its channels carried. The vocabulary for
 * filtering them lives here too, since it is the same whatever server sends
 * the records.
 */
import type { ChannelType } from "./page-data";
import type { Dataclip, RunDetails, RunStatus, WorkOrder } from "./workflow";

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
