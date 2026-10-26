import type { Meta, StoryObj } from "@storybook/react";
import LoadedRunBar from "./LoadedRunBar";
import { failedRun, sampleRun } from "../../mock-data/runs";

const meta: Meta<typeof LoadedRunBar> = {
  title: "Workflow/LoadedRunBar",
  component: LoadedRunBar,
  parameters: { layout: "centered" },
  args: { run: sampleRun, detail: sampleRun.when, onUnload: () => {} },
};

export default meta;
type Story = StoryObj<typeof LoadedRunBar>;

/** On the canvas: when the run ran. */
export const Default: Story = {};

export const Failed: Story = { args: { run: failedRun, detail: failedRun.when } };

/** In the toolbar in code mode: the version the run ran on. */
export const Toolbar: Story = { args: { detail: sampleRun.version } };
