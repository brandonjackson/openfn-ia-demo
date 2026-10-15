import { useState } from "react";
import FormModal from "../FormModal";
import Button from "../Button";
import Alert from "../Alert";
import Card from "../Card";
import Heading from "../Heading";
import IconButton from "../IconButton";
import InfoTooltip from "../InfoTooltip";
import { Checkbox, PasswordInput, Radio, TextArea, TextInput } from "../Inputs";
import Tabs from "../Tabs";
import TextLink from "../TextLink";
import ProjectsPicker from "./ProjectsPicker";
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
      <FormModal
        open={open}
        onClose={onClose}
        title="Add a credential"
        size="xl"
        formId="credential-schema-picker"
        formClassName=""
        onSubmit={() => setPage("second")}
        submitLabel="Configure credential"
        submitDisabled={!selected}
        cancelId="cancel-credential-type-picker"
      >
        <div className="grid max-h-99 grid-cols-2 gap-4 overflow-auto p-1 sm:grid-cols-3 md:grid-cols-4">
          {typeOptions.map((o) => (
            <Radio
              key={o.key}
              id={`credential-schema-picker_selected_${o.key}`}
              name="selected"
              value={o.key}
              checked={selected === o.key}
              onChange={() => pickType(o.key)}
              label={
                <span className="font-medium">
                  {o.name}
                  {o.type === "oauth" && <span className="hero-key-mini ml-1 h-4 w-4 text-gray-400" />}
                </span>
              }
            />
          ))}
        </div>
      </FormModal>
    );
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={editing ? `Edit ${credential.name || "credential"}` : `Create ${formatSchemaName(schema ?? "raw")} credential`}
      size="lg"
      before={
        schema === "oauth" &&
        !client && (
          <Alert type="danger" header="OAuth client not found" className="mb-4">
            <p>The associated Oauth client for this credential cannot be found. Create a new client or contact your administrator.</p>
          </Alert>
        )
      }
      formId={`credential-form-${credential?.id ?? "new"}`}
      formClassName="space-y-4"
      onSubmit={save}
      submitLabel="Save Credential"
      submitId={`save-credential-button-${credential?.id ?? "new"}`}
      submitDisabled={!valid}
    >
      <Card as="section" title="Credential identity" description="Basic information that applies to all environments">
        <TextInput id="credential-name" label="Credential Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <TextInput
          id="credential-external-id"
          label="External ID"
          hint="Optional identifier for external systems"
          value={externalId}
          onChange={(e) => setExternalId(e.target.value)}
        />
      </Card>

      <Card
        as="section"
        title="Credential environments"
        description="Different credential values for each environment (dev, staging, production, etc.)"
      >
        <Tabs
          label="Environments"
          tabs={envs.map((e, i) => ({ id: String(i), label: e.name }))}
          active={String(tab)}
          onChange={(id) => setTab(Number(id))}
          after={
            <IconButton
              id="add-environment-button"
              icon="hero-plus"
              label={envs.length >= MAX_ENVIRONMENTS ? "Maximum of 5 environments reached" : "Add new environment"}
              disabled={envs.length >= MAX_ENVIRONMENTS}
              onClick={() => {
                setEnvs((list) => [...list, { name: `env${list.length + 1}`, body: {} }]);
                setTab(envs.length);
              }}
            />
          }
        />
        <div className="space-y-6">
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
          {schema === "oauth" ? (
            <OauthFields client={client} authorized={authorized} onAuthorize={() => setAuthorized(true)} />
          ) : schema === "raw" ? (
            <TextArea
              id="credential-body-raw"
              label="Credential Body"
              required
              rows={8}
              className="font-mono"
              value={env.body.raw ?? ""}
              onChange={(e) => setBody("raw", e.target.value)}
            />
          ) : (
            <fieldset className="space-y-6">
              {fields.map((f) => {
                const Input = f.secret ? PasswordInput : TextInput;
                return (
                  <Input
                    key={`${tab}-${f.key}`}
                    id={`credential-body-${f.key}`}
                    label={f.label}
                    required={f.required}
                    value={env.body[f.key] ?? ""}
                    onChange={(e) => setBody(f.key, e.target.value)}
                  />
                );
              })}
            </fieldset>
          )}
        </div>
        {envs.length > 1 && (
          <Button
            theme="secondary"
            size="sm"
            onClick={() => {
              if (!window.confirm(`Are you sure you want to delete the ${env.name} environment?`)) return;
              setEnvs((list) => list.filter((_, i) => i !== tab));
              setTab(0);
            }}
          >
            <span className="hero-trash h-4 w-4" />
            Delete environment
          </Button>
        )}
      </Card>

      <Card as="section" title="Projects access" description="Select projects that can use this credential">
        <ProjectsPicker
          id={credential?.id ?? "new"}
          type="credential"
          projects={projects}
          selectedIds={projectIds}
          onChange={setProjectIds}
        />
      </Card>
    </FormModal>
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
        <div className="space-y-2">
          <Heading size="sm">
            Select permissions
            <InfoTooltip title="Select permissions associated to your OAuth2 Token" />
          </Heading>
          {client?.scopesDocUrl && (
            <p className="text-xs text-gray-800">
              Learn more about {client.name} permissions{" "}
              <TextLink to={client.scopesDocUrl} external>
                here
              </TextLink>
            </p>
          )}
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
      {authorized ? (
        <>
          <Alert type="info">
            Successfully authenticated with {client?.name}. Your credential seems ready to use, but we couldn't fetch
            your user info to verify. This app may not provide a user info endpoint, or your admin may not have
            configured it.
          </Alert>
          <p className="text-sm text-gray-600">
            If your credential isn't working as expected, you can{" "}
            <TextLink>reauthenticate with {client?.name}</TextLink>
          </p>
        </>
      ) : (
        client && (
          <Button id="authorize-button" onClick={onAuthorize}>
            Sign in with {client.name}
          </Button>
        )
      )}
    </div>
  );
}
