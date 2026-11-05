import type { Meta, StoryObj } from "@storybook/react";
import ProjectCreatePage from "./ProjectCreatePage";
import { withRouterAt } from "../stories/decorators";
import { projects } from "../fixtures/projects";
import { buildCreatePageData } from "../fixtures/build-ideas";
import type { IANode } from "../model/ia-tree";

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

const meta: Meta<typeof ProjectCreatePage> = {
  title: "Pages/ProjectCreatePage",
  component: ProjectCreatePage,
  decorators: [withRouterAt(`/projects/${project.id}/create`)],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectCreatePage>;

export const Default: Story = {
  args: {
    node,
    ancestors,
    currentPath: `/projects/${project.id}/create`,
    data: buildCreatePageData(project.id),
  },
};
