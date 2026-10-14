import type { Meta, StoryObj } from "@storybook/react";
import NewRunButton from "./NewRunButton";

const meta: Meta<typeof NewRunButton> = {
  title: "Workflow/NewRunButton",
  component: NewRunButton,
  args: { onClick: () => {} },
};
export default meta;
type Story = StoryObj<typeof NewRunButton>;

export const Split: Story = { args: { onRunWithCustomInputClick: () => {} } };
export const RunFromHere: Story = { args: { text: "Run From Here" } };
export const Secondary: Story = { args: { text: "Run From Here", variant: "secondary" } };
export const Disabled: Story = { args: { onRunWithCustomInputClick: () => {}, disabled: true } };
export const Processing: Story = { args: { isRunning: true } };
