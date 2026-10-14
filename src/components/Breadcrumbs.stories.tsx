import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb, Breadcrumbs } from "./Breadcrumbs";
import ProjectBreadcrumbs from "./ProjectBreadcrumbs";
import { projects } from "../mock-data/projects";
import { withRouter } from "../stories/decorators";

const meta: Meta = { title: "Shell/Breadcrumbs", decorators: [withRouter] };
export default meta;
type Story = StoryObj;

export const Plain: Story = {
  render: () => (
    <Breadcrumbs>
      <Breadcrumb to="/settings/users">Users</Breadcrumb>
      <Breadcrumb>Amy Admin</Breadcrumb>
    </Breadcrumbs>
  ),
};

export const Project: Story = {
  render: () => (
    <ProjectBreadcrumbs
      project={projects[0]}
      items={[["History", `/projects/${projects[0].id}/history`]]}
      current="Run 962b650f"
    />
  ),
};

export const Sandbox: Story = {
  render: () => <ProjectBreadcrumbs project={projects[2]} current="Workflows" />,
};
