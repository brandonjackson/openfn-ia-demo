import { useId, useState, type ReactNode } from "react";
import { PlugZap, Save, Trash2 } from "lucide-react";
import type { AuthProviderConfig, AuthProviderDraft, AuthProviderTest } from "../../model/authentication";
import { authProviderErrors, authRedirectUri } from "../../model/admin";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Card from "../primitives/Card";
import Checkbox from "../primitives/Checkbox";
import ConfirmModal from "../primitives/ConfirmModal";
import CopyValue from "../primitives/CopyValue";
import FormField from "../primitives/FormField";
import { TextInput } from "../primitives/FormControls";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  /** The provider set up now. Without one, the form sets up a new provider. */
  provider?: AuthProviderConfig;
  /** Where this instance is served from, the redirect host a new provider starts with. */
  defaultRedirectHost: string;
  /** The last test of a discovery URL. It shows while the form still has that URL. */
  test?: AuthProviderTest;
  /** Checks that the discovery URL answers with an OpenID configuration. Nothing is saved. */
  onTest: (draft: AuthProviderDraft) => Promise<void>;
  onSave: (draft: AuthProviderDraft) => Promise<void>;
  /** Removes the provider, which turns off single sign-on. Offered once a provider is set up. */
  onRemove: () => Promise<void>;
}

/**
 * The instance's single sign-on provider, over OpenID Connect: its name
 * (which goes into the redirect URI), discovery URL, client ID and secret,
 * redirect host, and whether to trust unverified emails. Shows the redirect
 * URI to register with the provider, tests the discovery URL, saves, and,
 * once a provider is set up, removes it.
 */
export default function AuthProviderForm({ provider, defaultRedirectHost, test, onTest, onSave, onRemove }: Props) {
  const id = useId();
  const [draft, setDraft] = useState<AuthProviderDraft>({
    name: provider?.name ?? "",
    discoveryUrl: provider?.discoveryUrl ?? "",
    clientId: provider?.clientId ?? "",
    clientSecret: "",
    redirectHost: provider?.redirectHost ?? defaultRedirectHost,
    allowUnverifiedEmail: provider?.allowUnverifiedEmail ?? false,
  });
  // Which fields someone has left, so errors don't show before they've typed.
  const [touched, setTouched] = useState<Partial<Record<keyof AuthProviderDraft, boolean>>>({});
  const [busy, setBusy] = useState<"test" | "save" | "remove" | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const errors = authProviderErrors(draft, !!provider?.hasClientSecret);
  const valid = Object.keys(errors).length === 0;
  const result = test && test.discoveryUrl === draft.discoveryUrl ? test : undefined;
  const set = (patch: Partial<AuthProviderDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const run = async (kind: "test" | "save" | "remove", action: () => Promise<void>) => {
    setBusy(kind);
    try {
      await action();
    } finally {
      setBusy(null);
    }
  };

  const field = (key: keyof AuthProviderDraft, label: string, hint: ReactNode, input: ReactNode) => (
    <FormField
      label={label}
      htmlFor={`${id}-${key}`}
      hint={touched[key] && errors[key] ? <Text tone="danger" size="xs">{errors[key]}</Text> : hint}
    >
      {input}
    </FormField>
  );
  const text = (key: "name" | "discoveryUrl" | "clientId" | "clientSecret" | "redirectHost", type = "text") => (
    <TextInput
      id={`${id}-${key}`}
      type={type}
      value={draft[key]}
      autoComplete={type === "password" ? "new-password" : "off"}
      placeholder={key === "clientSecret" && provider?.hasClientSecret ? "Stored; type to replace it" : undefined}
      onChange={(e) => set({ [key]: e.target.value })}
      onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
    />
  );

  return (
    <Stack gap="lg">
      <Card>
        <Stack gap="md">
          {field("name", "Name", "Lower case, used in the redirect URI, e.g. sim-dtu-sso.", text("name"))}
          {field(
            "discoveryUrl",
            "Discovery URL",
            "The provider's .well-known/openid-configuration URL, which lists every endpoint OpenFn needs.",
            text("discoveryUrl", "url")
          )}
          {field("clientId", "Client ID", undefined, text("clientId"))}
          {field(
            "clientSecret",
            "Client secret",
            provider?.hasClientSecret ? "Leave blank to keep the secret that's stored." : undefined,
            text("clientSecret", "password")
          )}
          {field("redirectHost", "Redirect host", "Where this instance is served from.", text("redirectHost", "url"))}
          <FormField label="Redirect URI" hint="Add this redirect URI to the client in your provider.">
            <CopyValue value={authRedirectUri(draft.redirectHost, draft.name || "…")} label="Copy redirect URI" />
          </FormField>
          <Checkbox
            label="Trust unverified emails from this provider"
            hint="Only for a provider you trust that doesn't say whether an email is verified. Off by default."
            checked={draft.allowUnverifiedEmail}
            onChange={(on) => set({ allowUnverifiedEmail: on })}
          />
          {result && (
            <Callout variant={result.ok ? "success" : "danger"} title={result.ok ? "Discovery URL works" : "Test failed"}>
              {result.message}
            </Callout>
          )}
          <Inline gap="sm">
            <Button icon={Save} disabled={!valid || busy !== null} onClick={() =>
                run("save", async () => {
                  await onSave(draft);
                  // The server holds the secret now; the box goes back to "stored".
                  set({ clientSecret: "" });
                })
              }
            >
              {busy === "save" ? "Saving…" : "Save"}
            </Button>
            <Button
              variant="secondary"
              icon={PlugZap}
              disabled={!!errors.discoveryUrl || busy !== null}
              onClick={() => run("test", () => onTest(draft))}
            >
              {busy === "test" ? "Testing…" : "Test"}
            </Button>
          </Inline>
        </Stack>
      </Card>

      {provider && (
        <Card
          title="Remove provider"
          description="Deletes this configuration and turns off single sign-on for everyone on this instance. People can still log in with their password."
        >
          <Button variant="outline-danger" size="sm" icon={Trash2} disabled={busy !== null} onClick={() => setConfirmRemove(true)}>
            Remove
          </Button>
        </Card>
      )}

      <ConfirmModal
        open={confirmRemove}
        title="Remove authentication provider"
        confirmLabel="Remove provider"
        onClose={() => setConfirmRemove(false)}
        onConfirm={() => {
          setConfirmRemove(false);
          void run("remove", onRemove);
        }}
      >
        <Text block>
          Single sign-on through {provider?.name} stops straight away. Anyone who only logs in that way will need a
          password reset.
        </Text>
      </ConfirmModal>
    </Stack>
  );
}
