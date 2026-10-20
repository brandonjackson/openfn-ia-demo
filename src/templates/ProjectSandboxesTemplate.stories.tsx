import type { Meta, StoryObj } from "@storybook/react";
import ProjectSandboxesTemplate from "./ProjectSandboxesTemplate";
import { withRouterAt } from "../stories/decorators";
import { projects, projectSandboxes } from "../mock-data/projects";
import type { IANode } from "../ia-tree";

const node: IANode = {
  id: "sandboxes",
  label: "Sandboxes",
  description:
    "Isolated copies of this project for trying out changes before merging them back.",
};

const project = projects[2];
const emptyProject = projects.find((p) => p.id === "data-quality-checks")!;

const ancestorsFor = (p: typeof project) => [
  { node: { id: "projects", label: "Projects" }, path: "/projects" },
  { node: { id: p.id, label: p.name }, path: `/projects/${p.id}` },
];

const meta: Meta<typeof ProjectSandboxesTemplate> = {
  title: "Templates/ProjectSandboxesTemplate",
  component: ProjectSandboxesTemplate,
  decorators: [withRouterAt(`/projects/${project.id}/sandboxes`)],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectSandboxesTemplate>;

export const Default: Story = {
  args: {
    node,
    ancestors: ancestorsFor(project),
    currentPath: `/projects/${project.id}/sandboxes`,
    data: {
      pageType: "project-sandboxes",
      projectId: project.id,
      sandboxes: projectSandboxes(project),
    },
  },
};

export const OnlyMain: Story = {
  args: {
    node,
    ancestors: ancestorsFor(emptyProject),
    currentPath: `/projects/${emptyProject.id}/sandboxes`,
    data: {
      pageType: "project-sandboxes",
      projectId: emptyProject.id,
      sandboxes: projectSandboxes(emptyProject),
    },
  },
};
