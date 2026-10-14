import type { Meta, StoryObj } from "@storybook/react";
import PillTabs from "./PillTabs";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof PillTabs> = {
  title: "Shared/PillTabs",
  component: PillTabs,
  decorators: [withRouter],
  args: {
    active: "work-orders",
    tabs: [
      { id: "work-orders", label: "Work Orders", to: "/history" },
      { id: "channel-logs", label: "Channel Logs", to: "/history/channels" },
    ],
  },
};
export default meta;
export const Default: StoryObj<typeof PillTabs> = {};
