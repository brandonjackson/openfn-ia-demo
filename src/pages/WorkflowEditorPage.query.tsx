import { useEffect, useMemo, useRef } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import WorkflowEditorPage from "./WorkflowEditorPage";
import { type Workflow, type WorkflowFileContents, type WorkOrder } from "../model/workflow";
import { type WorkflowDocument, isLive } from "../model/workflow-document";
import type { ProjectDetails } from "../model/projects";
import { buildStarterWorkflow, workflowGraphs } from "../fixtures/workflow";
import { simulateRun } from "../fixtures/runs";
import { apiProjectId, fixtureProject, fixtureWorkflow } from "../fixtures/projects";
import { apiWorkflowId, seedId } from "../fixtures/ids";
import { serviceCatalogData } from "../fixtures/service-catalog";
import { useSandbox } from "../app/sandbox-state";
import Loaded from "../app/Loaded";
import { useProject } from "../api/projects";
import { useProjectCredentials } from "../api/credentials";
import { useConnectedSystems } from "../api/connected-systems";
import { useDataclips, useRunSaves, useWorkOrders } from "../api/work-orders";
import { useProjectComponents } from "./component-records.query";
import { eventAddress } from "./channel-records.query";
import { useCollectionsItems } from "../api/collections";
import { starterContent } from "../model/project-components";
import { combine } from "../api/status";
import { asGraph, useProjectWorkflows, useSandboxes, useSandboxSaves, useWorkflow, useWorkflowSaves, useWorkflowSnapshots } from "../api/workflows";
import { assistantConversations, assistantPlanResult, assistantReply, assistantSuggestions } from "../fixtures/assistant";
import { adaptorChoices, adaptorInfo, adaptorSnippets } from "../fixtures/adaptor-reference";
import { adaptorCatalog, aiActions, aiModels, builtInTools, catalogCategories } from "../fixtures/adaptor-catalog";
import { codeSummary } from "../fixtures/code-summaries";
import { workflowDocs } from "../fixtures/workflow-files";
import { serviceListing, serviceUrl } from "../model/services";
import { useProjectServices } from "../api/services";
import type { AdaptorReference } from "../model/adaptor-reference";
import type { AdaptorCatalog } from "../model/adaptor-catalog";
import { useFlags } from "../app/feature-flags";
import { systemsFor } from "../model/connected-systems";
import { componentTypesFor, componentsFor } from "../model/component-types";

