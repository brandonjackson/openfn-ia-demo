import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { stepToolKinds, withoutStepTools, withoutToolResults } from "../model/step-tools";
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import WorkflowEditorPage, { WorkflowEditorLoading } from "./WorkflowEditorPage";
import { type Workflow, type WorkflowFileContents, type WorkOrder } from "../model/workflow";
import { type WorkflowDocument, isLive } from "../model/workflow-document";
import type { ProjectDetails } from "../model/projects";
import { sandboxNames } from "../model/sandboxes";
import { buildStarterWorkflow, workflowGraphs } from "../fixtures/workflow";
import { simulateRun } from "../fixtures/runs";
import { apiProjectId, fixtureProject, fixtureWorkflow } from "../fixtures/projects";
import { apiWorkflowId, seedId } from "../fixtures/ids";
import { serviceCatalogData } from "../fixtures/service-catalog";
import { useSandbox } from "../app/sandbox-state";
import Loaded from "../app/Loaded";
import { useProject } from "../api/projects";
import { useCreateStepCredential, useCredentialSchemaLoader, useCredentialSchemas, useProjectCredentials } from "../api/credentials";
import { useAdaptors, useConnectedSystems, useSystemSaves } from "../api/connected-systems";
import { useDataclips, useRunSaves, useWorkOrders } from "../api/work-orders";
import { useDataclipSaves } from "../api/dataclips";
import { runInputName, savedDataclips } from "../model/dataclips";
import { useProjectComponents } from "./component-records.query";
import { eventAddress } from "./channel-records.query";
import { useCollectionsItems } from "../api/collections";
import { starterContent } from "../model/project-components";
import { combine, inTurn } from "../api/status";
import { useEnvVars, useEnvVarSaves } from "../api/env-vars";
import { useTestCases, useTestCaseSaves } from "../api/test-cases";
import { asGraph, useProjectWorkflows, useSandboxComponentChanges, useSandboxes, useSandboxSaves, useWorkflow, useWorkflowSaves, useWorkflowSnapshots } from "../api/workflows";
import { componentChanges } from "../model/workflow-changes";
import { assistantConversations, assistantPlanResult, assistantReply, assistantSuggestions } from "../fixtures/assistant";
import { adaptorChoices, adaptorInfo, adaptorSnippets } from "../fixtures/adaptor-reference";
import { adaptorCatalog, aiActions, aiModels, builtInTools, catalogCategories } from "../fixtures/adaptor-catalog";
import { codeSummary } from "../fixtures/code-summaries";
import { workflowDocs } from "../fixtures/workflow-files";
import { isCallableFromStep, serviceUrl, serviceYaml } from "../model/services";
import { useOrganizationXRoad } from "../api/organization";
import { useAllServices } from "../api/services";
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

/** Every adaptor, for "Add a step". */
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

/** The fake assistant's work, done no sooner than it would take it to think. */
function thinking<T>(work: Promise<T>): Promise<T> {
  return Promise.all([work, new Promise((resolve) => setTimeout(resolve, REPLY_DELAY_MS))]).then(([answer]) => answer);
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
 * "Create promotion request" merges it into the sandbox's parent as a new version, which the
 * version picker lists. Turning the workflow on or off switches its
 * trigger, and deleting marks it deleted and goes back to the project.
 * "New workflow" makes one straight away, in the selected sandbox, so it's
 * in the project's lists from the start. Opened from Create's Build, the
 * prompt rides along in router state and the assistant opens on it.
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

/** What the editor can be opened with in router state: a prompt from Create for the assistant. */
interface EditorState {
  prompt?: string;
}

/** Makes a new workflow in the project (and the sandbox selected in it), then opens it. */
function NewWorkflow({ params }: { params: URLSearchParams }) {
  const navigate = useNavigate();
  // A prompt from Create is handed on to the new workflow's editor.
  const prompt = (useLocation().state as EditorState | null)?.prompt;
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
      (made) => navigate(`/workflow-editor/${made.id}`, { replace: true, state: prompt ? { prompt } : undefined }),
      () => navigate(-1),
    );
  }, [ready.state, target, workflows, create, navigate, params, prompt]);

  return (
    <Screen>
      <Loaded status={ready.state === "ready" ? { state: "loading" } : ready} path="/workflow-editor/new" loading={<WorkflowEditorLoading />}>
        {() => null}
      </Loaded>
    </Screen>
  );
}

/** The editor fills the window, loading or loaded. */
function Screen({ children }: { children: ReactNode }) {
  return <div className="h-screen">{children}</div>;
}

