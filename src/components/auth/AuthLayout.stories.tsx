import type { Meta, StoryObj } from "@storybook/react";
import AuthLayout, { AuthNav } from "./AuthLayout";
import AuthCard from "./AuthCard";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof AuthLayout> = {
  title: "Auth/AuthLayout",
  component: AuthLayout,
  decorators: [withRouter],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof AuthLayout>;

export const Default: Story = {
  args: {
    title: "Log in",
    children: (
      <AuthCard>
        <p className="text-sm">Card content</p>
      </AuthCard>
    ),
  },
};
export const LongTitle: Story = {
  args: { title: "Resend confirmation instructions", children: <AuthCard>…</AuthCard> },
};
export const NavOnly: StoryObj<typeof AuthNav> = { render: () => <AuthNav /> };