/** The adaptors steps can use; the project's credentials for them come from the API. */
const adaptorReference: Omit<AdaptorReference, "credentials"> = {
  info: adaptorInfo,
  snippets: adaptorSnippets,
  choices: adaptorChoices,
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

/** A name for a new workflow that no other workflow in the project has: "Untitled workflow", "Untitled workflow 2"… */
function freeName(taken: string[]): string {
  let name = "Untitled workflow";
  for (let n = 2; taken.some((t) => t.toLowerCase() === name.toLowerCase()); n++) name = `Untitled workflow ${n}`;
  return name;
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
  const [sandboxName] = useSandbox(rootId);
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
    // The catalog names a system's channel by its id on the API (src/fake-api/connected-systems.ts).
    const channel = serviceCatalogData.entries.find((e) => e.kind === "channel" && seedId("system_channel", e.id) === params.get("channel"));
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
  // The editor shares the project's selected sandbox with the rest of the app.
  const [sandbox, setSandbox] = useSandbox(root.id);
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
  // Sandboxes share their project's credentials: a step anywhere in the tree picks from the project's links.
  const { credentials } = useProjectCredentials(root.id);
  const { systems } = useConnectedSystems();
  const adaptors: AdaptorReference = { ...adaptorReference, credentials };

  const slug = fixtureWorkflow(main.id)?.slug;
  // "See details" opens the page of the service main's workflow backs, from the services API.
  const { services } = useProjectServices(root.id, flags.serviceCatalog);
  const backed = services.find((s) => s.workflowId === main.id);
  const service = backed && { service: backed, path: `/projects/${root.id}/services/${backed.id}`, url: serviceUrl(backed) };
  // The shown copy's own run history: main's on main; a sandbox's copy starts with none, as in Lightning.
  const { workOrders: projectOrders } = useWorkOrders([shown.project_id]);
  const { dataclips: projectClips } = useDataclips(shown.project_id);
  const runSaves = useRunSaves();
  const history = useMemo(
    () => ({
      workOrders: projectOrders.filter((o) => o.workflowId === shown.id).map((o) => o.workOrder),
      dataclips: projectClips.filter((d) => d.workflow_id === shown.id),
    }),
    [projectOrders, projectClips, shown.id],
  );
  // The project's components from the API: its channels, collections and the rest. Components belong
  // to the project, so a sandbox's editor shows and changes its project's.
  const records = useProjectComponents(root);
  const components = componentsFor(records.items, flags);
  const { items: collectionItems } = useCollectionsItems(root.id, records.collections.map((c) => c.name));
  // Editors and up change a project's components, as they do its workflows.
  const canEditComponents = !!root.permissions?.edit_workflow;
  // What opening the workflow's docs, its service listing and its components shows.
  const contents: WorkflowFileContents = {
    // The docs are written for the fixtures' workflows; any other starts with them blank.
    docs: slug ? workflowDocs : { context: "", spec: "" },
    serviceListing: service ? serviceListing(service.service) : undefined,
    componentContents: Object.fromEntries(records.contents.map((c) => [c.component.id, c.details])),
    collections: Object.fromEntries(
      records.collections.map((c) => [c.id, { items: collectionItems[c.name] ?? [], itemCount: c.itemCount, byteSize: c.byteSize }]),
    ),
    channels: Object.fromEntries(records.channels.channels.map((c) => [c.component.id, c.details])),
  };
  const collectionName = (id: string) => records.collections.find((c) => c.id === id)?.name ?? "";
  const contentResource = (id: string) => records.contents.find((c) => c.component.id === id)!;
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
      workOrders={useMemo(() => withoutXRoadCalls(history.workOrders, flags.xroad), [history, flags.xroad])}
      dataclips={history.dataclips}
      // Lightning's worker runs workflows, so it refuses a run the editor made (docs/api-gaps.md): the run then
      // stays in the editor, loaded, until it's reopened.
      onRunFinished={(made, clips, retryOf) => void runSaves.record(shown.project_id, shown.id, made, clips, retryOf).catch(() => undefined)}
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
      onCreateChannel={canEditComponents ? (draft) => records.channels.saves.create(draft, eventAddress(root.name, draft.name)) : undefined}
      onCreateCollection={records.canManageCollections ? (name) => records.saves.collections.create(root.id, name) : undefined}
      onCreateComponent={canEditComponents ? (type, draft) => records.saves.components.create(type, draft, starterContent(type, draft.name.trim())) : undefined}
      // Like the project's Components page: drafted from a plain-words description on Create.
      onDraftComponentWithAI={
        flags.aiBuild
          ? (type) =>
              navigate(`/projects/${root.id}/create`, {
                state: { draft: `Add ${/^[aeiou]/i.test(type) ? "an" : "a"} ${type.toLowerCase()} to this project that ` },
              })
          : undefined
      }
      channelCredentials={records.channels.credentialNames}
      channelAddress={(name) => eventAddress(root.name, name)}
      onSaveComponent={canEditComponents ? (id, content) => records.saves.components.saveContent(contentResource(id), content) : undefined}
      onSaveCollectionItem={canEditComponents ? (id, key, value) => records.saves.items.save(collectionName(id), key, value) : undefined}
      onDeleteCollectionItem={canEditComponents ? (id, key) => records.saves.items.remove(collectionName(id), key) : undefined}
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
      systems={systemsFor(flags, systems)}
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
