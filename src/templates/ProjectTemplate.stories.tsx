import type { Meta, StoryObj } from "@storybook/react";
import ProjectTemplate from "./ProjectTemplate";
import { withRouterAt } from "../stories/decorators";
import type { IANode } from "../ia-tree";
import type { ProjectPageData } from "../page-data";
import { projects } from "../mock-data/projects";
import { buildIdeas } from "../mock-data/build-ideas";
import { buildProjectOverviewTiles } from "../mock-data/insights";

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
  pageType: "project",
  projectId: project.id,
  tiles: buildProjectOverviewTiles(project.id, 3),
  ideas: buildIdeas,
  services: project.services,
  components: project.components,
};

const meta: Meta<typeof ProjectTemplate> = {
  title: "Templates/ProjectTemplate",
  component: ProjectTemplate,
  decorators: [withRouterAt(`/projects/${project.id}`)],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectTemplate>;

export const Default: Story = {
  args: {
    node,
    ancestors,
    currentPath: `/projects/${project.id}`,
    data: projectData,
  },
};

/** A brand new project: no runs yet, nothing published, no components. */
export const EmptyProject: Story = {
  args: {
    node: { id: "new-project", label: "New Project", description: "A brand new project with nothing in it yet." },
    ancestors,
    currentPath: "/projects/new-project",
    data: {
      pageType: "project",
      projectId: "new-project",
      tiles: buildProjectOverviewTiles("new-project", 0),
      ideas: buildIdeas,
      services: [],
      components: [],
    },
  },
};
