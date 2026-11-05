import type { LucideIcon } from "lucide-react";
import type { Adaptor } from "./adaptors";
import type { RunStatus, TriggerType } from "./workflow";
import type { ChannelDetails } from "./channels";
import type { EcosystemStation, EcosystemWorkflow } from "./ecosystem";
import type { OrgXRoadSettings, ServiceRecord, XRoadConnectionStatus, XRoadMember, XRoadService } from "./xroad";
import type { ConnectedSystem, ConnectionMethod } from "./connected-systems";

/* ------------------------------------------------------------------ */
/*  Shared primitive types                                             */
/* ------------------------------------------------------------------ */

/** The colours a badge comes in. */
export type BadgeTone = "green" | "yellow" | "red" | "indigo" | "pink" | "gray";

/** One point in a feature's intro banner. */
export interface FeatureIntroItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface MetricCard {
  label: string;
  value: string | number;
  linkTo?: string;
}

/** A headline number for a KPI row, optionally with a trend and a link. */
export interface StatTileData {
  label: string;
  value: string | number;
  /** Short supporting line under the value. */
  detail?: string;
  /** Recent values, oldest first, drawn as a sparkline. */
  trend?: number[];
  badge?: { label: string; tone: "green" | "yellow" | "red" | "indigo" | "gray" };
  linkTo?: string;
}

export type ActivityKind = "created" | "updated" | "tested" | "deployed" | "warning" | "error";

/** One line in an activity or needs-attention feed. Strong parts are bolded. */
export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  parts: (string | { strong: string })[];
  when: string;
  linkTo?: string;
}

export interface FilterDef {
  label: string;
  options: string[];
}

/* ------------------------------------------------------------------ */
/*  List page (Connected Systems)                                      */
/* ------------------------------------------------------------------ */

export interface ListItem {
  id: string;
  name: string;
  description: string;
  metadata?: Record<string, string>;
  linkTo?: string;
}

export interface ListPageData {
  pageType: "list";
  filters: FilterDef[];
  items: ListItem[];
  /** Filter function: given an item and the selected filter values, return true to show */
  filterKey?: string; // metadata key used for filtering
  filterMap?: Record<string, string>; // filter option -> metadata value mapping
  showSuggestions?: boolean;
  /** Dismissible "why use this" banner shown at the top of the page. */
  intro?: FeatureIntroData;
  /** The organisation's systems and the workflows between them, drawn as a transport map. */
  ecosystem?: {
    stations: EcosystemStation[];
    workflows: EcosystemWorkflow[];
    routes: Record<string, { col: number; row: number }[]>;
  };
  /** The X-Road directory, for an organisation on X-Road. */
  xroad?: {
    directory: XRoadMember[];
    /** The X-Road instance the directory is for, e.g. `FJ`. */
    instance: string;
    /** Directory services already in your systems, as `memberId/subsystem/service`. */
    added: string[];
    syncedAt: string;
  };
  /** Every adaptor a new system can be connected with. */
  adaptors: Adaptor[];
}

export interface FeatureIntroData {
  title: string;
  description?: string;
  features: FeatureIntroItem[];
  /** localStorage key that remembers the banner was dismissed. */
  storageKey?: string;
}

/* ------------------------------------------------------------------ */
/*  Detail page (OpenCRVS, DHIS2, etc.)                                */
/* ------------------------------------------------------------------ */

export interface DetailSectionItem {
  id: string;
  name: string;
  description: string;
  metadata?: Record<string, string>;
  linkTo?: string;
  badges?: string[];
}

export interface DetailSection {
  id: string;
  title: string;
  items: DetailSectionItem[];
  display: "cards" | "rows" | "links";
}

export interface AccessGrant {
  id: string;
  grantedTo: string;
  grantedToType: "user" | "project";
  scope: string;
  lastAccessed: string | null;
}

