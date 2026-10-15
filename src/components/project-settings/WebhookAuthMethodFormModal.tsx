import { useState, type ReactNode } from "react";
import Button from "../Button";
import { Field, TextInput } from "../Inputs";
import FormModal from "../FormModal";
import Modal from "../Modal";
import type { WebhookAuthMethod, WebhookAuthType } from "../../mock-data/project-settings";
import { cn } from "../../utils/cn";
import { useCopy } from "../../utils/useCopy";

interface Props {
  /** Omit to create a new method (starts at the "choose a type" step). */
  authMethod?: WebhookAuthMethod;
  onCancel: () => void;
  onSave: (method: Omit<WebhookAuthMethod, "id" | "projectId" | "triggers" | "channels">) => void;
}

function generateApiKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

const mask = (v = "") => "*".repeat(v.length);
const maskApiKey = (v = "") => "*".repeat(Math.min(15, Math.max(0, v.length - 5))) + v.slice(-5);

/** Masked secret with a Show / Copy button (maybe_mask_password_field / maybe_mask_api_key_field). */
function SecretField({ id, value, type, revealed, onShow }: { id: string; value: string; type: "password" | "text"; revealed: boolean; onShow: () => void }) {
  const { copy } = useCopy(value);
  return (
    <div className="flex">
      <TextInput id={id} type={type} value={value} disabled fieldClassName="flex-1" className="rounded-r-none" />
      <Button
        id={`${id}_action_button`}
        theme="secondary"
        className="-ml-px w-24 rounded-l-none rounded-r-lg"
        onClick={revealed ? copy : onShow}
      >
        {revealed ? "Copy" : "Show"}
      </Button>
    </div>
  );
}

function TypeOption({ selected, icon, children, onSelect }: { selected: boolean; icon: string; children: ReactNode; onSelect: () => void }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-x-2.5 rounded-lg border border-gray-200 bg-white p-2 text-sm shadow-xs",
        selected && "outline-2 outline-offset-2 outline-primary-600"
      )}
    >
      <input type="radio" name="auth_type" className="sr-only" checked={selected} onChange={onSelect} />
      <span className={cn(icon, "h-10 w-10")} />
      {children}
    </label>
  );
}

/**
 * WebhookAuthMethodFormComponent (workflow_live/webhook_auth_method_form_component.ex):
 * pick Basic or API key, then name it. Viewing an existing method masks the
 * secret; "Show" asks you to re-authenticate first (any input is accepted here).
 */
export default function WebhookAuthMethodFormModal({ authMethod, onCancel, onSave }: Props) {
  const isNew = !authMethod;
  const [choice, setChoice] = useState<WebhookAuthType | null>(authMethod?.authType ?? null);
  const [authType, setAuthType] = useState<WebhookAuthType | null>(authMethod?.authType ?? null);
  const [name, setName] = useState(authMethod?.name ?? "");
  const [username, setUsername] = useState(authMethod?.username ?? "");
  const [password, setPassword] = useState("");
  const [apiKey] = useState(authMethod?.apiKey ?? generateApiKey());
  const [reauth, setReauth] = useState(false);
  const [sudo, setSudo] = useState(false);

  const title = isNew
    ? authType === null
      ? "Add an authentication method"
      : authType === "basic"
        ? 'Create a "basic auth" method'
        : 'Create an "API token" method'
    : "Webhook Authentication Method";

  const valid = name.trim() !== "" && (authType === "api" || !isNew || (username.trim() !== "" && password !== ""));

  let body: ReactNode;
  let footer: ReactNode;
  if (reauth) {
    body = (
      <form id="reauthentication-form" className="space-y-4 text-sm" onSubmit={(e) => (e.preventDefault(), setSudo(true), setReauth(false))}>
        <p>
          You're required to reauthenticate yourself before viewing the webhook{" "}
          {authType === "basic" ? "Password" : "API Key"}
        </p>
        <TextInput id="user_password" type="password" label="Password" autoComplete="new-password" />
        <div className="flex items-center gap-2 text-gray-500">
          <hr className="flex-1 border-gray-300" />
          OR
          <hr className="flex-1 border-gray-300" />
        </div>
        <TextInput id="user_code" label="2FA Code" inputMode="numeric" />
      </form>
    );
    footer = (
      <>
        <Button type="submit" form="reauthentication-form">
          Done
        </Button>
        <Button theme="secondary" onClick={() => setReauth(false)}>
          Back
        </Button>
      </>
    );
  } else if (authType === null) {
    body = (
      <div className="space-y-4">
        <TypeOption selected={choice === "basic"} icon="hero-globe-alt" onSelect={() => setChoice("basic")}>
          Basic HTTP Authentication (username &amp; password)
        </TypeOption>
        <TypeOption selected={choice === "api"} icon="hero-code-bracket-square" onSelect={() => setChoice("api")}>
          API Key Authentication (‘x-api-key’ header)
        </TypeOption>
      </div>
    );
    footer = (
      <Button disabled={choice === null} onClick={() => setAuthType(choice)}>
        Next
      </Button>
    );
  } else {
    return (
      <FormModal
        open
        onClose={onCancel}
        title={title}
        formId="webhook-auth-method-form"
        formClassName="space-y-4"
        onSubmit={() =>
          onSave(authType === "basic" ? { name, authType, username, password } : { name, authType, apiKey })
        }
        submitLabel={isNew ? "Create auth method" : "Save changes"}
        submitDisabled={!valid}
      >
        <TextInput
          id="webhook_auth_method_name"
          label="Auth method name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {authType === "basic" ? (
          <>
            <TextInput
              id="webhook_auth_method_username"
              label="Username"
              required
              value={username}
              disabled={!isNew}
              onChange={(e) => setUsername(e.target.value)}
            />
            {isNew ? (
              <TextInput
                id="webhook_auth_method_password"
                label="Password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            ) : (
              <Field id="webhook_auth_method_password" label="Password">
                <SecretField
                  id="webhook_auth_method_password"
                  type="password"
                  value={sudo ? (authMethod?.password ?? "") : mask(authMethod?.password)}
                  revealed={sudo}
                  onShow={() => setReauth(true)}
                />
              </Field>
            )}
          </>
        ) : (
          <Field id="webhook_auth_method_api_key" label="API Key">
            <SecretField
              id="webhook_auth_method_api_key"
              type="text"
              value={isNew || sudo ? apiKey : maskApiKey(apiKey)}
              revealed={isNew || sudo}
              onShow={() => setReauth(true)}
            />
          </Field>
        )}
      </FormModal>
    );
  }

  return (
    <Modal open onClose={onCancel} title={title} footer={footer}>
      {body}
    </Modal>
  );
}
