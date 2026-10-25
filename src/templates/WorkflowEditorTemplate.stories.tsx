import type { Meta, StoryObj } from "@storybook/react";
import WorkflowEditorTemplate from "./WorkflowEditorTemplate";
import { nationalIdWorkflow, nationalIdWorkflowAt, workflowVersions } from "../mock-data/workflow";
import { dataclips, failedRun, olderRun, sampleRun, workOrders } from "../mock-data/runs";
import { projects } from "../mock-data/projects";
import { assistantConversations } from "../mock-data/assistant";
import type { Dock, EditorMode, TrayId, TrayLayout } from "../components/workflow/trays";
import { defaultLayout, defaultPlacement } from "../components/workflow/trays";

/** A layout with one more dock open on a tray, in a mode. */
function withDock(mode: EditorMode, dock: Dock, tray: TrayId, base: TrayLayout = defaultLayout): TrayLayout {
  return { ...base, [mode]: { ...base[mode], [dock]: { open: true, active: tray } } };
}

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
    assistantConversations,
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

/** The canvas, with run history in the left panel. */
export const Default: Story = {};

/** Selecting a step on the canvas opens its settings in the right panel. */
export const WithJobSelected: Story = {
  args: { initialSelectedId: "search", initialLayout: withDock("canvas", "right", "inspect") },
};

/** A run selected from history, drawn on the canvas, with its output in the bottom panel. */
export const RunSelected: Story = {
  args: { runId: sampleRun.runId, initialLayout: withDock("canvas", "bottom", "run") },
};

/** A step that ran, selected while following a run: the Run panel follows that step. */
export const RunSelectedWithStep: Story = {
  args: {
    runId: sampleRun.runId,
    initialSelectedId: "create",
    initialLayout: withDock("canvas", "right", "inspect", withDock("canvas", "bottom", "run")),
  },
};

export const FailedRunSelected: Story = {
  args: { runId: failedRun.runId, initialLayout: withDock("canvas", "bottom", "run") },
};

/** A v1 run shown on the latest graph; the Run panel offers the version that ran. */
export const OlderRunSelected: Story = {
  args: { runId: olderRun.runId, initialLayout: withDock("canvas", "bottom", "run") },
};

/** The same v1 run, viewed as executed. */
export const OlderRunAsExecuted: Story = {
  args: { runId: olderRun.runId, initialVersion: olderRun.version, initialLayout: withDock("canvas", "bottom", "run") },
};

/** The Fn file menu, which replaces the back button. */
export const FileMenuOpen: Story = {
  args: { onBack: () => {}, defaultFileMenuOpen: true },
};

/** Code: steps on the left, the open step's code with its step bar, its settings on the right. */
export const CodeMode: Story = {
  args: { initialMode: "code", initialSelectedId: "search" },
};

/** Code with nothing open shows the workflow's YAML and settings. */
export const CodeModeWorkflow: Story = {
  args: { initialMode: "code" },
};

/** The open step follows its part in the selected run. */
export const CodeModeFollowingRun: Story = {
  args: {
    initialMode: "code",
    initialSelectedId: "create",
    runId: failedRun.runId,
    initialLayout: withDock("code", "bottom", "run"),
  },
};

/** Adaptor docs in the right panel: snippets for the open step's adaptor. In a sandbox they can be inserted. */
export const CodeModeAdaptorDocs: Story = {
  args: {
    initialMode: "code",
    initialSelectedId: "search",
    sandbox: projects[0].sandboxes[1],
    initialLayout: withDock("code", "right", "reference"),
  },
};

/** Trays can move between docks: here History sits at the bottom, under the code. */
export const CodeModeHistoryAtBottom: Story = {
  args: {
    initialMode: "code",
    initialSelectedId: "search",
    initialPlacement: { ...defaultPlacement, history: "bottom" },
    initialLayout: withDock("code", "bottom", "history"),
  },
};

/** In a sandbox, settings can be changed and steps added. */
export const InSandbox: Story = {
  args: { sandbox: projects[0].sandboxes[1], initialMode: "code", initialSelectedId: "create" },
};

export const RunWithCustomInput: Story = {
  args: { defaultRunInputOpen: true },
};

/** Edit in sandbox while following a run: its input is offered as a starting point. */
export const EditInSandboxFromRun: Story = {
  args: { runId: sampleRun.runId, defaultEditInSandboxOpen: true },
};

export const PromoteDialogOpen: Story = {
  args: { sandbox: projects[0].sandboxes[1], defaultPromoteOpen: true },
};

/** A brand-new workflow with no history. */
export const NewWorkflow: Story = {
  args: { workOrders: [], versions: [], graphForVersion: undefined },
};

/** The AI Assistant beside the canvas, on the workflow's conversations. */
export const AssistantOpen: Story = {
  args: { defaultAssistantOpen: true },
};

/** In code, the assistant is about the open step. */
export const AssistantOpenInCode: Story = {
  args: { defaultAssistantOpen: true, initialMode: "code", initialSelectedId: "search", runId: sampleRun.runId },
};