/** What a page needs to show an X-Road route: the organisation's own settings, and where the route goes. */
export interface XRoadRouteContext {
  org: OrgXRoadSettings;
  /** The member the route goes to, from the directory. */
  member?: XRoadMember;
  /** The service the route goes to, from the directory. */
  service?: XRoadService;
}

export interface DetailPageData {
  pageType: "detail";
  headerBadge?: { label: string; variant: "shared" | "private" };
  /** The system the page is about: its URL, owner, environments and how it's reached. */
  system?: ConnectedSystem;
  /** For a system reached over X-Road: the organisation's X-Road settings, and the member and service the route goes to. */
  xroad?: XRoadRouteContext;
  metrics?: MetricCard[];
  sections: DetailSection[];
  accessGrants?: AccessGrant[];
  /** Projects a new workflow can be started in, from an event channel. */
  projects?: { id: string; name: string }[];
}

/* ------------------------------------------------------------------ */
/*  Catalog page (Service Catalog)                                     */
/* ------------------------------------------------------------------ */

export type ChannelType = "read" | "write" | "event";

export interface ChannelCatalogEntry {
  kind: "channel";
  id: string;
  name: string;
  description: string;
  channelType: ChannelType;
  system: string;
  systemPath: string;
  section: string;
}

/** Ways a published service can be used: as a step in another workflow, as an agent tool over MCP, or by other members over X-Road. */
export type ServiceConsumer = "workflow" | "mcp" | "xroad";

export interface WorkflowCatalogEntry {
  kind: "workflow";
  id: string;
  name: string;
  description: string;
  project: string;
  projectPath: string;
  badges?: string[];
  section: string;
  /** How the service can be called. Scheduled services run on their own and have none. */
  callableAs?: ServiceConsumer[];
  /** Tool name agents see on the organization's MCP server. */
  mcpToolName?: string;
  /** How many organisations use it, and how many calls it took in the last 30 days. */
  usage?: { organisations: number; calls30d: number };
}

/**
 * A service the organisation uses: one published by a system it has added,
 * such as another member's service on X-Road. Only systems you've added
 * show up.
 */
export interface UsedServiceEntry {
  id: string;
  name: string;
  description: string;
  /** The connected system it comes through. */
  system: string;
  systemPath: string;
  adaptor: string;
  connection: ConnectionMethod;
  xroadStatus?: XRoadConnectionStatus;
  /** The organisation that publishes it. */
  owner: string;
  /** The endpoints it offers. */
  methods: string[];
  /** Its X-Road service ID, e.g. `FJ/GOV/MOI/IDENTITY/verify-national-id`. */
  serviceId?: string;
  builtWithOpenFn?: boolean;
  record?: ServiceRecord;
}

export type CatalogEntry = ChannelCatalogEntry | WorkflowCatalogEntry;

