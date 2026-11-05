import type { Meta, StoryObj } from "@storybook/react";
import ProjectPage from "./ProjectPage";
import { withRouterAt } from "../stories/decorators";
import type { IANode } from "../model/ia-tree";
import type { ProjectPageData } from "../model/page-data";
import { projects } from "../fixtures/projects";
import { buildProjectOverviewTiles } from "../fixtures/insights";

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
  services: project.services,
  components: project.components,
};

const meta: Meta<typeof ProjectPage> = {
  title: "Pages/ProjectPage",
  component: ProjectPage,
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
          services: [],
      components: [],
    },
  },
};

/** With every feature flag off: just how the project's running, with no services or components. */
export const Redesign: Story = {
  args: { ...Default.args, data: { ...projectData, services: undefined, components: undefined } },
};
