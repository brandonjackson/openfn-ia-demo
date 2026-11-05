import type { Meta, StoryObj } from "@storybook/react";
import { BookMarked, Database, FileText, Globe, KeyRound, LayoutDashboard, Settings, Workflow } from "lucide-react";
import NavItem from "./NavItem";
import Badge from "./Badge";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof NavItem> = {
  title: "Primitives/NavItem",
  component: NavItem,
  decorators: [
    withRouter,
    (Story) => (
      <div className="w-60 space-y-0.5 p-2">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NavItem>;

/** A route link in the app's side menu. */
export const Sidebar: Story = {
  args: { to: "/connected-systems", icon: Globe, label: "Systems" },
};

/** The current page is tinted, with no fill. */
export const SidebarActive: Story = {
  args: { to: "/overview", icon: LayoutDashboard, label: "Overview", active: true },
};

/** Off-site links open in a new tab and show a marker on hover. */
export const External: Story = {
  args: { href: "https://docs.openfn.org", icon: BookMarked, label: "OpenFn docs" },
};

/** A section menu beside a page's content, as on settings pages; the current section is filled. */
export const Sections: Story = {
  render: () => (
    <>
      <NavItem variant="section" icon={Settings} label="Setup" active onClick={() => {}} />
      <NavItem variant="section" icon={KeyRound} label="Credentials" onClick={() => {}} />
      <NavItem variant="section" icon={Database} label="Data storage" onClick={() => {}} />
    </>
  ),
};

/** A compact list of things to open, like the code explorer; the open item is a quiet grey fill. */
export const Tree: Story = {
  render: () => (
    <>
      <NavItem variant="tree" icon={Workflow} label="workflow.yaml" onClick={() => {}} />
      <NavItem variant="tree" icon={FileText} label="context.md" active onClick={() => {}} />
      <NavItem variant="tree" icon={Database} label="District codes" trailing={<Badge label="collection" />} onClick={() => {}} />
    </>
  ),
};
