import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import Alert from "../Alert";
import InfoTooltip from "../InfoTooltip";
import { Checkbox, TextArea, TextInput } from "../Inputs";
import PasswordInput from "../auth/PasswordInput";
import ProjectsPicker from "./ProjectsPicker";
import { cn } from "../../utils/cn";
import { projects as allProjects, type Project } from "../../mock-data/projects";
import { currentUser } from "../../mock-data/users";
import {
  credentialTypeOptions,
  fieldsForSchema,
  formatSchemaName,
  type Credential,
  type OauthClient,
} from "../../mock-data/credentials";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Set to edit an existing credential (skips the type picker). */
  credential?: Credential;
  /** OAuth clients available here; each is offered as a credential type. */
  oauthClients: OauthClient[];
  /** Projects the user can grant access to. */
  projects?: Project[];
  /** Pre-selected projects for a new credential (the current project, in project settings). */
  defaultProjectIds?: string[];
  onSave?: (credential: Credential) => void;
}

interface Env {
  name: string;
  body: Record<string, string>;
}

const MAX_ENVIRONMENTS = 5;

const environmentTooltip =
  "Environment names let a workflow pick the right credential values for the project or sandbox it runs in, e.g. main, staging, production.";

/**
 * Lightning's CredentialFormComponent (credential_live/credential_form_component.ex):
 * page one picks a credential type (adaptor schema, Raw JSON or an OAuth client),
 * page two is the form: identity, per-environment values, and project access.
 * Static: values only live in this modal; nothing is validated by a server.
 */
