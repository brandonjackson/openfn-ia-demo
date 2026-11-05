import type { Meta, StoryObj } from "@storybook/react";
import ChangePasswordForm from "./ChangePasswordForm";

const meta: Meta<typeof ChangePasswordForm> = {
  title: "Domain/ChangePasswordForm",
  component: ChangePasswordForm,
  parameters: { layout: "padded" },
  args: { onChangePassword: async () => {} },
};

export default meta;
type Story = StoryObj<typeof ChangePasswordForm>;

/** Try a short password, or two that don't match, then Update password. */
export const Default: Story = {};

/** The server says the current password is wrong. */
export const WrongCurrentPassword: Story = {
  args: {
    onChangePassword: async () => {
      throw new Error("is not valid");
    },
  },
};
