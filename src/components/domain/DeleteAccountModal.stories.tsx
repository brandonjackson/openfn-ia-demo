import type { Meta, StoryObj } from "@storybook/react";
import DeleteAccountModal from "./DeleteAccountModal";

const meta: Meta<typeof DeleteAccountModal> = {
  title: "Domain/DeleteAccountModal",
  component: DeleteAccountModal,
  parameters: { layout: "fullscreen" },
  args: { open: true, onDelete: async () => {}, onClose: () => {} },
};

export default meta;
type Story = StoryObj<typeof DeleteAccountModal>;

export const Default: Story = {};

/** The email typed isn't the account's. */
export const WrongEmail: Story = {
  args: {
    onDelete: async () => {
      throw new Error("This email doesn't match your current email");
    },
  },
};
