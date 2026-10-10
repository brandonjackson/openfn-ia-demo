import type { Meta, StoryObj } from "@storybook/react";
import { BookMarked, Globe, LayoutDashboard } from "lucide-react";
import SidebarLink from "./SidebarLink";
import { withRouter } from "../stories/decorators";
import { openfnDocsUrl } from "../ia-tree";

const meta: Meta<typeof SidebarLink> = {
  title: "Components/SidebarLink",
  component: SidebarLink,
  decorators: [
    withRouter,
    (Story) => (
      <div className="w-60">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SidebarLink>;

export const Default: Story = {
  args: { to: "/connected-systems", icon: Globe, label: "Systems" },
};

export const Active: Story = {
  args: { to: "/overview", icon: LayoutDashboard, label: "Overview", active: true },
};

/** Off-site links open in a new tab and show a marker on hover. */
export const External: Story = {
  args: { href: openfnDocsUrl, icon: BookMarked, label: "OpenFn Docs" },
};
