/**
 * Work orders, runs, steps and dataclips for History, the run page, the
 * dataclip page and workflow health. Static fixtures only.
 */

export type RunState =
  | "available"
  | "claimed"
  | "started"
  | "success"
  | "failed"
  | "crashed"
  | "cancelled"
  | "killed"
  | "exception"
  | "lost";

/** A work order's state is its latest run's state, plus "pending"/"rejected". */
export type WorkOrderState = RunState | "pending" | "rejected";

export type DataclipType = "http_request" | "global" | "step_result" | "saved_input" | "kafka";

export interface Dataclip {
  id: string;
  projectId: string;
  type: DataclipType;
  name: string | null;
  body: unknown;
  insertedAt: string;
  /** Body wiped by the project's retention policy. */
  wiped: boolean;
}

export interface Step {
  id: string;
  runId: string;
  jobId: string;
  jobName: string;
  exitReason: "success" | "fail" | "crash" | null;
  startedAt: string;
  finishedAt: string | null;
  inputDataclipId: string;
  outputDataclipId: string | null;
}

export interface Run {
  id: string;
  workOrderId: string;
  state: RunState;
  startingTrigger: string | null;
  startingJob: string | null;
  createdBy: string | null;
  insertedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  stepIds: string[];
}

export interface WorkOrder {
  id: string;
  projectId: string;
  workflowId: string;
  workflowName: string;
  state: WorkOrderState;
  dataclipId: string;
  insertedAt: string;
  lastActivity: string;
  runIds: string[];
}

export interface LogLine {
  timestamp: string;
  source: "R/T" | "JOB" | "ADA" | "CLI";
  level: "info" | "debug" | "warn" | "error";
  message: string;
  stepId?: string;
}

const OPENHIE = "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa";
const DHIS2 = "1f0b7c2e-9d3a-4a4b-8f5e-2c6d7e8f9a01";

export const dataclips: Dataclip[] = [
  {
    id: "dc-7f3a91",
    projectId: OPENHIE,
    type: "http_request",
    name: null,
    insertedAt: "2026-10-14T09:12:00Z",
    wiped: false,
    body: {
      data: {
        form: {
          "@name": "Patient registration",
          patient: { given_name: "Aisha", family_name: "Okafor", sex: "female", birthdate: "2024-11-02" },
          chw_id: "chw-0042",
        },
      },
      request: { headers: { "content-type": "application/json", "user-agent": "CommCareHQ" } },
    },
  },
  {
    id: "dc-7f3a92",
    projectId: OPENHIE,
    type: "step_result",
    name: null,
    insertedAt: "2026-10-14T09:12:02Z",
    wiped: false,
    body: {
      data: { resourceType: "Patient", name: [{ given: ["Aisha"], family: "Okafor" }], gender: "female", birthDate: "2024-11-02" },
    },
  },
  {
    id: "dc-7f3a93",
    projectId: OPENHIE,
    type: "step_result",
    name: null,
    insertedAt: "2026-10-14T09:12:04Z",
    wiped: false,
    body: { data: { status: 201, location: "Patient/58213" } },
  },
  {
    id: "dc-5b11c0",
    projectId: OPENHIE,
    type: "global",
    name: null,
    insertedAt: "2026-10-14T06:00:00Z",
    wiped: false,
    body: {},
  },
  {
    id: "dc-saved-1",
    projectId: OPENHIE,
    type: "saved_input",
    name: "Sample registration",
    insertedAt: "2026-09-02T08:00:00Z",
    wiped: false,
    body: { data: { form: { patient: { given_name: "Test", family_name: "Patient" } } } },
  },
  {
    id: "dc-wiped",
    projectId: DHIS2,
    type: "global",
    name: null,
    insertedAt: "2026-09-01T09:00:00Z",
    wiped: true,
    body: null,
  },
];

