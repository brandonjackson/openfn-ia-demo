import type { Meta, StoryObj } from "@storybook/react";
import TextLink from "./TextLink";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof TextLink> = {
  title: "Components/TextLink",
  component: TextLink,
  decorators: [withRouter],
};

export default meta;
type Story = StoryObj<typeof TextLink>;

export const Default: Story = {
  args: { to: "/connected-systems/kobo-toolbox", children: "KoBoToolbox" },
};

export const Action: Story = {
  args: { to: "/status", children: "View status", variant: "action" },
};
