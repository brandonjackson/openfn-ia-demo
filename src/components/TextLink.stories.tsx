import type { Meta, StoryObj } from "@storybook/react";
import TextLink from "./TextLink";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof TextLink> = {
  title: "Shared/TextLink",
  component: TextLink,
  decorators: [withRouter],
  args: { to: "/profile", children: "your account" },
};
export default meta;
type Story = StoryObj<typeof TextLink>;

export const InApp: Story = {};
export const External: Story = { args: { to: "https://docs.openfn.org", external: true, children: "documentation" } };
export const Action: Story = { args: { to: undefined, onClick: () => {}, children: "Resend confirmation email" } };
export const Bold: Story = { args: { className: "font-medium", children: "Log in" } };
export const Danger: Story = { args: { to: undefined, onClick: () => {}, variant: "danger", children: "Remove integration" } };
