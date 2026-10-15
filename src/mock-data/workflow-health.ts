/**
 * Workflow health fixtures: what Lightning's `WorkflowHealthController`
 * returns for `outcomes`, `failures` and `runs` (assets/js/health/types.ts).
 * Static per workflow and per range; the demo never queries.
 */
import type { ErrorSignature, HealthRange, RunBucket, WorkOrderStateCounts, WorkflowHealthData } from "../types/workflow-health";

const zero: WorkOrderStateCounts = {
  success: 0,
  cancelled: 0,
  failed: 0,
  crashed: 0,
  killed: 0,
  exception: 0,
  lost: 0,
  rejected: 0,
};

const NOW = Date.parse("2026-10-14T10:00:00Z");

/** A deterministic run volume: `n` buckets ending now, shaped by `seed`. */
function buckets(n: number, hours: number, scale: number, failEvery: number): RunBucket[] {
  return Array.from({ length: n }, (_, i) => {
    const wave = Math.round(scale * (0.6 + 0.4 * Math.sin(i * 0.9) ** 2));
    const failed = i % failEvery === 0 ? Math.max(1, Math.round(scale / 12)) : 0;
    return {
      at: new Date(NOW - (n - i) * hours * 3_600_000).toISOString(),
      success: wave,
      cancelled: i % 11 === 5 ? 1 : 0,
      failed,
      crashed: i % (failEvery * 3) === 2 ? 1 : 0,
      killed: 0,
      exception: 0,
      lost: 0,
    };
  });
}

const openhieSignatures: ErrorSignature[] = [
  {
    count: 9,
    exit_reason: "fail",
    error_type: "AdaptorError",
    job_id: "job-upload",
    step_name: "Upload to OpenHIE",
    adaptor: "@openfn/language-http@6.5.1",
  },
  {
    count: 4,
    exit_reason: "fail",
    error_type: "RuntimeError",
    job_id: "job-transform",
    step_name: "Transform to FHIR",
    adaptor: "@openfn/language-common@2.1.1",
  },
  {
    count: 3,
    exit_reason: "crash",
    error_type: "TimeoutError",
    job_id: null,
    step_name: null,
    adaptor: null,
  },
  {
    count: 1,
    exit_reason: "rejected",
    error_type: "RunLimitExceeded",
    job_id: null,
    step_name: null,
    adaptor: null,
  },
];

const data: Record<string, Record<HealthRange["days"], WorkflowHealthData>> = {
  "wf-openhie": {
    "1": {
      counts: { ...zero, success: 41, failed: 1 },
      signatures: [{ ...openhieSignatures[0], count: 1 }],
      bucketHours: 2,
      timezone: "UTC",
      buckets: buckets(12, 2, 4, 7),
    },
    "7": {
      counts: { ...zero, success: 287, cancelled: 2, failed: 9, crashed: 3, rejected: 1 },
      signatures: openhieSignatures,
      bucketHours: 12,
      timezone: "UTC",
      buckets: buckets(14, 12, 20, 4),
    },
    "30": {
      counts: { ...zero, success: 1240, cancelled: 4, failed: 13, crashed: 3, rejected: 1 },
      signatures: openhieSignatures.map((s) => ({ ...s, count: s.count + (s.job_id ? 2 : 0) })),
      bucketHours: 24,
      timezone: "UTC",
      buckets: buckets(30, 24, 40, 5),
    },
  },
};

/** Fixture for a workflow and range; a workflow with no history is all zeroes. */
export function healthFor(workflowId: string, days: HealthRange["days"]): WorkflowHealthData {
  return (
    data[workflowId]?.[days] ?? {
      counts: zero,
      signatures: [],
      bucketHours: days === "1" ? 2 : days === "7" ? 12 : 24,
      timezone: "UTC",
      buckets: [],
    }
  );
}
