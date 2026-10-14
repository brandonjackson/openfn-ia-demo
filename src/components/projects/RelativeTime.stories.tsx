import type { Meta, StoryObj } from "@storybook/react";
import RelativeTime from "./RelativeTime";

const meta: Meta<typeof RelativeTime> = {
  title: "Projects/RelativeTime",
  component: RelativeTime,
  args: { datetime: new Date().toISOString() },
};
export default meta;
type Story = StoryObj<typeof RelativeTime>;

export const Today: Story = {};
export const Yesterday: Story = { args: { datetime: new Date(Date.now() - 86_400_000).toISOString() } };
export const ThisYear: Story = { args: { datetime: "2026-03-12T10:00:00Z" } };
export const LastYear: Story = { args: { datetime: "2024-03-12T10:00:00Z" } };
