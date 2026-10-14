import type { Meta, StoryObj } from "@storybook/react";
import RemoveCollaboratorModal from "./RemoveCollaboratorModal";
import { users } from "../../mock-data/users";

const meta: Meta<typeof RemoveCollaboratorModal> = {
  title: "Project settings/RemoveCollaboratorModal",
  component: RemoveCollaboratorModal,
  args: { user: users[1], onCancel: () => {}, onConfirm: () => {} },
};
export default meta;
type Story = StoryObj<typeof RemoveCollaboratorModal>;

export const Default: Story = {};
export const OwnsCredentials: Story = { args: { ownedCredentials: ["DHIS2 play", "CommCare demo"] } };