export interface CatalogPageData {
  pageType: "catalog";
  entries: CatalogEntry[];
  /** Services from systems you've added, beside the channels in `entries`. */
  usedServices?: UsedServiceEntry[];
  /** The organization's MCP server, which exposes callable services as agent tools. */
  mcpServerUrl?: string;
  /** Projects a new workflow can be started in, from an event channel. */
  projects?: { id: string; name: string }[];
  /** Whether the organisation has connected systems, whose methods "Services we use" lists. Defaults to true. */
  connectedSystems?: boolean;
  /** Whether the organisation is on X-Road, so services can be offered over it. Defaults to true. */
  xroad?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Table page (History)                                               */
/* ------------------------------------------------------------------ */

export interface TableColumn {
  key: string;
  label: string;
  /** Shows matching cell values as badges in the given tone. */
  toneMap?: Record<string, BadgeTone>;
}

export interface TablePageData {
  pageType: "table";
  filters: FilterDef[];
  columns: TableColumn[];
  rows: Record<string, unknown>[];
}

/* ------------------------------------------------------------------ */
/*  Environments                                                       */
/* ------------------------------------------------------------------ */

/**
 * Every connected system has these three environments, and every credential
 * belongs to exactly one of them.
 * - production: the live system, real data.
 * - staging: a real instance of the system used for testing, test data.
 * - mock: a simulated stand-in (no real system behind it) for building offline.
 */
export type Environment = "production" | "staging" | "mock";

export const ENVIRONMENTS: Environment[] = ["production", "staging", "mock"];

/** How one connected system is reached in one environment. */
export interface SystemEnvironment {
  url?: string;
  /** Name of the credential used in this environment, if one has been added. */
  credential?: string;
}

/* ------------------------------------------------------------------ */
/*  Dashboard page (Overview / Home)                                   */
/* ------------------------------------------------------------------ */

export interface ConnectedSystemSummary {
  id: string;
  name: string;
  credentialType: "user" | "org";
  hasAccess: boolean;
  color: string;
  /** OpenFn adaptor package id, used for the system's logo. */
  adaptor?: string;
}

/** A system we suggest connecting. */
export interface SuggestedSystem {
  name: string;
  description: string;
  adaptor?: string;
}

export interface SuggestedService {
  id: string;
  title: string;
  description: string;
  fromSystems: string[];
  toSystems: string[];
  category: string;
  why: string;
}

export interface DashboardPageData {
  pageType: "dashboard";
  /** Summary tiles that link through to Status and Insights. */
  tiles: StatTileData[];
  /** The organisation's systems, for setup progress. Absent without connected systems, which leaves the section out. */
  connectedSystems?: ConnectedSystemSummary[];
  recommendedSystems: SuggestedSystem[];
  projects: ProjectSummary[];
  recommended: number;
  /** Every adaptor a new system can be connected with. */
  adaptors: Adaptor[];
}

/* ------------------------------------------------------------------ */
/*  Status page (Monitoring: right now)                                */
/* ------------------------------------------------------------------ */

export type HealthState = "operational" | "degraded" | "down";

export interface SystemStatus {
  id: string;
  name: string;
  status: HealthState;
  note: string;
  linkTo: string;
}

export interface WorkflowStatus {
  id: string;
  name: string;
  project: string;
  projectId: string;
  status: HealthState;
  lastRun: string;
  note: string;
}

export interface StatusPageData {
  pageType: "status";
  checkedAt: string;
  /** The organisation's systems. Absent without connected systems, which leaves the table out. */
  systems?: SystemStatus[];
  workflows: WorkflowStatus[];
}

/* ------------------------------------------------------------------ */
/*  Insights page (Monitoring: over time)                              */
/* ------------------------------------------------------------------ */

export interface DailyRuns {
  day: string;
  succeeded: number;
  failed: number;
}

export interface ProjectInsight {
  id: string;
  name: string;
  runs: number;
  failed: number;
  avgDuration: string;
}

export interface InsightsPageData {
  pageType: "insights";
  range: string;
  tiles: StatTileData[];
  daily: DailyRuns[];
  projects: ProjectInsight[];
}

/* ------------------------------------------------------------------ */
/*  Projects list                                                      */
/* ------------------------------------------------------------------ */

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  environment: string;
  lastActivity: string;
  memberCount: number;
  workflowCount: number;
  /** Its published services, and how many are live. Absent without the service catalog. */
  serviceCount?: number;
  liveServiceCount?: number;
}

export interface ProjectsPageData {
  pageType: "projects";
  projects: ProjectSummary[];
}

/* ------------------------------------------------------------------ */
/*  Project page                                                       */
/* ------------------------------------------------------------------ */

