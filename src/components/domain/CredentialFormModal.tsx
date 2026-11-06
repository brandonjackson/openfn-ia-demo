import { useState } from "react";
import { Braces, Plus, Trash2 } from "lucide-react";
import type { CredentialDraft, CredentialEnvironmentValues, CredentialField, CredentialSchema, ProjectOption, UserCredential } from "../../model/credentials";
import { ENVIRONMENTS, credentialDraftErrors, environmentLabels, hasCredentialErrors, type Environment } from "../../model/credentials";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Checkbox from "../primitives/Checkbox";
import DropdownMenu from "../primitives/DropdownMenu";
import EmptyState from "../primitives/EmptyState";
import FormField from "../primitives/FormField";
import { TextArea, TextInput } from "../primitives/FormControls";
import Grid from "../primitives/Grid";
import Inline from "../primitives/Inline";
import ListRow from "../primitives/ListRow";
import SearchInput from "../primitives/SearchInput";
import SectionHeading from "../primitives/SectionHeading";
import SegmentedControl from "../primitives/SegmentedControl";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import AdaptorLogo from "./AdaptorLogo";

interface Props {
  open: boolean;
  /** The credential being edited. Absent for a new one, which starts by picking its type. */
  credential?: UserCredential;
  /** Every kind of credential, for the type picker and the fields each asks for. */
  schemas: CredentialSchema[];
  /** Projects it could be shared with. */
  projects: ProjectOption[];
  /** Saves the credential; rejects with a message to show if the server says no. */
  onSave: (draft: CredentialDraft) => Promise<void>;
  onClose: () => void;
  /** Skips the type picker with this type already chosen, e.g. "dhis2". */
  initialSchema?: string;
}

/** A new environment's values: each field's default, if it has one. */
function defaults(schema: CredentialSchema | undefined): Record<string, string> {
  return Object.fromEntries((schema?.fields ?? []).filter((f) => f.defaultValue).map((f) => [f.key, f.defaultValue!]));
}

