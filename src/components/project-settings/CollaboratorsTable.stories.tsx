import type { Meta, StoryObj } from "@storybook/react";
import CollaboratorsTable from "./CollaboratorsTable";
import { projects } from "../../mock-data/projects";
import { session, users } from "../../mock-data/users";

const noop = () => {};
const meta: Meta<typeof CollaboratorsTable> = {
  title: "Project settings/CollaboratorsTable",
  component: CollaboratorsTable,
  args: {
    members: projects[0].members,
    users,
    currentUserId: session.user.id,
    canRemoveProjectUser: true,
    canAdd: true,
    onChange: noop,
    onRemove: noop,
    onAdd: noop,
  },
};
export default meta;
type Story = StoryObj<typeof CollaboratorsTable>;

export const Owner: Story = {};
export const Viewer: Story = { args: { canRemoveProjectUser: false } };
export const Empty: Story = { args: { members: [] } };
