/** Workflow summaries and the dashboard figures built on them. Types only: no data, no behaviour. */
import type { ProjectRole } from "./projects";

export type TriggerType = "webhook" | "cron" | "kafka";

export interface WorkflowSummary {
  id: string;
  projectId: string;
  name: string;
  triggerType: TriggerType;
  /** Whether the trigger is enabled ("Active" toggle on the index). */
  enabled: boolean;
  /** Human-readable trigger description, e.g. the cron expression. */
  triggerLabel: string;
  lastRunAt: string | null;
  lastRunStatus: "success" | "failed" | "crashed" | "running" | null;
  workOrderCount: number;
  failedWorkOrderCount: number;
  updatedAt: string;
  insertedAt: string;
}

/** A row on the projects dashboard (`ProjectOverviewRow`). */
export interface ProjectOverview {
  id: string;
  name: string;
  role: ProjectRole;
  workflowsCount: number;
  collaboratorsCount: number;
  /** Latest workflow update in the project; null when it has none. */
  lastUpdatedAt: string | null;
}

export type WorkOrderDisplayState =
  | "pending"
  | "running"
  | "success"
  | "failed"
  | "crashed"
  | "cancelled"
  | "killed"
  | "exception"
  | "lost";

/** One row of the workflows table (`DashboardStats.WorkflowStats`). */
export interface WorkflowStats {
  workflow: WorkflowSummary;
  lastWorkOrder: { state: WorkOrderDisplayState; updatedAt: string } | null;
  lastFailedAt: string | null;
  workordersCount: number;
  failedWorkordersCount: number;
  stepCount: number;
  stepSuccessRate: number;
  /** Counted for the metric cards. */
  pendingWorkorders: number;
  runs: { total: number; pending: number; success: number };
}

/** The four metric cards above the workflows table (`ProjectMetrics`). */
export interface ProjectMetrics {
  workOrders: { total: number; pending: number; failed: number; failedPercentage: number };
  runs: { total: number; pending: number; success: number; successRate: number };
}
