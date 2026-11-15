/*
 * The Status page's view of right now: how each of the organisation's systems
 * and each workflow is doing. The API has no status checks yet, so these come
 * from fixtures (on Lightning the page shows empty; docs/api-gaps.md).
 */

/** How healthy a system or workflow is right now. */
export type HealthState = "operational" | "degraded" | "down";

/** One connected system on the Status page. */
export interface SystemStatus {
  id: string;
  name: string;
  status: HealthState;
  note: string;
  linkTo: string;
}

/** One workflow on the Status page, with when it last ran. */
export interface WorkflowStatus {
  id: string;
  name: string;
  project: string;
  projectId: string;
  status: HealthState;
  lastRun: string;
  note: string;
}

/** Everything the Status page shows. */
export interface StatusPageData {
  pageType: "status";
  checkedAt: string;
  /** The organisation's systems. Absent without connected systems, which leaves the table out. */
  systems?: SystemStatus[];
  workflows: WorkflowStatus[];
}
