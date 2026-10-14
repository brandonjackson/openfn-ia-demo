import type { Meta, StoryObj } from "@storybook/react";
import { withRouter } from "../../stories/decorators";
import { findRun, stepsOf } from "../../mock-data/history";
import RunStepList from "./RunStepList";

const run = findRun("run-1")!;
const meta = {
  title: "History/RunStepList",
  component: RunStepList,
  decorators: [withRouter, (Story) => <div className="w-96">{Story()}</div>],
} satisfies Meta<typeof RunStepList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { run, steps: stepsOf(run), selectedStepId: null, projectId: "p", workflowId: "wf-openhie" },
};
export const Selected: Story = {
  args: { run, steps: stepsOf(run), selectedStepId: "step-1b", projectId: "p", workflowId: "wf-openhie" },
};
