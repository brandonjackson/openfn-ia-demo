import type { Meta, StoryObj } from "@storybook/react";
import ConnectionMethodBadge from "./ConnectionMethodBadge";

const meta: Meta<typeof ConnectionMethodBadge> = {
  title: "Domain/ConnectionMethodBadge",
  component: ConnectionMethodBadge,
  argTypes: { method: { control: "radio", options: ["direct", "xroad"] } },
};

export default meta;
type Story = StoryObj<typeof ConnectionMethodBadge>;

export const Direct: Story = { args: { method: "direct" } };

export const XRoad: Story = { args: { method: "xroad" } };
