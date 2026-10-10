import type { HealthState, StatusPageData, SystemStatus, WorkflowStatus } from "../page-data";
import { connectedSystems } from "./connected-systems";
import { projects } from "./projects";

/** Systems that aren't fully healthy right now. Everything else is operational. */
const systemIssues: Record<string, { status: HealthState; note: string }> = {
  "kobo-toolbox": {
    status: "degraded",
    note: "3 timeouts in the last hour; responses averaging 8s.",
  },
};

/** Workflows that aren't fully healthy right now. */
const workflowIssues: Record<string, { status: HealthState; note: string; lastRun: string }> = {
  "client-dedup-workflow": {
    status: "down",
    note: "Failed on the last 3 runs with a duplicate-key error from DHIS2.",
    lastRun: "12 min ago",
  },
};

const systems: SystemStatus[] = connectedSystems.map((s) => ({
  id: s.id,
  name: s.name,
  status: systemIssues[s.id]?.status ?? "operational",
  note: systemIssues[s.id]?.note ?? "Responding normally.",
  linkTo: `/connected-systems/${s.id}`,
}));

const workflows: WorkflowStatus[] = projects.flatMap((p) =>
  p.components
    .filter((c) => c.type === "Workflow")
    .map((c) => ({
      id: c.id,
      name: c.name,
      project: p.name,
      projectId: p.id,
      status: workflowIssues[c.id]?.status ?? "operational",
      lastRun: workflowIssues[c.id]?.lastRun ?? "Within the last hour",
      note: workflowIssues[c.id]?.note ?? "Last run succeeded.",
    }))
);

export const statusData: StatusPageData = {
  pageType: "status",
  checkedAt: "1 minute ago",
  systems,
  workflows,
};

/** Systems and workflows that aren't operational, for the Overview. */
export const openIssues = {
  systems: systems.filter((s) => s.status !== "operational"),
  workflows: workflows.filter((w) => w.status !== "operational"),
};
