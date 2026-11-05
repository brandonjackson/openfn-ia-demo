import type { Meta, StoryObj } from "@storybook/react";
import UserFormModal from "./UserFormModal";
import { adminUsers } from "../../fixtures/admin";

const meta: Meta<typeof UserFormModal> = {
  title: "Domain/UserFormModal",
  component: UserFormModal,
  parameters: { layout: "fullscreen" },
  args: { onSave: async () => {}, onClose: () => {} },
};

export default meta;
type Story = StoryObj<typeof UserFormModal>;

/** A new account, with a first password. */
export const NewUser: Story = {};

export const EditUser: Story = { args: { user: adminUsers.find((u) => u.id === "user-amadou") } };

/** A support user, with the heads-up about what they can reach. */
export const EditSupportUser: Story = { args: { user: adminUsers.find((u) => u.supportUser) } };

/** Your own account: you can't disable yourself. */
export const EditYourself: Story = { args: { user: adminUsers.find((u) => u.isSelf) } };
