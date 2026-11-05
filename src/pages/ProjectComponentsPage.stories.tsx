import type { Meta, StoryObj } from "@storybook/react";
import ProjectComponentsPage from "./ProjectComponentsPage";
import { withRouterAt } from "../stories/decorators";
import { projects } from "../fixtures/projects";
import type { IANode } from "../model/ia-tree";
import { componentTypes } from "../model/component-types";

const node: IANode = {
  id: "components",
  label: "Components",
  description: "Every building block in this project, grouped by type.",
};

const project = projects[2];

/** Every kind of component, with every flag on. */
const types = componentTypes.map((t) => t.type).filter((t) => t !== "Workflow");

const ancestors = [
  { node: { id: "projects", label: "Projects" }, path: "/projects" },
  { node: { id: project.id, label: project.name }, path: `/projects/${project.id}` },
];

const meta: Meta<typeof ProjectComponentsPage> = {
  title: "Pages/ProjectComponentsPage",
  component: ProjectComponentsPage,
  args: { onAddComponent: () => {} },
  decorators: [withRouterAt(`/projects/${project.id}/components`)],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectComponentsPage>;

export const Default: Story = {
  args: {
    node,
    ancestors,
    currentPath: `/projects/${project.id}/components`,
    data: { pageType: "project-components", projectId: project.id, components: project.components, types },
  },
};

/** Every component type, including forms. */
export const AllTypes: Story = {
  args: {
    node,
    ancestors,
    currentPath: `/projects/${projects[0].id}/components`,
    data: { pageType: "project-components", projectId: projects[0].id, components: projects[0].components, types },
  },
};

export const Empty: Story = {
  args: {
    node,
    ancestors,
    currentPath: "/projects/data-quality-checks/components",
    data: { pageType: "project-components", projectId: "data-quality-checks", components: [], types },
  },
};

/** With the Components flag off: the project's Channels page, as in Lightning, and nothing to add without Create. */
export const ChannelsOnly: Story = {
  args: {
    node: { id: "components", label: "Channels", description: "Reads, writes and events on other systems, each with its own endpoint." },
    ancestors,
    currentPath: `/projects/${projects[0].id}/components`,
    data: {
      pageType: "project-components",
      projectId: projects[0].id,
      components: projects[0].components.filter((c) => c.type === "Channel"),
      types: ["Channel"],
    },
    onAddComponent: undefined,
    onCreateChannel: async () => {},
    channelCredentials: ["DHIS2 production", "Case Management API"],
    channelAddress: (name: string) => `https://app.openfn.org/c/project-a/${name}`,
  },
};
