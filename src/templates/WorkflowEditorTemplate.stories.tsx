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
    components: projects[0].components.filter((c) => c.type !== "Workflow"),
    onOpenComponent: () => {},
    onAddComponent: () => {},
    sandboxes: projects[0].sandboxes,
    versions: workflowVersions,
    assistantConversations,
    url: "https://app.openfn.org/i/8f3c2a1e",
    onBack: () => {},
    service: projects[0].services[0],
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
export const Default: Story = {
  args: { initialLayout: { panel: false, assistant: false, explorer: true } },
};

/** A step selected on the canvas brings up the inspector: its name, adaptor and credential. */
export const StepSelected: Story = {
  args: { initialSelectedId: "search", initialLayout: { panel: false } },
};

/** The trigger selected: its type, webhook URL and switch in the inspector. */
export const TriggerSelected: Story = {
  args: { initialSelectedId: "trigger", initialLayout: { panel: false } },
};

/** A run loaded with a step selected: snippets of its log, input and output in the inspector. */
export const InspectorFollowingRun: Story = {
  args: { runId: sampleRun.runId, initialSelectedId: "search", initialLayout: { panel: false } },
};

/** The step's settings in the full panel, opened from the inspector for more room. */
export const StepInPanel: Story = {
  args: { initialSelectedId: "search", initialLayout: { panel: true, panelView: "step" } },
};

/** The panel on its Runs view, ready to load a run. */
export const RunsPanel: Story = {
  args: { initialLayout: { panel: true, panelView: "runs" } },
};

/** A run loaded from the run picker, drawn on the canvas. */
export const RunLoaded: Story = {
  args: { runId: sampleRun.runId },
};

/** A failed run, with the failed step's log in the panel. */
export const FailedRunStepOpen: Story = {
  args: { runId: failedRun.runId, initialSelectedId: "create", initialLayout: { panel: true, panelView: "log" } },
};

/** A v1 run shown on the latest graph, with the banner offering the version that ran. */
export const OlderRunLoaded: Story = {
  args: { runId: olderRun.runId },
};

/** The same v1 run, viewed as executed. */
export const OlderRunAsExecuted: Story = {
  args: { runId: olderRun.runId, initialVersion: olderRun.version },
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
    initialLayout: { assistant: true, panel: false },
  },
};

/** Code mode following a run: the step's output sits under its code. */
export const CodeFollowingRun: Story = {
  args: {
    sandbox: projects[0].sandboxes[1],
    initialView: "code",
    initialFile: { stepId: "create" },
    runId: failedRun.runId,
    initialLayout: { panel: true, panelView: "log" },
  },
};

/** The plan document kept with the workflow. */
export const PlanDocument: Story = {
  args: { initialView: "code", initialFile: "plan" },
};

/** The listing of the published service the workflow backs, after the plan and spec. */
export const ServiceListing: Story = {
  args: { initialView: "code", initialFile: "service" },
};

/** A collection the workflow uses, opened from the explorer's Components group. */
export const ComponentOpen: Story = {
  args: { initialView: "code", initialFile: { componentId: "planning-authority-codes" } },
};

/** The workflow's settings beside its YAML. */
export const WorkflowSettings: Story = {
  args: { initialView: "code", initialFile: "workflow", sandbox: projects[0].sandboxes[1] },
};

/** The adaptor reference beside the code, in the details column. */
export const AdaptorReference: Story = {
  args: {
    initialView: "code",
    initialFile: { stepId: "search" },
    initialLayout: { panel: false, details: true, detailsView: "reference" },
    sandbox: projects[0].sandboxes[1],
  },
};

/** Explorer hidden and the panel maximised, as a reader might set it. */
export const CustomLayout: Story = {
  args: {
    initialView: "code",
    initialFile: { stepId: "search" },
    runId: sampleRun.runId,
    initialLayout: { explorer: false, details: false, panel: true, panelView: "output", panelMaximized: true, hiddenViews: ["step"] },
  },
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

/** The assistant open beside the canvas, on the workflow's conversations. */
export const AssistantOpen: Story = {
  args: { initialLayout: { assistant: true } },
};
