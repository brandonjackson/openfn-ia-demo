import type { Meta, StoryObj } from "@storybook/react";
import PlainSwitch from "./PlainSwitch";

const meta: Meta<typeof PlainSwitch> = {
  title: "Project settings/PlainSwitch",
  component: PlainSwitch,
  args: { checked: false },
};
export default meta;
type Story = StoryObj<typeof PlainSwitch>;

export const Off: Story = {};
export const On: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true, tooltip: "You do not have permission to perform this action" } };
