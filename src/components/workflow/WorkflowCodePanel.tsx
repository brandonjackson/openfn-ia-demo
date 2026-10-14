import { useState } from "react";
import type { WorkflowGraph } from "../../mock-data/workflow";
import InspectorLayout from "./InspectorLayout";
import { workflowToYaml } from "./workflowYaml";

/**
 * "Workflow as Code" (`?panel=code`, inspector/CodeViewPanel.tsx): the
 * workflow's YAML, read-only, with Download and Copy Code. Closing returns
 * to settings.
 */
export default function WorkflowCodePanel({ graph, onClose }: { graph: WorkflowGraph; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const yaml = workflowToYaml(graph);
  const secondary =
    "rounded-md px-3 py-2 text-sm font-semibold bg-white hover:bg-gray-50 text-gray-900 ring-1 ring-inset ring-gray-300 shadow-xs";
  return (
    <InspectorLayout title="Workflow as Code" onClose={onClose}>
      <div className="px-4 py-5 sm:p-6">
        <textarea
          id="workflow-code-viewer"
          className="w-full font-mono text-sm bg-slate-700 text-slate-200 rounded-md shadow-xs p-4 border border-slate-300 resize-none text-nowrap overflow-x-auto overflow-y-auto focus:ring-0 focus:border-slate-400"
          value={yaml}
          readOnly
          rows={18}
          spellCheck={false}
          aria-label="Workflow YAML code"
          style={{ fontVariantLigatures: "none" }}
        />
      </div>
      <div className="shrink-0 border-t border-gray-200 p-3 -mt-px">
        <div className="flex justify-end gap-2">
          <a
            id="download-workflow-code-btn"
            href={`data:text/yaml;charset=utf-8,${encodeURIComponent(yaml)}`}
            download={`${graph.name}.yaml`}
            className={secondary}
          >
            Download
          </a>
          <button
            id="copy-workflow-code-btn"
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(yaml).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className={`${secondary} inline-grid`}
          >
            <span className="col-start-1 row-start-1 invisible" aria-hidden="true">
              Copy Code
            </span>
            <span className="col-start-1 row-start-1">{copied ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>
      </div>
    </InspectorLayout>
  );
}
