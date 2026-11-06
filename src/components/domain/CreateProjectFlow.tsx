import { useId, useState } from "react";
import { X, FolderPlus } from "lucide-react";
import Button from "../primitives/Button";
import FormField from "../primitives/FormField";
import { TextArea, TextInput } from "../primitives/FormControls";
import Callout from "../primitives/Callout";
import { urlSafeName } from "../../model/project-settings";
import { errorMessageOf, fieldErrorOf } from "../../model/form-error";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface NewProjectInput {
  /** URL-safe, as Lightning names projects: lowercase letters, digits and hyphens. */
  name: string;
  environment: string;
  description: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /**
   * Creates the project from the form's values. While it's saving the form
   * waits; if it's refused, the form stays open and shows why, under the
   * field the refusal names.
   */
  onCreate: (project: NewProjectInput) => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Create project modal                                               */
/* ------------------------------------------------------------------ */

export default function CreateProjectFlow({ open, onClose, onCreate }: Props) {
  // Mounting the form only while open means its state resets on each open.
  if (!open) return null;
  return <CreateProjectModal onClose={onClose} onCreate={onCreate} />;
}

function CreateProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (project: NewProjectInput) => Promise<void>;
}) {
  const id = useId();
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("main");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const slug = urlSafeName(name);
  const canCreate = slug.length > 0 && !saving;
  const nameError = fieldErrorOf(error, "name");
  const descriptionError = fieldErrorOf(error, "description");
  const envError = fieldErrorOf(error, "env");
  const otherError = error && !nameError && !descriptionError && !envError ? errorMessageOf(error) : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    setSaving(true);
    setError(null);
    try {
      await onCreate({ name: slug, environment: environment.trim(), description: description.trim() });
    } catch (refused) {
      setError(refused);
      setSaving(false);
    }
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Create Project
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 pb-5 pt-4 overflow-y-auto flex-1">
          {/* Intro */}
          <div className="flex items-center gap-3 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <FolderPlus size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-900">New project</p>
              <p className="text-xs text-indigo-600">
                Projects are isolated workspaces that contain workflows.
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-5">
            {/* Name */}
            <FormField
              label="Project name"
              hint={slug ? `Your project will be named ${slug}` : "Lowercase letters, numbers and hyphens."}
              error={nameError}
              htmlFor={`${id}-name`}
            >
              <TextInput
                id={`${id}-name`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Planning Application Intake"
                autoFocus
              />
            </FormField>

            {/* Environment */}
            <FormField label="Project environment" hint="Credentials will be loaded with values from this environment." error={envError} htmlFor={`${id}-env`}>
              <TextInput
                id={`${id}-env`}
                type="text"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
              />
            </FormField>

            {/* Description */}
            <FormField label="Project description" hint={`${description.length}/240 characters`} error={descriptionError} htmlFor={`${id}-description`}>
              <TextArea
                id={`${id}-description`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this project is used for..."
                rows={3}
                maxLength={240}
              />
            </FormField>

            {otherError && <Callout variant="danger" title="The project wasn't created">{otherError}</Callout>}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canCreate}>
                {saving ? "Creating…" : "Create project"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
