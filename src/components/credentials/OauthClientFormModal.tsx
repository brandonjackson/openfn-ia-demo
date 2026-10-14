import { useState } from "react";
import FormModal from "../FormModal";
import Alert from "../Alert";
import Card from "../Card";
import Pill from "../Pill";
import { Checkbox, TextInput } from "../Inputs";
import PasswordInput from "../auth/PasswordInput";
import ProjectsPicker from "./ProjectsPicker";
import { projects as allProjects, type Project } from "../../mock-data/projects";
import { currentUser } from "../../mock-data/users";
import type { OauthClient } from "../../mock-data/credentials";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Set to edit an existing client. */
  client?: OauthClient;
  projects?: Project[];
  defaultProjectIds?: string[];
  /** Superusers may make a client global. */
  allowGlobal?: boolean;
  onSave?: (client: OauthClient) => void;
}

/**
 * Lightning's OauthClientFormComponent (credential_live/oauth_client_form_component.ex):
 * endpoints, client id and secret, scopes, and project access.
 */
export default function OauthClientFormModal({
  open,
  onClose,
  client,
  projects = allProjects,
  defaultProjectIds = [],
  allowGlobal = currentUser.role === "superuser",
  onSave,
}: Props) {
  const [values, setValues] = useState({
    name: client?.name ?? "",
    authorizationEndpoint: client?.authorizationEndpoint ?? "",
    tokenEndpoint: client?.tokenEndpoint ?? "",
    revocationEndpoint: client?.revocationEndpoint ?? "",
    introspectionEndpoint: client?.introspectionEndpoint ?? "",
    userinfoEndpoint: client?.userinfoEndpoint ?? "",
    clientId: client ? "demo-client-id" : "",
    clientSecret: client ? "demo-client-secret" : "",
    scopesDocUrl: client?.scopesDocUrl ?? "",
  });
  const [mandatory, setMandatory] = useState<string[]>(client?.mandatoryScopes ?? []);
  const [optional, setOptional] = useState<string[]>(client?.optionalScopes ?? []);
  const [global, setGlobal] = useState(client?.global ?? false);
  const [projectIds, setProjectIds] = useState<string[]>(client?.projectIds ?? defaultProjectIds);

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));
  const valid = ["name", "authorizationEndpoint", "tokenEndpoint", "clientId", "clientSecret"].every(
    (k) => values[k as keyof typeof values].trim()
  );

  const save = () => {
    onSave?.({
      id: client?.id ?? `oc-${Date.now()}`,
      ownerId: client?.ownerId ?? currentUser.id,
      name: values.name.trim(),
      global,
      projectIds: global ? [] : projectIds,
      authorizationEndpoint: values.authorizationEndpoint,
      tokenEndpoint: values.tokenEndpoint,
      revocationEndpoint: values.revocationEndpoint,
      introspectionEndpoint: values.introspectionEndpoint,
      userinfoEndpoint: values.userinfoEndpoint,
      mandatoryScopes: mandatory,
      optionalScopes: optional,
      scopesDocUrl: values.scopesDocUrl,
    });
    onClose();
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={client ? "Edit OAuth Client" : "Add an OAuth Client"}
      size="xl"
      formId={`oauth-client-form-${client?.id ?? "new"}`}
      onSubmit={save}
      submitLabel={client ? "Save Changes" : "Add OAuth Client"}
      submitDisabled={!valid}
    >
      <TextInput id="oauth-client-name" label="Name" required value={values.name} onChange={set("name")} />
      <TextInput label="Authorization Endpoint" required value={values.authorizationEndpoint} onChange={set("authorizationEndpoint")} />
      <TextInput label="Token Endpoint" required value={values.tokenEndpoint} onChange={set("tokenEndpoint")} />
      <TextInput label="Revocation Endpoint" value={values.revocationEndpoint} onChange={set("revocationEndpoint")} />
      <TextInput label="Introspection Endpoint" value={values.introspectionEndpoint} onChange={set("introspectionEndpoint")} />
      <TextInput label="UserInfo Endpoint" value={values.userinfoEndpoint} onChange={set("userinfoEndpoint")} />
      <PasswordInput label="Client ID" required value={values.clientId} onChange={set("clientId")} />
      <PasswordInput label="Client Secret" required autoComplete="new-password" value={values.clientSecret} onChange={set("clientSecret")} />

      <Card as="section" title="Manage Scopes" description="Type the names of the scopes and separate them using comma">
        <ScopesInput id={`mandatory-scopes-${client?.id ?? "new"}`} label="Mandatory Scopes" scopes={mandatory} onChange={setMandatory} />
        <ScopesInput id={`optional-scopes-${client?.id ?? "new"}`} label="Optional Scopes" scopes={optional} onChange={setOptional} />
        <TextInput label="Scopes Documentation URL" value={values.scopesDocUrl} onChange={set("scopesDocUrl")} />
      </Card>

      <Card as="section" title="Manage Project Access" description="Control which projects have access to this OAuth client">
        {allowGlobal && (
          <Alert type="warning">
            <Checkbox
              label="Make client global (allow any project in this instance to use this client)"
              checked={global}
              onChange={(e) => setGlobal(e.target.checked)}
            />
          </Alert>
        )}
        {!global && (
          <ProjectsPicker
            id={client?.id ?? "new"}
            type="oauth_client"
            projects={projects}
            selectedIds={projectIds}
            onChange={setProjectIds}
          />
        )}
      </Card>
    </FormModal>
  );
}

/** Scope entry: type and press comma or Enter to add a chip (Lightning's ClearInput hook). */
function ScopesInput({
  id,
  label,
  scopes,
  onChange,
}: {
  id: string;
  label: string;
  scopes: string[];
  onChange: (scopes: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const commit = (raw: string) => {
    const added = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !scopes.includes(s));
    if (added.length) onChange([...scopes, ...added]);
    setDraft("");
  };
  return (
    <div id={`generic-oauth-scopes-${id}`} className="space-y-2">
      <TextInput
        id={id}
        label={label}
        value={draft}
        onChange={(e) => (e.target.value.endsWith(",") ? commit(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(draft);
          }
        }}
        onBlur={() => draft && commit(draft)}
      />
      {scopes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {scopes.map((scope) => (
            <Pill key={scope} color="blue" removeLabel={`Remove ${scope}`} onRemove={() => onChange(scopes.filter((s) => s !== scope))}>
              {scope}
            </Pill>
          ))}
        </div>
      )}
    </div>
  );
}
