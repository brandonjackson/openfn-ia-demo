import type { Meta, StoryObj } from "@storybook/react";
import WorkflowNodeCard from "./WorkflowNodeCard";
import { nationalIdWorkflow } from "../../mock-data/workflow";
import { failedRun, sampleRun } from "../../mock-data/runs";

const trigger = nationalIdWorkflow.nodes.find((n) => n.type === "trigger")!;
const httpJob = nationalIdWorkflow.nodes.find((n) => n.id === "search")!;
const commonJob = nationalIdWorkflow.nodes.find((n) => n.id === "queue")!;

const meta: Meta<typeof WorkflowNodeCard> = {
  title: "Workflow/WorkflowNodeCard",
  component: WorkflowNodeCard,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof WorkflowNodeCard>;

export const Trigger: Story = { args: { node: trigger } };
export const HttpJob: Story = { args: { node: httpJob } };
export const CommonJob: Story = { args: { node: commonJob } };
export const Selected: Story = { args: { node: httpJob, selected: true } };

/** A step from the run shown on the canvas. */
export const RanSuccessfully: Story = {
  args: { node: httpJob, step: sampleRun.steps.find((s) => s.jobId === "search") },
};

export const RanAndFailed: Story = {
  args: {
    node: nationalIdWorkflow.nodes.find((n) => n.id === "create")!,
    step: failedRun.steps.find((s) => s.jobId === "create"),
  },
};

/** The trigger of a run says who or what started it. */
export const TriggerThatStartedRun: Story = {
  args: { node: trigger, note: `Started by ${sampleRun.startedBy}` },
};

/** The run shown on the canvas never reached this step. */
export const NotReached: Story = { args: { node: commonJob, dimmed: true } };

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <WorkflowNodeCard node={trigger} />
      <WorkflowNodeCard node={httpJob} />
      <WorkflowNodeCard node={httpJob} selected />
      <WorkflowNodeCard node={commonJob} />
    </div>
  ),
};
