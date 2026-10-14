import type { Meta, StoryObj } from "@storybook/react";
import StatePill, { ChannelStatePill } from "./StatePill";

const meta = { title: "History/StatePill", component: StatePill } satisfies Meta<typeof StatePill>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = { args: { state: "success" } };
export const Failed: Story = { args: { state: "failed" } };
export const Running: Story = { args: { state: "started" } };
export const Rejected: Story = { args: { state: "rejected" } };

export const AllStates: Story = {
  args: { state: "success" },
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(
        [
          "pending",
          "available",
          "claimed",
          "started",
          "success",
          "failed",
          "crashed",
          "cancelled",
          "killed",
          "exception",
          "lost",
          "rejected",
        ] as const
      ).map((s) => (
        <StatePill key={s} state={s} />
      ))}
    </div>
  ),
};

export const ChannelStates: Story = {
  args: { state: "success" },
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(["pending", "success", "failed", "timeout", "error"] as const).map((s) => (
        <ChannelStatePill key={s} state={s} />
      ))}
    </div>
  ),
};

export const ChannelTimeoutWithTooltip: Story = {
  args: { state: "success" },
  render: () => <ChannelStatePill state="timeout" title="Request timed out" />,
};
