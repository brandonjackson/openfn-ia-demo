import { useId, useState } from "react";
import type { ClipboardEvent, FormEvent } from "react";
import { Plus, X } from "lucide-react";
import type { Environment } from "../../model/credentials";
import type { EnvVar, EnvVarDraft } from "../../model/env-vars";
import { allEnvironments, envVarKeyError, listEnvironments, looksLikeEnvFile, parseEnvFile, takenEnvironments } from "../../model/env-vars";
import { errorMessageOf, fieldErrorOf } from "../../model/form-error";
import Button from "../primitives/Button";
import FormField from "../primitives/FormField";
import { TextInput } from "../primitives/FormControls";
import IconButton from "../primitives/IconButton";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import ToggleSwitch from "../primitives/ToggleSwitch";
import Callout from "../primitives/Callout";
import { focusFirstProblem } from "../primitives/focus-field";
import EnvironmentChecklist from "./EnvironmentChecklist";

interface Row {
  id: number;
  key: string;
  value: string;
  keyError?: string;
  valueError?: string;
}

interface Props {
  /** The project's variables, to say where a key is already set. */
  existing: EnvVar[];
  /** Makes one variable; called once a row, in order. Rejects with why the server refused it. */
  onCreate: (draft: EnvVarDraft) => Promise<void>;
  /** Rows to start with (useful for stories). */
  defaultRows?: { key: string; value: string }[];
}

let nextRow = 0;
const row = (key = "", value = ""): Row => ({ id: nextRow++, key, value });

/**
 * Adds environment variables the way Railway and Vercel do: a row each of
 * key and value, "Add another" for more, and pasting a `.env` file into a
 * key fills a row for each line. The environments and whether they're
 * secret apply to every row. Saving makes them one by one; a row the server
 * refuses stays, with why under it, and the rows before it are saved.
 */
