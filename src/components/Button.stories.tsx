import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof Button> = {
  title: "Shared/Button",
  component: Button,
  decorators: [withRouter],
  args: { children: "Save" },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Secondary: Story = { args: { theme: "secondary", children: "Cancel" } };
export const Danger: Story = { args: { theme: "danger", children: "Delete" } };
export const Success: Story = { args: { theme: "success", children: "Connect" } };
export const Warning: Story = { args: { theme: "warning", children: "Retry" } };
export const Disabled: Story = { args: { disabled: true, tooltip: "You don't have permission" } };
export const Pending: Story = { args: { pending: true, children: "Saving" } };
export const Small: Story = { args: { size: "sm", children: "Run" } };
export const Large: Story = { args: { size: "lg", children: "Create project" } };
export const AsLink: Story = { args: { to: "/projects", children: "Projects" } };
export const AsExternalLink: Story = { args: { href: "https://docs.openfn.org", children: "Docs" } };
