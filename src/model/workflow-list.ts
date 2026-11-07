/*
 * A project's workflows as its Workflows list and Overview show them: what
 * the API says about each workflow, with what its work orders add up to.
 */
import { isLive, type WorkflowDocument } from "./workflow-document";
import type { RunStatus, TriggerType, WorkOrder } from "./workflow";
import { workOrderActivity, type ActivityPeriod } from "./runs";

/** A workflow on the project's Workflows list, with its recent activity. */
export interface WorkflowListItem {
  id: string;
  name: string;
  /** What it does, in a line. Absent when nothing says (api/ workflows have no description yet). */
  description?: string;
  type: "Workflow";
  /** Status of the service the workflow backs, if it backs one. */
  serviceStatus?: "Live" | "Draft";
  /** Status of its most recent run; none if it has never run. */
  latestRun?: RunStatus;
  /** When it last ran, as an ISO timestamp (sorts by Activity). */
  lastRunAt?: string;
  /** Names of the people who have edited it, most recent first. Absent when nothing says (api/ has no workflow authors yet). */
  members?: string[];
  /** When it was last changed, as an ISO timestamp. */
  updatedAt: string;
  /** Whether its triggers are on. Off, it only runs when someone starts it by hand. */
  enabled: boolean;
  /** The kind of its trigger, e.g. "webhook" or "cron", for saying what turning it off stops. Absent without a trigger. */
  triggerType?: TriggerType;
  /** Work orders in the last 30 days. */
  workOrders: number;
  /** Of those, how many ended in a failed state. */
  failedWorkOrders: number;
}

/** How far back a project's Overview and Workflows list count work orders, as Lightning's workflow list does. */
export const LIST_PERIOD: ActivityPeriod = "30d";

/** A service a workflow backs, as far as its row cares. */
export interface WorkflowService {
  workflowId?: string;
  status: "Live" | "Draft";
}

/**
 * A workflow's row: what the API says (its name, whether it's on, its
 * trigger, when it changed), what its work orders add up to over the last 30
 * days (the same ones History lists), and the status of the service it backs,
 * if `services` names one. Pass no services when the catalog is off.
 */
export function asListItem(doc: WorkflowDocument, workOrders: WorkOrder[], services: WorkflowService[] = []): WorkflowListItem {
  const { workOrders: count, failedWorkOrders, latestRun, lastRunAt } = workOrderActivity(workOrders, LIST_PERIOD);
  return {
    id: doc.id,
    name: doc.name,
    type: "Workflow",
    serviceStatus: services.find((s) => s.workflowId === doc.id)?.status,
    latestRun,
    lastRunAt,
    updatedAt: doc.updated_at,
    enabled: isLive(doc),
    triggerType: doc.triggers[0]?.type,
    workOrders: count,
    failedWorkOrders,
  };
}

/** Each workflow's work orders, by its id. */
export function byWorkflow(records: { workflowId: string; workOrder: WorkOrder }[]): (workflowId: string) => WorkOrder[] {
  const groups = new Map<string, WorkOrder[]>();
  for (const r of records) groups.set(r.workflowId, [...(groups.get(r.workflowId) ?? []), r.workOrder]);
  return (workflowId) => groups.get(workflowId) ?? [];
}
