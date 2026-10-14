import type { Meta, StoryObj } from "@storybook/react";
import CollaborationPanel from "./CollaborationPanel";
import { projects } from "../../mock-data/projects";
import { currentUser } from "../../mock-data/users";

const meta: Meta<typeof CollaborationPanel> = {
  title: "Project settings/CollaborationPanel",
  component: CollaborationPanel,
  decorators: [(Story) => <div className="space-y-4 bg-secondary-100 p-6"><Story /></div>],
  args: {
    initialMembers: projects[0].members,
    currentUserId: currentUser.id,
    initialSupportAccess: false,
    canEditProject: true,
    canAddProjectUser: true,
    canRemoveProjectUser: true,
  },
};
export default meta;
type Story = StoryObj<typeof CollaborationPanel>;

export const Owner: Story = {};
export const Viewer: Story = { args: { canEditProject: false, canAddProjectUser: false, canRemoveProjectUser: false } };
