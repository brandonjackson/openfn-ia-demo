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