export default function CredentialFormModal({
  open,
  onClose,
  credential,
  oauthClients,
  projects = allProjects,
  defaultProjectIds = [],
  onSave,
}: Props) {
  const editing = !!credential;
  const [page, setPage] = useState<"first" | "second">(editing ? "second" : "first");
  const [selected, setSelected] = useState<string | null>(null);
  const [schema, setSchema] = useState<string | null>(credential?.schema ?? null);
  const [oauthClientId, setOauthClientId] = useState<string | null>(credential?.oauthClientId ?? null);
  const [name, setName] = useState(credential?.name ?? "");
  const [externalId, setExternalId] = useState(credential?.externalId ?? "");
  const [envs, setEnvs] = useState<Env[]>(
    (credential?.environments ?? ["main"]).map((n) => ({ name: n, body: {} }))
  );
  const [tab, setTab] = useState(0);
  const [projectIds, setProjectIds] = useState<string[]>(credential?.projectIds ?? defaultProjectIds);
  const [authorized, setAuthorized] = useState(editing);

  const typeOptions = credentialTypeOptions(oauthClients);
  const client = oauthClients.find((c) => c.id === oauthClientId);
  const env = envs[tab] ?? envs[0];
  const fields = schema && schema !== "raw" && schema !== "oauth" ? fieldsForSchema(schema) : [];

  const setBody = (key: string, value: string) =>
    setEnvs((list) => list.map((e, i) => (i === tab ? { ...e, body: { ...e.body, [key]: value } } : e)));

  const bodyValid =
    schema === "oauth"
      ? !!client && authorized
      : schema === "raw"
        ? editing || (env.body.raw ?? "").trim().length > 0
        : editing || fields.filter((f) => f.required).every((f) => (env.body[f.key] ?? "").trim());
  const valid = name.trim().length > 0 && envs.every((e) => e.name.trim()) && bodyValid;

  const pickType = (key: string) => {
    setSelected(key);
    const option = typeOptions.find((o) => o.key === key);
    if (option?.type === "oauth") {
      setSchema("oauth");
      setOauthClientId(key);
    } else {
      setSchema(key);
      setOauthClientId(null);
    }
  };

  const save = () => {
    onSave?.({
      id: credential?.id ?? `cred-${Date.now()}`,
      name: name.trim(),
      schema: schema ?? "raw",
      oauthClientId: schema === "oauth" ? oauthClientId : undefined,
      ownerId: credential?.ownerId ?? currentUser.id,
      projectIds,
      externalId: externalId.trim() || null,
      environments: envs.map((e) => e.name),
      transferStatus: credential?.transferStatus ?? null,
      scheduledDeletion: credential?.scheduledDeletion ?? null,
    });
    onClose();
  };

  if (page === "first") {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={<span className="font-bold">Add a credential</span>}
        width="max-w-[50rem]"
        footer={
          <>
            <Button theme="secondary" id="cancel-credential-type-picker" onClick={onClose}>
              Cancel
            </Button>
            <Button theme="primary" disabled={!selected} onClick={() => setPage("second")}>
              Configure credential
            </Button>
          </>
        }
      >
        <div className="text-xs text-left container mx-auto">
          <form id="credential-schema-picker" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 md:grid-cols-4 sm:grid-cols-3 gap-4 overflow-auto max-h-99">
              {typeOptions.map((o) => {
                const inputId = `credential-schema-picker_selected_${o.key}`;
                return (
                  <div key={o.key} className="flex items-center p-2">
                    <input
                      type="radio"
                      id={inputId}
                      name="selected"
                      value={o.key}
                      checked={selected === o.key}
                      onChange={() => pickType(o.key)}
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600 cursor-pointer"
                    />
                    <label htmlFor={inputId} className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                      {o.name}
                      {o.type === "oauth" && <span className="hero-key-mini ml-1 h-4 w-4 text-gray-400" />}
                    </label>
                  </div>
                );
              })}
            </div>
          </form>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="font-bold">
          {editing ? `Edit ${credential.name || "credential"}` : `Create ${formatSchemaName(schema ?? "raw")} credential`}
        </span>
      }
      width="max-w-[600px]"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div />
          <div className="flex gap-2">
            <Button theme="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button id={`save-credential-button-${credential?.id ?? "new"}`} disabled={!valid} onClick={save}>
              Save Credential
            </Button>
          </div>
        </div>
      }
    >
      <div className="text-left">
        {schema === "oauth" && !client && (
          <Alert type="danger" header="OAuth client not found" className="mb-4">
            <p>The associated Oauth client for this credential cannot be found. Create a new client or contact your administrator.</p>
          </Alert>
        )}
        <form id={`credential-form-${credential?.id ?? "new"}`} className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2 border border-gray-200 rounded-md p-4">
            <div>
              <h3 className="text-normal font-semibold text-gray-900">Credential identity</h3>
              <p className="text-xs text-gray-500 mt-1">Basic information that applies to all environments</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <TextInput id="credential-name" label="Credential Name" required value={name} onChange={(e) => setName(e.target.value)} />
              <div>
                <TextInput id="credential-external-id" label="External ID" value={externalId} onChange={(e) => setExternalId(e.target.value)} />
                <p className="text-xs text-gray-500 mt-1">Optional identifier for external systems</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 border border-gray-200 rounded-md p-4">
            <div>
              <h3 className="text-normal font-semibold text-gray-900">Credential environments</h3>
              <p className="text-xs text-gray-500 mt-1">
                Different credential values for each environment (dev, staging, production, etc.)
              </p>
            </div>
            <div className="border-b border-gray-200">
              <div className="flex space-x-4">
                {envs.map((e, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTab(i)}
                    className={cn(
                      "pb-4 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap",
                      i === tab
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    {e.name}
                  </button>
                ))}
                <span title={envs.length >= MAX_ENVIRONMENTS ? "Maximum of 5 environments reached" : "Add new environment"}>
                  <button
                    id="add-environment-button"
                    type="button"
                    disabled={envs.length >= MAX_ENVIRONMENTS}
                    onClick={() => {
                      setEnvs((list) => [...list, { name: `env${list.length + 1}`, body: {} }]);
                      setTab(envs.length);
                    }}
                    className={cn(
                      "pb-4 px-1 transition-colors",
                      envs.length >= MAX_ENVIRONMENTS
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-400 hover:text-gray-600 cursor-pointer"
                    )}
                  >
                    <span className="hero-plus h-5 w-5" />
                  </button>
                </span>
              </div>
            </div>
            <div>
              <div className="mb-6">
                <TextInput
                  id="environment-name-input"
                  label={
                    <>
                      Environment name<span className="text-red-500"> *</span>
                      <InfoTooltip title={environmentTooltip} />
                    </>
                  }
                  placeholder="e.g., production, staging, development, test, qa"
                  value={env.name}
                  errors={env.name.trim() ? [] : ["can't be blank"]}
                  onChange={(e) =>
                    setEnvs((list) => list.map((x, i) => (i === tab ? { ...x, name: e.target.value } : x)))
                  }
                />
              </div>
              {schema === "oauth" ? (
                <OauthFields client={client} authorized={authorized} onAuthorize={() => setAuthorized(true)} />
              ) : schema === "raw" ? (
                <fieldset>
                  <TextArea
                    id="credential-body-raw"
                    label="Credential Body"
                    required
                    rows={8}
                    className="font-mono"
                    value={env.body.raw ?? ""}
                    onChange={(e) => setBody("raw", e.target.value)}
                  />
                </fieldset>
              ) : (
                <fieldset className="space-y-6">
                  {fields.map((f) =>
                    f.secret ? (
                      <PasswordInput
                        key={`${tab}-${f.key}`}
                        id={`credential-body-${f.key}`}
                        label={f.label}
                        required={f.required}
                        value={env.body[f.key] ?? ""}
                        onChange={(e) => setBody(f.key, e.target.value)}
                      />
                    ) : (
                      <TextInput
                        key={`${tab}-${f.key}`}
                        id={`credential-body-${f.key}`}
                        label={f.label}
                        required={f.required}
                        value={env.body[f.key] ?? ""}
                        onChange={(e) => setBody(f.key, e.target.value)}
                      />
                    )
                  )}
                </fieldset>
              )}
            </div>
            {envs.length > 1 && (
              <div className="space-y-4">
                <div className="border-t border-gray-200" />
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(`Are you sure you want to delete the ${env.name} environment?`)) return;
                    setEnvs((list) => list.filter((_, i) => i !== tab));
                    setTab(0);
                  }}
                  className="inline-flex items-center text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  <span className="hero-trash h-4 w-4 mr-1.5" />
                  Delete environment
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 border border-gray-200 rounded-md p-4">
            <div>
              <h3 className="text-normal font-semibold text-gray-900">Projects access</h3>
              <p className="text-xs text-gray-500 mt-1">Select projects that can use this credential</p>
            </div>
            <ProjectsPicker
              id={credential?.id ?? "new"}
              type="credential"
              projects={projects}
              selectedIds={projectIds}
              onChange={setProjectIds}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
}

