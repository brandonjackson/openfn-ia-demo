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

/** Just the icon, for a canvas card's head. */
export const Compact: Story = {
  render: () => (
    <div className="flex gap-2">
      <ConnectionMethodBadge method="direct" compact />
      <ConnectionMethodBadge method="xroad" compact />
    </div>
  ),
};
