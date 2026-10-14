import { useState } from "react";
import type { WorkflowGraph } from "../../mock-data/workflow";
import Button from "../Button";
import CodeEditor from "./CodeEditor";
import InspectorLayout from "./InspectorLayout";
import { workflowToYaml } from "./workflowYaml";

function download(filename: string, text: string) {
  const a = document.createElement("a");
  a.href = `data:text/yaml;charset=utf-8,${encodeURIComponent(text)}`;
  a.download = filename;
  a.click();
}

/**
 * "Workflow as Code" (`?panel=code`, inspector/CodeViewPanel.tsx): the
 * workflow's YAML, read-only, with Download and Copy Code. Closing returns
 * to settings.
 */
export default function WorkflowCodePanel({ graph, onClose }: { graph: WorkflowGraph; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const yaml = workflowToYaml(graph);
  return (
    <InspectorLayout
      title="Workflow as Code"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button id="download-workflow-code-btn" theme="secondary" onClick={() => download(`${graph.name}.yaml`, yaml)}>
            Download
          </Button>
          <Button
            id="copy-workflow-code-btn"
            theme="secondary"
            className="min-w-24"
            onClick={() => {
              void navigator.clipboard?.writeText(yaml).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Copied!" : "Copy Code"}
          </Button>
        </div>
      }
    >
      <div className="h-[28rem] p-6">
        <div className="h-full overflow-hidden rounded-md">
          <CodeEditor value={yaml} readOnly ariaLabel="Workflow YAML code" />
        </div>
      </div>
    </InspectorLayout>
  );
}
