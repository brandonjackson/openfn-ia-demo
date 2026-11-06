import type { Meta, StoryObj } from "@storybook/react";
import WorkflowEditorPage from "./WorkflowEditorPage";
import { nationalIdWorkflow, nationalIdWorkflowAt, registerCaseWorkflow, surveillanceVersions, weeklyCaseReportWorkflow, workflowVersions } from "../fixtures/workflow";
import { dataclips, failedRun, olderRun, runHistories, sampleRun, simulateRun, workOrders } from "../fixtures/runs";
import { projects } from "../fixtures/projects";
import { assistantConversations, assistantPlanResult, assistantReply, assistantSuggestions } from "../fixtures/assistant";
import { adaptorChoices, adaptorInfo, adaptorSnippets, projectCredentials } from "../fixtures/adaptor-reference";
import { adaptorCatalog, aiActions, aiModels, builtInTools, catalogCategories } from "../fixtures/adaptor-catalog";
import { connectedSystems } from "../fixtures/connected-systems";
import { codeSummary } from "../fixtures/code-summaries";
import { channelDetails } from "../fixtures/channels";
import { serviceListing, workflowDocs } from "../fixtures/workflow-files";
import { fixtureComponentContents } from "../fixtures/project-components";
import type { ProjectComponent, ProjectService } from "../model/projects";
import type { WorkflowFileContents } from "../model/workflow";

/** The fake assistant "thinks" this long before answering. */
const REPLY_DELAY_MS = 900;
const later = <T,>(answer: () => T) => new Promise<T>((resolve) => setTimeout(() => resolve(answer()), REPLY_DELAY_MS));

/** What opening a workflow's docs, service listing and components shows, for a project's components. */
const contentsFor = (components: ProjectComponent[], service?: ProjectService): WorkflowFileContents => ({
  docs: workflowDocs,
  serviceListing: service ? serviceListing(service) : undefined,
  ...fixtureComponentContents(components),
  channels: Object.fromEntries(components.filter((c) => c.type === "Channel").map((c) => [c.id, channelDetails(c)])),
});

const projectA = projects[0];
const projectAComponents = projectA.components.filter((c) => c.type !== "Workflow");

