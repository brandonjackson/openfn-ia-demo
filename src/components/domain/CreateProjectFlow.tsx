import { useId, useState } from "react";
import { FolderPlus } from "lucide-react";
import Modal from "../primitives/Modal";
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
  // Set when Create is pressed with no name; cleared as soon as one is typed.
  const [missingName, setMissingName] = useState(false);

  const slug = urlSafeName(name);
  const nameError = missingName && !slug ? "Enter a project name" : fieldErrorOf(error, "name");
  const descriptionError = fieldErrorOf(error, "description");
  const envError = fieldErrorOf(error, "env");
  const otherError = error && !fieldErrorOf(error, "name") && !descriptionError && !envError ? errorMessageOf(error) : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!slug) {
      setMissingName(true);
      document.getElementById(`${id}-name`)?.focus();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onCreate({ name: slug, environment: environment.trim(), description: description.trim() });
    } catch (refused) {
      setError(refused);
      setSaving(false);
      // Take the person to the first field the server named.
      const field = ["name", "env", "description"].find((f) => fieldErrorOf(refused, f));
      if (field) document.getElementById(`${id}-${field}`)?.focus();
    }
  };

  return (
    <Modal
      open
      title="Create project"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {/* Busy rather than disabled while it saves, so it keeps focus and "Creating…" is read out. */}
          <Button type="submit" form={`${id}-form`} aria-disabled={saving}>
            {saving ? "Creating…" : "Create project"}
          </Button>
        </>
      }
    >
      <form id={`${id}-form`} onSubmit={handleSubmit} noValidate>
        {/* Intro */}
        <div className="flex items-center gap-3 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <FolderPlus size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900">New project</p>
            <p className="text-xs text-indigo-600">Projects are isolated workspaces that contain workflows.</p>
          </div>
        </div>

        <div className="space-y-5">
          <FormField
            label="Project name"
            required
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

          <FormField label="Project environment" hint="Credentials will be loaded with values from this environment." error={envError} htmlFor={`${id}-env`}>
            <TextInput id={`${id}-env`} type="text" value={environment} onChange={(e) => setEnvironment(e.target.value)} />
          </FormField>

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
        </div>
      </form>
    </Modal>
  );
}
