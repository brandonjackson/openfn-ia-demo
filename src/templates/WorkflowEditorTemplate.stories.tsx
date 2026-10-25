import type { Meta, StoryObj } from "@storybook/react";
import WorkflowEditorTemplate from "./WorkflowEditorTemplate";
import { nationalIdWorkflow, nationalIdWorkflowAt, workflowVersions } from "../mock-data/workflow";
import { dataclips, failedRun, olderRun, sampleRun, workOrders } from "../mock-data/runs";
import { projects } from "../mock-data/projects";
import { assistantConversations } from "../mock-data/assistant";

const meta: Meta<typeof WorkflowEditorTemplate> = {
  title: "Templates/WorkflowEditorTemplate",
  component: WorkflowEditorTemplate,
  parameters: { layout: "fullscreen" },
  args: {
    workflow: nationalIdWorkflow,
    workOrders,
    dataclips,
    graphForVersion: nationalIdWorkflowAt,
    projectName: "Project A",
    sandboxes: projects[0].sandboxes,
    versions: workflowVersions,
    assistantConversations,
    url: "https://app.openfn.org/i/8f3c2a1e",
    onBack: () => {},
    onSeeDetails: () => {},
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

/** On main: the canvas, read-only, with "Edit in sandbox" as the main action. */
export const Default: Story = {};

/** A step selected on the canvas opens the step tray along the bottom. */
export const StepSelected: Story = {
  args: { initialSelectedId: "search", initialTrays: ["step"] },
};

/** The history tray docked on the right. */
export const HistoryOpen: Story = {
  args: { initialTrays: ["history"] },
};

/** A run selected from history, drawn on the canvas. */
export const RunSelected: Story = {
  args: { runId: sampleRun.runId, initialTrays: ["history"] },
};

/** A failed run, with the failed step's log in the step tray. */
export const FailedRunStepOpen: Story = {
  args: { runId: failedRun.runId, initialSelectedId: "create", initialTrays: ["step"] },
};

/** A v1 run shown on the latest graph, with the banner offering the version that ran. */
export const OlderRunSelected: Story = {
  args: { runId: olderRun.runId, initialTrays: ["history"] },
};

/** The same v1 run, viewed as executed. */
export const OlderRunAsExecuted: Story = {
  args: { runId: olderRun.runId, initialVersion: olderRun.version, initialTrays: ["history"] },
};

/** Code mode on main: explorer, read-only code and the step's settings. */
export const CodeReadOnly: Story = {
  args: { initialView: "code", initialFile: { stepId: "search" } },
};

/** Code mode in a sandbox: everything editable, with the assistant open. */
export const CodeInSandbox: Story = {
  args: {
    sandbox: projects[0].sandboxes[1],
    initialView: "code",
    initialFile: { stepId: "create" },
    initialTrays: ["assistant"],
  },
};

/** Code mode following a run: the step's output sits under its code. */
export const CodeFollowingRun: Story = {
  args: {
    sandbox: projects[0].sandboxes[1],
    initialView: "code",
    initialFile: { stepId: "create" },
    runId: failedRun.runId,
    initialTrays: ["step"],
  },
};

/** The workflow's settings beside its YAML. */
export const WorkflowSettings: Story = {
  args: { initialView: "code", initialFile: "workflow", sandbox: projects[0].sandboxes[1] },
};

/** The adaptor reference tray beside the code. */
export const AdaptorReference: Story = {
  args: { initialView: "code", initialFile: { stepId: "search" }, initialTrays: ["docs"], sandbox: projects[0].sandboxes[1] },
};

/** The Runs view: every run in a table. */
export const Runs: Story = {
  args: { initialView: "runs", runId: sampleRun.runId },
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
  args: { workOrders: [], versions: [], graphForVersion: undefined, sandbox: projects[0].sandboxes[1] },
};

/** The assistant tray open beside the canvas, on the workflow's conversations. */
export const AssistantOpen: Story = {
  args: { initialTrays: ["assistant"] },
};
