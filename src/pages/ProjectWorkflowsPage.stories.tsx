import type { Meta, StoryObj } from "@storybook/react";
import ProjectWorkflowsPage from "./ProjectWorkflowsPage";
import { withRouterAt } from "../stories/decorators";
import { projects } from "../fixtures/projects";
import { projectWorkflowItems } from "../fixtures/workflow-lookup";
import type { IANode } from "../model/ia-tree";

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

const meta: Meta<typeof ProjectWorkflowsPage> = {
  title: "Pages/ProjectWorkflowsPage",
  component: ProjectWorkflowsPage,
  args: { onNewWorkflow: () => {}, onToggleWorkflow: async () => {}, onDeleteWorkflow: async () => {} },
  decorators: [withRouterAt("/projects/malawi-chw-referrals/workflows")],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectWorkflowsPage>;

export const Default: Story = {
  args: {
    node,
    ancestors,
    currentPath: `/projects/${project.id}/workflows`,
    data: {
      pageType: "project-workflows",
      projectId: project.id,
      workflows: projectWorkflowItems(project),
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

/** For a viewer: the wrapper leaves out toggling and deleting, so the rows have neither. */
export const ReadOnly: Story = {
  args: { ...Default.args, onToggleWorkflow: undefined, onDeleteWorkflow: undefined },
};
