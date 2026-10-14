import type { Meta, StoryObj } from "@storybook/react";
import Alert from "./Alert";
import { authMessages, unconfirmedUser } from "../../mock-data/auth";

const meta: Meta<typeof Alert> = { title: "Auth/Alert", component: Alert };
export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: { type: "info", children: `We have sent a new confirmation link to ${unconfirmedUser.email}.` },
};
export const Warning: Story = { args: { type: "warning", children: authMessages.resendThrottled } };
export const Danger: Story = {
  args: {
    type: "danger",
    children: "We could not send that email just now. Try again in a moment; if it keeps failing, contact your instance administrator.",
  },
};
export const Success: Story = { args: { type: "success", children: "Done." } };