export interface ProjectServiceItem {
  id: string;
  name: string;
  description: string;
  status: "Live" | "Draft";
  /** The workflow component that runs this service. */
  workflowId?: string;
  /** How other teams call the service. Generated from the workflow when absent. */
  api?: ServiceApiSpec;
  /** What the catalogue records about it: owner, purpose, legal basis and so on. */
  record?: ServiceRecord;
  /** Who uses it: how many organisations, and how many calls in the last 30 days. */
  usage?: { organisations: number; calls30d: number; trend?: number[] };
  /** Whether agents can call it as a tool on the organisation's MCP server. */
  mcpEnabled?: boolean;
  /** Its X-Road service code, once published to X-Road. */
  xroad?: { serviceCode: string; published: boolean; clients?: string[] };
}

/* ------------------------------------------------------------------ */
/*  Service page (a published service's catalog entry / API docs)      */
/* ------------------------------------------------------------------ */

export interface ServiceApiField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ServiceApiSpec {
  /**
   * `webhook` services are called over HTTP; `schedule` services run on a
   * timer and only publish what they produce.
   */
  trigger: "webhook" | "schedule";
  /** Webhook: `POST https://…`. Schedule: e.g. "Every 15 minutes". */
  invocation: string;
  /** How callers authenticate (webhook only). */
  auth?: string;
  /** Fields the caller sends (webhook only). */
  inputFields?: ServiceApiField[];
  /** A sample request, e.g. a curl command (webhook only). */
  requestExample?: string;
  /** What the service returns or publishes. */
  outputDescription: string;
  outputExample: string;
}

export interface ServicePageData {
  pageType: "service";
  projectId: string;
  projectName: string;
  service: ProjectServiceItem;
  /** The workflow behind the service, if it's been linked. */
  workflow?: ProjectComponentItem;
  api: ServiceApiSpec;
  /** The organisation's X-Road settings: who it is on X-Road, and its Security Server. Absent when it isn't on X-Road. */
  xroadOrg?: OrgXRoadSettings;
}

/** A channel's page in its project, opened from the project's Components. */
export interface ChannelPageData {
  pageType: "channel";
  projectId: string;
  projectName: string;
  component: ProjectComponentItem;
  channel: ChannelDetails;
}

/** Kinds of building block a project is made from. */
export type ProjectComponentType =
  | "Workflow"
  | "Channel"
  | "Form"
  | "Artifact"
  | "Collection"
  | "AI Skill"
  | "Document"
  | "Static Website";

export interface ProjectComponentItem {
  id: string;
  name: string;
  description: string;
  type: ProjectComponentType;
}

export interface ProjectPageData {
  pageType: "project";
  projectId: string;
  /** Headline numbers from Insights and History, linking through. */
  tiles: StatTileData[];
  /** Starter ideas from Create, to kick off something new. Absent without Create, which leaves the section out. */
  ideas?: BuildIdea[];
  /** What the project publishes. Absent without the service catalog. */
  services?: ProjectServiceItem[];
  /** What it's built from. Absent without components. */
  components?: ProjectComponentItem[];
}

/** A workflow on the project's Workflows list, with its recent activity. */
export interface WorkflowListItem extends ProjectComponentItem {
  /** Status of the service the workflow backs, if it backs one. */
  serviceStatus?: "Live" | "Draft";
  /** Status of its most recent run; none if it has never run. */
  latestRun?: RunStatus;
  /** When it last ran, as an ISO timestamp (sorts by Activity). */
  lastRunAt?: string;
  /** Names of the people who have edited it, most recent first. */
  members: string[];
  /** When it was last changed, as an ISO timestamp. */
  updatedAt: string;
  /** Whether its triggers are on. Off, it only runs when someone starts it by hand. */
  enabled: boolean;
  /** The kind of its trigger, e.g. "webhook" or "cron", for saying what turning it off stops. Absent without a trigger. */
  triggerType?: TriggerType;
  /** Work orders in the last 30 days. */
  workOrders: number;
  /** Of those, how many ended in a failed state. */
  failedWorkOrders: number;
}

export interface ProjectWorkflowsPageData {
  pageType: "project-workflows";
  projectId: string;
  workflows: WorkflowListItem[];
}

