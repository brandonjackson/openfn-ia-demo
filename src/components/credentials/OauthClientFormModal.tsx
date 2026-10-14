import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
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
    <Modal
      open={open}
      onClose={onClose}
      title={<span className="font-bold">{client ? "Edit OAuth Client" : "Add an OAuth Client"}</span>}
      width="max-w-[32rem] lg:max-w-[44rem]"
      footer={
        <>
          <Button disabled={!valid} onClick={save}>
            {client ? "Save Changes" : "Add OAuth Client"}
          </Button>
          <Button theme="secondary" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <form id={`oauth-client-form-${client?.id ?? "new"}`} className="text-left" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-6 bg-white">
          <TextInput id="oauth-client-name" label="Name" required value={values.name} onChange={set("name")} />
          <TextInput label="Authorization Endpoint" required value={values.authorizationEndpoint} onChange={set("authorizationEndpoint")} />
          <TextInput label="Token Endpoint" required value={values.tokenEndpoint} onChange={set("tokenEndpoint")} />
          <TextInput label="Revocation Endpoint" value={values.revocationEndpoint} onChange={set("revocationEndpoint")} />
          <TextInput label="Introspection Endpoint" value={values.introspectionEndpoint} onChange={set("introspectionEndpoint")} />
          <TextInput label="UserInfo Endpoint" value={values.userinfoEndpoint} onChange={set("userinfoEndpoint")} />
          <PasswordInput label="Client ID" required value={values.clientId} onChange={set("clientId")} />
          <PasswordInput label="Client Secret" required autoComplete="new-password" value={values.clientSecret} onChange={set("clientSecret")} />

          <fieldset>
            <legend className="contents text-base font-medium text-gray-900">Manage Scopes</legend>
            <p className="text-sm text-gray-500 pt-2">Type the names of the scopes and separate them using comma</p>
            <ScopesInput id={`mandatory-scopes-${client?.id ?? "new"}`} label="Mandatory Scopes" scopes={mandatory} onChange={setMandatory} />
            <ScopesInput id={`optional-scopes-${client?.id ?? "new"}`} label="Optional Scopes" scopes={optional} onChange={setOptional} />
            <div className="mt-5">
              <TextInput label="Scopes Documentation URL" value={values.scopesDocUrl} onChange={set("scopesDocUrl")} />
            </div>
          </fieldset>

          <div className="space-y-4">
            <fieldset>
              <legend className="contents text-base font-medium text-gray-900">Manage Project Access</legend>
              <p className="text-sm text-gray-500 pt-2">Control which projects have access to this OAuth client</p>
              <div className="mt-4">
                {allowGlobal && (
                  <div className="rounded-md bg-yellow-200 p-4 mb-4 border-2 border-slate-300">
                    <h3 className="text-sm font-medium text-yellow-800">
                      <Checkbox
                        label="Make client global (allow any project in this instance to use this client)"
                        checked={global}
                        onChange={(e) => setGlobal(e.target.checked)}
                      />
                    </h3>
                  </div>
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
              </div>
            </fieldset>
          </div>
        </div>
      </form>
    </Modal>
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
    <div id={`generic-oauth-scopes-${id}`} className="space-y-2 mt-5">
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
      <div>
        {scopes.map((scope) => (
          <span
            key={scope}
            className="inline-flex items-center rounded-md bg-blue-50 p-2 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 my-1"
          >
            {scope}
            <button
              type="button"
              onClick={() => onChange(scopes.filter((s) => s !== scope))}
              className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20"
            >
              <span className="sr-only">Remove</span>
              <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 stroke-gray-600/50 group-hover:stroke-gray-600/75">
                <path d="M4 4l6 6m0-6l-6 6" />
              </svg>
              <span className="absolute -inset-1" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