function ExistingWorkflow({ id }: { id: string }) {
  const { status, workflow: opened } = useWorkflow(id);
  const { status: projectStatus, project } = useProject(opened?.project_id);
  const rootId = project?.rootId;
  const { status: rootStatus, project: root } = useProject(rootId);
  const { status: sandboxStatus, sandboxes } = useSandboxes(rootId);
  // Each waits on the one before: the project isn't asked for until the workflow names it, so until then it's loading, not missing.
  const ready = inTurn(status, projectStatus, combine(rootStatus, sandboxStatus));
  return (
    <Screen>
      <Loaded status={ready} path={`/workflow-editor/${id}`} loading={<WorkflowEditorLoading />}>
        {() => <Editor opened={opened!} root={root!} sandboxes={sandboxes} />}
      </Loaded>
    </Screen>
  );
}

function Editor({ opened, root, sandboxes }: { opened: WorkflowDocument; root: ProjectDetails; sandboxes: ProjectDetails[] }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const [searchParams, setSearchParams] = useSearchParams();
  // A prompt from Create is read once, then taken out of the history entry so a reload doesn't send it again.
  const location = useLocation();
  const [assistantPrompt] = useState(() => (location.state as EditorState | null)?.prompt);
  const promptCleared = useRef(false);
  useEffect(() => {
    if (promptCleared.current || !assistantPrompt) return;
    promptCleared.current = true;
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [assistantPrompt, navigate, location.pathname, location.search]);
  // The editor shares the project's selected sandbox with the rest of the app.
  const [sandbox, setSandbox] = useSandbox(root.id);
  const listed = sandbox === "main" ? root : (sandboxes.find((s) => s.name === sandbox) ?? root);
  // A sandbox as the list has it says nothing of what you may do there; its own details do.
  const { project: details } = useProject(listed.id === root.id ? undefined : listed.id);
  const selected = listed.id === root.id ? root : (details ?? listed);
  const { workflows: here } = useProjectWorkflows(selected.id);
  const { workflows: onMain } = useProjectWorkflows(root.id);
  // The copy on the canvas: the selected sandbox's workflow of the same name.
  const shown = here.find((w) => w.name === opened.name) ?? (selected.id === opened.project_id ? opened : undefined) ?? opened;
  const editable = selected.id !== root.id && shown.project_id === selected.id;
  const main = onMain.find((w) => w.name === opened.name) ?? opened;
  // Where going live merges the copy: its parent's workflow of the same name, to say what's changed.
  const { workflows: inParent, status: parentStatus } = useProjectWorkflows(editable ? (selected.parentId ?? undefined) : undefined);
  const parentCopy = inParent.find((w) => w.name === shown.name);
  const { snapshots } = useWorkflowSnapshots(main.id);
  const saves = useWorkflowSaves();
  const sandboxSaves = useSandboxSaves();
  // Sandboxes share their project's credentials: a step anywhere in the tree picks from the project's links.
  const { credentials } = useProjectCredentials(root.id);
  const { systems } = useConnectedSystems();
  // An adaptor picked in "Add a step" that the project has no system for is added as one first.
  const { adaptors: systemAdaptors } = useAdaptors(flags.connectedSystems && editable);
  const systemSaves = useSystemSaves();
  const adaptors: AdaptorReference = { ...adaptorReference, credentials };
  // A step's New credential makes one shared with the project, which every sandbox in it uses too.
  const { schemas: credentialSchemas } = useCredentialSchemas();
  const loadCredentialSchema = useCredentialSchemaLoader();
  const createStepCredential = useCreateStepCredential(root.id);

  const slug = fixtureWorkflow(main.id)?.slug;
  // "See details" opens the page of the service main's workflow backs, from the services API.
  const { services: allServices } = useAllServices(flags.serviceCatalog);
  const backed = allServices.find((s) => s.projectId === root.id && s.workflowId === main.id);
  // What a new step can call: the organisation's Live services over HTTP, filed as the catalog files them, but never the one this workflow backs, which would call itself.
  const stepServices = flags.serviceCatalog
    ? allServices
        .filter((s) => isCallableFromStep(s) && s.workflowId !== main.id)
        .map((s) => ({ ...s, offeredBy: s.section ?? s.projectName }))
    : undefined;
  // service.yaml lists it as X-Road registers it, once the organisation is on X-Road.
  const { xroad } = useOrganizationXRoad(flags.xroad && !!backed);
  const service = backed && { service: backed, path: `/projects/${root.id}/services/${backed.id}`, url: serviceUrl(backed) };
  // The shown copy's own run history: main's on main; a sandbox's copy starts with none, as in Lightning.
  const { workOrders: projectOrders } = useWorkOrders([shown.project_id]);
  const { dataclips: projectClips } = useDataclips(shown.project_id);
  const runSaves = useRunSaves();
  const dataclipSaves = useDataclipSaves();
  // Who can save dataclips in the project shown: editors and up, as with its workflows.
  const canSaveDataclips = !!selected.permissions?.edit_workflow;
  const history = useMemo(() => {
    // The shown copy's own dataclips, and every dataclip saved in its project under a name.
    const own = projectClips.filter((d) => d.workflow_id === shown.id);
    const ids = new Set(own.map((d) => d.id));
    return {
      workOrders: projectOrders.filter((o) => o.workflowId === shown.id).map((o) => o.workOrder),
      dataclips: [...own, ...savedDataclips(projectClips.filter((d) => !ids.has(d.id)))],
    };
  }, [projectOrders, projectClips, shown.id]);
  // The components of the project shown, from the API: its channels, collections and the rest. A sandbox
  // is a copy of its project, components included, so in one the editor shows and changes the sandbox's own.
  const records = useProjectComponents(selected);
  const components = componentsFor(records.items, flags);
  const { items: collectionItems } = useCollectionsItems(selected.id, records.collections.map((c) => c.name));
  // Editors and up change a project's components, as they do its workflows.
  const canEditComponents = !!selected.permissions?.edit_workflow;
  // Its environment variables too: a sandbox has its own, and its runs use their values for its environment.
  const { envVars } = useEnvVars(flags.envVars ? selected.id : undefined);
  const envVarSaves = useEnvVarSaves(selected.id);
  // The shown copy's test cases: a sandbox's copy has its own, promoted with it. They're written in a
  // sandbox, like the workflow, and run anywhere you could run the workflow.
  const { testCases } = useTestCases(flags.testCases ? shown.project_id : undefined, flags.testCases ? shown.id : undefined);
  const testSaves = useTestCaseSaves(shown.project_id, shown.id);
  const canWriteTests = flags.testCases && editable && canEditComponents;
  const canRunTests = flags.testCases && !!selected.permissions?.edit_workflow;
  // What the sandbox changes in them against its parent, which merging brings back with the workflow.
  const componentVersion = [
    ...records.channels.channels.map((c) => `${c.component.id}:${c.lockVersion}`),
    ...records.collections.map((c) => c.name),
    ...records.contents.map((c) => `${c.component.id}:${c.lockVersion}`),
    ...envVars.map((v) => `${v.id}:${v.updatedAt}`),
  ].join(",");
  const { changes: changedComponents } = useSandboxComponentChanges(editable ? (selected.parentId ?? undefined) : undefined, editable ? selected.id : undefined, componentVersion);
  // What opening the workflow's docs, its service listing and its components shows.
  const contents: WorkflowFileContents = {
    // The docs are written for the fixtures' workflows; any other starts with them blank.
    docs: slug ? workflowDocs : { context: "", spec: "" },
    serviceListing: service ? serviceYaml(service.service, { code: service.service.code, xroad }) : undefined,
    componentContents: Object.fromEntries(records.contents.map((c) => [c.component.id, c.details])),
    collections: Object.fromEntries(
      records.collections.map((c) => [c.id, { items: collectionItems[c.name] ?? [], itemCount: c.itemCount, byteSize: c.byteSize }]),
    ),
    channels: Object.fromEntries(records.channels.channels.map((c) => [c.component.id, c.details])),
  };
  const collectionName = (id: string) => records.collections.find((c) => c.id === id)?.name ?? "";
  const contentResource = (id: string) => records.contents.find((c) => c.component.id === id)!;
  // With tools off, a tool step is the code step it runs as.
  const withTools = (g: Workflow) => (flags.stepTools ? g : withoutStepTools(g));
  const graph: Workflow = withTools(asGraph(shown, root.name));
  const versionGraph = (version: string) => {
    const s = snapshots.find((x) => x.version.id === version);
    return s ? withTools(asGraph(s.document, root.name, version)) : undefined;
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
      workOrders={useMemo(() => {
        const orders = withoutXRoadCalls(history.workOrders, flags.xroad);
        return flags.stepTools ? orders : withoutToolResults(orders);
      }, [history, flags.xroad, flags.stepTools])}
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
      componentsLoading={records.status.state === "loading"}
      // A component's page in the project shows main's, so a sandbox's own copy doesn't link to it.
      onOpenComponent={selected.id === root.id ? (componentId) => navigate(`/projects/${root.id}/components/${componentId}`) : undefined}
      onCreateChannel={canEditComponents ? (draft) => records.channels.saves.create(draft, eventAddress(root.name, draft.name)) : undefined}
      onCreateCollection={records.canManageCollections ? (name) => records.saves.collections.create(selected.id, name) : undefined}
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
      componentChanges={editable ? componentChanges(changedComponents) : undefined}
      sandboxes={sandboxNames(sandboxes)}
      sandbox={selected.id === root.id ? "main" : selected.name}
      onSelectSandbox={setSandbox}
      onViewAllSandboxes={() => navigate(`/projects/${root.id}/sandboxes`)}
      onCreateSandbox={async (name, start) => {
        // A saved dataclip comes across with the sandbox; a reviewed copy of a run's input is saved in it once it's made.
        const id = await sandboxSaves.create(selected.id, { name, color: null, dataclipIds: start.kind === "saved" ? [start.dataclip.id] : [] });
        if (start.kind === "run") await dataclipSaves.create(id, { name: runInputName(start.runId), description: "", body: start.body });
      }}
      onCreateDataclip={canSaveDataclips ? (draft) => dataclipSaves.create(shown.project_id, draft, shown.id) : undefined}
      onSaveDataclip={canSaveDataclips ? (id, changes) => dataclipSaves.update(shown.project_id, id, changes) : undefined}
      versions={snapshots.map((s) => s.version)}
      onSaveWorkflow={editable ? async (edited) => void (await saves.save(shown, edited)) : undefined}
      live={isLive(shown)}
      onToggleLive={(on) => saves.setEnabled(shown, on)}
      onPromote={
        editable && selected.parentId
          ? (message) => sandboxSaves.merge(selected.parentId!, selected.id, { targetId: selected.parentId!, workflowIds: [shown.id], message })
          : undefined
      }
      // Until the parent's workflows are in, there's nothing to compare against, so say nothing rather than "new".
      baseline={parentCopy ? asGraph(parentCopy, root.name) : parentStatus.state === "ready" ? undefined : graph}
      environment={selected.env}
      credentialSchemas={editable ? credentialSchemas : undefined}
      onLoadCredentialSchema={loadCredentialSchema}
      credentialProjects={[{ id: root.id, name: root.name }]}
      onCreateCredential={editable ? createStepCredential : undefined}
      envVars={flags.envVars ? envVars : undefined}
      onCreateEnvVar={flags.envVars && canEditComponents ? envVarSaves.create : undefined}
      onUpdateEnvVar={flags.envVars && canEditComponents ? envVarSaves.update : undefined}
      onDeleteEnvVar={flags.envVars && canEditComponents ? envVarSaves.remove : undefined}
      testCases={flags.testCases ? testCases : undefined}
      // The assistant takes a moment to make an input, run it and judge what came out.
      onRunTestCase={canRunTests ? (id) => thinking(testSaves.run(id)) : undefined}
      onCreateTestCase={canWriteTests ? testSaves.create : undefined}
      onUpdateTestCase={canWriteTests ? testSaves.update : undefined}
      onDeleteTestCase={canWriteTests ? testSaves.remove : undefined}
      onGenerateTestCases={canWriteTests ? () => thinking(testSaves.generate()) : undefined}
      url={service?.url}
      service={service?.service}
      onSeeDetails={service ? () => navigate(service.path) : undefined}
      assistantConversations={slug && !workflowGraphs[slug] ? assistantConversations : []}
      adaptors={adaptors}
      catalog={catalog}
      systems={systemsFor(flags, systems)}
      systemAdaptors={flags.connectedSystems && editable ? systemAdaptors : undefined}
      onAddSystem={
        flags.connectedSystems && editable
          ? (input) => systemSaves.add(input)
          : undefined
      }
      stepServices={stepServices}
      tools={flags.stepTools ? stepToolKinds : undefined}
      showWorkflowFiles={flags.workflowDocs}
      showComponents={flags.components}
      publishesServices={flags.serviceCatalog}
      contents={contents}
      codeSummary={codeSummary}
      onRun={simulateRun}
      assistantSuggestions={assistantSuggestions}
      onAssistantSend={(prompt, jobLabel, mode) => later(() => assistantReply(prompt, jobLabel, mode))}
      onAssistantCarryOutPlan={(plan) => later(() => assistantPlanResult(plan))}
      assistantPrompt={assistantPrompt}
    />
  );
}
