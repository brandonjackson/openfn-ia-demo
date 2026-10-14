import type { Meta, StoryObj } from "@storybook/react";
import TextLink from "./TextLink";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof TextLink> = {
  title: "Projects/TextLink",
  component: TextLink,
  decorators: [withRouter],
  args: { to: "/profile", children: "your account" },
};
export default meta;
type Story = StoryObj<typeof TextLink>;

export const Internal: Story = {};
export const External: Story = { args: { to: "https://docs.openfn.org", external: true, children: "docs.openfn.org" } };
