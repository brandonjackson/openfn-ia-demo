import type { Meta, StoryObj } from "@storybook/react";
import WorkflowNodeCard from "./WorkflowNodeCard";
import { nationalIdWorkflow } from "../../mock-data/workflow";
import { failedRun, runActivity, sampleRun, workOrders } from "../../mock-data/runs";

const trigger = nationalIdWorkflow.nodes.find((n) => n.type === "trigger")!;
const httpJob = nationalIdWorkflow.nodes.find((n) => n.id === "search")!;
const createJob = nationalIdWorkflow.nodes.find((n) => n.id === "create")!;
const commonJob = nationalIdWorkflow.nodes.find((n) => n.id === "queue")!;
const activity = runActivity(nationalIdWorkflow, workOrders);

const meta: Meta<typeof WorkflowNodeCard> = {
  title: "Workflow/WorkflowNodeCard",
  component: WorkflowNodeCard,
  parameters: { layout: "padded" },
  args: { onAction: () => {}, onOpen: () => {} },
};

export default meta;
type Story = StoryObj<typeof WorkflowNodeCard>;

export const Trigger: Story = { args: { node: trigger } };
export const HttpJob: Story = { args: { node: httpJob } };
export const CommonJob: Story = { args: { node: commonJob } };
export const Selected: Story = { args: { node: httpJob, selected: true } };

/** On main the delete item is disabled. */
export const ReadOnly: Story = { args: { node: httpJob, readOnly: true } };

/** Near the canvas's right edge the menu opens under its button instead of beside the card. */
export const MenuBelow: Story = { args: { node: commonJob, menuPlacement: "below" } };

/** Without an action handler the card has no menu. */
export const NoMenu: Story = { args: { node: httpJob, onAction: undefined } };

/** Hover the card to see the + that adds a step after it. */
export const WithAddStep: Story = { args: { node: httpJob, onAddAfter: () => {} } };

/** The run history on the card: runs that reached it and failures there. */
export const WithActivity: Story = { args: { node: createJob, activity: activity.nodes.create, onShowFailures: () => {} } };
export const WithActivityNoFailures: Story = { args: { node: httpJob, activity: activity.nodes.confirm } };

/** A step from the run shown on the canvas. */
export const RanSuccessfully: Story = {
  args: { node: httpJob, step: sampleRun.steps.find((s) => s.jobId === "search") },
};

export const RanAndFailed: Story = {
  args: { node: createJob, step: failedRun.steps.find((s) => s.jobId === "create") },
};

export const Running: Story = {
  args: { node: httpJob, step: { ...sampleRun.steps[0], status: "running", duration: "" } },
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
      <WorkflowNodeCard node={trigger} onAction={() => {}} activity={activity.nodes.trigger} />
      <WorkflowNodeCard node={httpJob} onAction={() => {}} activity={activity.nodes.search} onShowFailures={() => {}} />
      <WorkflowNodeCard node={createJob} onAction={() => {}} selected step={failedRun.steps.find((s) => s.jobId === "create")} />
      <WorkflowNodeCard node={commonJob} onAction={() => {}} dimmed />
    </div>
  ),
};