export interface ProjectComponentsPageData {
  pageType: "project-components";
  projectId: string;
  components: ProjectComponentItem[];
  /** The kinds of component the page lists and offers to add, never Workflow (it has its own page). */
  types: ProjectComponentType[];
}

/* ------------------------------------------------------------------ */
/*  Project Create page                                                */
/* ------------------------------------------------------------------ */

/** A starter idea for a new public service, built from available systems. */
export interface BuildIdea {
  id: string;
  title: string;
  description: string;
  /** Names of the systems the idea connects. */
  systems: string[];
  /** The prompt this idea drops into the builder. */
  prompt: string;
}

export interface ProjectCreatePageData {
  pageType: "project-create";
  projectId: string;
  ideas: BuildIdea[];
}

/* ------------------------------------------------------------------ */
/*  Project Sandboxes page                                             */
/* ------------------------------------------------------------------ */

export interface SandboxItem {
  name: string;
  /** The project's main line, which every other sandbox merges back into. */
  isMain: boolean;
  description: string;
  createdBy: string;
  lastActivity: string;
}

export interface ProjectSandboxesPageData {
  pageType: "project-sandboxes";
  projectId: string;
  sandboxes: SandboxItem[];
}

/* ------------------------------------------------------------------ */
/*  Project Settings page                                              */
/* ------------------------------------------------------------------ */

export interface Collaborator {
  name: string;
  email: string;
  role: "Owner" | "Editor" | "Viewer" | "Admin";
  isSelf?: boolean;
  failureAlert: string;
  digest: string;
}

export interface OrgCredential {
  id: string;
  name: string;
  system: string;
  environment: Environment;
  owner: string;
  hasAccess: boolean;
}

export interface ProjectSettingsPageData {
  pageType: "project-settings";
  projectName: string;
  projectEnvironment: string;
  projectDescription: string;
  collaborators: Collaborator[];
  orgCredentials: OrgCredential[];
  retentionPeriod: string;
  ioDataPolicy: "retain" | "zero-persistence";
  ioRetentionPeriod: string;
  mfaRequired: boolean;
  githubConnected: boolean;
  concurrencyDisabled: boolean;
}

/* ------------------------------------------------------------------ */
/*  User settings                                                      */
/* ------------------------------------------------------------------ */

/** How often OpenFn may get in touch about your account. */
export type ContactPreference = "Anytime" | "Critical only";

export const CONTACT_PREFERENCES: ContactPreference[] = ["Anytime", "Critical only"];

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  /** When the account was made, e.g. "12 March 2024". */
  createdAt: string;
  contactPreference: ContactPreference;
  /** Whether signing in asks for a code from an authenticator app. */
  mfaEnabled: boolean;
  /** Whether the account is linked to GitHub, for version control. */
  githubConnected: boolean;
  /** A new address waiting for its confirmation link to be clicked. Absent when no change is pending. */
  pendingEmail?: string;
  /** When the account will be deleted, once you've asked for it, e.g. "12 Nov 2026". Absent otherwise. */
  scheduledDeletion?: string;
}

/** A name, first and last, and how often to get in touch: what Profile's first form saves. */
export type ProfileDetails = Pick<UserProfile, "firstName" | "lastName" | "contactPreference">;

/** The secret for a new authenticator app, while setting up multi-factor authentication. */
export interface MfaSetup {
  /** The key to type into the app by hand, in base32. */
  secret: string;
  /** The otpauth:// link the QR code stands for. */
  uri: string;
}

/** A one-time code for signing in without the authenticator app. */
export interface BackupCode {
  code: string;
  /** When it was used, e.g. "3 Oct 2026". Absent while it's still good. */
  usedAt?: string;
}

/** What kind of value a credential field takes, which decides its input. */
export type CredentialFieldKind = "text" | "url" | "secret" | "number" | "boolean" | "json";

