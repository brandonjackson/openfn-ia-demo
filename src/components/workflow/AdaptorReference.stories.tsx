import type { Meta, StoryObj } from "@storybook/react";
import AdaptorReference from "./AdaptorReference";

const meta: Meta<typeof AdaptorReference> = {
  title: "Workflow/AdaptorReference",
  component: AdaptorReference,
  parameters: { layout: "padded" },
  args: { adaptor: "http" },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }} className="rounded-xl border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AdaptorReference>;

/** On main: snippets can be copied. */
export const ReadOnly: Story = {};

/** In a sandbox: snippets can be inserted into the open step. */
export const Editable: Story = { args: { adaptor: "postgresql", onInsert: () => {} } };

export const Common: Story = { args: { adaptor: "common", onInsert: () => {} } };

export const NoStepOpen: Story = { args: { adaptor: undefined } };
