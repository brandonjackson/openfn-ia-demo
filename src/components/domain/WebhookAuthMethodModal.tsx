import { useState } from "react";
import type { WebhookAuthMethod, WebhookAuthMethodDraft, WebhookTriggerOption } from "../../model/page-data";
import {
  webhookAuthNameError,
  webhookAuthTypes,
  webhookPasswordError,
  webhookUsername,
  type WebhookAuthType,
} from "../../model/project-settings";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Checkbox from "../primitives/Checkbox";
import CopyValue from "../primitives/CopyValue";
import FormField from "../primitives/FormField";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import { RadioOption, TextInput } from "../primitives/FormControls";

interface Props {
  open: boolean;
  onClose: () => void;
  /** The method to edit; leave it out to make a new one. */
  method?: WebhookAuthMethod;
  /** The project's webhook triggers the method can be assigned to. */
  triggers: WebhookTriggerOption[];
  /** The project's other auth method names; a name must be unique. */
  takenNames: string[];
  /** Makes a new method. Resolves with the generated API key, if it made one, to show once. */
  onCreate: (draft: WebhookAuthMethodDraft) => Promise<{ secret?: string }>;
  /** Saves a method's new name and triggers. */
  onUpdate: (id: string, changes: { name: string; triggerIds: string[] }) => Promise<void>;
}

/**
 * Makes or edits a webhook auth method. A new one starts with a choice of
 * basic auth or an API key; an API key is generated and shown once, to copy.
 * An existing one can be renamed and assigned to triggers, but its username
 * and secret stay as they were made.
 */
export default function WebhookAuthMethodModal({ open, ...rest }: Props) {
  if (!open) return null;
  return <AuthMethodForm {...rest} />;
}

function TriggerChecklist({
  triggers,
  selected,
  onChange,
}: {
  triggers: WebhookTriggerOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <Stack gap="sm">
      <Text tone="strong">Webhook triggers</Text>
      {triggers.length === 0 ? (
        <Text tone="muted" size="xs">
          This project has no webhook triggers yet.
        </Text>
      ) : (
        triggers.map((t) => (
          <Checkbox
            key={t.id}
            label={t.workflowName}
            hint="Calls to its webhook must use this method"
            checked={selected.includes(t.id)}
            onChange={(on) => onChange(on ? [...selected, t.id] : selected.filter((id) => id !== t.id))}
          />
        ))
      )}
    </Stack>
  );
}

function AuthMethodForm({ onClose, method, triggers, takenNames, onCreate, onUpdate }: Omit<Props, "open">) {
  const [step, setStep] = useState<"type" | "details" | "done">(method ? "details" : "type");
  const [type, setType] = useState<WebhookAuthType>(method?.type ?? "basic");
  const [name, setName] = useState(method?.name ?? "");
  const [username, setUsername] = useState(method?.username ?? "");
  const [password, setPassword] = useState("");
  const [triggerIds, setTriggerIds] = useState<string[]>(method?.triggerIds ?? []);
  const [touched, setTouched] = useState(false);
  const [secret, setSecret] = useState<string>();
  const [saving, setSaving] = useState(false);

  const nameError = webhookAuthNameError(name, takenNames);
  const usernameError = !method && type === "basic" && !username ? "can't be blank" : undefined;
  const passwordError = !method && type === "basic" ? webhookPasswordError(password) : undefined;
  const valid = !nameError && !usernameError && !passwordError;

  const save = async () => {
    setSaving(true);
    if (method) {
      await onUpdate(method.id, { name: name.trim(), triggerIds });
      onClose();
      return;
    }
    const result = await onCreate({
      name: name.trim(),
      type,
      ...(type === "basic" ? { username, password } : {}),
      triggerIds,
    });
    setSaving(false);
    if (result.secret) {
      setSecret(result.secret);
      setStep("done");
    } else onClose();
  };

  if (step === "type")
    return (
      <Modal
        open
        title="Add an authentication method"
        onClose={onClose}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => setStep("details")}>Next</Button>
          </>
        }
      >
        <Stack gap="md">
          {(Object.keys(webhookAuthTypes) as WebhookAuthType[]).map((t) => (
            <RadioOption
              key={t}
              name="webhook-auth-type"
              value={t}
              label={webhookAuthTypes[t].description}
              hint={
                t === "basic"
                  ? "Callers send a username and password you choose."
                  : "OpenFn generates a key that callers send in the x-api-key header."
              }
              checked={type === t}
              onChange={() => setType(t)}
            />
          ))}
        </Stack>
      </Modal>
    );

  if (step === "done")
    return (
      <Modal open title="API key created" onClose={onClose} footer={<Button onClick={onClose}>Done</Button>}>
        <Stack gap="md">
          <Callout variant="warning" title="Copy this API key now">
            You won't be able to see it again. Send it in the x-api-key header of every call to the triggers that use{" "}
            {name.trim()}.
          </Callout>
          <CopyValue value={secret ?? ""} label="Copy API key" />
        </Stack>
      </Modal>
    );

  const title = method
    ? "Webhook authentication method"
    : type === "basic"
      ? "Create a “basic auth” method"
      : "Create an “API key” method";

  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={method ? onClose : () => setStep("type")}>
            {method ? "Cancel" : "Back"}
          </Button>
          <Button disabled={saving || (touched && !valid)} onClick={() => (valid ? save() : setTouched(true))}>
            {method ? "Save changes" : "Create auth method"}
          </Button>
        </>
      }
    >
      <Stack gap="md">
        <FormField label="Auth method name" htmlFor="wam-name" error={touched ? nameError : undefined}>
          <TextInput id="wam-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        {type === "basic" && (
          <FormField
            label="Username"
            htmlFor="wam-username"
            hint={method ? undefined : "Lowercase, with dashes for spaces."}
            error={touched ? usernameError : undefined}
          >
            <TextInput
              id="wam-username"
              disabled={!!method}
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(webhookUsername(e.target.value))}
            />
          </FormField>
        )}
        {method ? (
          <FormField
            label={type === "basic" ? "Password" : "API key"}
            htmlFor="wam-secret"
            hint="Shown only once, when the method was made. Make a new method for a new secret."
          >
            <TextInput id="wam-secret" disabled value={method.maskedSecret} />
          </FormField>
        ) : type === "basic" ? (
          <FormField
            label="Password"
            htmlFor="wam-password"
            hint="Between 8 and 72 characters."
            error={touched ? passwordError : undefined}
          >
            <TextInput
              id="wam-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
        ) : (
          <Text tone="muted" size="xs" block>
            OpenFn generates the API key when you create the method, and shows it to you once.
          </Text>
        )}
        <TriggerChecklist triggers={triggers} selected={triggerIds} onChange={setTriggerIds} />
      </Stack>
    </Modal>
  );
}