export const steps: Step[] = [
  {
    id: "step-1a",
    runId: "run-1",
    jobId: "job-transform",
    jobName: "Transform data to FHIR standard",
    exitReason: "success",
    startedAt: "2026-10-14T09:12:01Z",
    finishedAt: "2026-10-14T09:12:02Z",
    inputDataclipId: "dc-7f3a91",
    outputDataclipId: "dc-7f3a92",
  },
  {
    id: "step-1b",
    runId: "run-1",
    jobId: "job-send",
    jobName: "Send to OpenHIM to route to SHR",
    exitReason: "success",
    startedAt: "2026-10-14T09:12:02Z",
    finishedAt: "2026-10-14T09:12:04Z",
    inputDataclipId: "dc-7f3a92",
    outputDataclipId: "dc-7f3a93",
  },
  {
    id: "step-1c",
    runId: "run-1",
    jobId: "job-notify-ok",
    jobName: "Notify CHW upload successful",
    exitReason: "success",
    startedAt: "2026-10-14T09:12:04Z",
    finishedAt: "2026-10-14T09:12:05Z",
    inputDataclipId: "dc-7f3a93",
    outputDataclipId: "dc-7f3a93",
  },
  {
    id: "step-2a",
    runId: "run-2",
    jobId: "job-referrals",
    jobName: "Fetch overdue referrals",
    exitReason: "fail",
    startedAt: "2026-10-14T06:00:01Z",
    finishedAt: "2026-10-14T06:00:09Z",
    inputDataclipId: "dc-5b11c0",
    outputDataclipId: null,
  },
];

export const runs: Run[] = [
  {
    id: "run-1",
    workOrderId: "wo-1",
    state: "success",
    startingTrigger: "Webhook",
    startingJob: null,
    createdBy: null,
    insertedAt: "2026-10-14T09:12:00Z",
    startedAt: "2026-10-14T09:12:01Z",
    finishedAt: "2026-10-14T09:12:05Z",
    stepIds: ["step-1a", "step-1b", "step-1c"],
  },
  {
    id: "run-2",
    workOrderId: "wo-2",
    state: "failed",
    startingTrigger: "Cron",
    startingJob: null,
    createdBy: null,
    insertedAt: "2026-10-14T06:00:00Z",
    startedAt: "2026-10-14T06:00:01Z",
    finishedAt: "2026-10-14T06:00:09Z",
    stepIds: ["step-2a"],
  },
  {
    id: "run-3",
    workOrderId: "wo-2",
    state: "success",
    startingTrigger: null,
    startingJob: "Fetch overdue referrals",
    createdBy: "user-amy",
    insertedAt: "2026-10-14T08:30:00Z",
    startedAt: "2026-10-14T08:30:01Z",
    finishedAt: "2026-10-14T08:30:06Z",
    stepIds: [],
  },
  {
    id: "run-4",
    workOrderId: "wo-3",
    state: "started",
    startingTrigger: "Webhook",
    startingJob: null,
    createdBy: null,
    insertedAt: "2026-10-14T09:20:00Z",
    startedAt: "2026-10-14T09:20:01Z",
    finishedAt: null,
    stepIds: [],
  },
  {
    id: "run-5",
    workOrderId: "wo-4",
    state: "crashed",
    startingTrigger: "Webhook",
    startingJob: null,
    createdBy: null,
    insertedAt: "2026-10-13T17:45:00Z",
    startedAt: "2026-10-13T17:45:01Z",
    finishedAt: "2026-10-13T17:45:31Z",
    stepIds: [],
  },
];