/** One value the credential asks for, drawn as the input its kind needs. */
function FieldInput({
  field,
  value,
  error,
  secretSaved,
  id,
  onChange,
}: {
  field: CredentialField;
  value: string;
  error?: string;
  secretSaved: boolean;
  id: string;
  onChange: (value: string) => void;
}) {
  if (field.kind === "boolean")
    return <Checkbox label={field.label} hint={field.description} checked={value === "true"} onChange={(on) => onChange(on ? "true" : "false")} />;
  if (field.kind === "json")
    return (
      <FormField label={field.label} htmlFor={id} required={field.required} error={error} hint="A JSON object with whatever keys your adaptor reads.">
        <TextArea id={id} mono rows={8} value={value} spellCheck={false} onChange={(e) => onChange(e.target.value)} />
      </FormField>
    );
  const secret = field.kind === "secret";
  return (
    <FormField label={field.label} htmlFor={id} required={field.required} error={error} hint={field.description}>
      <TextInput
        id={id}
        type={secret ? "password" : "text"}
        inputMode={field.kind === "number" ? "numeric" : field.kind === "url" ? "url" : undefined}
        autoComplete={secret ? "new-password" : "off"}
        placeholder={secret && secretSaved ? "Saved. Leave blank to keep it." : field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormField>
  );
}

/**
 * Lightning's credential form in a dialog. A new credential starts by
 * picking its type (an adaptor's schema, or raw JSON); then it asks for a
 * name and an optional external ID, its values per environment (production,
 * staging, mock, each on its own tab), and which projects can use it.
 * Secrets are never shown back: a blank one keeps what's saved.
 */
export default function CredentialFormModal({ open, credential, schemas, projects, onSave, onClose, initialSchema }: Props) {
  const startSchema = credential?.schema ?? initialSchema ?? "";
  const [step, setStep] = useState<"type" | "form">(startSchema ? "form" : "type");
  const [schemaId, setSchemaId] = useState(startSchema);
  const [query, setQuery] = useState("");
  const schema = schemas.find((s) => s.id === schemaId);

  const [name, setName] = useState(credential?.name ?? "");
  const [externalId, setExternalId] = useState(credential?.externalId ?? "");
  const [projectIds, setProjectIds] = useState<string[]>(credential?.projectIds ?? []);
  const [environments, setEnvironments] = useState<CredentialEnvironmentValues[]>(
    credential?.environments ?? [{ environment: "production", values: defaults(schema) }]
  );
  const [currentEnv, setCurrentEnv] = useState<Environment>(environments[0].environment);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string>();

  // Environments that had their secrets saved before this edit, where a blank secret keeps it.
  const savedSecrets = credential?.environments.map((e) => e.environment) ?? [];
  const draft: CredentialDraft = {
    id: credential?.id,
    name,
    schema: schemaId,
    externalId: externalId.trim() || undefined,
    projectIds,
    environments,
  };
  const errors = schema ? credentialDraftErrors(draft, schema, savedSecrets) : { fields: {} };
  const shown = attempted ? errors : { fields: {} as typeof errors.fields };

  const pickSchema = () => {
    setEnvironments([{ environment: "production", values: defaults(schema) }]);
    setCurrentEnv("production");
    setStep("form");
  };

  const setValue = (key: string, value: string) =>
    setEnvironments((envs) =>
      envs.map((e) => (e.environment === currentEnv ? { ...e, values: { ...e.values, [key]: value } } : e))
    );

  const remaining = ENVIRONMENTS.filter((env) => !environments.some((e) => e.environment === env));
  const addEnvironment = (env: Environment) => {
    setEnvironments((envs) => [...envs, { environment: env, values: defaults(schema) }]);
    setCurrentEnv(env);
  };
  const deleteEnvironment = () => {
    const next = environments.filter((e) => e.environment !== currentEnv);
    setEnvironments(next);
    setCurrentEnv(next[0].environment);
  };

  const save = async () => {
    setAttempted(true);
    setServerError(undefined);
    if (!schema) return;
    if (hasCredentialErrors(errors)) {
      // Show the first environment with a problem, if the open one has none.
      const bad = environments.find((e) => errors.fields[e.environment]);
      if (bad && !errors.fields[currentEnv]) setCurrentEnv(bad.environment);
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  if (step === "type") {
    const q = query.trim().toLowerCase();
    const matches = schemas.filter((s) => !q || `${s.name} ${s.description}`.toLowerCase().includes(q));
    return (
      <Modal
        open={open}
        title="Add a credential"
        onClose={onClose}
        widthClass="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!schema} onClick={pickSchema}>
              Configure credential
            </Button>
          </>
        }
      >
        <Stack gap="md">
          <SearchInput compact placeholder="Search credential types" value={query} onChange={(e) => setQuery(e.target.value)} />
          {matches.length > 0 ? (
            <Grid columns={2} gap="sm">
              {matches.map((s) => (
                <ListRow
                  key={s.id}
                  icon={Braces}
                  logo={s.adaptor ? <AdaptorLogo adaptor={s.adaptor} name={s.name} size="sm" /> : undefined}
                  title={s.name}
                  description={s.description}
                  selected={s.id === schemaId}
                  onClick={() => setSchemaId(s.id)}
                />
              ))}
            </Grid>
          ) : (
            <EmptyState icon={Braces} title="No credential types match" description="Try another name, or use Raw JSON." />
          )}
        </Stack>
      </Modal>
    );
  }

  const envValues = environments.find((e) => e.environment === currentEnv)?.values ?? {};

  return (
    <Modal
      open={open}
      title={credential ? `Edit ${credential.name}` : `Create ${schema?.name ?? ""} credential`}
      onClose={onClose}
      widthClass="max-w-2xl"
      footer={
        <>
          {!credential && !initialSchema && (
            <Button variant="secondary" onClick={() => setStep("type")}>
              Back
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={saving} onClick={save}>
            {saving ? "Saving…" : "Save credential"}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        {serverError && <Callout variant="danger" title={serverError} />}

        <section>
          <SectionHeading variant="label" compact title="Credential identity" description="Applies to every environment." />
          <Stack gap="md">
            <FormField label="Name" htmlFor="credential-name" required error={shown.name}>
              <TextInput id="credential-name" value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            <FormField label="External ID" htmlFor="credential-external-id" hint="Optional identifier for external systems.">
              <TextInput id="credential-external-id" value={externalId} onChange={(e) => setExternalId(e.target.value)} />
            </FormField>
          </Stack>
        </section>

        <section>
          <SectionHeading
            variant="label"
            compact
            title="Environments"
            description="Different values for each environment. A sandbox uses the environment its project names."
          />
          <Stack gap="md">
            <Inline justify="between" wrap>
              <SegmentedControl
                variant="pill"
                options={environments.map((e) => ({ id: e.environment, label: environmentLabels[e.environment] }))}
                value={currentEnv}
                onChange={(id) => setCurrentEnv(id as Environment)}
              />
              {remaining.length > 0 && (
                <DropdownMenu
                  ariaLabel="Add environment"
                  align="right"
                  widthClass="w-44"
                  items={remaining.map((env) => ({ id: env, label: environmentLabels[env] }))}
                  onSelect={(id) => addEnvironment(id as Environment)}
                  trigger={({ open: menuOpen, toggle }) => (
                    <Button variant="ghost" size="xs" icon={Plus} aria-expanded={menuOpen} onClick={toggle}>
                      Add environment
                    </Button>
                  )}
                />
              )}
            </Inline>
            {schema?.fields.map((field) => (
              <FieldInput
                key={`${currentEnv}-${field.key}`}
                id={`credential-${currentEnv}-${field.key}`}
                field={field}
                value={envValues[field.key] ?? ""}
                error={shown.fields[currentEnv]?.[field.key]}
                secretSaved={savedSecrets.includes(currentEnv)}
                onChange={(value) => setValue(field.key, value)}
              />
            ))}
            {environments.length > 1 && (
              <Inline>
                <Button variant="ghost" size="xs" icon={Trash2} onClick={deleteEnvironment}>
                  Delete {environmentLabels[currentEnv].toLowerCase()} environment
                </Button>
              </Inline>
            )}
          </Stack>
        </section>

        <section>
          <SectionHeading variant="label" compact title="Project access" description="Select projects that can use this credential." />
          {projects.length > 0 ? (
            <Stack gap="sm">
              {projects.map((p) => (
                <Checkbox
                  key={p.id}
                  label={p.name}
                  checked={projectIds.includes(p.id)}
                  onChange={(on) => setProjectIds((ids) => (on ? [...ids, p.id] : ids.filter((id) => id !== p.id)))}
                />
              ))}
            </Stack>
          ) : (
            <Text tone="muted">You aren't a member of any projects yet.</Text>
          )}
        </section>
      </Stack>
    </Modal>
  );
}
