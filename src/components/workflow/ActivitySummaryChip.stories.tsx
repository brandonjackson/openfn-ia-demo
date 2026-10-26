import type { Meta, StoryObj } from "@storybook/react";
import ActivitySummaryChip from "./ActivitySummaryChip";
import { runActivity, workOrders } from "../../mock-data/runs";
import { nationalIdWorkflow } from "../../mock-data/workflow";

const activity = runActivity(nationalIdWorkflow, workOrders);

const meta: Meta<typeof ActivitySummaryChip> = {
  title: "Workflow/ActivitySummaryChip",
  component: ActivitySummaryChip,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ActivitySummaryChip>;

export const Default: Story = { args: { activity, onViewRuns: () => {} } };
export const NoFailures: Story = { args: { activity: { ...activity, failed: 0 } } };
export const NoRuns: Story = { args: { activity: runActivity(nationalIdWorkflow, []), onViewRuns: () => {} } };
