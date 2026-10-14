import type { Meta, StoryObj } from "@storybook/react";
import Header from "./Header";
import Button from "./Button";
import ProjectBreadcrumbs from "./shell/ProjectBreadcrumbs";
import { projects } from "../mock-data/projects";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof Header> = { title: "Shell/Header", component: Header, decorators: [withRouter] };
export default meta;
type Story = StoryObj<typeof Header>;

export const Title: Story = { args: { title: "Projects" } };
export const WithAction: Story = {
  args: { title: "Personal Access Tokens", children: <Button>Generate New Token</Button> },
};
export const WithBreadcrumbs: Story = {
  args: { breadcrumbs: <ProjectBreadcrumbs project={projects[0]} current="History" /> },
};
export const LoggedOut: Story = { args: { title: "Log in", loggedOut: true } };
