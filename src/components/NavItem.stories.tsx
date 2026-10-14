import type { Meta, StoryObj } from "@storybook/react";
import NavItem from "./NavItem";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof NavItem> = {
  title: "Shell/NavItem",
  component: NavItem,
  decorators: [
    withRouter,
    (Story) => (
      <nav id="side-menu" className="w-48 py-4">
        <Story />
      </nav>
    ),
  ],
  args: { to: "/projects", icon: "hero-square-3-stack-3d", label: "Workflows" },
};
export default meta;
type Story = StoryObj<typeof NavItem>;

export const Inactive: Story = {};
export const Active: Story = { args: { active: true } };
export const External: Story = { args: { to: undefined, href: "https://docs.openfn.org", icon: "hero-book-open-mini", label: "Documentation" } };
