import type { Meta, StoryObj } from "@storybook/react";
import WorkflowCanvas from "./WorkflowCanvas";
import { nationalIdWorkflow, nationalIdWorkflowV1 } from "../../mock-data/workflow";
import { failedRun, olderRun, sampleRun } from "../../mock-data/runs";

const meta: Meta<typeof WorkflowCanvas> = {
  title: "Workflow/WorkflowCanvas",
  component: WorkflowCanvas,
  parameters: { layout: "fullscreen" },
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
  args: { workflow: nationalIdWorkflow, showMinimap: false, showControls: false },
};

/** A run drawn on the canvas: the path it took, with each step's status. */
export const WithRun: Story = {
  args: { workflow: nationalIdWorkflow, run: sampleRun },
};

export const WithFailedRun: Story = {
  args: { workflow: nationalIdWorkflow, run: failedRun },
};

/** A v1 run on the v1 graph, as it executed. */
export const OlderRunAsExecuted: Story = {
  args: { workflow: nationalIdWorkflowV1, run: olderRun },
};

/** The same v1 run drawn on the latest graph, which has changed since. */
export const OlderRunOnLatest: Story = {
  args: { workflow: nationalIdWorkflow, run: olderRun },
};
