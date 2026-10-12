import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import WorkflowEditorTemplate from "../templates/WorkflowEditorTemplate";
import {
  buildStarterWorkflow,
  nationalIdWorkflow,
  recentHistory,
  type Workflow,
} from "../mock-data/workflow";
import { projects } from "../mock-data/projects";
import { serviceCatalogData } from "../mock-data/service-catalog";

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
 * Resolve a workflow to open from its id. There is a single richly-modelled
 * workflow ({@link nationalIdWorkflow}); any other workflow component in the
 * prototype reuses its graph but is relabelled with the component's name and
 * owning project so the editor reads correctly.
 */
function resolveWorkflow(workflowId?: string): Workflow {
  if (!workflowId || workflowId === nationalIdWorkflow.id) {
    return nationalIdWorkflow;
  }
  for (const project of projects) {
    const component = project.components.find(
      (c) => c.id === workflowId && c.type === "Workflow"
    );
    if (component) {
      return {
        ...nationalIdWorkflow,
        id: component.id,
        name: component.name,
        project: project.name,
      };
    }
  }
  return nationalIdWorkflow;
}

/**
 * Full-screen route that drops the prototype's standard sidebar/chrome and
 * shows the workflow editor on its own, mirroring the real Lightning editor.
 * Opened from anywhere a workflow is opened (e.g. a project's components list)
 * via `/workflow-editor/:workflowId`, or blank via `/workflow-editor/new`. A back control in the top-left corner
 * returns you to the app shell view you came from.
 */
export default function WorkflowEditorPage() {
  const navigate = useNavigate();
  const { workflowId } = useParams();
  const [searchParams] = useSearchParams();
  const isNew = workflowId === "new";
  const workflow = isNew ? resolveNewWorkflow(searchParams) : resolveWorkflow(workflowId);

  return (
    <div className="h-screen">
      <WorkflowEditorTemplate
        workflow={workflow}
        history={isNew ? [] : recentHistory}
        onBack={() => navigate(-1)}
      />
    </div>
  );
}
