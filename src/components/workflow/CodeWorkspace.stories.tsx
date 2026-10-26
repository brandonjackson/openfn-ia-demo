import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import CodeWorkspace from "./CodeWorkspace";
import type { ExplorerFile } from "./EditorExplorer";
import EditorTray from "./EditorTray";
import StepRunDetails from "./StepRunDetails";
import StatusPill from "./StatusPill";
import { defaultWorkflowSettings, nationalIdWorkflow } from "../../mock-data/workflow";
import { dataclips, failedRun } from "../../mock-data/runs";
import { projects } from "../../mock-data/projects";

const components = projects[0].components.filter((c) => c.type !== "Workflow");

function Stateful(args: ComponentProps<typeof CodeWorkspace>) {
    const [file, setFile] = useState<ExplorerFile>(args.file);
    return <CodeWorkspace {...args} file={file} onOpen={setFile} />;
}

const meta: Meta<typeof CodeWorkspace> = {
  title: "Workflow/CodeWorkspace",
  component: CodeWorkspace,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="h-screen bg-gray-50 p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    workflow: nationalIdWorkflow,
    file: { stepId: "search" },
    settings: defaultWorkflowSettings(nationalIdWorkflow),
    credentials: { search: "cred-identity-prod" },
    url: "https://app.openfn.org/i/8f3c2a1e",
    components,
    onOpenComponent: () => {},
    onOpenReference: () => {},
  },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof CodeWorkspace>;

/** On main: read-only. */
export const ReadOnly: Story = { args: { readOnly: true } };

/** In a sandbox: everything can be changed. */
export const Editable: Story = {
  args: { onStepChange: () => {}, onInsertSnippet: () => {}, onDeleteStep: () => {}, onAddStep: () => {}, onRunFromStep: () => {} },
};

export const WorkflowFile: Story = { args: { file: "workflow", onSettingsChange: () => {} } };

export const Trigger: Story = { args: { file: "trigger", onToggleLive: () => {} } };

export const PlanDocument: Story = { args: { file: "plan" } };

export const ExplorerHidden: Story = { args: { showExplorer: false } };

/** A collection the workflow uses, opened from the Components group. */
export const CollectionOpen: Story = {
  args: { file: { componentId: components.find((c) => c.type === "Collection")!.id } },
};

/** Following a failed run, with the step's output in an inline tray. */
export const FollowingRun: Story = {
  args: {
    file: { stepId: "create" },
    run: failedRun,
    onRetryFromStep: () => {},
    statusNote: "Tested by the assistant",
    bottomTray: (
      <EditorTray
        title="Create new citizen in Identity"
        badge={<StatusPill status="failed" />}
        tabs={{ options: ["Log", "Input", "Output"], value: "Log", onChange: () => {} }}
        meta={`Run ${failedRun.runId.slice(0, 6)} · ${failedRun.duration}`}
        placement="bottom"
        heightClass="h-56"
        onClose={() => {}}
      >
        <StepRunDetails run={failedRun} step={failedRun.steps.find((s) => s.jobId === "create")} dataclips={dataclips} tab="log" />
      </EditorTray>
    ),
  },
};
