import type { ProjectCollection } from "./collections";
import type { ProjectSummary } from "./projects";
import type { Environment } from "./credentials";
import type { ProjectServiceItem, ServiceApiSpec } from "./services";
import type { ConnectedSystemSummary, SuggestedSystem, ConnectedSystem, ConnectionMethod } from "./connected-systems";
import type { CollectionContents, ComponentContent } from "./project-components";
import type { LucideIcon } from "lucide-react";
import type { ChannelRequest, HistoryWorkOrder } from "./history";
import type { Adaptor } from "./adaptors";
import type { ChannelDetails } from "./channels";
import type { EcosystemStation, EcosystemWorkflow } from "./ecosystem";
import type { OrgXRoadSettings, ServiceRecord, XRoadConnectionStatus, XRoadMember, XRoadService } from "./xroad";
import type {
  DigestFrequency,
  HistoryExportStatus,
  IoDataPolicy,
  ProjectRole,
  ProjectSettingsPermissions,
  SyncDirection,
  WebhookAuthType,
} from "./project-settings";

/* ------------------------------------------------------------------ */
/*  Shared primitive types                                             */
/* ------------------------------------------------------------------ */

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
  accessGrants?: AccessGrant[];
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
/*  Dashboard page (Overview / Home)                                   */
/* ------------------------------------------------------------------ */

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
/*  Service page (a published service's catalog entry / API docs)      */
/* ------------------------------------------------------------------ */

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

/**
 * The page of one of a project's components that isn't a workflow or a
 * channel: a collection's keys, or the file a form, artifact, AI skill,
 * document or static website is.
 */
export interface ComponentPageData {
  pageType: "component";
  projectId: string;
  component: ProjectComponentItem;
  /** For a form, artifact, AI skill, document or static website: what it holds. */
  content?: ComponentContent;
  /** For a collection: its keys, how many it holds in all and their size. */
  collection?: CollectionContents;
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
  /** When it last changed (or, if nothing has, when it was made), as the API sends it; null if unknown. The page words it. */
  lastActivity: string | null;
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

/** Someone with access to a project, as the collaboration table shows them. */
export interface Collaborator {
  /** The membership's id (one person can be in many projects). */
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: ProjectRole;
  /** This is you. */
  isSelf: boolean;
  /** Whether they're emailed when a run fails. */
  failureAlert: boolean;
  /** How often they get a digest of the project's runs. */
  digest: DigestFrequency;
  /** The roles you can give them, decided by the wrapper; empty when you can't change theirs. */
  assignableRoles: ProjectRole[];
  /** Why you can't remove them, decided by the wrapper; absent when you can. */
  removeBlockedReason?: string;
}

/** One row of the Add collaborators form: an email and the role to give them. */
export interface CollaboratorDraft {
  email: string;
  role: ProjectRole;
}

/** Someone without an OpenFn account, to invite to OpenFn and to the project. */
export interface CollaboratorInvite {
  firstName: string;
  lastName: string;
  email: string;
  role: ProjectRole;
}

export interface OrgCredential {
  id: string;
  name: string;
  system: string;
  environment: Environment;
  owner: string;
  hasAccess: boolean;
}

/** A way of authenticating calls to the project's webhook triggers. */
export interface WebhookAuthMethod {
  id: string;
  /** Unique in the project. */
  name: string;
  type: WebhookAuthType;
  /** The basic auth username; absent for an API key. */
  username?: string;
  /** The API key or password with all but its last characters hidden. The full secret is shown once, when it's made. */
  maskedSecret: string;
  /** The webhook triggers that require it, by id (see `WebhookTriggerOption`). */
  triggerIds: string[];
}

/** A webhook trigger in the project that an auth method can protect. */
export interface WebhookTriggerOption {
  id: string;
  /** The workflow it starts. */
  workflowName: string;
}

/** A new webhook auth method as typed into the form. */
export interface WebhookAuthMethodDraft {
  name: string;
  type: WebhookAuthType;
  /** Basic auth only. */
  username?: string;
  /** Basic auth only. */
  password?: string;
  /** The webhook triggers to protect straight away. */
  triggerIds: string[];
}

/** The repositories a GitHub App installation can reach. */
export interface GitHubInstallation {
  id: string;
  /** The user or organisation it's installed on. */
  account: string;
  repos: GitHubRepo[];
}

/** A repository an installation can reach. */
export interface GitHubRepo {
  /** "owner/name". */
  fullName: string;
  /** Where the pull workflow is committed. */
  defaultBranch: string;
  branches: string[];
}

/** How the project is connected to a GitHub branch. */
export interface GitHubConnectionSettings {
  installationId: string;
  /** "owner/name". */
  repo: string;
  branch: string;
  /** Where the project's config lives in the repo; blank for the default. */
  configPath: string;
  /** Which way the first sync went. */
  syncDirection: SyncDirection;
}

/** The project's GitHub connection, once it's made. */
export interface GitHubConnection extends GitHubConnectionSettings {
  /** When the last sync ran, for display; absent before the first. */
  lastSyncedAt?: string;
}

/** The project's GitHub sync, connected or not. */
export interface GitHubSyncState {
  /** Your OpenFn account is linked to GitHub, so you can pick installations. */
  accountConnected: boolean;
  /** The installations your GitHub account can use. */
  installations: GitHubInstallation[];
  /** The project's connection, absent when it isn't synced. */
  connection?: GitHubConnection;
}

/** How long the project keeps its run history and input/output data. */
export interface DataStorageSettings {
  /** One of `retentionPeriods`. */
  retentionPeriod: string;
  ioDataPolicy: IoDataPolicy;
  /** One of `retentionPeriods`; ignored under zero-persistence. */
  ioRetentionPeriod: string;
}

/** A file of the project's work order history, made on request. */
export interface HistoryExport {
  id: string;
  /** Absent until the export is ready. */
  fileName?: string;
  /** Who asked for it. */
  requestedBy: string;
  /** When it was asked for, for display. */
  createdAt: string;
  status: HistoryExportStatus;
}

export interface ProjectSettingsPageData {
  pageType: "project-settings";
  /** The project's id, as used in file names and the CLI. */
  projectId: string;
  /** The project's URL-safe name. */
  projectName: string;
  /** The environment credentials load their values from, e.g. "main". */
  projectEnvironment: string;
  projectDescription: string;
  /** What you're allowed to change here, from your role in the project. */
  permissions: ProjectSettingsPermissions;
  /** Only one run at a time across the whole project. */
  concurrencyDisabled: boolean;
  /** The organisation's credentials and whether this project can use each. */
  orgCredentials: OrgCredential[];
  collections: ProjectCollection[];
  webhookAuthMethods: WebhookAuthMethod[];
  /** The project's webhook triggers, which auth methods can be assigned to. */
  webhookTriggers: WebhookTriggerOption[];
  collaborators: Collaborator[];
  /** Everyone must have MFA on their account to open the project. */
  mfaRequired: boolean;
  github: GitHubSyncState;
  dataStorage: DataStorageSettings;
  /** Newest first. */
  historyExports: HistoryExport[];
}

export type PageData =
  | ListPageData
  | DetailPageData
  | CatalogPageData
  | HistoryPageData
  | DashboardPageData
  | StatusPageData
  | InsightsPageData
  | ProjectComponentsPageData
  | ProjectCreatePageData
  | ProjectSandboxesPageData
  | ProjectSettingsPageData
  | ServicePageData
  | ChannelPageData;
