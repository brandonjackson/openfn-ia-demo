/**
 * Credentials, OAuth clients and keychain credentials for the shared
 * credential index (annotations/shared/shared-credential-index-component.md).
 * Static fixtures only: every secret here is an obviously fake placeholder.
 */
import { projects, roleIn, type Project } from "./projects";
import { currentUser, findUser, users, type User } from "./users";
import { capitalize } from "../utils/format";

export type TransferStatus = "pending" | "completed" | null;

export interface Credential {
  id: string;
  name: string;
  /** Adaptor short name ("dhis2"), "raw" or "oauth". */
  schema: string;
  ownerId: string;
  projectIds: string[];
  externalId: string | null;
  /** Environment names; Lightning defaults to a single "main". */
  environments: string[];
  /** Only for schema "oauth"; null means the client was deleted. */
  oauthClientId?: string | null;
  transferStatus: TransferStatus;
  /** ISO date the credential will be purged, when deletion is scheduled. */
  scheduledDeletion: string | null;
}

export interface OauthClient {
  id: string;
  name: string;
  ownerId: string;
  /** Global clients are usable by every project on the instance. */
  global: boolean;
  projectIds: string[];
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revocationEndpoint: string;
  introspectionEndpoint: string;
  userinfoEndpoint: string;
  mandatoryScopes: string[];
  optionalScopes: string[];
  scopesDocUrl: string;
}

export interface KeychainCredential {
  id: string;
  name: string;
  /** JSONPath that picks the credential selector out of the run's input. */
  path: string;
  defaultCredentialId: string | null;
  projectId: string;
  createdById: string;
}

const [openhie, dhis2Project] = projects;

export const oauthClients: OauthClient[] = [
  {
    id: "oc-google",
    name: "Google Workspace",
    ownerId: "user-amy",
    global: false,
    projectIds: [openhie.id],
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
    introspectionEndpoint: "",
    userinfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
    mandatoryScopes: ["openid", "email"],
    optionalScopes: ["https://www.googleapis.com/auth/spreadsheets"],
    scopesDocUrl: "https://developers.google.com/identity/protocols/oauth2/scopes",
  },
  {
    id: "oc-salesforce",
    name: "Salesforce",
    ownerId: "user-sizwe",
    global: true,
    projectIds: [],
    authorizationEndpoint: "https://login.salesforce.com/services/oauth2/authorize",
    tokenEndpoint: "https://login.salesforce.com/services/oauth2/token",
    revocationEndpoint: "",
    introspectionEndpoint: "",
    userinfoEndpoint: "",
    mandatoryScopes: ["api", "refresh_token"],
    optionalScopes: [],
    scopesDocUrl: "",
  },
];

export const credentials: Credential[] = [
  {
    id: "cred-dhis2-play",
    name: "DHIS2 play",
    schema: "dhis2",
    ownerId: "user-amy",
    projectIds: [openhie.id, dhis2Project.id],
    externalId: null,
    environments: ["main"],
    transferStatus: null,
    scheduledDeletion: null,
  },
  {
    id: "cred-hapi-fhir",
    name: "OpenHIE HAPI FHIR",
    schema: "fhir",
    ownerId: "user-amy",
    projectIds: [openhie.id],
    externalId: "hapi-fhir-shr-01",
    environments: ["main", "staging"],
    transferStatus: null,
    scheduledDeletion: null,
  },
  {
    id: "cred-google-sheets",
    name: "Reporting spreadsheet",
    schema: "oauth",
    oauthClientId: "oc-google",
    ownerId: "user-amy",
    projectIds: [openhie.id],
    externalId: null,
    environments: ["main"],
    transferStatus: "pending",
    scheduledDeletion: null,
  },
  {
    id: "cred-commcare",
    name: "CommCare HQ",
    schema: "commcare",
    ownerId: "user-esther",
    projectIds: [openhie.id, dhis2Project.id],
    externalId: null,
    environments: ["main"],
    transferStatus: null,
    scheduledDeletion: null,
  },
  {
    id: "cred-old-postgres",
    name: "Legacy warehouse",
    schema: "postgresql",
    ownerId: "user-amy",
    projectIds: [],
    externalId: null,
    environments: ["main"],
    transferStatus: null,
    scheduledDeletion: "2026-10-21T09:00:00Z",
  },
];

export const keychainCredentials: KeychainCredential[] = [
  {
    id: "kc-by-district",
    name: "By district",
    path: "$.district_id",
    defaultCredentialId: "cred-dhis2-play",
    projectId: openhie.id,
    createdById: "user-amy",
  },
];

/**
 * Credential types offered on the first page of "Add a credential": every
 * adaptor with a credential schema (short names, as Lightning shows them),
 * plus Raw JSON and the OAuth clients available to the user or project.
 * Lightning sorts the combined list case-insensitively.
 */
const adaptorSchemas = [
  "airqo", "arcgis", "asana", "aws-s3", "azure-storage", "beyonic", "bigquery", "browserless",
  "cartodb", "chatgpt", "cht", "claude", "commcare", "dagu", "dhis2", "divoc", "dynamics",
  "erpnext", "et-mfr", "facebook", "fhir", "fhir-4", "fhir-eswatini", "fhir-fr", "fhir-ndr-et",
  "fhir-opensrp", "flutterwave", "formsg", "gemini", "ghana-bdr", "ghana-nia", "godata",
  "googledrive", "googlehealthcare", "hive", "http", "ihris", "kobotoolbox", "mailchimp",
  "mailgun", "medicmobile", "mogli", "mongodb", "msgraph", "mssql", "mysql", "ocl", "odk",
  "openfn", "openhim", "openimis", "openlmis", "openmrs", "openspp", "postgresql", "primero",
  "rapidpro", "redis", "salesforce", "satusehat", "senaite", "sftp", "surveycto", "telerivet",
  "twilio", "vtiger", "wigal-sms",
];

