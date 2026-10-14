import type { Meta, StoryObj } from "@storybook/react";
import InviteCollaboratorsModal from "./InviteCollaboratorsModal";

const meta: Meta<typeof InviteCollaboratorsModal> = {
  title: "Project settings/InviteCollaboratorsModal",
  component: InviteCollaboratorsModal,
  args: { initial: [{ email: "new.person@example.org", role: "editor" }], onCancel: () => {}, onInvite: () => {} },
};
export default meta;
type Story = StoryObj<typeof InviteCollaboratorsModal>;

export const OnePerson: Story = {};
export const Several: Story = {
  args: {
    initial: [
      { email: "new.person@example.org", role: "editor" },
      { email: "another@example.org", role: "viewer" },
    ],
  },
};
