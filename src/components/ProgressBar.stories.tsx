import type { Meta, StoryObj } from "@storybook/react";
import ProgressBar from "./ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: { value: 4, max: 10 },
};

export const WithCount: Story = {
  args: { value: 4, max: 10, showCount: true },
};

export const Complete: Story = {
  args: { value: 10, max: 10, showCount: true },
};
