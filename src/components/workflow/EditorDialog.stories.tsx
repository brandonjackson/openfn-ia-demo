import type { Meta, StoryObj } from "@storybook/react";
import EditorDialog from "./EditorDialog";

const meta: Meta<typeof EditorDialog> = {
  title: "Workflow/EditorDialog",
  component: EditorDialog,
  args: { open: true, onClose: () => {}, children: <p className="p-6 text-sm">Dialog body</p> },
};
export default meta;
type Story = StoryObj<typeof EditorDialog>;

export const Default: Story = {};
export const Wide: Story = { args: { className: "sm:max-w-2xl" } };
