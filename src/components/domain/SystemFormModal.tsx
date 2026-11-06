import { useState } from "react";
import type { ConnectedSystem } from "../../model/connected-systems";
import { ENVIRONMENTS, type Environment, type SystemChanges } from "../../model/page-data";
import { fieldErrorOf, firstProblemOf, FormError } from "../../model/form-error";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import FormField from "../primitives/FormField";
import Modal from "../primitives/Modal";
import Stack from "../primitives/Stack";
import { TextArea, TextInput } from "../primitives/FormControls";

const ENV_LABEL: Record<Environment, string> = { production: "Production URL", staging: "Staging URL", mock: "Mock URL" };
const DESCRIPTION_MAX = 240;

interface Props {
  open: boolean;
  onClose: () => void;
  /** The system being edited. */
  system: ConnectedSystem;
  /** Whether it's reached directly, so each environment's URL can be set. A system on X-Road takes its address from its route. */
  direct: boolean;
  /** Saves the changes. Rejects with what the server refused, shown under the field it names; the modal closes itself once saved. */
  onSave: (changes: SystemChanges) => Promise<void>;
}

/** Edits a connected system's name, description, API docs and, for a direct one, where it lives in each environment. */
export default function SystemFormModal({ open, ...rest }: Props) {
  if (!open) return null;
  return <SystemForm {...rest} />;
}

function SystemForm({ onClose, system, direct, onSave }: Omit<Props, "open">) {
  const [name, setName] = useState(system.name);
  const [description, setDescription] = useState(system.description);
  const [docsUrl, setDocsUrl] = useState(system.apiDocsUrl ?? "");
  const [urls, setUrls] = useState<Record<Environment, string>>(() => ({
    production: system.environments.production.url ?? "",
    staging: system.environments.staging.url ?? "",
    mock: system.environments.mock.url ?? "",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const tooLong = description.length > DESCRIPTION_MAX;
  const valid = !!name.trim() && !tooLong;
  const fieldError = (field: string) => fieldErrorOf(error, field);
  // A refusal that names no field on this form still needs saying.
  const formFields = ["name", "description", "apiDocsUrl", ...ENVIRONMENTS.map((e) => `environments.${e}.url`)];
  const unplaced = error !== null && !(error instanceof FormError && formFields.some((f) => fieldError(f)));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({ name: name.trim(), description: description.trim(), docsUrl: docsUrl.trim(), ...(direct && { urls }) });
      onClose();
    } catch (e) {
      setError(e);
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title="Edit system"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid || saving} onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <Stack gap="md">
        {unplaced && (
          <Callout variant="danger" title="That didn't save">
            {firstProblemOf(error)}
          </Callout>
        )}
        <FormField label="Name" htmlFor="system-name" required error={fieldError("name")}>
          <TextInput id="system-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField
          label="Description"
          htmlFor="system-description"
          optional
          error={tooLong ? `Keep it to ${DESCRIPTION_MAX} characters` : fieldError("description")}
          hint={`${description.length}/${DESCRIPTION_MAX}`}
        >
          <TextArea id="system-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>
        <FormField label="API docs" htmlFor="system-docs" optional error={fieldError("apiDocsUrl")}>
          <TextInput id="system-docs" type="url" placeholder="https://" value={docsUrl} onChange={(e) => setDocsUrl(e.target.value)} />
        </FormField>
        {direct &&
          ENVIRONMENTS.map((env) => (
            <FormField key={env} label={ENV_LABEL[env]} htmlFor={`system-url-${env}`} optional error={fieldError(`environments.${env}.url`)}>
              <TextInput
                id={`system-url-${env}`}
                type="url"
                placeholder="https://"
                value={urls[env]}
                onChange={(e) => setUrls((u) => ({ ...u, [env]: e.target.value }))}
              />
            </FormField>
          ))}
      </Stack>
    </Modal>
  );
}
