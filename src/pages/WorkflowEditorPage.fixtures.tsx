import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import WorkflowEditorPage from "./WorkflowEditorPage";
import {
  buildStarterWorkflow,
  nationalIdWorkflow,
  nationalIdWorkflowAt,
  surveillanceVersions,
  workflowGraphs,
  workflowVersions,
  type Workflow,
} from "../fixtures/workflow";
import { dataclips, runHistories, workOrders } from "../fixtures/runs";
import { projects, serviceForWorkflow } from "../fixtures/projects";
import { serviceCatalogData } from "../fixtures/service-catalog";
import { useSandbox } from "../app/sandbox-state";
import { assistantConversations } from "../fixtures/assistant";

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
 * Resolve a workflow to open from its id, at a version ("latest" by default).
 * A few workflows have a graph and history of their own ({@link workflowGraphs});
 * any other workflow component in the prototype reuses the national ID
 * workflow's graph and history ({@link nationalIdWorkflow}) but is
 * relabelled with the component's name and owning project so the editor
 * reads correctly.
 */
function resolveWorkflow(workflowId?: string, version = "latest"): Workflow {
  if (workflowId && workflowGraphs[workflowId]) return workflowGraphs[workflowId];
  const graph = nationalIdWorkflowAt(version);
  if (!workflowId || workflowId === nationalIdWorkflow.id) {
    return graph;
  }
  for (const project of projects) {
    const component = project.components.find(
      (c) => c.id === workflowId && c.type === "Workflow"
    );
    if (component) {
      return {
        ...graph,
        id: component.id,
        name: component.name,
        project: project.name,
      };
    }
  }
  return graph;
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
 */
export default function WorkflowEditorPageFixtures() {
  const navigate = useNavigate();
  const { workflowId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNew = workflowId === "new";
  const workflow = isNew ? resolveNewWorkflow(searchParams) : resolveWorkflow(workflowId);
  // The editor shares the project's selected sandbox with the rest of the app.
  const project = projects.find((p) => p.name === workflow.project);
  const [sandbox, setSandbox] = useSandbox(project?.id ?? workflow.project);
  // "See details" opens the service listing that documents this workflow.
  const service = isNew ? undefined : serviceForWorkflow(workflow.id);
  // Workflows with a graph of their own have their own run history too.
  const history = workflowId ? runHistories[workflowId] : undefined;
  const ownGraph = !!(workflowId && workflowGraphs[workflowId]);

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
        workOrders={isNew ? [] : (history?.workOrders ?? workOrders)}
        dataclips={isNew ? [] : (history?.dataclips ?? dataclips)}
        graphForVersion={isNew ? undefined : (version) => resolveWorkflow(workflowId, version)}
        runId={runId}
        onRunChange={setRunId}
        onBack={() => (project ? navigate(`/projects/${project.id}/workflows`) : navigate(-1))}
        projectName={project?.name}
        components={project?.components.filter((c) => c.type !== "Workflow")}
        onOpenComponent={project ? (id) => navigate(`/projects/${project.id}/components/${id}`) : undefined}
        // Like the project's Components page: drafted from a plain-words description on Create.
        onAddComponent={
          project
            ? (type) =>
                navigate(`/projects/${project.id}/create`, {
                  state: { draft: `Add ${/^[aeiou]/i.test(type) ? "an" : "a"} ${type.toLowerCase()} to this project that ` },
                })
            : undefined
        }
        sandboxes={project?.sandboxes ?? ["main"]}
        sandbox={sandbox}
        onSelectSandbox={setSandbox}
        onViewAllSandboxes={project ? () => navigate(`/projects/${project.id}/sandboxes`) : undefined}
        versions={isNew ? [] : ownGraph ? surveillanceVersions : workflowVersions}
        url={service?.url}
        service={service?.service}
        onSeeDetails={service ? () => navigate(service.path) : undefined}
        assistantConversations={isNew || ownGraph ? [] : assistantConversations}
      />
    </div>
  );
}
