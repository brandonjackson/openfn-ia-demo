import type { Meta, StoryObj } from "@storybook/react";
import DashboardTemplate from "./DashboardTemplate";
import { withRouter } from "../stories/decorators";
import { overviewData } from "../mock-data/overview";

const meta: Meta<typeof DashboardTemplate> = {
  title: "Templates/DashboardTemplate",
  component: DashboardTemplate,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof DashboardTemplate>;

export const Default: Story = {
  args: { data: overviewData },
};

export const FewSystems: Story = {
  args: {
    data: {
      ...overviewData,
      connectedSystems: overviewData.connectedSystems.slice(0, 2),
    },
  },
};

/** A quiet week: nothing open, no recent activity. */
export const AllClear: Story = {
  args: {
    data: {
      ...overviewData,
      tiles: [
        { ...overviewData.tiles[0], value: "All clear", detail: "Every system and workflow is running", badge: { label: "Operational", tone: "green" } },
        ...overviewData.tiles.slice(1),
      ],
      attention: [],
      recentActivity: [],
    },
  },
};
