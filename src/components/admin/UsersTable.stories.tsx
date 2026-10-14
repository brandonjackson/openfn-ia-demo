import type { Meta, StoryObj } from "@storybook/react";
import UsersTable from "./UsersTable";
import { users } from "../../mock-data/users";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof UsersTable> = {
  title: "Admin/UsersTable",
  component: UsersTable,
  decorators: [withRouter],
  args: { users },
};
export default meta;
type Story = StoryObj<typeof UsersTable>;

export const Default: Story = {};
export const ScheduledDeletion: Story = {
  args: {
    users: users.map((u) => (u.id === "user-vikram" ? { ...u, scheduledDeletion: "2026-10-21T09:00:00Z" } : u)),
  },
};
export const Empty: Story = { args: { users: [] } };
