import { useEffect, useRef } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import WorkflowEditorPage from "./WorkflowEditorPage";
import { type Workflow, type WorkflowFileContents, type WorkOrder } from "../model/workflow";
import type { WorkflowDocument } from "../model/workflow-document";
import { isLive } from "../model/workflow-document";
import type { ProjectDetails } from "../model/projects";
import { buildStarterWorkflow, workflowGraphs } from "../fixtures/workflow";
import { workflowHistory } from "../fixtures/workflow-lookup";
import { useChangedHistories } from "../app/history-state";
import { simulateRun } from "../fixtures/runs";
import { apiProjectId, fixtureProject, fixtureWorkflow, serviceForWorkflow } from "../fixtures/projects";
import { apiNodeId, apiWorkflowId, cloneNodeId } from "../fixtures/ids";
import { serviceCatalogData } from "../fixtures/service-catalog";
import { useSandbox } from "../app/sandbox-state";
import Loaded from "../app/Loaded";
import { useProject } from "../api/projects";
import { combine } from "../api/status";
import { asGraph, useProjectWorkflows, useSandboxes, useSandboxSaves, useWorkflow, useWorkflowSaves, useWorkflowSnapshots } from "../api/workflows";
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

/** A run history's steps named by the ids of the copy they're drawn on: `map` takes a fixture step id to it. */
function onCopy(orders: WorkOrder[], map: (jobId: string) => string): WorkOrder[] {
  return orders.map((wo) => ({ ...wo, runs: wo.runs.map((r) => ({ ...r, steps: r.steps.map((s) => ({ ...s, jobId: map(s.jobId) })) })) }));
}

/** A name for a new workflow that no other workflow in the project has: "Untitled workflow", "Untitled workflow 2"… */
function freeName(taken: string[]): string {
  let name = "Untitled workflow";
  for (let n = 2; taken.some((t) => t.toLowerCase() === name.toLowerCase()); n++) name = `Untitled workflow ${n}`;
  return name;
}

/** The sandboxes from the root down to `project`: each copy's ids are worked out from the one above. */
function chainTo(project: ProjectDetails, sandboxes: ProjectDetails[]): string[] {
  const chain: string[] = [];
  for (let p: ProjectDetails | undefined = project; p?.parentId; p = sandboxes.find((s) => s.id === p!.parentId)) chain.unshift(p.id);
  return chain;
}

/**
 * The full-screen workflow editor, fed from the API. It sits outside the
 * standard chrome, as in Lightning, and is opened at
 * `/workflow-editor/:workflowId` (an old link by a fixture's slug still
 * lands) or blank at `/workflow-editor/new?project=…&channel=…`.
 *
 * What's on the canvas is the workflow in the sandbox selected in the
 * project bar: main's, read-only, or a sandbox's own copy, paired by name
 * as a merge pairs them. In a sandbox every edit is saved to that copy;
 * "Go live" merges it into the sandbox's parent as a new version, which the
 * version picker lists. Turning the workflow on or off switches its
 * trigger, and deleting marks it deleted and goes back to the project.
 * "New workflow" makes one straight away, in the selected sandbox, so it's
 * in the project's lists from the start.
 *
 * Run history and dataclips are still the fixtures' until runs move to the
 * API, drawn on whichever copy is shown. The selected run is kept in the URL
 * as `?run=<id>`. The feature flags decide what else the editor is handed,
 * as before.
 */
export default function WorkflowEditorPageQuery() {
  const { workflowId } = useParams();
  const [searchParams] = useSearchParams();
  if (workflowId === "new") return <NewWorkflow params={searchParams} />;
  // Workflows are named by their id on the API now; an old link by a fixture's slug still lands.
  const legacy = workflowId && !/^[0-9a-f-]{36}$/.test(workflowId) && fixtureWorkflow(workflowId);
  if (legacy) return <Navigate to={`/workflow-editor/${apiWorkflowId(legacy.slug)}?${searchParams}`} replace />;
  return <ExistingWorkflow id={workflowId!} />;
}