export default function EnvVarForm({ existing, onCreate, defaultRows }: Props) {
  const id = useId();
  const [rows, setRows] = useState<Row[]>(() => (defaultRows?.length ? defaultRows.map((r) => row(r.key, r.value)) : [row()]));
  const [environments, setEnvironments] = useState<Environment[]>(allEnvironments);
  const [environmentsError, setEnvironmentsError] = useState<string>();
  const [secret, setSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string>();
  const [saved, setSaved] = useState<number>();

  const keyId = (r: Row) => `${id}-key-${r.id}`;
  const valueId = (r: Row) => `${id}-value-${r.id}`;
  const change = (rowId: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));

  // A pasted .env file fills the row and adds one for each further line.
  const pasteInto = (at: Row) => (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!looksLikeEnvFile(text)) return;
    e.preventDefault();
    const pairs = parseEnvFile(text);
    setRows((rs) => {
      const i = rs.findIndex((r) => r.id === at.id);
      const filled = pairs.map((p, n) => (n === 0 ? { ...at, key: p.key, value: p.value, keyError: undefined, valueError: undefined } : row(p.key, p.value)));
      // Empty rows after it give way to the pasted ones.
      const rest = rs.slice(i + 1).filter((r) => r.key || r.value);
      return [...rs.slice(0, i), ...filled, ...rest];
    });
  };

  const check = (): Row[] => {
    const seen = new Set<string>();
    return rows.map((r) => {
      const key = r.key.trim();
      const taken = takenEnvironments(existing, key, environments);
      const keyError =
        envVarKeyError(key) ??
        (seen.has(key) ? "This key is in the list twice" : taken.length ? `Already set in ${listEnvironments(taken)}` : undefined);
      seen.add(key);
      return { ...r, keyError, valueError: r.value === "" ? "Enter a value" : undefined };
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setFailure(undefined);
    setSaved(undefined);
    const checked = check();
    const envError = environments.length === 0 ? "Pick at least one environment" : undefined;
    setRows(checked);
    setEnvironmentsError(envError);
    const problems: [string, unknown][] = [
      ...checked.flatMap((r): [string, unknown][] => [
        [keyId(r), r.keyError],
        [valueId(r), r.valueError],
      ]),
      [`${id}-env-production`, envError],
    ];
    if (focusFirstProblem(problems)) return;

    setSaving(true);
    let made = 0;
    for (const r of checked) {
      try {
        await onCreate({ key: r.key.trim(), value: r.value, secret, environments });
        made++;
        setRows((rs) => rs.filter((x) => x.id !== r.id));
      } catch (err) {
        const keyError = fieldErrorOf(err, "key");
        const valueError = fieldErrorOf(err, "value");
        const envProblem = fieldErrorOf(err, "environments");
        change(r.id, { keyError, valueError });
        setEnvironmentsError(envProblem);
        if (!keyError && !valueError && !envProblem) setFailure(errorMessageOf(err));
        setSaving(false);
        if (made) setSaved(made);
        focusFirstProblem([
          [keyId(r), keyError],
          [valueId(r), valueError],
        ]);
        return;
      }
    }
    setSaving(false);
    setSaved(made);
    setRows([row()]);
  };

  return (
    <form onSubmit={(e) => void submit(e)} noValidate>
      <Stack gap="md">
        <Stack gap="sm">
          <Inline gap="sm">
            <Stack grow>
              <Text tone="muted" size="xs">
                Key
              </Text>
            </Stack>
            <Stack grow>
              <Text tone="muted" size="xs">
                Value
              </Text>
            </Stack>
          </Inline>
          {rows.map((r, n) => (
            <Inline key={r.id} gap="sm" align="start">
              <Stack grow>
                <FormField label={`Key ${n + 1}`} hideLabel htmlFor={keyId(r)} error={r.keyError}>
                  <TextInput
                    id={keyId(r)}
                    mono
                    placeholder="e.g. API_URL"
                    autoComplete="off"
                    spellCheck={false}
                    value={r.key}
                    onChange={(e) => change(r.id, { key: e.target.value, keyError: undefined })}
                    onPaste={pasteInto(r)}
                  />
                </FormField>
              </Stack>
              <Stack grow>
                <Inline gap="sm" align="start">
                  <Stack grow>
                    <FormField label={`Value ${n + 1}`} hideLabel htmlFor={valueId(r)} error={r.valueError}>
                      <TextInput
                        id={valueId(r)}
                        mono
                        type={secret ? "password" : "text"}
                        autoComplete="off"
                        spellCheck={false}
                        value={r.value}
                        onChange={(e) => change(r.id, { value: e.target.value, valueError: undefined })}
                      />
                    </FormField>
                  </Stack>
                  {rows.length > 1 && (
                    <IconButton icon={X} size="md" label={`Remove row ${n + 1}`} onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} />
                  )}
                </Inline>
              </Stack>
            </Inline>
          ))}
          <Inline justify="between" wrap>
            <Button variant="ghost" size="sm" icon={Plus} onClick={() => setRows((rs) => [...rs, row()])}>
              Add another
            </Button>
            <Text tone="muted" size="xs">
              Tip: paste a .env file into a key to add several at once.
            </Text>
          </Inline>
        </Stack>

        <Stack gap="xs">
          <Text tone="strong" size="xs">
            Environments
          </Text>
          <EnvironmentChecklist idPrefix={`${id}-env`} value={environments} onChange={(v) => {
              setEnvironments(v);
              setEnvironmentsError(undefined);
            }} error={environmentsError} />
        </Stack>

        <ToggleSwitch
          label="Secret"
          detail="Hidden once saved: it can be replaced but never read back."
          checked={secret}
          onChange={setSecret}
        />

        {failure && <Callout variant="danger" title={failure} role="alert" />}

        <Inline justify="between" gap="sm">
          <Text tone="success" size="xs" role="status">
            {saved ? `Saved ${saved} ${saved === 1 ? "variable" : "variables"}.` : ""}
          </Text>
          <Button type="submit" size="sm" aria-disabled={saving || undefined}>
            {saving ? "Saving…" : rows.length > 1 ? `Save ${rows.length} variables` : "Save"}
          </Button>
        </Inline>
      </Stack>
    </form>
  );
}
