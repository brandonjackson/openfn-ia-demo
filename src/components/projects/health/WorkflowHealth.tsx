import { formatNumber } from "../../../utils/format";
import { useState } from "react";
import {
  DEFAULT_HEALTH_DAYS,
  healthFor,
  type HealthRange,
  type WorkOrderStateCounts,
} from "../../../mock-data/workflow-health";
import { FailureBreakdownDonut, OutcomesDonut } from "./HealthDonuts";
import RangePicker from "./RangePicker";
import StepFailureBars from "./StepFailureBars";
import TriageTable from "./TriageTable";
import Card from "../../Card";
import Heading from "../../Heading";
import Tabs from "../../Tabs";
import VolumeBars from "./VolumeBars";

type Tab = "Work orders" | "Runs";

const windowLabel = (days: HealthRange["days"]) => (days === "1" ? "24 hours" : `${days} days`);

const workOrders = (counts: WorkOrderStateCounts) => {
  const n = Object.values(counts).reduce((sum, c) => sum + c, 0);
  return `${formatNumber(n)} work order${n === 1 ? "" : "s"}`;
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
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
        <Heading as="h1" size="xl" className="order-2 min-w-0 break-words md:order-1">
          {workflowName}
        </Heading>
        <div className="order-1 shrink-0 md:order-2">
          <RangePicker days={days} onChange={setDays} retentionDays={historyRetentionPeriod} />
        </div>
      </div>

      <Tabs<Tab>
        tabs={[
          { id: "Work orders", label: "Work orders" },
          { id: "Runs", label: "Runs" },
        ]}
        active={tab}
        onChange={setTab}
        label="Count by"
        className="border-b-0"
      />
      {tab === "Work orders" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card padding="lg" title="Outcomes" action={meta(workOrders(data.counts))} className="flex flex-col">
            <OutcomesDonut counts={data.counts} emptyMessage={empty()} historyHref={historyHref} />
          </Card>
          <Card padding="lg" title="Failure breakdown" className="flex flex-col">
            <FailureBreakdownDonut counts={data.counts} emptyMessage={empty("failures")} historyHref={historyHref} />
          </Card>
          <Card padding="lg" title="Steps with failures" className="flex flex-col">
            <StepFailureBars signatures={data.signatures} emptyMessage={empty("failures")} />
          </Card>
        </div>
      ) : (
        <Card
          padding="lg"
          title="Runs over time"
          action={meta(`${data.bucketHours >= 24 ? "daily" : `${data.bucketHours}-hour`} buckets · ${data.timezone}`)}
        >
          <VolumeBars buckets={data.buckets} hours={data.bucketHours} timezone={data.timezone} emptyMessage={empty("runs")} />
        </Card>
      )}

      <section className="space-y-3">
        <Heading as="h2" size="eyebrow">
          Triage - grouped by failure type
        </Heading>
        <TriageTable signatures={data.signatures} emptyMessage={empty("failures")} historyHref={historyHref} />
      </section>
    </div>
  );
}

/** The small gray note at the right of a card's title. */
const meta = (text: string) => <span className="text-xs text-gray-500">{text}</span>;
