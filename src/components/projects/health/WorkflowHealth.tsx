import { useState } from "react";
import {
  DEFAULT_HEALTH_DAYS,
  healthFor,
  type HealthRange,
  type WorkOrderStateCounts,
} from "../../../mock-data/workflow-health";
import HealthCard from "./HealthCard";
import { FailureBreakdownDonut, OutcomesDonut } from "./HealthDonuts";
import RangePicker from "./RangePicker";
import StepFailureBars from "./StepFailureBars";
import TriageTable from "./TriageTable";
import UnderlineTabs from "./UnderlineTabs";
import VolumeBars from "./VolumeBars";

type Tab = "Work orders" | "Runs";

const windowLabel = (days: HealthRange["days"]) => (days === "1" ? "24 hours" : `${days} days`);

const workOrders = (counts: WorkOrderStateCounts) => {
  const n = Object.values(counts).reduce((sum, c) => sum + c, 0);
  return `${n.toLocaleString()} work order${n === 1 ? "" : "s"}`;
};

/**
 * The workflow health page body (assets/js/health/WorkflowHealth.tsx): the
 * workflow name with a range picker, Work orders / Runs tabs over the
 * Outcomes, Failure breakdown and Steps with failures cards (or Runs over
 * time), and the triage table. Data comes from static fixtures per range.
 */
export default function WorkflowHealth({
  workflowId,
  projectId,
  workflowName,
  historyRetentionPeriod = null,
}: {
  workflowId: string;
  projectId: string;
  workflowName: string;
  historyRetentionPeriod?: number | null;
}) {
  const [days, setDays] = useState<HealthRange["days"]>(DEFAULT_HEALTH_DAYS);
  const [tab, setTab] = useState<Tab>("Work orders");
  const data = healthFor(workflowId, days);
  const historyHref = `/projects/${projectId}/history`;
  const empty = (noun = "finished work orders") => `No ${noun} in the last ${windowLabel(days)}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <h1 className="order-2 md:order-1 min-w-0 text-2xl font-semibold break-words text-gray-900">{workflowName}</h1>
        <div className="shrink-0 order-1 md:order-2">
          <RangePicker days={days} onChange={setDays} retentionDays={historyRetentionPeriod} />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <UnderlineTabs<Tab> tabs={["Work orders", "Runs"]} selected={tab} onSelect={setTab} label="Count by" />
        {tab === "Work orders" ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <HealthCard title="Outcomes" meta={workOrders(data.counts)}>
              <OutcomesDonut counts={data.counts} emptyMessage={empty()} historyHref={historyHref} />
            </HealthCard>
            <HealthCard title="Failure breakdown">
              <FailureBreakdownDonut counts={data.counts} emptyMessage={empty("failures")} historyHref={historyHref} />
            </HealthCard>
            <HealthCard title="Steps with failures">
              <StepFailureBars signatures={data.signatures} emptyMessage={empty("failures")} />
            </HealthCard>
          </div>
        ) : (
          <div>
            <HealthCard
              title="Runs over time"
              meta={`${data.bucketHours >= 24 ? "daily" : `${data.bucketHours}-hour`} buckets · ${data.timezone}`}
            >
              <VolumeBars
                buckets={data.buckets}
                hours={data.bucketHours}
                timezone={data.timezone}
                emptyMessage={empty("runs")}
              />
            </HealthCard>
          </div>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium tracking-wide text-gray-500 uppercase">Triage - grouped by failure type</h2>
        <div className="flex flex-col rounded-lg bg-white p-6 shadow">
          <TriageTable signatures={data.signatures} emptyMessage={empty("failures")} historyHref={historyHref} />
        </div>
      </section>
    </div>
  );
}
