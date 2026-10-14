import type { Meta, StoryObj } from "@storybook/react";
import TextLink from "./TextLink";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof TextLink> = { title: "Auth/TextLink", component: TextLink, decorators: [withRouter] };
export default meta;
type Story = StoryObj<typeof TextLink>;

export const RouterLink: Story = { args: { to: "/users/log_in", children: "Use your backup code" } };
export const External: Story = { args: { href: "https://www.openfn.org/terms", target: "_blank", children: "here" } };
export const Action: Story = { args: { onClick: () => {}, children: "Use your password instead" } };
