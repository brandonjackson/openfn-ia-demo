import type { Meta, StoryObj } from "@storybook/react";
import RunPanel from "./RunPanel";
import { sampleRun } from "../../mock-data/workflow";

const meta: Meta<typeof RunPanel> = {
  title: "Workflow/RunPanel",
  component: RunPanel,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof RunPanel>;

export const Default: Story = { args: { run: sampleRun } };
export const WithSelectedStep: Story = {
  args: { run: sampleRun, selectedStepId: "s1" },
};
