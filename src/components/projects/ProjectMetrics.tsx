import type { ProjectMetrics as Metrics } from "../../mock-data/dashboard-stats";
import MetricCard from "./MetricCard";
import TextLink from "../TextLink";

/**
 * The four stat cards on the workflows index (DashboardComponents
 * .project_metrics): Work Orders, Runs, Successful Runs, and Work Orders in
 * failed state, each over the last 30 days.
 */
export default function ProjectMetrics({ metrics, projectId }: { metrics: Metrics; projectId: string }) {
  const history = `/projects/${projectId}/history`;
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Work Orders"
        value={metrics.workOrders.total}
        suffix={<TextLink to={history}>{metrics.workOrders.pending} pending</TextLink>}
      />
      <MetricCard title="Runs" value={metrics.runs.total} suffix={`${metrics.runs.pending} pending`} />
      <MetricCard
        title="Successful Runs"
        value={metrics.runs.success}
        suffix={`${metrics.runs.successRate.toFixed(1)}%`}
      />
      <MetricCard
        title="Work Orders in failed state"
        value={metrics.workOrders.failed}
        suffix={`${metrics.workOrders.failedPercentage.toFixed(1)}%`}
        link={<TextLink to={history}>View all</TextLink>}
      />
    </div>
  );
}
