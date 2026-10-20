import type { Meta, StoryObj } from "@storybook/react";
import { Activity, ChartColumn, Clock, LayoutDashboard } from "lucide-react";
import SidebarSection from "./SidebarSection";
import SidebarLink from "./SidebarLink";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof SidebarSection> = {
  title: "Components/SidebarSection",
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
        <SidebarLink to="/status" icon={Activity} label="Status" active />
        <SidebarLink to="/insights" icon={ChartColumn} label="Insights" />
        <SidebarLink to="/history" icon={Clock} label="History" />
      </>
    ),
  },
};

/** The top group has no heading. */
export const Unlabelled: Story = {
  args: {
    children: <SidebarLink to="/overview" icon={LayoutDashboard} label="Overview" />,
  },
};
