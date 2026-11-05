import type { Meta, StoryObj } from "@storybook/react";
import RunCountBadge from "./RunCountBadge";
import { runActivity } from "../../model/runs";
import { workOrders } from "../../fixtures/runs";
import { nationalIdWorkflow } from "../../fixtures/workflow";

const activity = runActivity(nationalIdWorkflow, workOrders);

const meta: Meta<typeof RunCountBadge> = {
  title: "Domain/RunCountBadge",
  component: RunCountBadge,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof RunCountBadge>;

export const AllSucceeded: Story = { args: { activity: activity.nodes.confirm } };
export const SomeFailed: Story = { args: { activity: activity.nodes.create, onShowFailures: () => {} } };
export const SomeFailedReadOnly: Story = { args: { activity: activity.nodes.create } };
export const NeverReached: Story = { args: { activity: { runs: 0, failed: 0 } } };
