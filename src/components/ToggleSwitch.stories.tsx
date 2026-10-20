import type { Meta, StoryObj } from "@storybook/react";
import ToggleSwitch from "./ToggleSwitch";

const meta: Meta<typeof ToggleSwitch> = {
  title: "Components/ToggleSwitch",
  component: ToggleSwitch,
};

export default meta;
type Story = StoryObj<typeof ToggleSwitch>;

export const Off: Story = {
  args: { checked: false },
};

export const On: Story = {
  args: { checked: true },
};

export const WithLabel: Story = {
  args: { checked: false, label: "Disable parallel execution" },
};
