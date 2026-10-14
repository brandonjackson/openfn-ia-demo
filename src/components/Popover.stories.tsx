import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";
import { Checkbox } from "./Inputs";
import Popover from "./Popover";

const meta: Meta<typeof Popover> = {
  title: "Shared/Popover",
  component: Popover,
  decorators: [(Story) => <div className="p-8 pb-64"><Story /></div>],
  args: {
    trigger: (
      <Button theme="secondary">
        Status <span className="hero-chevron-down h-4 w-4" />
      </Button>
    ),
    className: "w-60 px-4 py-3",
    children: (
      <div className="space-y-2">
        <Checkbox label="Pending" />
        <Checkbox label="Running" defaultChecked />
        <Checkbox label="Success" />
        <Checkbox label="Failed" defaultChecked />
      </div>
    ),
  },
};
export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {};
export const AlignedEnd: Story = { args: { align: "end" } };
export const WithClose: Story = {
  args: {
    children: (close: () => void) => (
      <div className="space-y-3 text-sm text-gray-700">
        <p>Panels can close themselves once a choice is made.</p>
        <Button size="sm" onClick={close}>
          Apply
        </Button>
      </div>
    ),
  },
};
/** `panelProps` reach the portalled panel, so the annotations panel can find its `data-annotation`. */
export const WithPanelProps: Story = { args: { panelProps: { "data-annotation": "history-filter-chip" } } };
