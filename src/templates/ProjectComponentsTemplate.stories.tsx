import type { Meta, StoryObj } from "@storybook/react";
import ProjectComponentsTemplate from "./ProjectComponentsTemplate";
import { withRouterAt } from "../stories/decorators";
import { projects } from "../mock-data/projects";
import type { IANode } from "../ia-tree";

const node: IANode = {
  id: "components",
  label: "Components",
  description: "Every building block in this project, grouped by type.",
};

const project = projects[2];

const ancestors = [
  { node: { id: "projects", label: "Projects" }, path: "/projects" },
  { node: { id: project.id, label: project.name }, path: `/projects/${project.id}` },
];

const meta: Meta<typeof ProjectComponentsTemplate> = {
  title: "Templates/ProjectComponentsTemplate",
  component: ProjectComponentsTemplate,
  decorators: [withRouterAt(`/projects/${project.id}/components`)],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectComponentsTemplate>;

export const Default: Story = {
  args: {
    node,
    ancestors,
    currentPath: `/projects/${project.id}/components`,
    data: { pageType: "project-components", projectId: project.id, components: project.components },
  },
};

/** Every component type, including forms. */
export const AllTypes: Story = {
  args: {
    node,
    ancestors,
    currentPath: `/projects/${projects[0].id}/components`,
    data: { pageType: "project-components", projectId: projects[0].id, components: projects[0].components },
  },
};

export const Empty: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/projects/data-quality-checks/components",
    data: { pageType: "project-components", projectId: "data-quality-checks", components: [] },
  },
};
