import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import WorkflowEditorPage from "./WorkflowEditorPage";
import { type WorkOrder, type Workflow, type WorkflowFileContents } from "../model/workflow";
import { buildStarterWorkflow, nationalIdWorkflow, surveillanceVersions, workflowGraphs, workflowVersions } from "../fixtures/workflow";
import { resolveWorkflow, workflowHistory } from "../fixtures/workflow-lookup";
import { useChangedHistories } from "../app/history-state";
import { simulateRun } from "../fixtures/runs";
import { projects, serviceForWorkflow } from "../fixtures/projects";
import { serviceCatalogData } from "../fixtures/service-catalog";
import { useSandbox } from "../app/sandbox-state";
import { assistantConversations, assistantPlanResult, assistantReply, assistantSuggestions } from "../fixtures/assistant";
import { adaptorChoices, adaptorInfo, adaptorSnippets, projectCredentials } from "../fixtures/adaptor-reference";
import { adaptorCatalog, aiActions, aiModels, builtInTools, catalogCategories } from "../fixtures/adaptor-catalog";
import { codeSummary } from "../fixtures/code-summaries";
import { channelDetails } from "../fixtures/channels";
import { componentPreview, serviceListing, workflowDocs } from "../fixtures/workflow-files";
import type { AdaptorReference } from "../model/adaptor-reference";
import type { AdaptorCatalog } from "../model/adaptor-catalog";
import { useFlags } from "../app/feature-flags";
import { componentTypesFor, componentsFor, systemsFor } from "./flagged.fixtures";

/** The adaptors steps can use, and the project's credentials for them. */
const adaptors: AdaptorReference = {
  info: adaptorInfo,
  snippets: adaptorSnippets,
  choices: adaptorChoices,
  credentials: projectCredentials,
};

/** Every adaptor, for "Connect a system". */
const catalog: AdaptorCatalog = {
  adaptors: adaptorCatalog,
  categories: catalogCategories,
  builtInTools,
  aiModels,
  aiActions,
};

/** Work orders without who called over X-Road, when the organisation isn't on it. */
function withoutXRoadCalls(orders: WorkOrder[], xroad: boolean): WorkOrder[] {
  if (xroad) return orders;
  return orders.map((wo) => ({ ...wo, runs: wo.runs.map((r) => ({ ...r, xroad: undefined })) }));
}

/** How long the fake assistant "thinks" before answering. */
const REPLY_DELAY_MS = 900;

/** The fake assistant's answer, after it has thought about it. */
function later<T>(answer: () => T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(answer()), REPLY_DELAY_MS));
}

/**
 * `/workflow-editor/new?project=…&channel=…` opens a blank workflow in that
 * project, triggered by the given event channel when there is one.
 */
function resolveNewWorkflow(params: URLSearchParams): Workflow {
  const project = projects.find((p) => p.id === params.get("project")) ?? projects[0];
  const channel = serviceCatalogData.entries.find(
    (e) => e.kind === "channel" && e.id === params.get("channel")
  );
  return buildStarterWorkflow({
    projectName: project.name,
    channel: channel?.kind === "channel" ? { name: channel.name, system: channel.system } : undefined,
  });
}

/**
 * Full-screen route that drops the prototype's standard sidebar/chrome and
 * shows the workflow editor on its own, mirroring the real Lightning editor.
 * Opened from anywhere a workflow is opened (e.g. a project's components list)
 * via `/workflow-editor/:workflowId`, or blank via `/workflow-editor/new`. The
 * Fn menu in the top-left corner leads back to the workflows list of the
 * workflow's project.
 *
 * The selected run is kept in the URL as `?run=<id>`, so a link to a run opens
 * the editor with that run on the canvas.
 *
 * The feature flags decide what the editor is handed: connected systems (none
 * without the flag, none over X-Road without X-Road), whether the workflow
 * backs a service, which components it lists, and whether the explorer lists
 * the workflow's own files.
 */
