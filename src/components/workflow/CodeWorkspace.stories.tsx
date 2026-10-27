import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import CodeWorkspace from "./CodeWorkspace";
import type { ExplorerFile } from "./EditorExplorer";
import type { DetailsViewId } from "../../editor-layout";
import EditorTray from "./EditorTray";
import StepRunDetails from "./StepRunDetails";
import StatusPill from "./StatusPill";
import { defaultWorkflowSettings, nationalIdWorkflow } from "../../mock-data/workflow";
import { dataclips, failedRun, workflowHealth, workOrders } from "../../mock-data/runs";
import WorkflowHealth from "./WorkflowHealth";
import { projects } from "../../mock-data/projects";

const components = projects[0].components.filter((c) => c.type !== "Workflow");

function Stateful(args: ComponentProps<typeof CodeWorkspace>) {
  const [file, setFile] = useState<ExplorerFile>(args.file);
  const [detailsView, setDetailsView] = useState<DetailsViewId>(args.detailsView ?? "snippets");
  const [bodies, setBodies] = useState<Record<string, string>>({});
  const workflow = {
    ...args.workflow,
    nodes: args.workflow.nodes.map((n) => (n.type === "job" && bodies[n.id] !== undefined ? { ...n, body: bodies[n.id] } : n)),
  };
  return (
    <CodeWorkspace
      {...args}
      workflow={workflow}
      file={file}
      onOpen={setFile}
      detailsView={detailsView}
      onDetailsViewChange={setDetailsView}
      onCodeChange={args.onCodeChange ? (id, code) => setBodies((b) => ({ ...b, [id]: code })) : undefined}
      pane={file === "health" ? args.pane : undefined}
    />
  );
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
    onClose: () => {},
  },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof CodeWorkspace>;

/** On main: read-only. */
export const ReadOnly: Story = { args: { readOnly: true } };

/** In a sandbox: everything can be changed. */
export const Editable: Story = {
  args: { onStepChange: () => {}, onCodeChange: () => {}, onDeleteStep: () => {}, onAddStep: () => {} },
};

export const WorkflowFile: Story = { args: { file: "workflow", onSettingsChange: () => {} } };

export const Trigger: Story = { args: { file: "trigger", onToggleLive: () => {} } };

export const ContextDocument: Story = { args: { file: "context" } };

/** The listing of the published service the workflow backs, after the context and spec. */
export const ServiceListing: Story = { args: { file: "service", service: projects[0].services[0], onOpenService: () => {} } };

/** Health, from the explorer under service.md: a page in the main pane in place of the code editor. */
export const HealthPane: Story = {
  args: {
    file: "health",
    pane: <WorkflowHealth health={workflowHealth(nationalIdWorkflow, workOrders, "30d")} onPeriodChange={() => {}} latestVersion="v2" />,
  },
};

export const ExplorerHidden: Story = { args: { showExplorer: false } };

/** The details column on its Config view; a step opens on Snippets by default. */
export const StepConfig: Story = {
  args: { detailsView: "config", onCodeChange: () => {}, onStepChange: () => {} },
};

export const DetailsHidden: Story = { args: { showDetails: false } };

/** A step edited in this session, not yet promoted. */
export const UnsavedChanges: Story = { args: { dirtyStepIds: ["search"], onStepChange: () => {} } };

/** A collection the workflow uses, opened from the Components group. */
export const CollectionOpen: Story = {
  args: { file: { componentId: components.find((c) => c.type === "Collection")!.id } },
};

/** Following a failed run, with the step's output in an inline tray. */
export const FollowingRun: Story = {
  args: {
    file: { stepId: "create" },
    run: failedRun,
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

/** A run loaded: the details column shows the step's input over its output. */
export const RunLoadedIO: Story = {
  args: { file: { stepId: "create" }, run: failedRun, dataclips, detailsView: "io", onExpandRunData: () => {} },
};

/** A run loaded with the trigger open: I/O shows the run's input. */
export const RunLoadedTriggerIO: Story = {
  args: { file: "trigger", run: failedRun, dataclips, detailsView: "io", onExpandRunData: () => {} },
};