/** GenericOauthComponent, idle and complete states only (no real OAuth flow). */
function OauthFields({
  client,
  authorized,
  onAuthorize,
}: {
  client?: OauthClient;
  authorized: boolean;
  onAuthorize: () => void;
}) {
  const scopes = client ? [...client.mandatoryScopes, ...client.optionalScopes] : [];
  return (
    <div className="space-y-4">
      {scopes.length > 0 && (
        <div className="mt-5">
          <h3 className="leading-6 text-slate-800 pb-2 mb-2">
            <div className="flex flex-row text-sm font-semibold">
              Select permissions
              <InfoTooltip title="Select permissions associated to your OAuth2 Token" />
            </div>
            {client?.scopesDocUrl && (
              <div className="flex flex-row text-xs mt-1">
                Learn more about {client.name} permissions
                <a target="_blank" rel="noreferrer" href={client.scopesDocUrl} className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600">
                  &nbsp;here
                </a>
              </div>
            )}
          </h3>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {scopes.map((s) => (
              <Checkbox
                key={s}
                label={s}
                defaultChecked={client?.mandatoryScopes.includes(s)}
                disabled={client?.mandatoryScopes.includes(s)}
              />
            ))}
          </div>
        </div>
      )}
      <div className="mb-6 space-y-4">
        {authorized ? (
          <>
            <Alert type="info">
              Successfully authenticated with {client?.name}. Your credential seems ready to use, but we couldn't fetch
              your user info to verify. This app may not provide a user info endpoint, or your admin may not have
              configured it.
            </Alert>
            <div className="text-sm text-gray-600">
              If your credential isn't working as expected, you can{" "}
              <button type="button" className="font-medium text-blue-600 hover:text-blue-500">
                reauthenticate with {client?.name}
              </button>
            </div>
          </>
        ) : (
          client && (
            <Button id="authorize-button" onClick={onAuthorize}>
              <span className="text-normal">Sign in with {client.name}</span>
            </Button>
          )
        )}
      </div>
    </div>
  );
}
