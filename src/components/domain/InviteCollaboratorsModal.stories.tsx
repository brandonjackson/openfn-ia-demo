import type { Meta, StoryObj } from "@storybook/react";
import InviteCollaboratorsModal from "./InviteCollaboratorsModal";

const meta: Meta<typeof InviteCollaboratorsModal> = {
  title: "Domain/InviteCollaboratorsModal",
  component: InviteCollaboratorsModal,
  parameters: { layout: "fullscreen" },
  args: { onClose: () => {}, onInvite: async () => {} },
};

export default meta;
type Story = StoryObj<typeof InviteCollaboratorsModal>;

export const OnePerson: Story = {
  args: { people: [{ email: "k.osei@planning.example.gov", role: "editor" }] },
};

export const SeveralPeople: Story = {
  args: {
    people: [
      { email: "k.osei@planning.example.gov", role: "editor" },
      { email: "l.moreau@planning.example.gov", role: "viewer" },
    ],
  },
};
