import type { Meta, StoryObj } from "@storybook/react";
import RunRetryButton from "./RunRetryButton";

const meta: Meta<typeof RunRetryButton> = {
  title: "Workflow/RunRetryButton",
  component: RunRetryButton,
  decorators: [(Story) => <div className="h-32 p-4 flex justify-end"><Story /></div>],
  args: { isRetryable: false, onRun: () => {}, onRetry: () => {} },
};
export default meta;
type Story = StoryObj<typeof RunRetryButton>;

export const Run: Story = {};
export const Retry: Story = { args: { isRetryable: true } };
export const Disabled: Story = { args: { disabled: true } };
