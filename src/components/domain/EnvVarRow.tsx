import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, Lock, Pencil, Trash2 } from "lucide-react";
import type { Environment } from "../../model/credentials";
import { environmentLabels } from "../../model/credentials";
import type { EnvVar, EnvVarDraft } from "../../model/env-vars";
import { envVarKeyError, listEnvironments, takenEnvironments } from "../../model/env-vars";
import { errorMessageOf, fieldErrorOf } from "../../model/form-error";
import ActionMenu from "../primitives/ActionMenu";
import Badge from "../primitives/Badge";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import ExpandableRow from "../primitives/ExpandableRow";
import Grid from "../primitives/Grid";
import FormField from "../primitives/FormField";
import { TextInput } from "../primitives/FormControls";
import IconButton from "../primitives/IconButton";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import ToggleSwitch from "../primitives/ToggleSwitch";
import { focusFirstProblem } from "../primitives/focus-field";
import EnvironmentBadge from "./EnvironmentBadge";
import EnvironmentChecklist from "./EnvironmentChecklist";

interface Props {
  variable: EnvVar;
  /** The project's variables, to say where a new key is already set. */
  existing: EnvVar[];
  /** Saves a change; a secret's blank value keeps the stored one. Left out where you can't change it: the row then opens to who changed it last. */
  onUpdate?: (draft: EnvVarDraft) => Promise<void>;
  /** Asks to delete it. Left out where you can't. */
  onDelete?: () => void;
  /** Start open (useful for stories). */
  defaultExpanded?: boolean;
  /** Start with the value shown (useful for stories). */
  defaultRevealed?: boolean;
}

const MASK = "••••••••••••";

/**
 * One environment variable in the list: its key, its value hidden until you
 * show it (a secret's can't be shown), and the environments it's set in.
 * Clicking it opens it to edit in place, as Railway does; ⋮ has Edit and
 * Delete.
 */
export default function EnvVarRow({ variable: v, existing, onUpdate, onDelete, defaultExpanded = false, defaultRevealed = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [revealed, setRevealed] = useState(defaultRevealed);

  const actions = [
    ...(onUpdate ? [{ id: "edit", label: "Edit", icon: Pencil }] : []),
    ...(onDelete ? [{ id: "delete", label: "Delete", icon: Trash2, tone: "danger" as const }] : []),
  ];

  return (
    <ExpandableRow
      label={`${onUpdate ? "Edit" : "Details of"} ${v.key} in ${v.environments.map((e) => environmentLabels[e]).join(", ")}`}
      expanded={expanded}
      onToggle={() => setExpanded((x) => !x)}
      trailing={
        <>
          {/* A secret keeps the button, unable to show it, so the columns line up row to row. */}
          <IconButton
            icon={revealed && !v.secret ? EyeOff : Eye}
            size="sm"
            label={v.secret ? "A secret can't be shown" : revealed ? `Hide ${v.key}` : `Show ${v.key}`}
            disabled={v.secret}
            onClick={() => setRevealed((r) => !r)}
          />
          {actions.length > 0 && (
            <ActionMenu
              label={`Actions for ${v.key}`}
              items={actions}
              onSelect={(id) => (id === "edit" ? setExpanded(true) : onDelete?.())}
            />
          )}
        </>
      }
      details={
        onUpdate ? (
          <EditForm variable={v} existing={existing} onSave={onUpdate} onDone={() => setExpanded(false)} />
        ) : (
          <Text tone="muted" size="xs">
            Changed {v.updatedAt} by {v.updatedBy}.
          </Text>
        )
      }
    >
      <Grid columns={3} gap="md">
        <Text tone="strong" mono truncate>
          {v.key}
        </Text>
        <Inline gap="sm">
          <Text tone="muted" mono size="xs" truncate>
            {v.secret || !revealed ? MASK : v.value || "(empty)"}
          </Text>
          {v.secret && <Badge label="Secret" shape="tag" icon={Lock} />}
        </Inline>
        <Inline gap="xs" wrap>
          {v.environments.map((e) => (
            <EnvironmentBadge key={e} environment={e} />
          ))}
        </Inline>
      </Grid>
    </ExpandableRow>
  );
}

/** The row's own form, open under it. */
function EditForm({ variable: v, existing, onSave, onDone }: { variable: EnvVar; existing: EnvVar[]; onSave: (draft: EnvVarDraft) => Promise<void>; onDone: () => void }) {
  const id = useId();
  const [key, setKey] = useState(v.key);
  const [value, setValue] = useState(v.value ?? "");
  const [environments, setEnvironments] = useState<Environment[]>(v.environments);
  const [secret, setSecret] = useState(v.secret);
  const [errors, setErrors] = useState<{ key?: string; value?: string; environments?: string }>({});
  const [failure, setFailure] = useState<string>();
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const taken = takenEnvironments(existing, key, environments, v.id);
    const found = {
      key: envVarKeyError(key) ?? (taken.length ? `Already set in ${listEnvironments(taken)}` : undefined),
      value: !v.secret && value === "" ? "Enter a value" : undefined,
      environments: environments.length === 0 ? "Pick at least one environment" : undefined,
    };
    setErrors(found);
    setFailure(undefined);
    if (
      focusFirstProblem([
        [`${id}-key`, found.key],
        [`${id}-value`, found.value],
        [`${id}-env-production`, found.environments],
      ])
    )
      return;
    setSaving(true);
    try {
      await onSave({ key: key.trim(), value, secret, environments });
      onDone();
    } catch (err) {
      const named = { key: fieldErrorOf(err, "key"), value: fieldErrorOf(err, "value"), environments: fieldErrorOf(err, "environments") ?? fieldErrorOf(err, "secret") };
      setErrors(named);
      if (!named.key && !named.value && !named.environments) setFailure(errorMessageOf(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} noValidate>
      <Stack gap="md">
        <Inline gap="sm" align="start" stackOnMobile>
          <Stack grow>
            <FormField label="Key" htmlFor={`${id}-key`} error={errors.key}>
              <TextInput id={`${id}-key`} mono autoComplete="off" spellCheck={false} value={key} onChange={(e) => setKey(e.target.value)} />
            </FormField>
          </Stack>
          <Stack grow>
            <FormField label="Value" htmlFor={`${id}-value`} error={errors.value} hint={v.secret ? "Leave blank to keep the secret as it is." : undefined}>
              <TextInput
                id={`${id}-value`}
                mono
                type={secret ? "password" : "text"}
                autoComplete="off"
                spellCheck={false}
                placeholder={v.secret ? MASK : undefined}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </FormField>
          </Stack>
        </Inline>
        <EnvironmentChecklist idPrefix={`${id}-env`} value={environments} onChange={setEnvironments} error={errors.environments} />
        <ToggleSwitch
          label="Secret"
          detail={v.secret ? "A secret stays secret: make a new variable to store it in plain sight." : "Hidden once saved: it can be replaced but never read back."}
          checked={secret}
          onChange={setSecret}
          disabled={v.secret}
        />
        {failure && <Callout variant="danger" title={failure} role="alert" />}
        <Inline gap="sm" justify="end">
          <Button variant="secondary" size="sm" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" size="sm" aria-disabled={saving || undefined}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </Inline>
      </Stack>
    </form>
  );
}
