import type { Meta, StoryObj } from "@storybook/react";
import ConfirmModal from "./ConfirmModal";

const meta: Meta<typeof ConfirmModal> = {
  title: "Components/ConfirmModal",
  component: ConfirmModal,
  parameters: { layout: "fullscreen" },
  args: { open: true, onClose: () => {}, onConfirm: () => {} },
};

export default meta;
type Story = StoryObj<typeof ConfirmModal>;

export const DeleteWorkflow: Story = {
  args: {
    title: "Delete workflow?",
    confirmLabel: "Delete workflow",
    children: (
      <>
        <p>
          <strong>Apply for a national ID</strong> and its run history will be removed from Project A.
        </p>
        <p>This can't be undone.</p>
      </>
    ),
  },
};

export const Primary: Story = {
  args: { title: "Discard changes?", confirmLabel: "Discard", tone: "primary", children: <p>Your unsaved edits will be lost.</p> },
};
