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

/** Smaller, for a row of tiles in a narrow card such as the inspector. */
export const Compact: Story = { args: { label: "Runs", value: 214, compact: true } };

/** A failure count, drawn in red. */
export const Danger: Story = { args: { label: "Failed", value: 12, compact: true, danger: true } };

/** Bare: three numbers in a row with dividers instead of boxes, as the inspector's run strip. */
export const Bare: Story = {
  render: () => (
    <div className="grid grid-cols-3 divide-x divide-gray-100 rounded-lg border border-gray-200 px-3 py-2 [&>*+*]:pl-3">
      <StatTile bare label="Reached" value={214} />
      <StatTile bare label="Failed" value={12} danger />
      <StatTile bare label="Succeeded" value="94%" />
    </div>
  ),
};
