import { X, Info, Maximize2, Trash2, Play } from "lucide-react";
import type { JobNode } from "../../mock-data/workflow";
import { AdaptorIcon } from "./AdaptorIcon";

/**
 * The right-hand inspector shown when a job node is selected on the canvas.
 * Lets you rename the job, pick its adaptor, and run from this step.
 */
export default function JobInspectorPanel({
  job,
  onClose,
  onExpand,
}: {
  job: JobNode;
  onClose?: () => void;
  onExpand?: () => void;
}) {
  return (
    <div className="w-80 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="pr-2 text-sm font-semibold text-gray-900">{job.label}</h2>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Job Name
          </label>
          <input
            type="text"
            defaultValue={job.label}
            className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
            Adaptor
            <Info size={11} className="text-gray-300" />
          </label>
          <div className="flex items-center justify-between rounded-md border border-gray-200 px-2.5 py-2">
            <div className="flex items-center gap-2">
              <AdaptorIcon adaptor={job.adaptor} size="sm" />
              <span className="text-sm text-gray-700">
                {job.adaptor === "common" ? "Common" : job.adaptor === "http" ? "Http" : job.adaptor}
              </span>
              <span className="text-xs text-gray-400">latest</span>
            </div>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
              Edit
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <button
              onClick={onExpand}
              title="Expand editor"
              className="rounded-md border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
            >
              <Maximize2 size={16} />
            </button>
            <button
              title="Delete step"
              className="rounded-md border border-gray-200 p-2 text-gray-500 hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            <Play size={14} fill="currentColor" />
            Run From Here
          </button>
        </div>
      </div>
    </div>
  );
}
