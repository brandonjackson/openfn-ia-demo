import type { Meta, StoryObj } from "@storybook/react";
import SelectionBar from "./SelectionBar";
import Button from "./Button";

const meta: Meta<typeof SelectionBar> = {
  title: "Primitives/SelectionBar",
  component: SelectionBar,
  args: { onClear: () => {} },
};

export default meta;
type Story = StoryObj<typeof SelectionBar>;

export const Default: Story = {
  args: {
    count: 3,
    noun: "work order",
    children: [
      <Button key="c" size="sm" variant="secondary" disabled>
        Cancel
      </Button>,
      <Button key="r" size="sm">
        Retry
      </Button>,
    ],
  },
};

export const One: Story = { args: { count: 1, noun: "user", children: <Button size="sm" variant="danger">Delete</Button> } };

/** With nothing selected the bar isn't drawn at all. */
export const NoneSelected: Story = { args: { count: 0, noun: "work order" } };
