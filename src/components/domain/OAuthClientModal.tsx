import { useState } from "react";
import type { OAuthClient, OAuthClientDraft, ProjectOption } from "../../model/page-data";
import { isUrl, parseScopes } from "../../model/credentials";
import Modal from "../primitives/Modal";
import Badge from "../primitives/Badge";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Checkbox from "../primitives/Checkbox";
import FormField from "../primitives/FormField";
import { TextInput } from "../primitives/FormControls";
import Grid from "../primitives/Grid";
import Inline from "../primitives/Inline";
import SectionHeading from "../primitives/SectionHeading";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  open: boolean;
  /** The client being edited. Absent to register a new one. */
  client?: OAuthClient;
  /** Projects it could be shared with. */
  projects: ProjectOption[];
  /** Whether "Make client global" is offered (superusers only). */
  canMakeGlobal?: boolean;
  /** Saves the client; rejects with a message to show if the server says no. */
  onSave: (draft: OAuthClientDraft) => Promise<void>;
  onClose: () => void;
}

type Endpoint = "authorizationEndpoint" | "tokenEndpoint" | "revocationEndpoint" | "introspectionEndpoint" | "userinfoEndpoint";

const endpoints: { key: Endpoint; label: string; required?: boolean }[] = [
  { key: "authorizationEndpoint", label: "Authorization endpoint", required: true },
  { key: "tokenEndpoint", label: "Token endpoint", required: true },
  { key: "revocationEndpoint", label: "Revocation endpoint" },
  { key: "introspectionEndpoint", label: "Introspection endpoint" },
  { key: "userinfoEndpoint", label: "UserInfo endpoint" },
];

/** The scopes typed so far, as tags under their input. */
function ScopeTags({ text }: { text: string }) {
  const scopes = parseScopes(text);
  if (scopes.length === 0) return null;
  return (
    <Inline gap="xs" wrap>
      {scopes.map((s) => (
        <Badge key={s} label={s} tone="indigo" />
      ))}
    </Inline>
  );
}

/**
 * Lightning's OAuth client form in a dialog: the provider's endpoints, the
 * app's client ID and secret, the scopes every credential asks for and those
 * it may add, and which projects can use it (or, for a superuser, every
 * project). The secret is never shown back: blank keeps the saved one.
 */
