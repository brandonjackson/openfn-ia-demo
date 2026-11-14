import { useRef, useState } from "react";
import type { ConnectedSystem } from "../../model/connected-systems";
import { type SystemChanges } from "../../model/connected-systems";
import { ENVIRONMENTS, type Environment } from "../../model/credentials";
import { fieldErrorOf, firstProblemOf, FormError } from "../../model/form-error";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import FormField from "../primitives/FormField";
import Modal from "../primitives/Modal";
import Stack from "../primitives/Stack";
import { TextArea, TextInput } from "../primitives/FormControls";

const ENV_NAME: Record<Environment, string> = { production: "Production", staging: "Staging", mock: "Mock" };
const DESCRIPTION_MAX = 240;

interface Props {
  open: boolean;
  onClose: () => void;
  /** The system being edited. */
  system: ConnectedSystem;
  /** Whether it's reached directly, so each environment's URL can be set. A system on X-Road takes its address from its route. */
  direct: boolean;
  /** Edits just this environment of a direct system (its Edit on the system's page): the form asks only for where it lives there, and keeps everything else. Left out, the whole system. */
  environment?: Environment;
  /** Saves the changes. Rejects with what the server refused, shown under the field it names; the modal closes itself once saved. */
  onSave: (changes: SystemChanges) => Promise<void>;
}

/**
 * Edits a connected system's name, description, API docs, OpenAPI spec and,
 * for a direct one, where it lives in each environment. Given an
 * `environment`, it edits only that one's URL.
 */
export default function SystemFormModal({ open, ...rest }: Props) {
  if (!open) return null;
  return <SystemForm {...rest} />;
}

function SystemForm({ onClose, system, direct, environment, onSave }: Omit<Props, "open">) {
  const [name, setName] = useState(system.name);
  const [description, setDescription] = useState(system.description);
  const [docsUrl, setDocsUrl] = useState(system.apiDocsUrl ?? "");
  const [specUrl, setSpecUrl] = useState(system.openApiSpecUrl ?? "");
  const [urls, setUrls] = useState<Record<Environment, string>>(() => ({
    production: system.environments.production.url ?? "",
    staging: system.environments.staging.url ?? "",
    mock: system.environments.mock.url ?? "",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [checked, setChecked] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const descriptionInput = useRef<HTMLTextAreaElement>(null);

  const environments = environment ? [environment] : ENVIRONMENTS;
  const nameMissing = checked && !name.trim();
  const tooLong = description.length > DESCRIPTION_MAX;
  const fieldError = (field: string) => fieldErrorOf(error, field);
  // A refusal that names no field on this form still needs saying.
  const formFields = [...(environment ? [] : ["name", "description", "apiDocsUrl", "openApiSpecUrl"]), ...environments.map((e) => `environments.${e}.url`)];
  const unplaced = error !== null && !(error instanceof FormError && formFields.some((f) => fieldError(f)));

  const save = async () => {
    if (saving) return;
    setChecked(true);
    if (!name.trim()) return nameInput.current?.focus();
    if (tooLong) return descriptionInput.current?.focus();
    setSaving(true);
    setError(null);
    try {
      await onSave({ name: name.trim(), description: description.trim(), docsUrl: docsUrl.trim(), openApiSpecUrl: specUrl.trim(), ...(direct && { urls }) });
      onClose();
    } catch (e) {
      setError(e);
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={environment ? `Edit ${ENV_NAME[environment].toLowerCase()}` : "Edit system"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button aria-disabled={saving || undefined} onClick={() => void save()}>
            {saving ? "Saving…" : "Save"}
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
        {!environment && (
          <>
            <FormField label="Name" htmlFor="system-name" required error={nameMissing ? "Enter a name" : fieldError("name")}>
              <TextInput id="system-name" ref={nameInput} autoFocus value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            <FormField
              label="Description"
              htmlFor="system-description"
              optional
              error={tooLong ? `Keep it to ${DESCRIPTION_MAX} characters` : fieldError("description")}
              hint={`${description.length}/${DESCRIPTION_MAX}`}
            >
              <TextArea id="system-description" ref={descriptionInput} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormField>
            <FormField label="API docs" htmlFor="system-docs" optional hint="Where people read about its API." error={fieldError("apiDocsUrl")}>
              <TextInput id="system-docs" type="url" placeholder="https://" value={docsUrl} onChange={(e) => setDocsUrl(e.target.value)} />
            </FormField>
            <FormField
              label="OpenAPI spec"
              htmlFor="system-openapi"
              optional
              hint="The URL of its OpenAPI (Swagger) file, in JSON or YAML."
              error={fieldError("openApiSpecUrl")}
            >
              <TextInput id="system-openapi" type="url" placeholder="https://" value={specUrl} onChange={(e) => setSpecUrl(e.target.value)} />
            </FormField>
          </>
        )}
        {direct &&
          environments.map((env) => (
            <FormField key={env} label={`${ENV_NAME[env]} URL`} htmlFor={`system-url-${env}`} optional error={fieldError(`environments.${env}.url`)}>
              <TextInput
                id={`system-url-${env}`}
                type="url"
                placeholder="https://"
                autoFocus={env === environment}
                value={urls[env]}
                onChange={(e) => setUrls((u) => ({ ...u, [env]: e.target.value }))}
              />
            </FormField>
          ))}
      </Stack>
    </Modal>
  );
}
