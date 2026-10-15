/**
 * Workflow summaries for the workflows index and health pages. The canvas
 * itself (jobs, edges, positions) lives in ./workflow.ts.
 */

import { kickstartWorkflows } from "./generated/kickstart";

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

export const workflows: WorkflowSummary[] = [
  {
    id: "wf-openhie",
    projectId: "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa",
    name: "OpenHIE Workflow",
    triggerType: "webhook",
    enabled: true,
    triggerLabel: "Webhook",
    lastRunAt: "2026-10-14T09:12:00Z",
    lastRunStatus: "success",
    workOrderCount: 1284,
    failedWorkOrderCount: 17,
    updatedAt: "2026-10-10T11:00:00Z",
    insertedAt: "2024-03-12T10:00:00Z",
  },
  {
    id: "wf-referrals",
    projectId: "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa",
    name: "Referral follow-ups",
    triggerType: "cron",
    enabled: true,
    triggerLabel: "Every day at 06:00",
    lastRunAt: "2026-10-14T06:00:00Z",
    lastRunStatus: "failed",
    workOrderCount: 212,
    failedWorkOrderCount: 9,
    updatedAt: "2026-09-21T14:30:00Z",
    insertedAt: "2025-01-04T09:00:00Z",
  },
  {
    id: "wf-facility-sync",
    projectId: "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa",
    name: "Facility registry sync",
    triggerType: "cron",
    enabled: false,
    triggerLabel: "Every Monday at 02:00",
    lastRunAt: null,
    lastRunStatus: null,
    workOrderCount: 0,
    failedWorkOrderCount: 0,
    updatedAt: "2026-08-02T10:15:00Z",
    insertedAt: "2026-08-02T10:15:00Z",
  },
  {
    id: "wf-dhis2-sheets",
    projectId: "1f0b7c2e-9d3a-4a4b-8f5e-2c6d7e8f9a01",
    name: "DHIS2 to Sheets",
    triggerType: "cron",
    enabled: true,
    triggerLabel: "Every hour",
    lastRunAt: "2026-10-14T09:00:00Z",
    lastRunStatus: "success",
    workOrderCount: 8760,
    failedWorkOrderCount: 41,
    updatedAt: "2026-06-30T08:20:00Z",
    insertedAt: "2024-03-12T10:05:00Z",
  },
  {
    id: "wf-openhie-sandbox",
    projectId: "8c1d2e3f-4a5b-4c6d-9e7f-0a1b2c3d4e5f",
    name: "OpenHIE Workflow",
    triggerType: "webhook",
    enabled: true,
    triggerLabel: "Webhook",
    lastRunAt: "2026-10-13T12:00:00Z",
    lastRunStatus: "crashed",
    workOrderCount: 14,
    failedWorkOrderCount: 3,
    updatedAt: "2026-10-13T11:50:00Z",
    insertedAt: "2026-09-30T08:00:00Z",
  },
  // Projects loaded from kickstart/exports/ (see kickstart/sync.mjs).
  ...kickstartWorkflows,
];

export function workflowsIn(projectId: string): WorkflowSummary[] {
  return workflows.filter((w) => w.projectId === projectId);
}

export function findWorkflow(id: string | undefined): WorkflowSummary | undefined {
  return workflows.find((w) => w.id === id);
}
