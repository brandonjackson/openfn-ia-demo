/**
 * Derived figures for the projects dashboard and the workflows index
 * (Lightning's `Projects.get_projects_overview/2` and `DashboardStats`).
 * Static fixtures layered on projects.ts and workflows.ts; nothing is counted
 * live.
 */
import { projects } from "./projects";
import { roleIn } from "../permissions";
import { workflows, workflowsIn } from "./workflows";
import type { ProjectOverview, WorkflowStats } from "../types/workflows";

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

/** A workflow with no work orders yet (e.g. one loaded from kickstart/exports/). */
const NO_ACTIVITY: Omit<WorkflowStats, "workflow"> = {
  lastWorkOrder: null,
  lastFailedAt: null,
  workordersCount: 0,
  failedWorkordersCount: 0,
  stepCount: 0,
  stepSuccessRate: 0,
  pendingWorkorders: 0,
  runs: { total: 0, pending: 0, success: 0 },
};

export function workflowStatsFor(projectId: string): WorkflowStats[] {
  return workflowsIn(projectId).map((workflow) => ({ workflow, ...(extra[workflow.id] ?? NO_ACTIVITY) }));
}

export function findWorkflowStats(workflowId: string): WorkflowStats | undefined {
  const workflow = workflows.find((w) => w.id === workflowId);
  return workflow && { workflow, ...(extra[workflow.id] ?? NO_ACTIVITY) };
}
