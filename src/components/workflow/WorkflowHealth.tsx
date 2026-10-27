import type { RunDetails } from "../../mock-data/workflow";
import type { ActivityPeriod, WorkflowHealth as Health } from "../../mock-data/runs";
import { activityPeriodLabel } from "../../mock-data/runs";
import Card from "../Card";
import StatTile from "../StatTile";
import BarChart from "../BarChart";
import Donut from "../Donut";
import ProgressBar from "../ProgressBar";
import SectionHeading from "../SectionHeading";
import PeriodPicker from "./PeriodPicker";
import FailureBreakdown from "./FailureBreakdown";
import { AdaptorIcon } from "./AdaptorIcon";

/**
 * The workflow's Health page, opened from the code view's explorer and shown
 * in the main pane in the code's place: how the workflow has been doing over a period,
 * across every version and however its runs started. Headline figures,
 * work orders by outcome, runs and failures over time, the steps runs
 * failed at, and the failures grouped by reason for triage, where opening a
 * reason lists its runs and picking one loads it. The period is the same
 * one the canvas's runs bar uses. It lays itself out by its own width, so
 * it fits beside the explorer and details column.
 */
export default function WorkflowHealth({
  health,
  onPeriodChange,
  selectedRunId,
  latestVersion,
  onSelectRun,
}: {
  health: Health;
  onPeriodChange: (period: ActivityPeriod) => void;
  selectedRunId?: string;
  latestVersion?: string;
  onSelectRun?: (run: RunDetails) => void;
}) {
  const { workOrders, runs, period } = health;
  const span = activityPeriodLabel(period).toLowerCase();
  const finished = workOrders.succeeded + workOrders.failed;
  const successRate = finished > 0 ? `${Math.round((workOrders.succeeded / finished) * 100)}%` : "–";
  const mostFailed = Math.max(0, ...health.steps.map((s) => s.failed));

  return (
    <div className="@container h-full overflow-y-auto bg-gray-50">
      <div className="mx-auto max-w-6xl space-y-6 px-6 pb-10 pt-4">
        <SectionHeading
          title="Health"
          description={`Every run of this workflow in the ${span}, on any version.`}
          action={<PeriodPicker value={period} onChange={onPeriodChange} />}
        />

        <div className="grid grid-cols-2 gap-4 @4xl:grid-cols-4">
          <StatTile label="Work orders" value={String(workOrders.total)} detail={workOrders.running > 0 ? `${workOrders.running} still running` : undefined} />
          <StatTile label="Success rate" value={successRate} detail={`of ${finished} finished work orders`} />
          <StatTile label="Runs" value={String(runs.total)} detail="including retries" />
          <StatTile label="Failed runs" value={String(runs.failed)} danger={runs.failed > 0} />
        </div>

        <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-3">
          <Card title="Outcomes" description="Work orders by how their latest run ended.">
            <Donut
              slices={[
                { key: "success", label: "Success", value: workOrders.succeeded, fillClassName: "fill-green-600", dotClassName: "bg-green-600" },
                { key: "failed", label: "Failed", value: workOrders.failed, fillClassName: "fill-red-500", dotClassName: "bg-red-500" },
              ]}
              centre={{ value: successRate, label: "success" }}
              emptyMessage={`No finished work orders in the ${span}`}
            />
          </Card>
          <Card title="Runs" description="Every run, successful or not." className="@3xl:col-span-2">
            <BarChart unit="runs" per={health.per} data={health.buckets.map((b) => ({ label: b.label, tick: b.tick, value: b.runs }))} />
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-3">
          <Card title="Steps with failures" description="Where runs failed, most first.">
            {health.steps.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No failures in the {span}</p>
            ) : (
              <ul className="space-y-4">
                {health.steps.map((s) => (
                  <li key={s.jobId}>
                    <div className="mb-1.5 flex items-center gap-2 text-sm">
                      {s.adaptor && <AdaptorIcon adaptor={s.adaptor} size="xs" />}
                      <span className="min-w-0 flex-1 truncate text-gray-900" title={s.label}>
                        {s.label}
                      </span>
                      <span className="flex-shrink-0 font-medium tabular-nums text-red-600">{s.failed}</span>
                    </div>
                    <ProgressBar value={s.failed} max={mostFailed} tone="red" />
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Failed runs" description="Runs that ended in failure." className="@3xl:col-span-2">
            <BarChart
              unit="failed runs"
              per={health.per}
              barClassName="bg-red-500"
              data={health.buckets.map((b) => ({ label: b.label, tick: b.tick, value: b.failed }))}
            />
          </Card>
        </div>

        <section>
          <SectionHeading variant="label" title="Triage" description="Failures grouped by reason. Open one to see its runs; pick a run to load it at the step it failed." />
          <Card flush>
            <FailureBreakdown
              key={period}
              reasons={health.reasons}
              period={period}
              selectedRunId={selectedRunId}
              latestVersion={latestVersion}
              onSelectRun={onSelectRun}
            />
          </Card>
        </section>
      </div>
    </div>
  );
}