export default function WorkflowEditorPageFixtures() {
  const navigate = useNavigate();
  const flags = useFlags();
  const { workflowId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNew = workflowId === "new";
  const workflow = isNew ? resolveNewWorkflow(searchParams) : resolveWorkflow(workflowId);
  // The editor shares the project's selected sandbox with the rest of the app.
  const project = projects.find((p) => p.name === workflow.project);
  const [sandbox, setSandbox] = useSandbox(project?.id ?? workflow.project);
  // "See details" opens the service listing that documents this workflow.
  const service = isNew || !flags.serviceCatalog ? undefined : serviceForWorkflow(workflow.id);
  // The workflow's run history, with any runs retried or cancelled from History this session.
  const changed = useChangedHistories();
  const fixtureHistory = isNew ? undefined : workflowHistory(workflowId ?? nationalIdWorkflow.id);
  const changedHistory = workflowId ? changed[workflowId] : undefined;
  const history = fixtureHistory && {
    workOrders: changedHistory?.workOrders ?? fixtureHistory.workOrders,
    dataclips: [...fixtureHistory.dataclips, ...(changedHistory?.dataclips ?? [])],
  };
  const ownGraph = !!(workflowId && workflowGraphs[workflowId]);
  const components = project && componentsFor(project.components, flags).filter((c) => c.type !== "Workflow");
  // What opening the workflow's docs, its service listing and its components shows.
  const contents: WorkflowFileContents = {
    docs: workflowDocs,
    serviceListing: service ? serviceListing(service.service) : undefined,
    componentPreviews: Object.fromEntries((components ?? []).map((c) => [c.id, componentPreview(c)])),
    channels: Object.fromEntries((components ?? []).filter((c) => c.type === "Channel").map((c) => [c.id, channelDetails(c)])),
  };

  const runId = searchParams.get("run") ?? undefined;
  const setRunId = (id: string | undefined) =>
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        if (id) next.set("run", id);
        else next.delete("run");
        return next;
      },
      { replace: true }
    );

  return (
    <div className="h-screen">
      <WorkflowEditorPage
        workflow={workflow}
        workOrders={history ? withoutXRoadCalls(history.workOrders, flags.xroad) : []}
        dataclips={history?.dataclips ?? []}
        graphForVersion={isNew ? undefined : (version) => resolveWorkflow(workflowId, version)}
        runId={runId}
        onRunChange={setRunId}
        onBack={() => (project ? navigate(`/projects/${project.id}/workflows`) : navigate(-1))}
        projectName={project?.name}
        components={components}
        onOpenComponent={project ? (id) => navigate(`/projects/${project.id}/components/${id}`) : undefined}
        // Like the project's Components page: drafted from a plain-words description on Create.
        onAddComponent={
          project && flags.components && flags.aiBuild
            ? (type) =>
                navigate(`/projects/${project.id}/create`, {
                  state: { draft: `Add ${/^[aeiou]/i.test(type) ? "an" : "a"} ${type.toLowerCase()} to this project that ` },
                })
            : undefined
        }
        componentTypeOptions={componentTypesFor(flags)}
        sandboxes={project?.sandboxes ?? ["main"]}
        sandbox={sandbox}
        onSelectSandbox={setSandbox}
        onViewAllSandboxes={project ? () => navigate(`/projects/${project.id}/sandboxes`) : undefined}
        versions={isNew ? [] : ownGraph ? surveillanceVersions : workflowVersions}
        url={service?.url}
        service={service?.service}
        onSeeDetails={service ? () => navigate(service.path) : undefined}
        assistantConversations={isNew || ownGraph ? [] : assistantConversations}
        adaptors={adaptors}
        catalog={catalog}
        systems={systemsFor(flags)}
        showWorkflowFiles={flags.workflowDocs}
        showComponents={flags.components}
        publishesServices={flags.serviceCatalog}
        contents={contents}
        codeSummary={codeSummary}
        onRun={simulateRun}
        assistantSuggestions={assistantSuggestions}
        onAssistantSend={(prompt, jobLabel, mode) => later(() => assistantReply(prompt, jobLabel, mode))}
        onAssistantCarryOutPlan={(plan) => later(() => assistantPlanResult(plan))}
      />
    </div>
  );
}
