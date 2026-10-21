import type { Meta, StoryObj } from "@storybook/react";
import StatusPill from "./StatusPill";

const meta: Meta<typeof StatusPill> = {
  title: "Workflow/StatusPill",
  component: StatusPill,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof StatusPill>;

export const Success: Story = { args: { status: "success" } };
export const Failed: Story = { args: { status: "failed" } };
export const Running: Story = { args: { status: "running" } };
export const Pending: Story = { args: { status: "pending" } };

export const AllStatuses: Story = {
  render: () => (
    <div className="flex gap-2">
      <StatusPill status="success" />
      <StatusPill status="failed" />
      <StatusPill status="running" />
      <StatusPill status="pending" />
    </div>
  ),
};

/** The compact dot used in history rows. */
export const Dots: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <StatusPill status="success" variant="dot" />
      <StatusPill status="failed" variant="dot" />
      <StatusPill status="running" variant="dot" />
      <StatusPill status="pending" variant="dot" />
    </div>
  ),
};
