import type { Meta, StoryObj } from "@storybook/react";
import RunChip from "./RunChip";
import { failedRun, sampleRun } from "../../mock-data/runs";

const meta: Meta<typeof RunChip> = {
  title: "Workflow/RunChip",
  component: RunChip,
  parameters: { layout: "centered" },
  args: { run: sampleRun, onClear: () => {} },
};

export default meta;
type Story = StoryObj<typeof RunChip>;

export const Default: Story = {};

export const Failed: Story = { args: { run: failedRun } };

/** The open step wasn't part of the followed run. */
export const StepNotInRun: Story = { args: { tone: "warning", note: "Step not in this run" } };

/** In the toolbar's version slot, sized to match the version picker. */
export const Toolbar: Story = { args: { size: "md", note: sampleRun.version } };
