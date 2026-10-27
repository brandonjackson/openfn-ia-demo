import type { Meta, StoryObj } from "@storybook/react";
import RunLabel from "./RunLabel";
import { failedRun, sampleRun } from "../../mock-data/runs";

const meta: Meta<typeof RunLabel> = {
  title: "Workflow/RunLabel",
  component: RunLabel,
  parameters: { layout: "centered" },
  args: { run: sampleRun, detail: sampleRun.when },
};

export default meta;
type Story = StoryObj<typeof RunLabel>;

/** Just the run's name, as in the code view's panel with nothing to unload. */
export const Default: Story = {};

/** With the way to unload it, as in the runs bar, the inspector and the panel. */
export const WithUnload: Story = { args: { onUnload: () => {} } };

export const Failed: Story = { args: { run: failedRun, detail: failedRun.when, onUnload: () => {} } };

/** A step in focus: its name and how long it took. */
export const StepDetail: Story = { args: { detail: `${sampleRun.steps[0].label} · ${sampleRun.steps[0].duration}`, onUnload: () => {} } };
