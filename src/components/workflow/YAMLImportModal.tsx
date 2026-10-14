import { useState } from "react";
import ActionButton from "./ActionButton";
import CodeEditor from "./CodeEditor";
import EditorDialog from "./EditorDialog";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the YAML text; the demo builds a blank workflow from it. */
  onCreate: (yaml: string) => void;
}

/**
 * "Import a workflow" (YAMLImportModal.tsx): upload or paste YAML, then
 * Create. The demo only checks that something looks like a workflow spec.
 */
export default function YAMLImportModal({ isOpen, onClose, onCreate }: Props) {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [yaml, setYaml] = useState("");
  const looksValid = /^name:/m.test(yaml) && /^jobs:/m.test(yaml);
  const error = yaml.trim() && !looksValid ? "Workflow YAML needs a top-level name and jobs." : null;

  return (
    <EditorDialog open={isOpen} onClose={onClose} className="rounded-2xl shadow-2xl sm:max-w-lg flex flex-col">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-xl font-medium text-gray-900">Import a workflow</h2>
        <button
          type="button"
          onClick={() => setMode(mode === "upload" ? "paste" : "upload")}
          className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {mode === "upload" ? "Paste text" : "Upload a file"}
        </button>
      </div>
      <div className="h-80 px-6 pb-4">
        {mode === "upload" ? (
          <div className="h-full flex flex-col gap-2">
            <div className="relative flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors border-gray-200 hover:border-gray-300">
              <input
                id="workflow-file"
                aria-label="Upload a file"
                type="file"
                accept=".yaml,.yml"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    void file.text().then((t) => {
                      setYaml(t);
                      setMode("paste");
                    });
                }}
              />
              <label htmlFor="workflow-file" className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                <div className="bg-gray-100 rounded-xl p-3 mb-3">
                  <span className="hero-arrow-up-tray size-6 text-gray-800 block" />
                </div>
                <p className="mb-2 text-sm text-gray-600">Upload or drop a YAML file.</p>
                <p className="text-xs text-gray-500">
                  <span className="text-primary-500 font-medium">YML</span> or <span className="text-primary-500 font-medium">YAML</span>, up to 8MB
                </p>
              </label>
            </div>
          </div>
        ) : (
          <div className="h-full rounded-lg overflow-hidden">
            <CodeEditor value={yaml} onChange={setYaml} ariaLabel="Workflow YAML" />
          </div>
        )}
      </div>
      {error && (
        <div className="px-6 pb-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <div className="flex items-center justify-between px-6 py-5 border-t border-gray-100">
        <button type="button" onClick={onClose} className="text-sm font-medium text-gray-700 hover:text-gray-900">
          Cancel
        </button>
        <span title={!yaml.trim() ? "Enter YAML content to create workflow" : error ? "Fix validation errors to continue" : undefined}>
          <ActionButton onClick={() => onCreate(yaml)} disabled={!looksValid}>
            Create
          </ActionButton>
        </span>
      </div>
    </EditorDialog>
  );
}
