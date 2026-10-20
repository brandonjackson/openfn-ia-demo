import type { Meta, StoryObj } from "@storybook/react";
import RunPanel from "./RunPanel";
import { failedRun, sampleRun } from "../../mock-data/runs";

const meta: Meta<typeof RunPanel> = {
  title: "Workflow/RunPanel",
  component: RunPanel,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof RunPanel>;

export const Default: Story = { args: { run: sampleRun } };
export const WithSelectedStep: Story = {
  args: { run: sampleRun, selectedStepId: sampleRun.steps[0].id },
};

export const FailedRun: Story = { args: { run: failedRun } };
