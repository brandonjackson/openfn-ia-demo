import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import WorkflowEditorTemplate from "../templates/WorkflowEditorTemplate";
import {
  buildStarterWorkflow,
  nationalIdWorkflow,
  nationalIdWorkflowAt,
  workflowVersions,
  type Workflow,
} from "../mock-data/workflow";
import { dataclips, workOrders } from "../mock-data/runs";
import { projects, serviceForWorkflow } from "../mock-data/projects";
import { serviceCatalogData } from "../mock-data/service-catalog";
import { useSandbox } from "../sandbox-state";
import { assistantConversations } from "../mock-data/assistant";

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
 * There is a single richly-modelled workflow ({@link nationalIdWorkflow});
 * any other workflow component in the prototype reuses its graph and history
 * but is relabelled with the component's name and owning project so the
 * editor reads correctly.
 */
function resolveWorkflow(workflowId?: string, version = "latest"): Workflow {
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
 * via `/workflow-editor/:workflowId`, or blank via `/workflow-editor/new`. "Back to …" in the editor's
 * Fn menu returns you to the workflows list of the workflow's project.
 *
 * The selected run is kept in the URL as `?run=<id>`, so a link to a run opens
 * the editor with that run on the canvas.
 */
export default function WorkflowEditorPage() {
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
      <WorkflowEditorTemplate
        key={isNew ? `new:${searchParams.get("project")}:${searchParams.get("channel")}` : workflow.id}
        workflow={workflow}
        workOrders={isNew ? [] : workOrders}
        dataclips={isNew ? [] : dataclips}
        graphForVersion={isNew ? undefined : (version) => resolveWorkflow(workflowId, version)}
        runId={runId}
        onRunChange={setRunId}
        onBack={() => (project ? navigate(`/projects/${project.id}/workflows`) : navigate(-1))}
        sandboxes={project?.sandboxes ?? ["main"]}
        sandbox={sandbox}
        onSelectSandbox={setSandbox}
        onViewAllSandboxes={project ? () => navigate(`/projects/${project.id}/sandboxes`) : undefined}
        versions={isNew ? [] : workflowVersions}
        url={service?.url}
        onSeeDetails={service ? () => navigate(service.path) : undefined}
        assistantConversations={isNew ? [] : assistantConversations}
      />
    </div>
  );
}
