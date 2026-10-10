import type { Meta, StoryObj } from "@storybook/react";
import StatusBadge from "./StatusBadge";

const meta: Meta<typeof StatusBadge> = {
  title: "Components/StatusBadge",
  component: StatusBadge,
  argTypes: {
    status: { control: "select", options: ["operational", "degraded", "down"] },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Operational: Story = { args: { status: "operational" } };
export const Degraded: Story = { args: { status: "degraded" } };
export const Down: Story = { args: { status: "down" } };
