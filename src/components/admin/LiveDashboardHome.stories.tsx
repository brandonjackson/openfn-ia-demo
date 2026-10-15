import type { Meta, StoryObj } from "@storybook/react";
import LiveDashboardHome from "./LiveDashboardHome";
import { liveDashboard } from "../../mock-data/admin";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof LiveDashboardHome> = {
  title: "Admin/LiveDashboardHome",
  component: LiveDashboardHome,
  decorators: [withRouter],
  parameters: { layout: "fullscreen" },
  args: { data: liveDashboard },
};
export default meta;
type Story = StoryObj<typeof LiveDashboardHome>;

export const Default: Story = {};
