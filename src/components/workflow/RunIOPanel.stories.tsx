import type { Meta, StoryObj } from "@storybook/react";
import RunIOPanel from "./RunIOPanel";
import { dataclips, failedRun, sampleRun } from "../../mock-data/runs";

const meta: Meta<typeof RunIOPanel> = {
  title: "Workflow/RunIOPanel",
  component: RunIOPanel,
  decorators: [
    (Story) => (
      <div className="h-[560px] w-80 rounded-xl border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
  args: {
    run: sampleRun,
    jobId: sampleRun.steps[0].jobId,
    dataclips,
    onExpand: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof RunIOPanel>;

/** The step's input over its output, each at half the height. */
export const Default: Story = {};

/** A failed step: its output wasn't kept. */
export const Failed: Story = {
  args: { run: failedRun, jobId: failedRun.steps.find((s) => s.status === "failed")?.jobId ?? failedRun.steps[0].jobId },
};

/** A step the run never reached. */
export const NotInRun: Story = { args: { jobId: "not-a-step" } };
