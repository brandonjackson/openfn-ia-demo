import { useState } from "react";
import { templateGraph, workflowTemplates, type WorkflowTemplate } from "../../mock-data/workflow";
import { cn } from "../../utils/cn";
import ActionButton from "./ActionButton";
import EditorDialog from "./EditorDialog";
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
    <EditorDialog open={isOpen} onClose={onClose} className="rounded-2xl shadow-2xl flex flex-col h-[90vh] max-h-180 sm:max-w-5xl">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-xl font-medium text-gray-900">Templates</h2>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Close">
          <span className="hero-x-mark h-5 w-5 block" />
        </button>
      </div>
      <div className="flex flex-1 min-h-0 px-6 pb-6">
        <div className="relative w-76 shrink-0 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white pb-2">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <span className="hero-magnifying-glass h-4 w-4 text-gray-400" />
                </span>
                <input
                  type="text"
                  aria-label="Search templates"
                  placeholder="Search templates"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-0 focus-visible:border-gray-500"
                />
              </div>
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
        <div className="relative w-6 shrink-0" />
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
                <ActionButton onClick={() => onCreate(previewed)}>Create</ActionButton>
              </span>
            </div>
          )}
        </div>
      </div>
    </EditorDialog>
  );
}
