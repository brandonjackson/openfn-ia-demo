import type { Meta, StoryObj } from "@storybook/react";
import RunRow from "./RunRow";
import { accessNotGrantedRun, failedRun, olderRun, registerCaseWorkOrders, sampleRun } from "../../mock-data/runs";

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

/** A run started by a call over X-Road names the calling member and subsystem. */
export const CalledOverXRoad: Story = { args: { run: registerCaseWorkOrders[0].runs[0], latestVersion: "v1" } };

/** Refused by the provider because access hadn't been granted yet. */
export const AccessNotGranted: Story = { args: { run: accessNotGrantedRun, latestVersion: "v1" } };
