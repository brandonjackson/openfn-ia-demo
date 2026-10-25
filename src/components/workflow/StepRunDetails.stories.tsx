import type { Meta, StoryObj } from "@storybook/react";
import StepRunDetails from "./StepRunDetails";
import { dataclips, failedRun, sampleRun } from "../../mock-data/runs";

const createStep = sampleRun.steps.find((s) => s.jobId === "create");

const meta: Meta<typeof StepRunDetails> = {
  title: "Workflow/StepRunDetails",
  component: StepRunDetails,
  decorators: [
    (Story) => (
      <div className="h-72 w-[800px] overflow-auto border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
  args: { run: sampleRun, step: createStep, dataclips, tab: "log" },
};

export default meta;
type Story = StoryObj<typeof StepRunDetails>;

export const Log: Story = {};
export const Input: Story = { args: { tab: "input" } };
export const Output: Story = { args: { tab: "output" } };
export const Run: Story = { args: { tab: "run" } };
export const FailedStep: Story = { args: { run: failedRun, step: failedRun.steps.find((s) => s.jobId === "create") } };
export const StepNotInRun: Story = { args: { step: undefined } };
