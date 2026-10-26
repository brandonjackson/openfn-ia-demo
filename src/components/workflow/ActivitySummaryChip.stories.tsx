import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ActivitySummaryChip from "./ActivitySummaryChip";
import { runActivity, workOrders } from "../../mock-data/runs";
import type { ActivityPeriod } from "../../mock-data/runs";
import { nationalIdWorkflow } from "../../mock-data/workflow";

const activity = runActivity(nationalIdWorkflow, workOrders);

function WithPeriodPicker() {
  const [period, setPeriod] = useState<ActivityPeriod>("7d");
  return (
    <ActivitySummaryChip
      activity={runActivity(nationalIdWorkflow, workOrders, period)}
      onPeriodChange={setPeriod}
      onViewRuns={() => {}}
      onViewFailures={() => {}}
    />
  );
}

const meta: Meta<typeof ActivitySummaryChip> = {
  title: "Workflow/ActivitySummaryChip",
  component: ActivitySummaryChip,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ActivitySummaryChip>;

/** The period can be changed; the numbers follow it. */
export const WithPicker: Story = { render: () => <WithPeriodPicker /> };
export const FixedPeriod: Story = { args: { activity, onViewRuns: () => {} } };
export const NoFailures: Story = { args: { activity: { ...activity, failed: 0 }, onPeriodChange: () => {} } };
export const NoRuns: Story = { args: { activity: runActivity(nationalIdWorkflow, []), onPeriodChange: () => {}, onViewRuns: () => {} } };