/** Makes a new workflow in the project (and the sandbox selected in it), then opens it. */
function NewWorkflow({ params }: { params: URLSearchParams }) {
  const navigate = useNavigate();
  const projectParam = params.get("project") ?? "";
  const rootId = fixtureProject(projectParam) ? apiProjectId(fixtureProject(projectParam)!.id) : projectParam;
  const [sandboxName] = useSandbox(fixtureProject(rootId)?.id ?? rootId);
  const { project: root, status: rootStatus } = useProject(rootId);
  const { sandboxes, status: sandboxStatus } = useSandboxes(rootId);
  const target = sandboxName === "main" ? root : (sandboxes.find((s) => s.name === sandboxName) ?? root);
  const { workflows, status } = useProjectWorkflows(target?.id);
  const { create } = useWorkflowSaves();
  const started = useRef(false);
  const ready = combine(rootStatus, sandboxStatus, status);

  useEffect(() => {
    if (started.current || ready.state !== "ready" || !target) return;
    started.current = true;
    const channel = serviceCatalogData.entries.find((e) => e.kind === "channel" && e.id === params.get("channel"));
    const starter = buildStarterWorkflow({
      projectName: target.name,
      channel: channel?.kind === "channel" ? { name: channel.name, system: channel.system } : undefined,
    });
    void create(target.id, { ...starter, name: freeName(workflows.map((w) => w.name)) }).then(
      (made) => navigate(`/workflow-editor/${made.id}`, { replace: true }),
      () => navigate(-1),
    );
  }, [ready.state, target, workflows, create, navigate, params]);

  return <Loaded status={ready.state === "ready" ? { state: "loading" } : ready} path="/workflow-editor/new">{() => null}</Loaded>;
}

function ExistingWorkflow({ id }: { id: string }) {
  const { status, workflow: opened } = useWorkflow(id);
  const { status: projectStatus, project } = useProject(opened?.project_id);
  const rootId = project?.rootId;
  const { status: rootStatus, project: root } = useProject(rootId);
  const { status: sandboxStatus, sandboxes } = useSandboxes(rootId);
  return (
    <div className="h-screen">
      <Loaded status={combine(status, projectStatus, rootStatus, sandboxStatus)} path={`/workflow-editor/${id}`}>
        {() => <Editor opened={opened!} root={root!} sandboxes={sandboxes} />}
      </Loaded>
    </div>
  );
}

