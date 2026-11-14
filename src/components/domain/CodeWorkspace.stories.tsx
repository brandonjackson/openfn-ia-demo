import { useState, type ComponentProps, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import CodeWorkspace from "./CodeWorkspace";
import type { ExplorerFile } from "./EditorExplorer";
import type { DetailsViewId } from "./editor-layout";
import EditorPanel from "../patterns/EditorPanel";
import CodeLayout from "../patterns/CodeLayout";
import EditorTray from "../patterns/EditorTray";
import { panelViews } from "./panel-views";
import StepRunDetails from "./StepRunDetails";
import StatusPill from "./StatusPill";
import { defaultWorkflowSettings } from "../../model/workflow";
import { nationalIdWorkflow } from "../../fixtures/workflow";
import { workflowHealth } from "../../model/runs";
import { dataclips, failedRun, workOrders } from "../../fixtures/runs";
import WorkflowHealth from "./WorkflowHealth";
import ChannelView from "./ChannelView";
import { channelDetails } from "../../fixtures/channels";
import { projects } from "../../fixtures/projects";
import { adaptorChoices, adaptorInfo, adaptorSnippets, projectCredentials } from "../../fixtures/adaptor-reference";
import { connectedSystems } from "../../fixtures/connected-systems";
import { workflowDocs } from "../../fixtures/workflow-files";
import { serviceYaml } from "../../model/services";
import { orgXRoad } from "../../fixtures/xroad";
import { fixtureComponentContents } from "../../fixtures/project-components";
import CollectionView from "./CollectionView";
import ComponentView from "./ComponentView";

const components = projects[0].components.filter((c) => c.type !== "Workflow");
const adaptors = { info: adaptorInfo, snippets: adaptorSnippets, choices: adaptorChoices, credentials: projectCredentials };
const contents = {
  docs: { "context.md": workflowDocs.context, "spec.md": workflowDocs.spec },
  serviceListing: serviceYaml(projects[0].services[0], { code: projects[0].services[0].id, xroad: orgXRoad }),
  ...fixtureComponentContents(components),
  channels: Object.fromEntries(components.filter((c) => c.type === "Channel").map((c) => [c.id, channelDetails(c)])),
};

/** The workspace's props, plus the panel the page would put under the code. */
type Args = Omit<ComponentProps<typeof CodeWorkspace>, "children"> & { bottomTray?: ReactNode };

function Stateful({ bottomTray, ...args }: Args) {
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
    >
      {/* Laid out as the page does, in the code view's frame. */}
      {(code) => (
        <CodeLayout
          nav={code.nav}
          header={code.header}
          footer={code.footer}
          bottomTray={bottomTray}
          rightTray={
            code.details && (
              <EditorTray placement="right" tabs={code.details.tabs} actions={code.details.actions}>
                {code.details.body}
              </EditorTray>
            )
          }
        >
          {code.main}
        </CodeLayout>
      )}
    </CodeWorkspace>
  );
}

const meta: Meta<Args> = {
  title: "Domain/CodeWorkspace",
  component: Stateful,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="h-screen bg-gray-50">
        <Story />
      </div>
    ),
  ],
  args: {
    workflow: nationalIdWorkflow,
    adaptors,
    systems: connectedSystems,
    contents,
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
type Story = StoryObj<Args>;

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

/** service.yaml for a service published to X-Road: its Security Server registration, with the subsystems allowed to call it. */
const surveillanceService = projects.find((p) => p.id === "case-surveillance")!.services[0];
export const ServiceListingOnXRoad: Story = {
  args: {
    file: "service",
    service: surveillanceService,
    onOpenService: () => {},
    contents: { ...contents, serviceListing: serviceYaml(surveillanceService, { code: "register-suspected-case", xroad: orgXRoad }) },
  },
};

/** Health, from the explorer under service.yaml: a page in the main pane in place of the code editor. */
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

const collection = components.find((c) => c.type === "Collection")!;

/** A collection the workflow uses, opened from the Components group: its keys in the code's place. */
export const CollectionOpen: Story = {
  args: {
    file: { componentId: collection.id },
    pane: <CollectionView name={collection.name} {...contents.collections[collection.id]!} onSaveItem={async () => {}} onDeleteItem={async () => {}} />,
  },
};

const artifact = components.find((c) => c.type === "Artifact")!;

/** An artifact opened from the Components group: its file to edit and save in the code's place. */
export const ArtifactOpen: Story = {
  args: {
    file: { componentId: artifact.id },
    pane: <ComponentView name={artifact.name} description={artifact.description} type="Artifact" content={contents.componentContents[artifact.id]!} onSave={async () => {}} />,
  },
};

const channel = components.find((c) => c.type === "Channel")!;

/** A channel the workflow uses, opened from the Components group: its traffic in the code's place, its facts on the right. */
export const ChannelOpen: Story = {
  args: {
    file: { componentId: channel.id },
    pane: <ChannelView name={channel.name} description={channel.description} channel={channelDetails(channel)} />,
  },
};

/** Following a failed run, with the step's log in the panel under the code. */
export const FollowingRun: Story = {
  args: {
    file: { stepId: "create" },
    run: failedRun,
    statusNote: "Tested by the assistant",
    bottomTray: (
      <EditorPanel
        views={panelViews}
        view="log"
        onViewChange={() => {}}
        context={
          <>
            <StatusPill status="failed" variant="dot" />
            Run {failedRun.runId.slice(0, 6)} · {failedRun.duration}
          </>
        }
        onClose={() => {}}
      >
        <StepRunDetails run={failedRun} step={failedRun.steps.find((s) => s.jobId === "create")} dataclips={dataclips} tab="log" />
      </EditorPanel>
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
