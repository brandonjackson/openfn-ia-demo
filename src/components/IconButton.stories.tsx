import type { Meta, StoryObj } from "@storybook/react";
import IconButton from "./IconButton";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof IconButton> = {
  title: "Shared/IconButton",
  component: IconButton,
  args: { icon: "hero-x-mark", label: "Close" },
  decorators: [withRouter],
};
export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};
export const Small: Story = { args: { size: "sm", icon: "hero-trash", label: "Delete" } };
export const Large: Story = { args: { size: "lg", icon: "hero-cog-6-tooth", label: "Settings" } };
export const Active: Story = { args: { active: true, icon: "hero-view-columns", label: "Toggle panel orientation" } };
export const Disabled: Story = { args: { disabled: true, icon: "hero-play", label: "Run" } };
export const Danger: Story = { args: { tone: "danger", icon: "hero-trash", label: "Delete token" } };
export const AsLink: Story = { args: { to: "/projects", icon: "hero-rectangle-stack", label: "View full history" } };
export const ExternalLink: Story = { args: { href: "https://docs.openfn.org", external: true, icon: "hero-arrow-top-right-on-square", label: "Open docs" } };
export const CustomIcon: Story = {
  args: {
    label: "Merge",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <circle cx="6" cy="6" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="12" r="2" />
        <path d="M6 8v8M8 6c6 0 10 2 10 4" />
      </svg>
    ),
  },
};
