import type { Meta, StoryObj } from "@storybook/react";
import ConfirmModal from "./ConfirmModal";

const meta: Meta<typeof ConfirmModal> = {
  title: "Primitives/ConfirmModal",
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

/** The person types the account's email before the button wakes up, as when deleting a user. */
export const TypeToConfirm: Story = {
  args: {
    title: "Delete user",
    confirmLabel: "Schedule deletion",
    confirmText: "lokafor@example.org",
    confirmTextLabel: "Type the user's email to confirm",
    children: (
      <p>
        Lena Okafor's account and credential data will be deleted 7 days from today. Make sure none of their credentials
        are used in production workflows.
      </p>
    ),
  },
};

export const Primary: Story = {
  args: { title: "Discard changes?", confirmLabel: "Discard", tone: "primary", children: <p>Your unsaved edits will be lost.</p> },
};
