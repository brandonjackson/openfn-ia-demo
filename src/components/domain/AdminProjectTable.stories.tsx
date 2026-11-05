import type { Meta, StoryObj } from "@storybook/react";
import AdminProjectTable from "./AdminProjectTable";
import { adminUsers, instanceProjects } from "../../fixtures/admin";

const meta: Meta<typeof AdminProjectTable> = {
  title: "Domain/AdminProjectTable",
  component: AdminProjectTable,
  parameters: { layout: "padded" },
  args: {
    projects: instanceProjects,
    users: adminUsers,
    onEdit: () => {},
    onScheduleDeletion: () => {},
    onCancelDeletion: () => {},
    onDeleteNow: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof AdminProjectTable>;

/** Every project, one of them due to be deleted. */
export const Default: Story = {};

/** A project whose owner has gone. */
export const WithoutOwner: Story = {
  args: { projects: [{ ...instanceProjects[0], members: instanceProjects[0].members.filter((m) => m.role !== "owner") }] },
};

export const NoMatches: Story = { args: { projects: [], emptyMessage: "No projects match." } };
