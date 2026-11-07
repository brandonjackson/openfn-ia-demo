import type { Meta, StoryObj } from "@storybook/react";
import ProjectPage from "./ProjectPage";
import { withRouterAt } from "../../stories/decorators";
import type { IANode } from "../../model/ia-tree";
import type { ProjectPageData } from "./ProjectPage";
import { activityTiles, workOrderActivity } from "../../model/runs";
import { projects } from "../../fixtures/projects";
import { projectHistory, projectWorkflowItems } from "../../fixtures/workflow-lookup";

const project = projects[0];

const node: IANode = {
  id: project.id,
  label: project.name,
  description: project.description,
};

const ancestors = [
  { node: { id: "root", label: "Home" }, path: "/" },
  { node: { id: "projects", label: "Projects" }, path: "/projects" },
];

const projectData: ProjectPageData = {
  projectId: project.id,
  tiles: activityTiles(workOrderActivity(projectHistory(project), "30d"), "30d", `/projects/${project.id}/history`),
  workflows: projectWorkflowItems(project),
  services: project.services,
  components: project.components,
};

const meta: Meta<typeof ProjectPage> = {
  title: "Pages/ProjectPage",
  component: ProjectPage,
  args: { onNewWorkflow: () => {} },
  decorators: [withRouterAt(`/projects/${project.id}`)],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectPage>;

export const Default: Story = {
  args: {
    node,
    ancestors,
    currentPath: `/projects/${project.id}`,
    data: projectData,
  },
};

/** A brand new project: no runs yet, no workflows, nothing published, no components. */
export const EmptyProject: Story = {
  args: {
    node: { id: "new-project", label: "New Project", description: "A brand new project with nothing in it yet." },
    ancestors,
    currentPath: "/projects/new-project",
    data: {
          projectId: "new-project",
      tiles: activityTiles(workOrderActivity([], "30d"), "30d", "/projects/new-project/history"),
      workflows: [],
      services: [],
      components: [],
    },
  },
};

/** With every feature flag off: how the project's running and its workflows, with no services or components. */
export const Redesign: Story = {
  args: { ...Default.args, data: { ...projectData, services: undefined, components: undefined } },
};
