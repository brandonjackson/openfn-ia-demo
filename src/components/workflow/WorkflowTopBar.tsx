import {
  ChevronDown,
  HelpCircle,
  SlidersHorizontal,
  Play,
  MessageSquare,
} from "lucide-react";
import type { Workflow } from "../../mock-data/workflow";

/**
 * The editor top bar: project / workflow breadcrumb with a version selector on
 * the left, and the inspector toggle, Run and Save actions on the right.
 */
export default function WorkflowTopBar({
  workflow,
  runLabel = "Run",
}: {
  workflow: Workflow;
  runLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-2.5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm min-w-0">
        <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-gray-700 hover:bg-gray-50">
          <span className="inline-block w-4 h-4 rounded bg-gray-200" />
          <span className="font-medium">{workflow.project}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500">Workflows</span>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-900 truncate">{workflow.name}</span>
        <button className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200">
          {workflow.version}
          <ChevronDown size={12} />
        </button>
        <HelpCircle size={16} className="text-gray-300" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          title="Toggle inspector"
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600"
        >
          <span className="ml-auto mr-0.5 inline-block h-5 w-5 rounded-full bg-white shadow" />
        </button>
        <button title="Run settings" className="p-1.5 text-gray-400 hover:text-gray-600">
          <SlidersHorizontal size={18} />
        </button>
        <div className="flex items-center rounded-md bg-blue-600 text-white overflow-hidden">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium hover:bg-blue-700">
            <Play size={14} fill="currentColor" />
            {runLabel}
          </button>
          <button className="px-1.5 py-1.5 border-l border-blue-500 hover:bg-blue-700">
            <ChevronDown size={14} />
          </button>
        </div>
        <button className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
          Save
        </button>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-600">
          <MessageSquare size={16} />
        </button>
      </div>
    </div>
  );
}
