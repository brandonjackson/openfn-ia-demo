import type { Meta, StoryObj } from "@storybook/react";
import AdminProjectForm from "./AdminProjectForm";
import { projects } from "../../mock-data/projects";
import { users } from "../../mock-data/users";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof AdminProjectForm> = {
  title: "Admin/AdminProjectForm",
  component: AdminProjectForm,
  decorators: [withRouter],
  args: { users },
};
export default meta;
type Story = StoryObj<typeof AdminProjectForm>;

export const New: Story = {};
export const Edit: Story = { args: { project: projects[0] } };
