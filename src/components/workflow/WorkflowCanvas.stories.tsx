import type { Meta, StoryObj } from "@storybook/react";
import WorkflowCanvas from "./WorkflowCanvas";
import { nationalIdWorkflow, nationalIdWorkflowV1 } from "../../mock-data/workflow";
import { failedRun, olderRun, runActivity, sampleRun, workOrders } from "../../mock-data/runs";

const activity = runActivity(nationalIdWorkflow, workOrders);

const meta: Meta<typeof WorkflowCanvas> = {
  title: "Workflow/WorkflowCanvas",
  component: WorkflowCanvas,
  parameters: { layout: "fullscreen" },
  args: { onNodeAction: () => {}, onSelect: () => {} },
};

export default meta;
type Story = StoryObj<typeof WorkflowCanvas>;

export const Default: Story = {
  args: { workflow: nationalIdWorkflow },
};

export const WithSelection: Story = {
  args: { workflow: nationalIdWorkflow, selectedId: "search" },
};

export const Bare: Story = {
  name: "No overlays",
  args: { workflow: nationalIdWorkflow, showMinimap: false, showControls: false, onNodeAction: undefined },
};

/** The run history laid over the workflow: counts on cards, volume on edges. */
export const WithActivity: Story = {
  args: { workflow: nationalIdWorkflow, activity, onShowFailures: () => {}, onViewRuns: () => {} },
};

/** A run drawn on the canvas: the path it took, with each step's status. */
export const WithRun: Story = {
  args: { workflow: nationalIdWorkflow, run: sampleRun },
};

export const WithFailedRun: Story = {
  args: { workflow: nationalIdWorkflow, run: failedRun },
};

/** A run in progress: the first step is done, the second is running. */
export const WithRunningRun: Story = {
  args: {
    workflow: nationalIdWorkflow,
    run: {
      ...sampleRun,
      status: "running",
      steps: sampleRun.steps.map((s, i) => ({ ...s, status: i === 0 ? "success" : i === 1 ? "running" : "pending", duration: i === 0 ? s.duration : "" })),
    },
  },
};

/** A v1 run on the v1 graph, as it executed. */
export const OlderRunAsExecuted: Story = {
  args: { workflow: nationalIdWorkflowV1, run: olderRun },
};

/** The same v1 run drawn on the latest graph, which has changed since. */
export const OlderRunOnLatest: Story = {
  args: { workflow: nationalIdWorkflow, run: olderRun },
};