function Editor({ opened, root, sandboxes }: { opened: WorkflowDocument; root: ProjectDetails; sandboxes: ProjectDetails[] }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const [searchParams, setSearchParams] = useSearchParams();
  const fixtureRoot = fixtureProject(root.id);
  // The editor shares the project's selected sandbox with the rest of the app.
  const [sandbox, setSandbox] = useSandbox(fixtureRoot?.id ?? root.id);
  const selected = sandbox === "main" ? root : (sandboxes.find((s) => s.name === sandbox) ?? root);
  const { workflows: here } = useProjectWorkflows(selected.id);
  const { workflows: onMain } = useProjectWorkflows(root.id);
  // The copy on the canvas: the selected sandbox's workflow of the same name.
  const shown = here.find((w) => w.name === opened.name) ?? (selected.id === opened.project_id ? opened : undefined) ?? opened;
  const editable = selected.id !== root.id && shown.project_id === selected.id;
  const main = onMain.find((w) => w.name === opened.name) ?? opened;
  const { snapshots } = useWorkflowSnapshots(main.id);
  const saves = useWorkflowSaves();
  const sandboxSaves = useSandboxSaves();

  const slug = fixtureWorkflow(main.id)?.slug;
  // "See details" opens the service listing that documents this workflow.
  const service = !slug || !flags.serviceCatalog ? undefined : serviceForWorkflow(slug);
  // The fixtures' run history, with any runs retried or cancelled from History this session, drawn on this copy.
  const changed = useChangedHistories();
  const fixtureHistory = slug ? workflowHistory(slug) : undefined;
  const changedHistory = slug ? changed[slug] : undefined;
  const chain = chainTo(selected, sandboxes);
  const stepOnCopy = (jobId: string) => chain.reduce((nodeId, sandboxId) => cloneNodeId(sandboxId, nodeId), apiNodeId(slug ?? "", jobId));
  const history = fixtureHistory && {
    workOrders: onCopy(changedHistory?.workOrders ?? fixtureHistory.workOrders, stepOnCopy),
    dataclips: [...fixtureHistory.dataclips, ...(changedHistory?.dataclips ?? [])],
  };
  const components = fixtureRoot && componentsFor(fixtureRoot.components, flags).filter((c) => c.type !== "Workflow");
  // What opening the workflow's docs, its service listing and its components shows.
  const contents: WorkflowFileContents = {
    docs: workflowDocs,
    serviceListing: service ? serviceListing(service.service) : undefined,
    componentPreviews: Object.fromEntries((components ?? []).map((c) => [c.id, componentPreview(c)])),
    channels: Object.fromEntries((components ?? []).filter((c) => c.type === "Channel").map((c) => [c.id, channelDetails(c)])),
  };
  const graph: Workflow = asGraph(shown, root.name);
  const versionGraph = (version: string) => {
    const s = snapshots.find((x) => x.version.id === version);
    return s ? asGraph(s.document, root.name, version) : undefined;
  };

  const runId = searchParams.get("run") ?? undefined;
  const setRunId = (runId: string | undefined) =>
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        if (runId) next.set("run", runId);
        else next.delete("run");
        return next;
      },
      { replace: true },
    );
  const back = () => navigate(`/projects/${root.id}/workflows`);

  return (
    <WorkflowEditorPage
      workflow={graph}
      workOrders={history ? withoutXRoadCalls(history.workOrders, flags.xroad) : []}
      dataclips={history?.dataclips ?? []}
      graphForVersion={versionGraph}
      runId={runId}
      onRunChange={setRunId}
      onBack={back}
      onDelete={async () => {
        await saves.remove(shown);
        back();
      }}
      projectName={root.name}
      components={components}
      onOpenComponent={(componentId) => navigate(`/projects/${root.id}/components/${componentId}`)}
      // Like the project's Components page: drafted from a plain-words description on Create.
      onAddComponent={
        flags.components && flags.aiBuild
          ? (type) =>
              navigate(`/projects/${root.id}/create`, {
                state: { draft: `Add ${/^[aeiou]/i.test(type) ? "an" : "a"} ${type.toLowerCase()} to this project that ` },
              })
          : undefined
      }
      componentTypeOptions={componentTypesFor(flags)}
      sandboxes={["main", ...sandboxes.filter((s) => !s.scheduledDeletion).map((s) => s.name)]}
      sandbox={selected.id === root.id ? "main" : selected.name}
      onSelectSandbox={setSandbox}
      onViewAllSandboxes={() => navigate(`/projects/${root.id}/sandboxes`)}
      onCreateSandbox={async (name) => {
        await sandboxSaves.create(selected.id, { name, color: null });
      }}
      versions={snapshots.map((s) => s.version)}
      onSaveWorkflow={editable ? async (edited) => void (await saves.save(shown, edited)) : undefined}
      live={isLive(shown)}
      onToggleLive={(on) => saves.setEnabled(shown, on)}
      onPromote={
        editable && selected.parentId
          ? (message) => sandboxSaves.merge(selected.parentId!, selected.id, { targetId: selected.parentId!, workflowIds: [shown.id], message })
          : undefined
      }
      url={service?.url}
      service={service?.service}
      onSeeDetails={service ? () => navigate(service.path) : undefined}
      assistantConversations={slug && !workflowGraphs[slug] ? assistantConversations : []}
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
  );
}
