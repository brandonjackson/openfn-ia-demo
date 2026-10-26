import type { Meta, StoryObj } from "@storybook/react";
import EditorStatusBar from "./EditorStatusBar";

const meta: Meta<typeof EditorStatusBar> = {
  title: "Workflow/EditorStatusBar",
  component: EditorStatusBar,
  decorators: [
    (Story) => (
      <div className="w-[720px] border border-gray-200">
        <Story />
      </div>
    ),
  ],
  args: { items: ["common@2.1", "Map fields"], trailing: ["7 lines", "Saved"] },
};

export default meta;
type Story = StoryObj<typeof EditorStatusBar>;

export const Default: Story = {};

export const Unsaved: Story = {
  args: { trailing: ["Tested by the assistant", "12 lines", "Unsaved changes"] },
};

export const ReadOnly: Story = {
  args: { items: ["http@7.3", "Search for duplicate citizens"], trailing: ["Read-only"] },
};
