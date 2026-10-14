import { useState } from "react";
import { templateGraph, workflowTemplates, type WorkflowTemplate } from "../../mock-data/workflow";
import { cn } from "../../utils/cn";
import Button from "../Button";
import Modal from "../Modal";
import SearchInput from "../SearchInput";
import WorkflowDiagram from "./WorkflowDiagram";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onCreate: (template: WorkflowTemplate) => void;
}

/**
 * "Templates" (TemplateBrowserModal.tsx): searchable template list on the
 * left, a preview of the selected one on the right with Create.
 */
export default function TemplateBrowserModal({ isOpen, onClose, projectId, onCreate }: Props) {
  const [query, setQuery] = useState("");
  const [previewedId, setPreviewedId] = useState<string | null>(workflowTemplates[0]?.id ?? null);
  const q = query.trim().toLowerCase();
  const visible = workflowTemplates.filter((t) => !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  const previewed = workflowTemplates.find((t) => t.id === previewedId) ?? null;

  return (
    <Modal open={isOpen} onClose={onClose} size="2xl" title="Templates">
      <div className="flex h-[70vh] max-h-160 min-h-0 gap-6">
        <div className="relative flex w-76 shrink-0 flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white pb-2">
              <SearchInput value={query} onChange={setQuery} placeholder="Search templates" size="sm" />
            </div>
            <div className="flex flex-col gap-2">
              {visible.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPreviewedId(t.id)}
                  aria-pressed={t.id === previewedId}
                  className={cn(
                    "w-full text-left rounded-lg border bg-white p-4 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary-600",
                    t.id === previewedId ? "border-gray-500" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  <p className="mt-0.5 text-sm text-gray-500 line-clamp-3">{t.description}</p>
                </button>
              ))}
              {visible.length === 0 && <p className="py-2 text-sm text-gray-500">No saved templates match your search.</p>}
            </div>
          </div>
        </div>
        <div className="flex flex-1 min-w-0 flex-col rounded-lg border border-gray-200 bg-gray-50 overflow-clip">
          <div className="flex-1 min-h-0">
            {previewed ? (
              <WorkflowDiagram key={previewed.id} graph={templateGraph(previewed, projectId)} selection={null} onSelect={() => {}} preview />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">Select a template to preview it.</div>
            )}
          </div>
          {previewed && (
            <div className="flex items-center justify-between bg-white gap-14 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{previewed.name}</p>
                <p className="mt-0.5 line-clamp-2 min-h-[2lh] text-sm text-gray-500">{previewed.description}</p>
              </div>
              <span className="shrink-0">
                <Button onClick={() => onCreate(previewed)}>Create</Button>
              </span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
