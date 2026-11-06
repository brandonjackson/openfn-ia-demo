import type { Meta, StoryObj } from "@storybook/react";
import { FormError } from "../../model/form-error";
import InviteOrgMemberModal from "./InviteOrgMemberModal";

const meta: Meta<typeof InviteOrgMemberModal> = {
  title: "Domain/InviteOrgMemberModal",
  component: InviteOrgMemberModal,
  args: { roles: ["Owner", "Admin", "Member"], onInvite: async () => {}, onClose: () => {} },
};

export default meta;
type Story = StoryObj<typeof InviteOrgMemberModal>;

/** An owner invites someone, and can give any role. */
export const Default: Story = {};

/** An admin can't make an owner. */
export const AsAdmin: Story = { args: { roles: ["Admin", "Member"] } };

/** The server refused the email: it shows under the field and the modal stays open. */
export const Refused: Story = {
  args: {
    onInvite: async () => {
      throw new FormError("The request body is not valid.", { email: ["is already in the organisation"] });
    },
  },
};
