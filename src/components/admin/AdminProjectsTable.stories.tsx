import type { Meta, StoryObj } from "@storybook/react";
import AdminProjectsTable from "./AdminProjectsTable";
import { adminProjectRows } from "../../mock-data/admin";
import { withRouter } from "../../stories/decorators";

const projects = adminProjectRows();

const meta: Meta<typeof AdminProjectsTable> = {
  title: "Admin/AdminProjectsTable",
  component: AdminProjectsTable,
  decorators: [withRouter],
  args: { projects },
};
export default meta;
type Story = StoryObj<typeof AdminProjectsTable>;

export const Default: Story = {};
export const NoOwner: Story = {
  args: { projects: projects.map((p, i) => (i === 0 ? { ...p, ownerName: "" } : p)) },
};
export const ScheduledForDeletion: Story = {
  args: { projects: projects.map((p, i) => (i === 0 ? { ...p, scheduledDeletion: "2026-10-22T09:00:00Z" } : p)) },
};
