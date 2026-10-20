import type { Meta, StoryObj } from "@storybook/react";
import StatTile from "./StatTile";
import { withRouter } from "../stories/decorators";
import { overviewData } from "../mock-data/overview";
import { insightsData } from "../mock-data/insights";

const meta: Meta<typeof StatTile> = {
  title: "Components/StatTile",
  component: StatTile,
  decorators: [
    withRouter,
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StatTile>;

/** Links through to Status, with a badge instead of a trend. */
export const WithBadge: Story = { args: overviewData.tiles[0] };

/** Links through to Insights, with a sparkline. */
export const WithTrend: Story = { args: overviewData.tiles[1] };

export const ErrorTrend: Story = {
  args: { ...overviewData.tiles[2], trendClassName: "text-red-500" },
};

/** No link: just a number and a supporting line. */
export const Plain: Story = { args: insightsData.tiles[3] };
