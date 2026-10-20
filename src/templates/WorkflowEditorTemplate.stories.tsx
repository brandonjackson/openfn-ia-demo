import type { Meta, StoryObj } from "@storybook/react";
import WorkflowEditorTemplate from "./WorkflowEditorTemplate";
import { nationalIdWorkflow, nationalIdWorkflowAt, workflowVersions } from "../mock-data/workflow";
import { dataclips, failedRun, olderRun, sampleRun, workOrders } from "../mock-data/runs";
import { projects } from "../mock-data/projects";

const meta: Meta<typeof WorkflowEditorTemplate> = {
  title: "Templates/WorkflowEditorTemplate",
  component: WorkflowEditorTemplate,
  parameters: { layout: "fullscreen" },
  args: {
    workflow: nationalIdWorkflow,
    workOrders,
    dataclips,
    graphForVersion: nationalIdWorkflowAt,
    sandboxes: projects[0].sandboxes,
    versions: workflowVersions,
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WorkflowEditorTemplate>;

export const Default: Story = {};

export const WithBackButton: Story = {
  args: { onBack: () => {} },
};

export const WithJobSelected: Story = {
  args: { initialSelectedId: "search" },
};

/** A run selected from history, drawn on the canvas. */
export const RunSelected: Story = {
  args: { runId: sampleRun.runId },
};

export const FailedRunSelected: Story = {
  args: { runId: failedRun.runId },
};

/** A v1 run shown on the latest graph, with the banner offering the version that ran. */
export const OlderRunSelected: Story = {
  args: { runId: olderRun.runId },
};

/** The same v1 run, viewed as executed. */
export const OlderRunAsExecuted: Story = {
  args: { runId: olderRun.runId, initialVersion: olderRun.version },
};

export const JobExpanded: Story = {
  name: "Job expanded (code editor)",
  args: { initialSelectedId: "search", initialExpandedId: "search" },
};

/** The expanded job follows its step in the selected run. */
export const JobExpandedFollowingRun: Story = {
  args: { initialSelectedId: "create", initialExpandedId: "create", runId: failedRun.runId },
};

export const InSandbox: Story = {
  args: { sandbox: projects[0].sandboxes[1] },
};

export const RunWithCustomInput: Story = {
  args: { defaultRunInputOpen: true },
};

/** Edit in sandbox while following a run: its input is offered as a starting point. */
export const EditInSandboxFromRun: Story = {
  args: { runId: sampleRun.runId, defaultEditInSandboxOpen: true },
};

/** A brand-new workflow with no history. */
export const NewWorkflow: Story = {
  args: { workOrders: [], versions: [], graphForVersion: undefined },
};
