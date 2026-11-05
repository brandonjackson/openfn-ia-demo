import type { Meta, StoryObj } from "@storybook/react";
import ProjectSandboxesPage from "./ProjectSandboxesPage";
import { withRouterAt } from "../stories/decorators";
import { projects, projectSandboxes } from "../fixtures/projects";
import type { IANode } from "../model/ia-tree";

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

const meta: Meta<typeof ProjectSandboxesPage> = {
  title: "Pages/ProjectSandboxesPage",
  component: ProjectSandboxesPage,
  args: {
    selectedSandbox: "main",
    onSelectSandbox: () => {},
    onCreateSandbox: async () => {},
    onEditSandbox: async () => {},
    onMergeSandbox: async () => {},
    onDeleteSandbox: async () => {},
  },
  decorators: [withRouterAt(`/projects/${project.id}/sandboxes`)],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectSandboxesPage>;

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
