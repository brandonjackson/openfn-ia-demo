import type { Meta, StoryObj } from "@storybook/react";
import AlertDialog from "./AlertDialog";

const meta: Meta<typeof AlertDialog> = {
  title: "Workflow/AlertDialog",
  component: AlertDialog,
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    title: "Delete Job?",
    description: 'This will permanently remove "Notify CHW upload failed" from the workflow. This action cannot be undone.',
    confirmLabel: "Delete Job",
    variant: "danger",
  },
};
export default meta;
type Story = StoryObj<typeof AlertDialog>;

export const DeleteJob: Story = {};
export const ResetWorkflow: Story = {
  args: {
    title: "Reset Workflow?",
    description: "This will undo all uncommitted changes and restore the workflow to its latest snapshot. This action cannot be undone.",
    confirmLabel: "Reset Workflow",
  },
};
