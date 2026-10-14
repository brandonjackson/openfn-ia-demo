import type { WorkflowGraph } from "../../mock-data/workflow";
import Button from "../Button";
import CodeEditor from "./CodeEditor";
import InspectorLayout, { InspectorFooter } from "./InspectorLayout";
import { workflowToYaml } from "./workflowYaml";
import CopyButton from "../CopyButton";

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
  const yaml = workflowToYaml(graph);
  return (
    <InspectorLayout
      title="Workflow as Code"
      onClose={onClose}
      footer={
        <InspectorFooter
          rightButtons={
            <>
              <Button id="download-workflow-code-btn" theme="secondary" onClick={() => download(`${graph.name}.yaml`, yaml)}>
                Download
              </Button>
              <CopyButton id="copy-workflow-code-btn" value={yaml} className="min-w-24">
                Copy Code
              </CopyButton>
            </>
          }
        />
      }
    >
      <div className="h-100 overflow-hidden rounded-md">
        <CodeEditor value={yaml} readOnly ariaLabel="Workflow YAML code" />
      </div>
    </InspectorLayout>
  );
}
