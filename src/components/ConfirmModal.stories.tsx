import type { Meta, StoryObj } from "@storybook/react";
import ConfirmModal from "./ConfirmModal";

const meta: Meta<typeof ConfirmModal> = {
  title: "Shared/ConfirmModal",
  component: ConfirmModal,
  args: {
    open: true,
    onClose: () => {},
    onConfirm: () => {},
    title: "Run selected work orders",
    confirmLabel: "Rerun 3 work orders",
    children: <p>This will create new runs for 3 work orders, starting from their first step.</p>,
  },
};
export default meta;
type Story = StoryObj<typeof ConfirmModal>;

export const Default: Story = {};
export const Danger: Story = {
  args: {
    title: "Delete credential",
    tone: "danger",
    confirmLabel: "Delete",
    children: <p>This credential will be removed from every project that uses it. This can't be undone.</p>,
  },
};
export const ConfirmDisabled: Story = { args: { confirmDisabled: true } };
/** Type-to-confirm: the button enables once the text matches. */
export const TypeToConfirm: Story = {
  args: {
    title: "Delete project",
    tone: "danger",
    confirmLabel: "Delete project",
    formId: "scheduled_deletion_form",
    confirmation: {
      id: "project_name_confirmation",
      label: "Project name",
      expected: "openhie-project",
      mismatchError: "doesn't match the project name",
    },
    children: (
      <p>
        Enter the project name to confirm deletion: <b>openhie-project</b>
      </p>
    ),
  },
};
/** Collects the text without checking it (the server does). */
export const CollectOnly: Story = {
  args: {
    title: "Delete user",
    tone: "danger",
    confirmLabel: "Delete account",
    confirmation: { id: "scheduled_deletion_email", label: "User email" },
    children: <p>This user's account and credential data will be deleted.</p>,
  },
};
