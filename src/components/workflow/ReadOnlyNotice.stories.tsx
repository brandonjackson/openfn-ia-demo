import type { Meta, StoryObj } from "@storybook/react";
import ReadOnlyNotice from "./ReadOnlyNotice";

const meta: Meta<typeof ReadOnlyNotice> = {
  title: "Workflow/ReadOnlyNotice",
  component: ReadOnlyNotice,
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
  args: { onEditInSandbox: () => {} },
};

export default meta;
type Story = StoryObj<typeof ReadOnlyNotice>;

/** Pinned to the bottom of the canvas on main. */
export const Banner: Story = {};

/** The code pane's top-right corner on main. */
export const Tag: Story = { args: { variant: "tag", onEditInSandbox: undefined } };
