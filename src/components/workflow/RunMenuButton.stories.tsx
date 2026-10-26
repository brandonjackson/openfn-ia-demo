import type { Meta, StoryObj } from "@storybook/react";
import RunMenuButton from "./RunMenuButton";

const meta: Meta<typeof RunMenuButton> = {
  title: "Workflow/RunMenuButton",
  component: RunMenuButton,
  decorators: [
    (Story) => (
      <div className="flex h-64 justify-end p-4">
        <Story />
      </div>
    ),
  ],
  args: { onRun: () => {}, onRunWithCustomInput: () => {}, onRetry: () => {} },
};

export default meta;
type Story = StoryObj<typeof RunMenuButton>;

/** Nothing loaded. */
export const Default: Story = {};

/** A step open, no run loaded. */
export const FromStep: Story = {
  args: { fromStep: "Create new citizen in Identity", onRunFromStep: () => {}, defaultOpen: true },
};

/** A run loaded, no step in focus. */
export const RetryRun: Story = { args: { retry: {} } };

export const MenuOpen: Story = { args: { defaultOpen: true } };

/** A step open and a run loaded that reached it. */
export const RetryFromStep: Story = {
  args: { retry: { step: "Create new citizen in Identity", hint: "Runs this input on v2, not v1" }, defaultOpen: true },
};

export const Disabled: Story = { args: { disabled: true } };
