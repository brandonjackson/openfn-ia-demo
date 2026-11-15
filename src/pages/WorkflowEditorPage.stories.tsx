import { useEffect, useRef, useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import WorkflowEditorPage, { WorkflowEditorLoading } from "./WorkflowEditorPage";
import { nationalIdTestCaseRecords } from "../fixtures/test-cases";
import { nationalIdWorkflow, nationalIdWorkflowAt, registerCaseWorkflow, surveillanceVersions, weeklyCaseReportWorkflow, workflowVersions } from "../fixtures/workflow";
import { dataclips, failedRun, olderRun, runHistories, sampleRun, simulateRun, workOrders } from "../fixtures/runs";
import { projects, stepServices } from "../fixtures/projects";
import { assistantConversations, assistantPlanResult, assistantReply, assistantSuggestions } from "../fixtures/assistant";
import { adaptorChoices, adaptorInfo, adaptorSnippets, projectCredentials } from "../fixtures/adaptor-reference";
import { adaptorCatalog, aiActions, aiModels, builtInTools, catalogCategories } from "../fixtures/adaptor-catalog";
import { connectedSystems } from "../fixtures/connected-systems";
import { codeSummary } from "../fixtures/code-summaries";
import { channelDetails } from "../fixtures/channels";
import { workflowDocs } from "../fixtures/workflow-files";
import { projectAEnvVars } from "../fixtures/env-vars";
import { serviceYaml } from "../model/services";
import { orgXRoad } from "../fixtures/xroad";
import { fixtureComponentContents } from "../fixtures/project-components";
import type { ProjectComponent, ProjectService } from "../model/projects";
import type { Dataclip, RunDetails, WorkflowFileContents } from "../model/workflow";
import { sandboxSlug } from "../model/sandboxes";
import { runInputName } from "../model/dataclips";
import { shortId } from "../model/runs";

/** The fake assistant "thinks" this long before answering. */
const REPLY_DELAY_MS = 900;
const later = <T,>(answer: () => T) => new Promise<T>((resolve) => setTimeout(() => resolve(answer()), REPLY_DELAY_MS));

/** What opening a workflow's docs, service listing and components shows, for a project's components. */
const contentsFor = (components: ProjectComponent[], service?: ProjectService): WorkflowFileContents => ({
  docs: { "context.md": workflowDocs.context, "spec.md": workflowDocs.spec },
  serviceListing: service ? serviceYaml(service, { code: service.id, xroad: orgXRoad }) : undefined,
  ...fixtureComponentContents(components),
  channels: Object.fromEntries(components.filter((c) => c.type === "Channel").map((c) => [c.id, channelDetails(c)])),
});

/** How long a step of a run takes in a story, as on the fake server. */
const STEP_TIME_MS = 700;

/**
 * Stands in for the page's wrapper and the server behind it: it holds what a
 * server would (the workflow as saved, the loaded run, the selected sandbox,
 * the trigger's switch, the sandboxes, the versions, the run history and the
 * dataclips), starting from the story's args, and plays out a run a step at
 * a time. So a story can edit, run, retry, switch sandbox, pause the
 * workflow, make a sandbox and promote one.
 */
function EditorWithState(args: ComponentProps<typeof WorkflowEditorPage>) {
  const [workflow, setWorkflow] = useState(args.workflow);
  const [runId, setRunId] = useState(args.runId);
  const [sandbox, setSandbox] = useState(args.sandbox);
  const [live, setLive] = useState(args.live);
  const [sandboxes, setSandboxes] = useState(args.sandboxes ?? ["main"]);
  const [versions, setVersions] = useState(args.versions ?? []);
  const [clips, setClips] = useState(args.dataclips ?? []);
  const [orders, setOrders] = useState(args.workOrders ?? []);

  const timers = useRef<ReturnType<typeof setInterval>[]>([]);
  useEffect(() => () => timers.current.forEach(clearInterval), []);

  /** The server's worker: a new run of a work order, saved as each step finishes. */
  const play = (workOrderId: string, input: Dataclip, fromJobId?: string) => {
    const base = { workflow, version: versions[0]?.id ?? "draft", input, workOrderId, runId: shortId(), fromJobId, startedBy: "Jane Doe" };
    const put = ({ run, dataclips: made }: { run: RunDetails; dataclips: Dataclip[] }) => {
      setOrders((current) => {
        const runs = [run, ...(current.find((o) => o.id === workOrderId)?.runs.filter((r) => r.runId !== run.runId) ?? [])];
        return [{ id: workOrderId, status: run.status, lastActivity: run.when, runs }, ...current.filter((o) => o.id !== workOrderId)];
      });
      setClips((current) => [...current, ...made.filter((d) => !current.some((c) => c.id === d.id))]);
    };
    const started = simulateRun({ ...base, progress: 0 });
    put(started);
    let progress = 0;
    const timer = setInterval(() => {
      progress += 1;
      const next = progress < started.run.steps.length ? simulateRun({ ...base, progress }) : simulateRun(base);
      put(next);
      if (next.run.status !== "running") clearInterval(timer);
    }, STEP_TIME_MS);
    timers.current.push(timer);
    return { runId: base.runId };
  };

  return (
    <WorkflowEditorPage
      {...args}
      workflow={workflow}
      onSaveWorkflow={async (edited) => setWorkflow(edited)}
      runId={runId}
      onRunChange={setRunId}
      sandbox={sandbox}
      onSelectSandbox={setSandbox}
      live={live}
      onToggleLive={async (on) => setLive(on)}
      sandboxes={sandboxes}
      workOrders={orders}
      dataclips={clips}
      onRun={async ({ fromJobId, input }) => {
        const existing = input && "dataclipId" in input ? clips.find((d) => d.id === input.dataclipId) : undefined;
        const made: Dataclip = existing ?? { id: shortId(), type: "saved_input", body: input && "body" in input ? input.body : "{}", name: input && "name" in input ? input.name : undefined, created: "just now" };
        if (!existing) setClips((current) => [made, ...current]);
        return play(shortId(), made, fromJobId);
      }}
      onRetryRun={async (id, fromJobId) => {
        const run = orders.flatMap((o) => o.runs).find((r) => r.runId === id);
        const step = run?.steps.find((s) => s.jobId === fromJobId);
        const input = clips.find((d) => d.id === (step?.inputId ?? run?.inputId));
        if (!run || !input) throw new Error("This run's input is gone.");
        return play(run.workOrderId, input, fromJobId);
      }}
      onCreateDataclip={async (draft) => {
        const made: Dataclip = { id: shortId(), type: "saved_input", created: "just now", ...draft, description: draft.description || undefined };
        setClips((current) => [made, ...current]);
        return made;
      }}
      onSaveDataclip={async (id, changes) => setClips((current) => current.map((c) => (c.id === id ? { ...c, name: changes.name, description: changes.description || undefined } : c)))}
      onCreateSandbox={async (draft) => {
        setSandboxes((current) => [...current, sandboxSlug(draft.name)]);
        // A reviewed copy of a run's input comes along as a saved dataclip.
        const input = draft.runInput;
        if (input) setClips((current) => [{ id: shortId(), type: "saved_input", body: input.body, name: runInputName(input.runId), created: "just now" }, ...current]);
      }}
      versions={versions}
      onPromote={async (message) => {
        const next = `v${Math.max(0, ...versions.map((v) => Number(v.id.replace(/^v/, "")) || 0)) + 1}`;
        setVersions((current) => [{ id: next, message, author: "Jane Doe", date: "20 Oct 2026" }, ...current]);
      }}
    />
  );
}

const projectA = projects[0];
const projectAComponents = projectA.components.filter((c) => c.type !== "Workflow");

const meta: Meta<typeof WorkflowEditorPage> = {
  title: "Pages/WorkflowEditorPage",
  component: WorkflowEditorPage,
  parameters: { layout: "fullscreen" },
  render: (args) => <EditorWithState {...args} />,
  args: {
    workflow: nationalIdWorkflow,
    // What a server would hold starts here; `EditorWithState` keeps it from then on.
    sandbox: "main",
    live: true,
    onRunChange: () => {},
    onSelectSandbox: () => {},
    onToggleLive: async () => {},
    onCreateSandbox: async () => {},
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
    environment: "production",
    envVars: projectAEnvVars,
    onCreateEnvVar: async () => {},
    onUpdateEnvVar: async () => {},
    onDeleteEnvVar: async () => {},
    testCases: nationalIdTestCaseRecords,
    onRunTestCase: async () => ({ ...nationalIdTestCaseRecords[0]!.lastResult!, ranAt: "just now" }),
    onCreateTestCase: async () => {},
    onUpdateTestCase: async () => {},
    onDeleteTestCase: async () => {},
    onGenerateTestCases: async () => ({ created: 1, names: ["Logs never pair a name with a date of birth"], upToDate: 3, notInSpec: 0 }),
    // In a sandbox, what's changed is counted against main's copy: this one, so edits made in a story show up.
    baseline: nationalIdWorkflow,
    assistantConversations,
    url: "https://app.openfn.org/i/8f3c2a1e",
    onBack: () => {},
    service: projects[0].services[0],
    onSeeDetails: () => {},
    adaptors: { info: adaptorInfo, snippets: adaptorSnippets, choices: adaptorChoices, credentials: projectCredentials },
    catalog: { adaptors: adaptorCatalog, categories: catalogCategories, builtInTools, aiModels, aiActions },
    systems: connectedSystems,
    stepServices,
    contents: contentsFor(projectAComponents, projectA.services[0]),
    codeSummary,
    // `EditorWithState` plays runs out; this only says the story can run.
    onRun: async () => ({}),
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

/** Health, opened from the explorer under service.yaml: the run history summed up in the main pane, in the code's place. */
export const Health: Story = {
  args: { initialView: "code", initialFile: "health" },
};

/** Saved dataclips, opened from the explorer's Workflow group: each with Run as its main action, and its title and description to edit. */
export const SavedDataclips: Story = {
  args: { initialView: "code", initialFile: "dataclips", },
};

/** The workflow's test cases, under Saved dataclips in the explorer: Run all tests at the top, each with its own Run, and Generate from spec. */
export const TestCases: Story = {
  args: { initialView: "code", initialFile: "testCases", runId: undefined, initialLayout: { explorer: true } },
};

/** In a sandbox, the Workflow group's + opens what can be added: the service manifest, spec, a saved dataclip, context or a doc. */
export const AddToWorkflow: Story = {
  args: {
    sandbox: projects[0].sandboxes[1],
    initialView: "code",
    initialFile: "workflow",
    defaultAddFileOpen: true,
    initialLayout: { assistant: false, panel: false },
  },
};

/** A new workflow with no docs yet: the Workflow group lists only workflow.yaml and Health until its + adds the rest. */
export const NewWorkflowFiles: Story = {
  args: {
    sandbox: projects[0].sandboxes[1],
    initialView: "code",
    initialFile: "workflow",
    service: undefined,
    dataclips: [],
    workOrders: [],
    contents: { ...contentsFor(projectAComponents), docs: {} },
    initialLayout: { assistant: false, panel: false },
  },
};

/** Code mode on main: explorer, read-only code and the step's settings. */
export const CodeReadOnly: Story = {
  args: { initialView: "code", initialFile: { stepId: "search" } },
};

/** The canvas in a sandbox: hover a step for the + that adds the next one, through "Add a step". */
export const CanvasInSandbox: Story = {
  args: {
    sandbox: projects[0].sandboxes[1],
    initialLayout: { panel: false, assistant: false, canvasActivity: false },
  },
};

/** A new workflow opened from Create's Build: the assistant opens on the prompt and starts on it. */
export const OpenedFromCreate: Story = {
  args: {
    sandbox: projects[0].sandboxes[1],
    assistantConversations: [],
    assistantPrompt: "When a birth is registered in OpenCRVS, open a child benefit application in Salesforce.",
    initialLayout: { panel: false, assistant: true },
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

/** In a sandbox, changed since main's v1: the sandbox chip counts the changes and lists what going live takes to main. */
export const InSandbox: Story = {
  args: { sandbox: projects[0].sandboxes[1], environment: "staging", baseline: nationalIdWorkflowAt("v1") },
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
    stepServices: undefined,
    service: undefined,
  },
};

/** The project's environment variables, opened from Workflow in the explorer. */
export const EnvironmentVariables: Story = {
  args: { initialView: "code", initialFile: "envVars", runId: undefined, initialLayout: { explorer: true } },
};

/** While the workflow is on its way: the editor's frame, with a spinner where the workflow's name goes. */
export const Loading: Story = {
  render: () => <WorkflowEditorLoading />,
};
