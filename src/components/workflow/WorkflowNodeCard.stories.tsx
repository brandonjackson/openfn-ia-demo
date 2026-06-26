import type { Meta, StoryObj } from "@storybook/react";
import WorkflowNodeCard from "./WorkflowNodeCard";
import { nationalIdWorkflow } from "../../mock-data/workflow";

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
