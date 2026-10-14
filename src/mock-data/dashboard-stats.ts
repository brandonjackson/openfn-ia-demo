/**
 * Derived figures for the projects dashboard and the workflows index
 * (Lightning's `Projects.get_projects_overview/2` and `DashboardStats`).
 * Static fixtures layered on projects.ts and workflows.ts; nothing is counted
 * live.
 */
import { projects, roleIn, type ProjectRole } from "./projects";
import { workflows, workflowsIn, type WorkflowSummary } from "./workflows";

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

/** Root projects the user belongs to (sandboxes never show on the dashboard). */
export function projectsOverviewFor(userId: string): ProjectOverview[] {
  return projects
    .filter((p) => p.parentId === null)
    .flatMap((p) => {
      const role = roleIn(p, userId);
      if (!role) return [];
      const wfs = workflowsIn(p.id);
      const lastUpdatedAt = wfs.map((w) => w.updatedAt).sort().at(-1) ?? null;
      return [
        {
          id: p.id,
          name: p.name,
          role,
          workflowsCount: wfs.length,
          collaboratorsCount: p.members.length,
          lastUpdatedAt,
        },
      ];
    });
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

const extra: Record<string, Omit<WorkflowStats, "workflow">> = {
  "wf-openhie": {
    lastWorkOrder: { state: "success", updatedAt: "2026-10-14T09:12:00Z" },
    lastFailedAt: "2026-10-12T15:41:00Z",
    workordersCount: 1284,
    failedWorkordersCount: 17,
    stepCount: 3852,
    stepSuccessRate: 98.7,
    pendingWorkorders: 2,
    runs: { total: 1301, pending: 2, success: 1284 },
  },
  "wf-referrals": {
    lastWorkOrder: { state: "failed", updatedAt: "2026-10-14T06:00:00Z" },
    lastFailedAt: "2026-10-14T06:00:00Z",
    workordersCount: 30,
    failedWorkordersCount: 9,
    stepCount: 84,
    stepSuccessRate: 89.3,
    pendingWorkorders: 0,
    runs: { total: 33, pending: 0, success: 21 },
  },
  "wf-facility-sync": {
    lastWorkOrder: null,
    lastFailedAt: null,
    workordersCount: 0,
    failedWorkordersCount: 0,
    stepCount: 0,
    stepSuccessRate: 0,
    pendingWorkorders: 0,
    runs: { total: 0, pending: 0, success: 0 },
  },
  "wf-dhis2-sheets": {
    lastWorkOrder: { state: "running", updatedAt: "2026-10-14T09:00:00Z" },
    lastFailedAt: "2026-10-09T03:00:00Z",
    workordersCount: 720,
    failedWorkordersCount: 4,
    stepCount: 1440,
    stepSuccessRate: 99.4,
    pendingWorkorders: 1,
    runs: { total: 720, pending: 1, success: 715 },
  },
  "wf-openhie-sandbox": {
    lastWorkOrder: { state: "crashed", updatedAt: "2026-10-13T12:00:00Z" },
    lastFailedAt: "2026-10-13T12:00:00Z",
    workordersCount: 14,
    failedWorkordersCount: 3,
    stepCount: 36,
    stepSuccessRate: 86.1,
    pendingWorkorders: 0,
    runs: { total: 14, pending: 0, success: 11 },
  },
};

export function workflowStatsFor(projectId: string): WorkflowStats[] {
  return workflowsIn(projectId).map((workflow) => ({ workflow, ...extra[workflow.id] }));
}

export function findWorkflowStats(workflowId: string): WorkflowStats | undefined {
  const workflow = workflows.find((w) => w.id === workflowId);
  return workflow && { workflow, ...extra[workflow.id] };
}

/** The four metric cards above the workflows table (`ProjectMetrics`). */
export interface ProjectMetrics {
  workOrders: { total: number; pending: number; failed: number; failedPercentage: number };
  runs: { total: number; pending: number; success: number; successRate: number };
}

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
