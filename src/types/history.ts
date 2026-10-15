/** Work orders, runs, steps, dataclips and logs. Types only: no data, no behaviour. */

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

export type SearchFieldId = "id" | "dataclip_name" | "body" | "log";

/** A step as History lists it, with whether its input dataclip was wiped. */
export interface HistoryStep extends Step {
  inputWiped: boolean;
}

/** A run with its steps, in order. */
export interface HistoryRun extends Run {
  steps: HistoryStep[];
}

/**
 * A work order as History lists it: Lightning preloads its runs (newest
 * first) with their steps, and whether its input dataclip was wiped.
 */
export interface HistoryWorkOrder extends WorkOrder {
  runs: HistoryRun[];
  dataclipWiped: boolean;
}
