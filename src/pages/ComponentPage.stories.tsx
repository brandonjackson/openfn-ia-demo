import type { Meta, StoryObj } from "@storybook/react";
import ComponentPage, { type ComponentPageProps } from "./ComponentPage";
import { withRouter } from "../stories/decorators";
import { projects } from "../fixtures/projects";
import { fixtureComponentContents } from "../fixtures/project-components";
import type { IANode } from "../model/ia-tree";

const node: IANode = { id: "component", label: "Component", pageType: "component" };
const project = projects[0];
const { componentContents, collections } = fixtureComponentContents(project.components);

function storyArgs(componentId: string): ComponentPageProps {
  const component = project.components.find((c) => c.id === componentId)!;
  return {
    node,
    ancestors: [
      { node: { id: "projects", label: "Projects" }, path: "/projects" },
      { node: { id: project.id, label: project.name }, path: `/projects/${project.id}` },
      { node: { id: "components", label: "Components" }, path: `/projects/${project.id}/components` },
    ],
    currentPath: `/projects/${project.id}/components/${component.id}`,
    data: { pageType: "component", projectId: project.id, component, content: componentContents[componentId], collection: collections[componentId] },
    takenNames: [],
    onSaveContent: async () => {},
    onEditDetails: async () => {},
    onRenameCollection: async () => {},
    onSaveItem: async () => {},
    onDeleteItem: async () => {},
    onDelete: async () => {},
  };
}

const meta: Meta<typeof ComponentPage> = {
  title: "Pages/ComponentPage",
  component: ComponentPage,
  decorators: [withRouter],
};

export default meta;
type Story = StoryObj<typeof ComponentPage>;

/** An artifact: its JSON, to edit and save, with Edit details and Delete in the header's menu. */
export const Artifact: Story = { args: storyArgs("application-field-mapping") };

/** A form's fields. */
export const Form: Story = { args: storyArgs("planning-submission-form") };

/** An AI skill. */
export const AISkill: Story = { args: storyArgs("triage-planning-applications") };

/** A document. */
export const Document: Story = { args: storyArgs("planning-officer-guide") };

/** A static website. */
export const StaticWebsite: Story = { args: storyArgs("application-status-site") };

/** A collection: its keys, with Rename and Delete in the header's menu. */
export const Collection: Story = { args: storyArgs("planning-authority-codes") };

/** For a viewer: everything to read, nothing to change. */
export const ReadOnly: Story = {
  args: {
    ...storyArgs("planning-officer-guide"),
    onSaveContent: undefined,
    onEditDetails: undefined,
    onDelete: undefined,
  },
};
