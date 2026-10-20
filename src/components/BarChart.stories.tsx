import type { Meta, StoryObj } from "@storybook/react";
import BarChart from "./BarChart";
import { insightsData } from "../mock-data/insights";

const meta: Meta<typeof BarChart> = {
  title: "Components/BarChart",
  component: BarChart,
  decorators: [
    (Story) => (
      <div className="max-w-lg pt-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BarChart>;

export const Runs: Story = {
  args: {
    unit: "runs",
    data: insightsData.daily.map((d) => ({ label: d.day, value: d.succeeded + d.failed })),
  },
};

export const Errors: Story = {
  args: {
    unit: "errors",
    barClassName: "bg-red-500",
    data: insightsData.daily.map((d) => ({ label: d.day, value: d.failed })),
  },
};
