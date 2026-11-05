import type { Meta, StoryObj } from "@storybook/react";
import ChangeEmailForm from "./ChangeEmailForm";
import { currentUser } from "../../fixtures/user";

const meta: Meta<typeof ChangeEmailForm> = {
  title: "Domain/ChangeEmailForm",
  component: ChangeEmailForm,
  parameters: { layout: "padded" },
  args: { currentEmail: currentUser.email, onChangeEmail: async () => {} },
};

export default meta;
type Story = StoryObj<typeof ChangeEmailForm>;

export const Default: Story = {};

/** A change is waiting for its confirmation link to be clicked. */
export const Pending: Story = {
  args: { pendingEmail: "jane.doe@example.com" },
};

/** The server says the address belongs to someone else. */
export const Taken: Story = {
  args: {
    onChangeEmail: async () => {
      throw new Error("has already been taken");
    },
  },
};
