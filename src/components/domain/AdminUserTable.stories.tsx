import type { Meta, StoryObj } from "@storybook/react";
import AdminUserTable from "./AdminUserTable";
import { adminUsers } from "../../fixtures/admin";

const meta: Meta<typeof AdminUserTable> = {
  title: "Domain/AdminUserTable",
  component: AdminUserTable,
  parameters: { layout: "padded" },
  args: {
    users: adminUsers,
    onEdit: () => {},
    onSetDisabled: () => {},
    onScheduleDeletion: () => {},
    onCancelDeletion: () => {},
    onDeleteNow: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof AdminUserTable>;

/** Superusers, a support user, a disabled account, and two accounts due to be deleted. */
export const Default: Story = {};

/** A search with no results. */
export const NoMatches: Story = { args: { users: [], emptyMessage: "No users match." } };
