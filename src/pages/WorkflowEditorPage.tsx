import { useNavigate, useParams } from "react-router-dom";
import WorkflowEditorTemplate from "../templates/WorkflowEditorTemplate";
import {
  nationalIdWorkflow,
  recentHistory,
  type Workflow,
} from "../mock-data/workflow";
import { projects } from "../mock-data/projects";

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
 * via `/workflow-editor/:workflowId`. A back control in the top-left corner
 * returns you to the app shell view you came from.
 */
export default function WorkflowEditorPage() {
  const navigate = useNavigate();
  const { workflowId } = useParams();
  const workflow = resolveWorkflow(workflowId);

  return (
    <div className="h-screen">
      <WorkflowEditorTemplate
        workflow={workflow}
        history={recentHistory}
        onBack={() => navigate(-1)}
      />
    </div>
  );
}
