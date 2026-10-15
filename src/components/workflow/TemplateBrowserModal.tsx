import { useState } from "react";
import { templateGraph } from "../../utils/workflowGraph";
import type { WorkflowTemplate } from "../../types/workflow-graph";
import Button from "../Button";
import Card from "../Card";
import Heading from "../Heading";
import Modal from "../Modal";
import SearchInput from "../SearchInput";
import WorkflowDiagram from "./WorkflowDiagram";
import { matchesQuery } from "../../utils/search";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  /** Templates available to the project (base templates and published ones). */
  templates: WorkflowTemplate[];
  onCreate: (template: WorkflowTemplate) => void;
}

/** A template's name over its clamped description. */
function TemplateSummary({ template, lines }: { template: WorkflowTemplate; lines: string }) {
  return (
    <div className="min-w-0">
      <Heading size="sm" as="p" className="truncate">
        {template.name}
      </Heading>
      <p className={`mt-0.5 text-gray-500 ${lines}`}>{template.description}</p>
    </div>
  );
}

/**
 * "Templates" (TemplateBrowserModal.tsx): searchable template list on the
 * left, a preview of the selected one on the right with Create.
 */
export default function TemplateBrowserModal({ isOpen, onClose, projectId, templates, onCreate }: Props) {
  const [query, setQuery] = useState("");
  const [previewedId, setPreviewedId] = useState<string | null>(templates[0]?.id ?? null);
  const visible = templates.filter((t) => matchesQuery(query, t.name, t.description));
  const previewed = templates.find((t) => t.id === previewedId) ?? null;

  return (
    <Modal open={isOpen} onClose={onClose} size="2xl" title="Templates">
      <div className="flex h-[70vh] max-h-160 gap-6 text-sm">
        <div className="w-76 shrink-0 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white pb-2">
            <SearchInput value={query} onChange={setQuery} placeholder="Search templates" size="sm" />
          </div>
          <div className="flex flex-col gap-2">
            {visible.map((t) => (
              <Card
                key={t.id}
                as="button"
                onClick={() => setPreviewedId(t.id)}
                aria-pressed={t.id === previewedId}
                className={t.id === previewedId ? "border-gray-500" : "hover:bg-gray-50"}
              >
                <TemplateSummary template={t} lines="line-clamp-3" />
              </Card>
            ))}
            {visible.length === 0 && <p className="py-2 text-gray-500">No saved templates match your search.</p>}
          </div>
        </div>
        <Card muted padding="none" className="flex min-w-0 flex-1 flex-col overflow-clip">
          <div className="min-h-0 flex-1">
            {previewed ? (
              <WorkflowDiagram key={previewed.id} graph={templateGraph(previewed, projectId)} selection={null} onSelect={() => {}} preview />
            ) : (
              <p className="flex h-full items-center justify-center text-gray-500">Select a template to preview it.</p>
            )}
          </div>
          {previewed && (
            <div className="flex items-center justify-between gap-14 bg-white p-4">
              <TemplateSummary template={previewed} lines="line-clamp-2" />
              <Button className="shrink-0" onClick={() => onCreate(previewed)}>
                Create
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Modal>
  );
}
