import type { Meta, StoryObj } from "@storybook/react";
import RunCountBadge from "./RunCountBadge";
import { runActivity, workOrders } from "../../mock-data/runs";
import { nationalIdWorkflow } from "../../mock-data/workflow";

const activity = runActivity(nationalIdWorkflow, workOrders);

const meta: Meta<typeof RunCountBadge> = {
  title: "Workflow/RunCountBadge",
  component: RunCountBadge,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof RunCountBadge>;

export const AllSucceeded: Story = { args: { activity: activity.nodes.confirm } };
export const SomeFailed: Story = { args: { activity: activity.nodes.create, onShowFailures: () => {} } };
export const SomeFailedReadOnly: Story = { args: { activity: activity.nodes.create } };
export const NeverReached: Story = { args: { activity: { runs: 0, failed: 0 } } };
