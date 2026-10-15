/** What WorkflowHealthController returns (assets/js/health/types.ts). Types only: no data, no behaviour. */

export const FAILURE_STATES = ["failed", "crashed", "killed", "exception", "lost", "rejected"] as const;

export type FailureState = (typeof FAILURE_STATES)[number];

export type WorkOrderStateCounts = Record<"success" | "cancelled" | FailureState, number>;

export interface ErrorSignature {
  count: number;
  exit_reason: string;
  error_type: string | null;
  job_id: string | null;
  step_name: string | null;
  adaptor: string | null;
}

export interface RunBucket {
  at: string;
  success: number;
  cancelled: number;
  failed: number;
  crashed: number;
  killed: number;
  exception: number;
  lost: number;
}

export interface HealthRange {
  days: "1" | "7" | "30";
  label: string;
}

export interface WorkflowHealthData {
  counts: WorkOrderStateCounts;
  signatures: ErrorSignature[];
  /** Bar width in hours: 2 for 24 hours, 12 for 7 days, 24 for 30 days. */
  bucketHours: number;
  timezone: string;
  buckets: RunBucket[];
}
