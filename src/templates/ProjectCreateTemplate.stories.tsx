import type { Meta, StoryObj } from "@storybook/react";
import ProjectCreateTemplate from "./ProjectCreateTemplate";
import { withRouterAt } from "../stories/decorators";
import { projects } from "../mock-data/projects";
import { buildCreatePageData } from "../mock-data/build-ideas";
import type { IANode } from "../ia-tree";

const node: IANode = {
  id: "create",
  label: "Create",
  description: "Start something new from an idea.",
};

const project = projects[0];

const ancestors = [
  { node: { id: "projects", label: "Projects" }, path: "/projects" },
  { node: { id: project.id, label: project.name }, path: `/projects/${project.id}` },
];

const meta: Meta<typeof ProjectCreateTemplate> = {
  title: "Templates/ProjectCreateTemplate",
  component: ProjectCreateTemplate,
  decorators: [withRouterAt(`/projects/${project.id}/create`)],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectCreateTemplate>;

export const Default: Story = {
  args: {
    node,
    ancestors,
    currentPath: `/projects/${project.id}/create`,
    data: buildCreatePageData(project.id),
  },
};
