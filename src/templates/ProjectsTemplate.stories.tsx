import type { Meta, StoryObj } from "@storybook/react";
import ProjectsTemplate from "./ProjectsTemplate";
import { withRouter } from "../stories/decorators";
import { projectSummaries } from "../mock-data/projects";
import type { IANode } from "../ia-tree";

const node: IANode = {
  id: "projects",
  label: "Projects",
  description: "Every integration project in your organization.",
};

const ancestors = [{ node: { id: "root", label: "Home" }, path: "/" }];

const meta: Meta<typeof ProjectsTemplate> = {
  title: "Templates/ProjectsTemplate",
  component: ProjectsTemplate,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectsTemplate>;

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
