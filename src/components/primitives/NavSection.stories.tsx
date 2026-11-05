import type { Meta, StoryObj } from "@storybook/react";
import { Activity, ChartColumn, LayoutDashboard, Lightbulb } from "lucide-react";
import NavSection from "./NavSection";
import NavItem from "./NavItem";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof NavSection> = {
  title: "Primitives/NavSection",
  component: NavSection,
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
type Story = StoryObj<typeof NavSection>;

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
