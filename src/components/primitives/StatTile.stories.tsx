import type { Meta, StoryObj } from "@storybook/react";
import StatTile from "./StatTile";
import { withRouter } from "../../stories/decorators";
import { insightsData } from "../../fixtures/insights";

const meta: Meta<typeof StatTile> = {
  title: "Primitives/StatTile",
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
export const WithBadge: Story = {
  args: { label: "Status", value: "2 issues", detail: "1 system, 1 workflow", badge: { label: "Needs attention", tone: "red" }, linkTo: "/status" },
};

/** Links through to Insights, with a sparkline. */
export const WithTrend: Story = { args: { ...insightsData.tiles[0], label: "Runs this week", linkTo: "/insights" } };

export const ErrorTrend: Story = {
  args: { ...insightsData.tiles[1], label: "Errors this week", linkTo: "/insights", trendClassName: "text-red-500" },
};

/** No link: just a number and a supporting line. */
export const Plain: Story = { args: insightsData.tiles[3] };

/** Smaller, for a row of tiles in a narrow card such as the inspector. */
export const Compact: Story = { args: { label: "Runs", value: 214, compact: true } };

/** A failure count, drawn in red. */
export const Danger: Story = { args: { label: "Failed", value: 12, compact: true, danger: true } };

/** Bare: a row of figures, number over label, as the inspector's run strip. */
export const Bare: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-3">
      <StatTile bare label="Reached" value={214} />
      <StatTile bare label="Failed" value={12} danger />
      <StatTile bare label="Succeeded" value="94%" />
    </div>
  ),
};
