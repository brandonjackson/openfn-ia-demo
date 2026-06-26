import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
 * via `/workflow-editor/:workflowId`. A floating control returns you to where
 * you came from.
 */
export default function WorkflowEditorPage() {
  const navigate = useNavigate();
  const { workflowId } = useParams();
  const workflow = resolveWorkflow(workflowId);

  return (
    <div className="relative h-screen">
      <WorkflowEditorTemplate workflow={workflow} history={recentHistory} />
      <button
        onClick={() => navigate(-1)}
        title="Back to prototype"
        className="absolute bottom-4 left-1/2 z-50 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur hover:bg-white hover:text-gray-900"
      >
        <ArrowLeft size={13} />
        Back to prototype
      </button>
    </div>
  );
}
