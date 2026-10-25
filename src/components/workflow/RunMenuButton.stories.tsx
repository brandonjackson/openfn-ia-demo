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

export const Default: Story = {};

export const MenuOpen: Story = { args: { defaultOpen: true } };

/** With an earlier run selected, the main action retries it. */
export const Retry: Story = {
  args: { retry: { step: "Create new citizen in Identity", hint: "Runs this input on v2, not v1" }, defaultOpen: true },
};

export const Disabled: Story = { args: { disabled: true } };
