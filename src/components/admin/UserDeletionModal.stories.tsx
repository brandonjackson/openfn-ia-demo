import type { Meta, StoryObj } from "@storybook/react";
import UserDeletionModal from "./UserDeletionModal";

const meta: Meta<typeof UserDeletionModal> = {
  title: "Admin/UserDeletionModal",
  component: UserDeletionModal,
  args: { open: true, onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof UserDeletionModal>;

export const Default: Story = {};
export const WithProjectActivity: Story = { args: { hasActivityInProjects: true } };
export const CurrentUser: Story = { args: { isCurrentUser: true } };
export const Blocked: Story = { args: { blocked: true } };
