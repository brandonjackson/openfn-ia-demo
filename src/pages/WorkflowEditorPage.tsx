import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import WorkflowEditorTemplate from "../templates/WorkflowEditorTemplate";
import { nationalIdWorkflow, recentHistory } from "../mock-data/workflow";

/**
 * Full-screen route that drops the prototype's standard sidebar/chrome and
 * shows the workflow editor on its own, mirroring the real Lightning editor.
 * A small floating control returns you to the rest of the prototype.
 */
export default function WorkflowEditorPage() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen">
      <WorkflowEditorTemplate
        workflow={nationalIdWorkflow}
        history={recentHistory}
      />
      <button
        onClick={() => navigate("/")}
        title="Back to prototype"
        className="absolute bottom-4 left-1/2 z-50 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur hover:bg-white hover:text-gray-900"
      >
        <ArrowLeft size={13} />
        Back to prototype
      </button>
    </div>
  );
}
