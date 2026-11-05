import type { LucideIcon } from "lucide-react";
import type { ChannelRequest, HistoryWorkOrder } from "./history";
import type { Adaptor } from "./adaptors";
import type { RunStatus } from "./workflow";
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

/** A workflow History can filter by, with its steps for retrying from one. */
export interface HistoryWorkflowOption {
  id: string;
  name: string;
  /** The project it belongs to, for History across every project. */
  projectId: string;
  /** Its steps in the order they run, to pick one to retry from. */
  steps: { id: string; label: string }[];
  /** Its latest version, so runs on an older one can be told apart. */
  latestVersion: string;
}

/**
 * History: a project's (or every project's) work orders with their runs, and
 * its channels' requests.
 */
export interface HistoryPageData {
  pageType: "table";
  /** Newest first. */
  workOrders: HistoryWorkOrder[];
  /** Newest first. Absent when channels aren't shown. */
  channelRequests: ChannelRequest[];
  /** The workflows the work orders belong to. */
  workflows: HistoryWorkflowOption[];
  /** Set for History across every project, to filter by project and say which one each order belongs to. */
  projects?: { id: string; name: string }[];
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

/** The colours a sandbox can be marked with, so you can tell at a glance which one you're in. */
export type SandboxColor = "indigo" | "green" | "yellow" | "red" | "pink" | "gray";

export const SANDBOX_COLORS: SandboxColor[] = ["indigo", "green", "yellow", "red", "pink", "gray"];

/** A workflow changed in a sandbox, which merging would bring into its target. */
export interface SandboxChange {
  workflowId: string;
  workflowName: string;
  /** The target has changed this workflow too since the sandbox was made, so merging overwrites those changes. */
  diverged: boolean;
}

export interface SandboxItem {
  /** Its slug, e.g. "intake-validation-v2", which is how it's named everywhere. */
  name: string;
  /** The project's main line, which every other sandbox merges back into. */
  isMain: boolean;
  description: string;
  createdBy: string;
  lastActivity: string;
  color: SandboxColor;
  /** The sandbox it was made from, and merges into by default. Main has none. */
  parent?: string;
  /** Workflows changed in it since it was made. */
  changes: SandboxChange[];
  /** Credentials that exist only in this sandbox, which merging can bring along. */
  credentials: string[];
}

/** What creating or editing a sandbox asks for. */
export interface SandboxDraft {
  /** As typed; the sandbox is named its slug. */
  name: string;
  color: SandboxColor;
  /** The sandbox to make it from. Only when creating. */
  parent?: string;
}

/** What merging a sandbox brings, and where. */
export interface SandboxMerge {
  /** The sandbox to merge into, usually its parent. */
  target: string;
  /** The changed workflows to bring across. */
  workflowIds: string[];
  /** The sandbox-only credentials to bring across. */
  credentials: string[];
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

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  contactPreference: "Anytime" | "Critical only";
  mfaEnabled: boolean;
  githubConnected: boolean;
}

export interface UserCredential {
  id: string;
  name: string;
  type: string;
  projects: string[];
  environment: Environment;
  createdAt: string;
}

export interface OAuthClient {
  id: string;
  name: string;
  system: string;
  scope: "Global" | "Project";
}

export interface ApiToken {
  id: string;
  /** Last characters of the token; the rest is masked in the UI. */
  suffix: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface UserSettingsPageData {
  pageType: "user-settings";
  profile: UserProfile;
  credentials: UserCredential[];
  oauthClients: OAuthClient[];
  apiTokens: ApiToken[];
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
  | HistoryPageData
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
