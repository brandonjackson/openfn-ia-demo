import type { Meta, StoryObj } from "@storybook/react";
import ActivityList from "./ActivityList";
import { withRouter } from "../stories/decorators";
import { overviewData } from "../mock-data/overview";

const meta: Meta<typeof ActivityList> = {
  title: "Components/ActivityList",
  component: ActivityList,
  decorators: [
    withRouter,
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ActivityList>;

export const RecentActivity: Story = {
  args: { items: overviewData.recentActivity },
};

/** Problems pulled from Status. */
export const NeedsAttention: Story = {
  args: { items: overviewData.attention },
};

export const Empty: Story = {
  args: { items: [], emptyMessage: "Nothing needs your attention." },
};
