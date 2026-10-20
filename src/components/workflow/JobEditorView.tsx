import { useState } from "react";
import { X, ChevronsUpDown, FileText, Tag, History, Play } from "lucide-react";
import type { JobNode, RunDetails } from "../../mock-data/workflow";
import CodeEditor from "./CodeEditor";
import RunPanel from "./RunPanel";
import LogConsole from "./LogConsole";
import { AdaptorIcon } from "./AdaptorIcon";

type Tab = "logs" | "input" | "output";

/**
 * The expanded job editor body: a job sub-header, the code editor on the left,
 * and a run inspector / log console stacked on the right.
 *
 * This is the surface you reach by clicking "expand" on a job in the canvas
 * inspector. It deliberately omits the workflow top bar so it can be embedded
 * either under a standalone template or inside the canvas editor.
 */
export default function JobEditorView({
  job,
  run,
  onClose,
}: {
  job: JobNode;
  run: RunDetails;
  onClose?: () => void;
}) {
  const [tab, setTab] = useState<Tab>("logs");

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Job sub-header */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-3 min-w-0">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50">
            <span className="truncate max-w-[260px]">{job.label}</span>
            <ChevronsUpDown size={14} className="text-gray-400 flex-shrink-0" />
          </button>
          <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1">
            <AdaptorIcon adaptor={job.adaptor} size="sm" />
            <span className="text-sm text-gray-700">
              {job.adaptor === "common" ? "Common" : "Http"}
            </span>
            <span className="text-xs text-gray-400">latest</span>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
              Edit
            </button>
          </div>
          <button className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <FileText size={14} /> Docs
          </button>
          <button className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <Tag size={14} /> Metadata
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            <History size={14} /> History
          </button>
          <div className="flex items-center rounded-md bg-indigo-600 text-white overflow-hidden">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium hover:bg-indigo-700">
              <Play size={14} fill="currentColor" /> Run (Retry)
            </button>
          </div>
          <button
            onClick={onClose}
            title="Collapse editor"
            className="text-gray-300 hover:text-gray-500"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Split body */}
      <div className="grid flex-1 grid-cols-2 overflow-hidden divide-x divide-gray-200">
        {/* Code editor */}
        <div className="overflow-hidden">
          <CodeEditor code={job.body} />
        </div>

        {/* Run inspector + logs */}
        <div className="flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-200 px-3">
            <span className="mr-2 inline-flex items-center gap-1.5 rounded-t-md border-x border-t border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-blue-600">
              Run {run.runId.slice(0, 6)}
              <X size={11} className="text-gray-400" />
            </span>
            {(["logs", "input", "output"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-2 text-sm capitalize ${
                  tab === t
                    ? "border-b-2 border-blue-500 font-medium text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Run details (top half) */}
          <div className="flex-shrink-0 overflow-auto border-b border-gray-200">
            {tab === "logs" ? (
              <RunPanel run={run} />
            ) : (
              <pre className="overflow-auto bg-gray-50 p-4 font-mono text-xs text-gray-600">
                {tab === "input"
                  ? '{\n  "given_name": "Aleksa",\n  "date_of_birth": "1950-01-01"\n}'
                  : '{\n  "nationalId": "YTSG-2026-004812",\n  "status": "issued"\n}'}
              </pre>
            )}
          </div>

          {/* Log console (bottom half) */}
          <div className="min-h-0 flex-1">
            <LogConsole lines={run.logs} />
          </div>
        </div>
      </div>
    </div>
  );
}