export const workOrders: WorkOrder[] = [
  {
    id: "wo-1",
    projectId: OPENHIE,
    workflowId: "wf-openhie",
    workflowName: "OpenHIE Workflow",
    state: "success",
    dataclipId: "dc-7f3a91",
    insertedAt: "2026-10-14T09:12:00Z",
    lastActivity: "2026-10-14T09:12:05Z",
    runIds: ["run-1"],
  },
  {
    id: "wo-2",
    projectId: OPENHIE,
    workflowId: "wf-referrals",
    workflowName: "Referral follow-ups",
    state: "success",
    dataclipId: "dc-5b11c0",
    insertedAt: "2026-10-14T06:00:00Z",
    lastActivity: "2026-10-14T08:30:06Z",
    runIds: ["run-2", "run-3"],
  },
  {
    id: "wo-3",
    projectId: OPENHIE,
    workflowId: "wf-openhie",
    workflowName: "OpenHIE Workflow",
    state: "started",
    dataclipId: "dc-7f3a91",
    insertedAt: "2026-10-14T09:20:00Z",
    lastActivity: "2026-10-14T09:20:01Z",
    runIds: ["run-4"],
  },
  {
    id: "wo-4",
    projectId: OPENHIE,
    workflowId: "wf-openhie",
    workflowName: "OpenHIE Workflow",
    state: "crashed",
    dataclipId: "dc-7f3a91",
    insertedAt: "2026-10-13T17:45:00Z",
    lastActivity: "2026-10-13T17:45:31Z",
    runIds: ["run-5"],
  },
  {
    id: "wo-5",
    projectId: OPENHIE,
    workflowId: "wf-openhie",
    workflowName: "OpenHIE Workflow",
    state: "rejected",
    dataclipId: "dc-7f3a91",
    insertedAt: "2026-10-13T15:02:00Z",
    lastActivity: "2026-10-13T15:02:00Z",
    runIds: [],
  },
];

export const runLogs: Record<string, LogLine[]> = {
  "run-1": [
    { timestamp: "09:12:01.004", source: "R/T", level: "info", message: "Starting operation 1" },
    { timestamp: "09:12:01.210", source: "JOB", level: "info", message: "Mapping registration chw-0042 to a FHIR Patient", stepId: "step-1a" },
    { timestamp: "09:12:02.011", source: "R/T", level: "info", message: "Operation 1 complete in 1.007s" },
    { timestamp: "09:12:02.400", source: "ADA", level: "info", message: "POST https://openhim.example.org/fhir/Patient - 201 in 1.2s", stepId: "step-1b" },
    { timestamp: "09:12:04.002", source: "R/T", level: "info", message: "Operation 2 complete in 1.991s" },
    { timestamp: "09:12:04.900", source: "JOB", level: "info", message: "Sent SMS to chw-0042", stepId: "step-1c" },
    { timestamp: "09:12:05.001", source: "R/T", level: "info", message: "Run complete with status: success" },
  ],
  "run-2": [
    { timestamp: "06:00:01.002", source: "R/T", level: "info", message: "Starting operation 1" },
    { timestamp: "06:00:08.880", source: "ADA", level: "error", message: "GET https://commcare.example.org/a/referrals - 401 Unauthorized", stepId: "step-2a" },
    { timestamp: "06:00:09.001", source: "R/T", level: "error", message: "Error in runtime execution!" },
    { timestamp: "06:00:09.002", source: "R/T", level: "info", message: "Run complete with status: failed" },
  ],
};

export function workOrdersIn(projectId: string): WorkOrder[] {
  return workOrders.filter((w) => w.projectId === projectId);
}

export function workOrdersOfWorkflow(workflowId: string): WorkOrder[] {
  return workOrders.filter((w) => w.workflowId === workflowId);
}

export function dataclipsIn(projectId: string): Dataclip[] {
  return dataclips.filter((d) => d.projectId === projectId);
}

export function findRun(id: string | undefined): Run | undefined {
  return runs.find((r) => r.id === id);
}

export function findWorkOrder(id: string | undefined): WorkOrder | undefined {
  return workOrders.find((w) => w.id === id);
}

export function findDataclip(id: string | undefined): Dataclip | undefined {
  return dataclips.find((d) => d.id === id);
}

export function stepsOf(run: Run): Step[] {
  return run.stepIds.map((id) => steps.find((s) => s.id === id)!).filter(Boolean);
}
