import type { Meta, StoryObj } from "@storybook/react";
import { Activity, ChartColumn, LayoutDashboard, Lightbulb } from "lucide-react";
import SidebarSection from "./SidebarSection";
import NavItem from "../primitives/NavItem";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof SidebarSection> = {
  title: "Patterns/SidebarSection",
  component: SidebarSection,
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
type Story = StoryObj<typeof SidebarSection>;

export const Labelled: Story = {
  args: {
    label: "Monitoring",
    children: (
      <>
        <NavItem to="/status" icon={Activity} label="Status" active />
        <NavItem to="/insights" icon={Lightbulb} label="Insights" />
        <NavItem to="/history" icon={ChartColumn} label="History" />
      </>
    ),
  },
};

/** The top group has no heading. */
export const Unlabelled: Story = {
  args: {
    children: <NavItem to="/overview" icon={LayoutDashboard} label="Overview" />,
  },
};