export interface CredentialTypeOption {
  /** Shown next to the radio. */
  name: string;
  /** Schema key, or the OAuth client id for OAuth options. */
  key: string;
  type: "adaptor" | "raw" | "oauth";
}

export function credentialTypeOptions(clients: OauthClient[]): CredentialTypeOption[] {
  return [
    ...adaptorSchemas.map((s) => ({ name: s, key: s, type: "adaptor" as const })),
    { name: "Raw JSON", key: "raw", type: "raw" as const },
    ...clients.map((c) => ({ name: c.name, key: c.id, type: "oauth" as const })),
  ].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

/** One field of a credential schema form (JsonSchemaBodyComponent). */
export interface SchemaField {
  key: string;
  label: string;
  required?: boolean;
  secret?: boolean;
  placeholder?: string;
}

const genericFields: SchemaField[] = [
  { key: "hostUrl", label: "Host URL", required: true },
  { key: "username", label: "Username" },
  { key: "password", label: "Password", secret: true },
];

/** A handful of real adaptor schemas; the rest fall back to host/user/password. */
const schemaFields: Record<string, SchemaField[]> = {
  dhis2: [
    { key: "hostUrl", label: "Host URL", required: true },
    { key: "username", label: "Username" },
    { key: "password", label: "Password", secret: true },
    { key: "apiVersion", label: "API Version" },
    { key: "pat", label: "Personal access token", secret: true },
  ],
  http: [
    { key: "baseUrl", label: "Base URL" },
    { key: "username", label: "Username" },
    { key: "password", label: "Password", secret: true },
    { key: "access_token", label: "Access Token", secret: true },
  ],
  postgresql: [
    { key: "host", label: "Host", required: true },
    { key: "port", label: "Port", required: true },
    { key: "database", label: "Database", required: true },
    { key: "user", label: "User", required: true },
    { key: "password", label: "Password", required: true, secret: true },
    { key: "ssl", label: "SSL" },
  ],
  commcare: [
    { key: "hostUrl", label: "Host URL" },
    { key: "domain", label: "Domain", required: true },
    { key: "appId", label: "App ID" },
    { key: "username", label: "Username", required: true },
    { key: "password", label: "Password", secret: true },
    { key: "apiKey", label: "API Key", secret: true },
  ],
  fhir: [
    { key: "baseUrl", label: "Base URL", required: true },
    { key: "apiPath", label: "API Path" },
    { key: "access_token", label: "Access Token", secret: true },
  ],
};

export function fieldsForSchema(schema: string): SchemaField[] {
  return schemaFields[schema] ?? genericFields;
}

/** Lightning's `format_schema_name`: "dhis2" → "Dhis2", "aws-s3" → "Aws-s3". */
export function formatSchemaName(schema: string): string {
  if (schema === "raw") return "Raw JSON";
  if (schema === "oauth") return "OAuth";
  if (schema === "http") return "HTTP";
  return schema
    .split("_")
    .map(capitalize)
    .join(" ");
}

/** The Type column (DataTables `credential_type`). */
export function credentialTypeLabel(credential: Credential): string {
  if (credential.schema === "oauth") {
    const client = oauthClients.find((c) => c.id === credential.oauthClientId);
    return client ? client.name.toLowerCase() : "oauth";
  }
  return credential.schema;
}

export function missingOauthClient(credential: Credential): boolean {
  return credential.schema === "oauth" && !oauthClients.some((c) => c.id === credential.oauthClientId);
}

export function projectNames(projectIds: string[]): string[] {
  return projectIds.map((id) => projects.find((p) => p.id === id)?.name).filter((n): n is string => !!n);
}

export function ownerEmail(userId: string): string {
  return findUser(userId)?.email ?? "";
}

/** Credentials shown on /credentials (the user's own) or in a project's settings (shared with it). */
export function credentialsFor(project?: Project, user: User = currentUser): Credential[] {
  return project
    ? credentials.filter((c) => c.projectIds.includes(project.id))
    : credentials.filter((c) => c.ownerId === user.id);
}

export function oauthClientsFor(project?: Project, user: User = currentUser): OauthClient[] {
  return project
    ? oauthClients.filter((c) => c.global || c.projectIds.includes(project.id))
    : oauthClients.filter((c) => c.ownerId === user.id);
}

export function keychainCredentialsIn(project: Project): KeychainCredential[] {
  return keychainCredentials.filter((k) => k.projectId === project.id);
}

export function findCredential(id: string | null | undefined): Credential | undefined {
  return credentials.find((c) => c.id === id);
}

/** Users Lightning lists as transfer targets ("First Last (email)"). */
export const transferUserOptions: [label: string, value: string][] = users.map((u) => [
  `${u.firstName} ${u.lastName} (${u.email})`,
  u.id,
]);

/** Lightning.Policies.Users :edit_credential: only the owner. */
export function canEditCredential(ownerId: string, user: User = currentUser): boolean {
  return ownerId === user.id;
}

/** Lightning.Policies.Credentials :edit_keychain_credential: project admins and owners. */
export function canEditKeychain(project: Project | undefined, user: User = currentUser): boolean {
  if (!project) return false;
  const role = roleIn(project, user.id);
  return role === "admin" || role === "owner";
}

/** Project editors and up can create project credentials. */
export function canCreateProjectCredential(project: Project | undefined, user: User = currentUser): boolean {
  if (!project) return true;
  const role = roleIn(project, user.id);
  return role === "owner" || role === "admin" || role === "editor";
}