const meta: Meta<typeof WorkflowEditorPage> = {
  title: "Pages/WorkflowEditorPage",
  component: WorkflowEditorPage,
  parameters: { layout: "fullscreen" },
  args: {
    workflow: nationalIdWorkflow,
    workOrders,
    dataclips,
    graphForVersion: nationalIdWorkflowAt,
    projectName: "Project A",
    components: projectAComponents,
    onOpenComponent: () => {},
    onCreateChannel: async () => "new-channel",
    onCreateCollection: async () => "new-collection",
    onCreateComponent: async () => "new-component",
    onDraftComponentWithAI: () => {},
    channelCredentials: ["DHIS2 production", "Case Management API"],
    onSaveComponent: async () => {},
    onSaveCollectionItem: async () => {},
    onDeleteCollectionItem: async () => {},
    sandboxes: projects[0].sandboxes,
    versions: workflowVersions,
    assistantConversations,
    url: "https://app.openfn.org/i/8f3c2a1e",
    onBack: () => {},
    service: projects[0].services[0],
    onSeeDetails: () => {},
    adaptors: { info: adaptorInfo, snippets: adaptorSnippets, choices: adaptorChoices, credentials: projectCredentials },
    catalog: { adaptors: adaptorCatalog, categories: catalogCategories, builtInTools, aiModels, aiActions },
    systems: connectedSystems,
    contents: contentsFor(projectAComponents, projectA.services[0]),
    codeSummary,
    onRun: simulateRun,
    assistantSuggestions,
    onAssistantSend: (prompt, jobLabel, mode) => later(() => assistantReply(prompt, jobLabel, mode)),
    onAssistantCarryOutPlan: (plan) => later(() => assistantPlanResult(plan)),
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
type Story = StoryObj<typeof WorkflowEditorPage>;

/** On main: the canvas, read-only, with "Edit in sandbox" as the main action. */
export const Default: Story = {
  args: { initialLayout: { panel: false, assistant: false, explorer: true } },
};

/** A step selected with the runs bar Off: the inspector shows its config and what its code does. */
export const StepSelected: Story = {
  args: { initialSelectedId: "search", initialLayout: { canvasActivity: false } },
};

/** The trigger selected with the runs bar Off: its type, webhook URL and switch. */
export const TriggerSelected: Story = {
  args: { initialSelectedId: "trigger", initialLayout: { canvasActivity: false } },
};

/** Run history on the canvas with a step selected: its runs, failures and why they failed. */
export const StepStats: Story = {
  args: { initialSelectedId: "create", initialLayout: { canvasActivity: true } },
};

/** Run history with the trigger selected: the whole workflow's numbers. */
export const WorkflowStats: Story = {
  args: { initialSelectedId: "trigger", initialLayout: { canvasActivity: true } },
};

/** The runs bar's Filter open over the canvas, ready to load a run. */
export const RunsFilterOpen: Story = {
  args: { defaultRunsFilterOpen: true, initialLayout: { canvasActivity: true } },
};

/** A run loaded from the runs bar, drawn on the canvas. */
export const RunLoaded: Story = {
  args: { runId: sampleRun.runId },
};

/** A run loaded with a step selected: its log, input and output in the inspector. */
export const InspectorFollowingRun: Story = {
  args: { runId: sampleRun.runId, initialSelectedId: "search" },
};

/** A failed run with the failed step selected. */
export const FailedRunStepSelected: Story = {
  args: { runId: failedRun.runId, initialSelectedId: "create" },
};

/** A v1 run shown on the latest graph, with the banner offering the version that ran. */
export const OlderRunLoaded: Story = {
  args: { runId: olderRun.runId },
};

/** The same v1 run, viewed as executed. */
export const OlderRunAsExecuted: Story = {
  args: { runId: olderRun.runId, initialVersion: olderRun.version },
};

/** Health, opened from the explorer under service.md: the run history summed up in the main pane, in the code's place. */
export const Health: Story = {
  args: { initialView: "code", initialFile: "health" },
};

/** Code mode on main: explorer, read-only code and the step's settings. */
export const CodeReadOnly: Story = {
  args: { initialView: "code", initialFile: { stepId: "search" } },
};

/** The canvas in a sandbox: hover a step for the + that adds the next one, through "Connect a system". */
export const CanvasInSandbox: Story = {
  args: {
    sandbox: projects[0].sandboxes[1],
    initialLayout: { panel: false, assistant: false, canvasActivity: false },
  },
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

/** The context document kept with the workflow: the law behind it and who it affects. */
export const PlanDocument: Story = {
  args: { initialView: "code", initialFile: "context" },
};

/** The listing of the published service the workflow backs, after the context and spec. */
export const ServiceListing: Story = {
  args: { initialView: "code", initialFile: "service" },
};

/** A collection the workflow uses, opened from the explorer's Components group: its keys, to add, edit and delete. */
export const ComponentOpen: Story = {
  args: { initialView: "code", initialFile: { componentId: "planning-authority-codes" } },
};

/** An artifact opened from the explorer's Components group: its file, to edit and save, as on its page in the project. */
export const ArtifactOpen: Story = {
  args: { initialView: "code", initialFile: { componentId: "application-field-mapping" } },
};

/** An AI skill opened from the explorer's Components group. */
export const AISkillOpen: Story = {
  args: { initialView: "code", initialFile: { componentId: "triage-planning-applications" } },
};

/** A channel the workflow uses, opened from the explorer's Components group: its traffic, recent messages and message shape. */
export const ChannelOpen: Story = {
  args: { initialView: "code", initialFile: { componentId: "eplanning-submission-received" } },
};

/** The workflow's settings beside its YAML. */
export const WorkflowSettings: Story = {
  args: { initialView: "code", initialFile: "workflow", sandbox: projects[0].sandboxes[1] },
};

/** The step's adaptor snippets beside the code, ready to insert at the cursor. */
export const Snippets: Story = {
  args: {
    initialView: "code",
    initialFile: { stepId: "search" },
    initialLayout: { panel: false, details: true, detailsView: "snippets" },
    sandbox: projects[0].sandboxes[1],
  },
};

/** Explorer hidden and the panel maximised, as a reader might set it. */
export const CustomLayout: Story = {
  args: {
    initialView: "code",
    initialFile: { stepId: "search" },
    runId: sampleRun.runId,
    initialLayout: { explorer: false, details: false, panel: true, panelView: "output", panelMaximized: true, hiddenViews: ["failures"] },
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

const surveillance = projects.find((p) => p.id === "case-surveillance")!;
const surveillanceComponents = surveillance.components.filter((c) => c.type !== "Workflow");

/**
 * Workflow A: facilities call it over X-Road, and its steps reach OpenMRS and
 * the Ministry of Interior's own workflow service over X-Road too. Each step
 * just names a connected system; the badge is the only sign of X-Road.
 */
export const XRoadWorkflow: Story = {
  name: "X-Road workflow (A)",
  args: {
    workflow: registerCaseWorkflow,
    ...runHistories[registerCaseWorkflow.id],
    graphForVersion: () => registerCaseWorkflow,
    projectName: surveillance.name,
    components: surveillanceComponents,
    contents: contentsFor(surveillanceComponents, surveillance.services[0]),
    sandboxes: surveillance.sandboxes,
    versions: surveillanceVersions,
    assistantConversations: [],
    url: "https://app.openfn.org/i/case-surveillance/register-suspected-case",
    service: surveillance.services[0],
    initialSelectedId: "openmrs-patient",
    initialLayout: { canvasActivity: false, panel: false, assistant: false },
  },
};

/** Workflow B: the same kind of step on DHIS2, reached directly with a credential. */
export const DirectWorkflow: Story = {
  name: "Direct workflow (B)",
  args: {
    ...XRoadWorkflow.args,
    workflow: weeklyCaseReportWorkflow,
    ...runHistories[weeklyCaseReportWorkflow.id],
    graphForVersion: () => weeklyCaseReportWorkflow,
    url: undefined,
    service: undefined,
    onSeeDetails: undefined,
    initialSelectedId: "send-dhis2",
  },
};

/** Code mode with the Workflow docs, Components, Service catalog and Connected systems flags off: the trigger and steps, as in Lightning. */
export const CodeRedesign: Story = {
  args: {
    initialView: "code",
    showWorkflowFiles: false,
    showComponents: false,
    publishesServices: false,
    systems: [],
    service: undefined,
  },
};
