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
      metrics: [
        { label: "Connected Systems", value: 2 },
        { label: "Active Services", value: 3 },
        { label: "Work Orders (24h)", value: 18 },
      ],
      connectedSystems: overviewData.connectedSystems.slice(0, 2),
    },
  },
};
