import type { Meta, StoryObj } from "@storybook/react";
import TransferCredentialModal from "./TransferCredentialModal";
import { userCredentials } from "../../fixtures/user";

const meta: Meta<typeof TransferCredentialModal> = {
  title: "Domain/TransferCredentialModal",
  component: TransferCredentialModal,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    credential: userCredentials[0],
    onTransfer: async () => {},
    onRevoke: async () => {},
    onClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof TransferCredentialModal>;

/** Enter the new owner's email. */
export const Transfer: Story = {};

/** The server's answer when the new owner isn't in every project that uses it. */
export const RecipientLacksAccess: Story = {
  args: {
    onTransfer: async () => {
      throw new Error("User doesn't have access to these projects: Project A");
    },
  },
};

/** A transfer is waiting to be accepted, so the dialog offers to revoke it. */
export const RevokePending: Story = {
  args: { credential: userCredentials.find((c) => c.transferPendingTo) },
};
