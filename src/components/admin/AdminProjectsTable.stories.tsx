import type { Meta, StoryObj } from "@storybook/react";
import AdminProjectsTable from "./AdminProjectsTable";
import { projects } from "../../mock-data/projects";
import { withRouter } from "../../stories/decorators";

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
  args: { projects: projects.map((p, i) => (i === 0 ? { ...p, members: [] } : p)) },
};
