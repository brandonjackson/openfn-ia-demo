import type { Meta, StoryObj } from "@storybook/react";
import RunRow from "./RunRow";
import { failedRun, olderRun, sampleRun } from "../../mock-data/runs";

const meta: Meta<typeof RunRow> = {
  title: "Workflow/RunRow",
  component: RunRow,
  args: { run: sampleRun, latestVersion: "v2", onSelect: () => {}, onDeselect: () => {} },
  decorators: [
    (Story) => (
      <div className="w-80 rounded-lg border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RunRow>;

export const Default: Story = {};

export const Selected: Story = { args: { selected: true } };

export const Failed: Story = { args: { run: failedRun } };

/** A run on an older version than the latest gets a yellow version tag. */
export const OlderVersion: Story = { args: { run: olderRun } };

/** In the inspector's failure list: a shallower indent. */
export const Compact: Story = { args: { compact: true } };
