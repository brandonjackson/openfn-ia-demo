import type { Meta, StoryObj } from "@storybook/react";
import StatusDot from "./StatusDot";

const meta: Meta<typeof StatusDot> = {
  title: "Primitives/StatusDot",
  component: StatusDot,
};

export default meta;
type Story = StoryObj<typeof StatusDot>;

/** Grey, e.g. paused. */
export const Default: Story = {};

/** Green, e.g. live. */
export const Green: Story = { args: { tone: "green" } };

export const Amber: Story = { args: { tone: "amber" } };

export const Red: Story = { args: { tone: "red" } };
