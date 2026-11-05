import type { Meta, StoryObj } from "@storybook/react";
import ProfileDetailsForm from "./ProfileDetailsForm";
import { currentUser } from "../../fixtures/user";

const meta: Meta<typeof ProfileDetailsForm> = {
  title: "Domain/ProfileDetailsForm",
  component: ProfileDetailsForm,
  parameters: { layout: "padded" },
  args: { details: currentUser, onSave: async () => {} },
};

export default meta;
type Story = StoryObj<typeof ProfileDetailsForm>;

/** Save stays off until something changes. */
export const Default: Story = {};

/** The server refused the change. */
export const ServerError: Story = {
  args: {
    onSave: async () => {
      throw new Error("Couldn't update your details. Please try again.");
    },
  },
};
