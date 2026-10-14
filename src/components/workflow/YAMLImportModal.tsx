import { useState } from "react";
import Button from "../Button";
import Card from "../Card";
import { FieldError } from "../Inputs";
import Modal from "../Modal";
import CodeEditor from "./CodeEditor";

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
    <Modal
      open={isOpen}
      onClose={onClose}
      size="md"
      title="Import a workflow"
      footer={
        <>
          <Button
            onClick={() => onCreate(yaml)}
            disabled={!looksValid}
            tooltip={!yaml.trim() ? "Enter YAML content to create workflow" : error ? "Fix validation errors to continue" : undefined}
          >
            Create
          </Button>
          <Button theme="secondary" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <div className="mb-3 flex justify-end">
        <Button theme="secondary" size="sm" onClick={() => setMode(mode === "upload" ? "paste" : "upload")}>
          {mode === "upload" ? "Paste text" : "Upload a file"}
        </Button>
      </div>
      <div className="h-80">
        {mode === "upload" ? (
          <Card dashed padding="none" className="relative h-full hover:border-gray-400">
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
            <label htmlFor="workflow-file" className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 text-xs text-gray-500">
              <span className="mb-1 rounded-xl bg-gray-100 p-3">
                <span className="hero-arrow-up-tray block size-6 text-gray-800" />
              </span>
              <p className="text-sm text-gray-600">Upload or drop a YAML file.</p>
              <p className="*:font-medium *:text-primary-500">
                <span>YML</span> or <span>YAML</span>, up to 8MB
              </p>
            </label>
          </Card>
        ) : (
          <div className="h-full overflow-hidden rounded-lg">
            <CodeEditor value={yaml} onChange={setYaml} ariaLabel="Workflow YAML" />
          </div>
        )}
      </div>
      {error && <FieldError>{error}</FieldError>}
    </Modal>
  );
}