/** One value a credential type asks for, from its adaptor's configuration schema. */
export interface CredentialField {
  /** Its key in the credential body, e.g. "hostUrl". */
  key: string;
  label: string;
  kind: CredentialFieldKind;
  /** One line on what to put in it. */
  description?: string;
  /** An example value shown in the empty input. */
  placeholder?: string;
  /** Whether the credential can't be saved without it. */
  required?: boolean;
  /** The value a new credential starts with, e.g. "5432" for a port. */
  defaultValue?: string;
}

/** A kind of credential you can make: an adaptor's configuration schema, or raw JSON. */
export interface CredentialSchema {
  /** The schema's id, e.g. "dhis2" or "raw". */
  id: string;
  /** What it's called in the type picker, e.g. "DHIS2". */
  name: string;
  /** Adaptor id for its logo; absent for raw JSON. */
  adaptor?: string;
  /** One line on what it connects to. */
  description: string;
  /** What it asks for, in order. Raw JSON has one `json` field, `body`. */
  fields: CredentialField[];
}

/**
 * A credential's values for one environment. Secret fields never come back
 * from the server: they're missing here even when they're set, and a blank
 * secret on save keeps the one already stored. Booleans are "true" or "false";
 * raw JSON is the whole body as text under `body`.
 */
export interface CredentialEnvironmentValues {
  environment: Environment;
  values: Record<string, string>;
}

export interface UserCredential {
  id: string;
  name: string;
  /** Id of its `CredentialSchema`. */
  schema: string;
  /** An optional id it's known by in an outside system. */
  externalId?: string;
  /** Ids of the projects that can use it. */
  projectIds: string[];
  /** Its values per environment, at least one. A sandbox uses the environment its project names. */
  environments: CredentialEnvironmentValues[];
  createdAt: string;
  /** Email of the person it's being handed to, while they haven't accepted yet. */
  transferPendingTo?: string;
}

/** A credential as the form saves it: no `id` for a new one, and secrets in the values. */
export type CredentialDraft = Omit<UserCredential, "id" | "createdAt" | "transferPendingTo"> & { id?: string };

export interface OAuthClient {
  id: string;
  name: string;
  /** Where people are sent to sign in and grant access. */
  authorizationEndpoint: string;
  /** Where OpenFn swaps the grant for tokens. */
  tokenEndpoint: string;
  /** Where OpenFn revokes a token it no longer needs. */
  revocationEndpoint?: string;
  /** Where OpenFn checks whether a token is still good. */
  introspectionEndpoint?: string;
  /** Where OpenFn reads who signed in. */
  userinfoEndpoint?: string;
  /** The app's id at the provider. The client secret never comes back from the server. */
  clientId: string;
  /** Scopes every credential made with this client asks for. */
  mandatoryScopes: string[];
  /** Scopes a credential may add. */
  optionalScopes: string[];
  /** Where the provider documents its scopes. */
  scopesDocUrl?: string;
  /** Any project on the instance can use it. Only superusers make global clients. */
  global: boolean;
  /** Ids of the projects that can use it, when it isn't global. */
  projectIds: string[];
}

/** An OAuth client as the form saves it: no `id` for a new one, and a secret when one is typed. */
export type OAuthClientDraft = Omit<OAuthClient, "id"> & { id?: string; clientSecret?: string };

export interface ApiToken {
  id: string;
  /** Last characters of the token; the rest is masked in the UI. */
  suffix: string;
  createdAt: string;
  lastUsedAt?: string;
}

/** A project you could share a credential or OAuth client with. */
export interface ProjectOption {
  id: string;
  name: string;
}

