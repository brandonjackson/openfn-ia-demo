import type { Meta, StoryObj } from "@storybook/react";
import Sparkline from "./Sparkline";
import { errorTrend, runTrend } from "../mock-data/insights";

const meta: Meta<typeof Sparkline> = {
  title: "Components/Sparkline",
  component: Sparkline,
  decorators: [
    (Story) => (
      <div className="w-48">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sparkline>;

export const Runs: Story = {
  args: { values: runTrend, label: "Runs per day" },
};

export const Errors: Story = {
  args: { values: errorTrend, label: "Errors per day", className: "h-8 w-full text-red-500" },
};