export default function OAuthClientModal({ open, client, projects, canMakeGlobal = false, onSave, onClose }: Props) {
  const [name, setName] = useState(client?.name ?? "");
  const [urls, setUrls] = useState<Record<Endpoint, string>>({
    authorizationEndpoint: client?.authorizationEndpoint ?? "",
    tokenEndpoint: client?.tokenEndpoint ?? "",
    revocationEndpoint: client?.revocationEndpoint ?? "",
    introspectionEndpoint: client?.introspectionEndpoint ?? "",
    userinfoEndpoint: client?.userinfoEndpoint ?? "",
  });
  const [clientId, setClientId] = useState(client?.clientId ?? "");
  const [clientSecret, setClientSecret] = useState("");
  const [mandatory, setMandatory] = useState(client?.mandatoryScopes.join(", ") ?? "");
  const [optional, setOptional] = useState(client?.optionalScopes.join(", ") ?? "");
  const [docsUrl, setDocsUrl] = useState(client?.scopesDocUrl ?? "");
  const [global, setGlobal] = useState(client?.global ?? false);
  const [projectIds, setProjectIds] = useState<string[]>(client?.projectIds ?? []);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string>();

  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = "can't be blank";
  for (const e of endpoints) {
    const v = urls[e.key].trim();
    if (!v && e.required) errors[e.key] = "can't be blank";
    else if (v && !isUrl(v)) errors[e.key] = "must be a valid URL";
  }
  if (!clientId.trim()) errors.clientId = "can't be blank";
  if (!client && !clientSecret) errors.clientSecret = "can't be blank";
  if (docsUrl.trim() && !isUrl(docsUrl.trim())) errors.docsUrl = "must be a valid URL";
  const shown = attempted ? errors : {};

  const save = async () => {
    setAttempted(true);
    setServerError(undefined);
    if (Object.keys(errors).length > 0) return;
    const opt = (v: string) => v.trim() || undefined;
    setSaving(true);
    try {
      await onSave({
        id: client?.id,
        name: name.trim(),
        authorizationEndpoint: urls.authorizationEndpoint.trim(),
        tokenEndpoint: urls.tokenEndpoint.trim(),
        revocationEndpoint: opt(urls.revocationEndpoint),
        introspectionEndpoint: opt(urls.introspectionEndpoint),
        userinfoEndpoint: opt(urls.userinfoEndpoint),
        clientId: clientId.trim(),
        clientSecret: clientSecret || undefined,
        mandatoryScopes: parseScopes(mandatory),
        optionalScopes: parseScopes(optional),
        scopesDocUrl: opt(docsUrl),
        global,
        projectIds: global ? [] : projectIds,
      });
    } catch (e) {
      setServerError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={client ? "Edit OAuth client" : "Add an OAuth client"}
      onClose={onClose}
      widthClass="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={saving} onClick={save}>
            {saving ? "Saving…" : client ? "Save changes" : "Add OAuth client"}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        {serverError && <Callout variant="danger" title={serverError} />}

        <FormField label="Name" htmlFor="oauth-name" required error={shown.name}>
          <TextInput id="oauth-name" value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>

        <section>
          <SectionHeading variant="label" compact title="Endpoints" description="Where the provider signs people in and hands out tokens." />
          <Stack gap="md">
            {endpoints.map((e) => (
              <FormField key={e.key} label={e.label} htmlFor={`oauth-${e.key}`} required={e.required} error={shown[e.key]}>
                <TextInput
                  id={`oauth-${e.key}`}
                  inputMode="url"
                  placeholder="https://"
                  value={urls[e.key]}
                  onChange={(ev) => setUrls((u) => ({ ...u, [e.key]: ev.target.value }))}
                />
              </FormField>
            ))}
          </Stack>
        </section>

        <section>
          <SectionHeading variant="label" compact title="Client" description="The app you registered with the provider." />
          <Grid columns={2}>
            <FormField label="Client ID" htmlFor="oauth-client-id" required error={shown.clientId}>
              <TextInput id="oauth-client-id" autoComplete="off" value={clientId} onChange={(e) => setClientId(e.target.value)} />
            </FormField>
            <FormField label="Client secret" htmlFor="oauth-client-secret" required={!client} error={shown.clientSecret}>
              <TextInput
                id="oauth-client-secret"
                type="password"
                autoComplete="new-password"
                placeholder={client ? "Saved. Leave blank to keep it." : undefined}
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
              />
            </FormField>
          </Grid>
        </section>

        <section>
          <SectionHeading variant="label" compact title="Scopes" description="Type the names of the scopes and separate them with commas." />
          <Stack gap="md">
            <FormField label="Mandatory scopes" htmlFor="oauth-mandatory" hint="Every credential made with this client asks for these.">
              <Stack gap="sm">
                <TextInput id="oauth-mandatory" value={mandatory} onChange={(e) => setMandatory(e.target.value)} />
                <ScopeTags text={mandatory} />
              </Stack>
            </FormField>
            <FormField label="Optional scopes" htmlFor="oauth-optional" hint="A credential may add any of these.">
              <Stack gap="sm">
                <TextInput id="oauth-optional" value={optional} onChange={(e) => setOptional(e.target.value)} />
                <ScopeTags text={optional} />
              </Stack>
            </FormField>
            <FormField label="Scopes documentation URL" htmlFor="oauth-docs" error={shown.docsUrl}>
              <TextInput id="oauth-docs" inputMode="url" placeholder="https://" value={docsUrl} onChange={(e) => setDocsUrl(e.target.value)} />
            </FormField>
          </Stack>
        </section>

        <section>
          <SectionHeading variant="label" compact title="Project access" description="Control which projects have access to this OAuth client." />
          <Stack gap="sm">
            {canMakeGlobal && (
              <Checkbox
                label="Make client global"
                hint="Allow any project in this instance to use this client."
                checked={global}
                onChange={setGlobal}
              />
            )}
            {!global &&
              (projects.length > 0 ? (
                projects.map((p) => (
                  <Checkbox
                    key={p.id}
                    label={p.name}
                    checked={projectIds.includes(p.id)}
                    onChange={(on) => setProjectIds((ids) => (on ? [...ids, p.id] : ids.filter((id) => id !== p.id)))}
                  />
                ))
              ) : (
                <Text tone="muted">You aren't a member of any projects yet.</Text>
              ))}
          </Stack>
        </section>
      </Stack>
    </Modal>
  );
}