export interface UserSettingsPageData {
  pageType: "user-settings";
  profile: UserProfile;
  credentials: UserCredential[];
  /** Every kind of credential you can make, in the type picker's order. */
  credentialSchemas: CredentialSchema[];
  oauthClients: OAuthClient[];
  /** Projects you're a member of, which you can share credentials and OAuth clients with. */
  projects: ProjectOption[];
  apiTokens: ApiToken[];
  /** Your backup codes, while multi-factor authentication is on. */
  backupCodes?: BackupCode[];
  /** Whether you may make an OAuth client every project can use (superusers only). */
  canCreateGlobalOAuthClients?: boolean;
  /** Whether organization credentials live on connected systems, which the Credentials section points to. Defaults to true. */
  orgCredentialsOnSystems?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Organization settings                                              */
/* ------------------------------------------------------------------ */

export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
  lastActive: string;
}

export interface BillingDetails {
  plan: string;
  /** e.g. "$1,200 / month". */
  price: string;
  renewsOn: string;
  runsUsed: number;
  runsIncluded: number;
  invoices: { id: string; date: string; amount: string; status: "Paid" | "Due" }[];
}

/** A context layer: a shared source of handbook, systems and services. */
export interface ContextLayer {
  id: string;
  name: string;
  /** Where the layer lives, e.g. "Hosted on OpenFn Cloud". */
  host: string;
  url: string;
  status: "connected" | "pending";
  /** Human-readable time of the last successful fetch. */
  lastFetched?: string;
}

/** Who can find and use something by default: its project's members, the whole organisation, or everyone on the server. */
export type VisibilityScope = "project" | "organization" | "server";

/** Everything the organisation sets once: who's in it, what others see, where its context comes from, X-Road and billing. */
export interface OrganizationSettingsPageData {
  pageType: "organization-settings";
  name: string;
  members: OrganizationMember[];
  /** Default discoverability and access for new projects, systems and services. Systems and services are absent when the organisation has none. */
  visibility: { projects: VisibilityScope; systems?: VisibilityScope; services?: VisibilityScope };
  /** Shared sources of handbook pages, systems and services the organisation draws on. */
  contextLayers: ContextLayer[];
  /** Its identity on X-Road. Absent when it isn't on X-Road, which leaves out the X-Road section. */
  xroad?: OrgXRoadSettings;
  /** How many connected systems and published services use the X-Road settings. */
  xroadUsage: { systems: number; services: number };
  billing: BillingDetails;
}

/* ------------------------------------------------------------------ */
/*  Union type                                                         */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Handbook                                                           */
/* ------------------------------------------------------------------ */

/** Inline wiki text: plain strings, or links to other pages in the app. */
export type WikiInline = string | { text: string; to: string };

export type WikiBlock =
  | { type: "paragraph"; content: WikiInline[] }
  | { type: "list"; items: WikiInline[][] }
  /** Label/value rows, e.g. who owns a system and what agreement covers it. */
  | { type: "facts"; rows: { label: string; value: WikiInline[] }[] };

export interface WikiSection {
  id: string;
  title: string;
  blocks: WikiBlock[];
}

export type HandbookFileKind = "pdf" | "doc" | "sheet" | "text" | "image";

export interface HandbookFile {
  id: string;
  name: string;
  kind: HandbookFileKind;
  /** Human-readable size, e.g. "240 KB". */
  size: string;
  /** Size in bytes, used to work out how full the handbook is. */
  bytes: number;
  addedBy: string;
  addedAt: string;
}

export interface HandbookPageData {
  pageType: "handbook";
  updatedAt: string;
  updatedBy: string;
  sections: WikiSection[];
  files: HandbookFile[];
  /** Total bytes the handbook can hold across all files. */
  capacityBytes: number;
}

export type PageData =
  | ListPageData
  | DetailPageData
  | CatalogPageData
  | TablePageData
  | DashboardPageData
  | StatusPageData
  | InsightsPageData
  | ProjectsPageData
  | ProjectPageData
  | ProjectWorkflowsPageData
  | ProjectComponentsPageData
  | ProjectCreatePageData
  | ProjectSandboxesPageData
  | ProjectSettingsPageData
  | ServicePageData
  | ChannelPageData
  | UserSettingsPageData
  | OrganizationSettingsPageData
  | HandbookPageData;
