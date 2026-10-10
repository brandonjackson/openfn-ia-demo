import type { Meta, StoryObj } from "@storybook/react";
import ProjectWorkflowsTemplate from "./ProjectWorkflowsTemplate";
import { withRouter } from "../stories/decorators";
import { projects } from "../mock-data/projects";
import type { IANode } from "../ia-tree";

const node: IANode = {
  id: "workflows",
  label: "Workflows",
  description: "Every workflow in this project.",
};

const project = projects[2];

const ancestors = [
  { node: { id: "projects", label: "Projects" }, path: "/projects" },
  { node: { id: project.id, label: project.name }, path: `/projects/${project.id}` },
];

const meta: Meta<typeof ProjectWorkflowsTemplate> = {
  title: "Templates/ProjectWorkflowsTemplate",
  component: ProjectWorkflowsTemplate,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectWorkflowsTemplate>;

export const Default: Story = {
  args: {
    node,
    ancestors,
    currentPath: `/projects/${project.id}/workflows`,
    data: {
      pageType: "project-workflows",
      projectId: project.id,
      workflows: project.components.filter((c) => c.type === "Workflow"),
    },
  },
};

export const Empty: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/projects/data-quality-checks/workflows",
    data: { pageType: "project-workflows", projectId: "data-quality-checks", workflows: [] },
  },
};
