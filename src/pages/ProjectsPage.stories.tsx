import type { Meta, StoryObj } from "@storybook/react";
import ProjectsPage from "./ProjectsPage";
import { withRouter } from "../stories/decorators";
import { projectSummaries } from "../fixtures/projects";
import type { IANode } from "../model/ia-tree";

const node: IANode = {
  id: "projects",
  label: "Projects",
  description: "Every integration project in your organization.",
};

const ancestors = [{ node: { id: "root", label: "Home" }, path: "/" }];

const meta: Meta<typeof ProjectsPage> = {
  title: "Pages/ProjectsPage",
  component: ProjectsPage,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectsPage>;

export const Default: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/projects",
    data: { pageType: "projects", projects: projectSummaries },
  },
};

export const NoProjects: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/projects",
    data: { pageType: "projects", projects: [] },
  },
};
