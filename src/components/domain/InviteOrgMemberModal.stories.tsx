import type { Meta, StoryObj } from "@storybook/react";
import { FormError } from "../../model/form-error";
import InviteOrgMemberModal from "./InviteOrgMemberModal";

const meta: Meta<typeof InviteOrgMemberModal> = {
  title: "Domain/InviteOrgMemberModal",
  component: InviteOrgMemberModal,
  args: { roles: ["Admin", "Member"], onInvite: async () => {}, onClose: () => {} },
};

export default meta;
type Story = StoryObj<typeof InviteOrgMemberModal>;

/** An admin adds someone already on OpenFn, as an admin or a member. */
export const Default: Story = {};

/** Nobody on OpenFn has the email: it shows under the field and the modal stays open. */
export const Refused: Story = {
  args: {
    onInvite: async () => {
      throw new FormError("The request body is not valid.", { email: ["names nothing you can see"] });
    },
  },
};
