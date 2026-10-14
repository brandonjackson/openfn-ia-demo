import type { Meta, StoryObj } from "@storybook/react";
import WorkOrderStatus from "./WorkOrderStatus";

const meta: Meta<typeof WorkOrderStatus> = {
  title: "Projects/WorkOrderStatus",
  component: WorkOrderStatus,
  args: { state: "success", updatedAt: new Date().toISOString() },
};
export default meta;
type Story = StoryObj<typeof WorkOrderStatus>;

export const Success: Story = {};
export const Failed: Story = { args: { state: "failed" } };
export const Running: Story = { args: { state: "running" } };
export const Crashed: Story = { args: { state: "crashed" } };
export const Nothing: Story = { args: { state: null } };
