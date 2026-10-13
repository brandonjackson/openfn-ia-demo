/* ------------------------------------------------------------------ */
/*  Shared primitive types                                             */
/* ------------------------------------------------------------------ */

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
  badge?: { label: string; tone: "green" | "yellow" | "red" | "blue" | "gray" };
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

export interface DetailPageData {
  pageType: "detail";
  headerBadge?: { label: string; variant: "shared" | "private" };
  /** System ID to look up full system data (url, owner, credentials, etc.) */
  systemId?: string;
  metrics?: MetricCard[];
  sections: DetailSection[];
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

export interface WorkflowCatalogEntry {
  kind: "workflow";
  id: string;
  name: string;
  description: string;
  project: string;
  projectPath: string;
  badges?: string[];
  section: string;
}

export type CatalogEntry = ChannelCatalogEntry | WorkflowCatalogEntry;

export interface CatalogPageData {
  pageType: "catalog";
  entries: CatalogEntry[];
}

/* ------------------------------------------------------------------ */
/*  Table page (History)                                               */
/* ------------------------------------------------------------------ */

export interface TableColumn {
  key: string;
  label: string;
  colorMap?: Record<string, string>;
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
  color: string;
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
  /** Open problems, newest first. Empty when everything is fine. */
  attention: ActivityItem[];
  recentActivity: ActivityItem[];
  connectedSystems: ConnectedSystemSummary[];
  recommendedSystems: { name: string; description: string }[];
  suggestedServices: SuggestedService[];
  recommended: number;
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
  systems: SystemStatus[];
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
  serviceCount: number;
  liveServiceCount: number;
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
  /** Starter ideas from Create, to kick off something new. */
  ideas: BuildIdea[];
  services: ProjectServiceItem[];
  components: ProjectComponentItem[];
}

export interface ProjectWorkflowsPageData {
  pageType: "project-workflows";
  projectId: string;
  workflows: ProjectComponentItem[];
}

export interface ProjectComponentsPageData {
  pageType: "project-components";
  projectId: string;
  components: ProjectComponentItem[];
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

/** Something already available to build with: a system, channel or service. */
export interface BuildingBlock {
  id: string;
  name: string;
  description: string;
  /** Short label for the block's owner or system, e.g. "OpenCRVS". */
  meta?: string;
  to: string;
}

export interface ProjectCreatePageData {
  pageType: "project-create";
  projectId: string;
  ideas: BuildIdea[];
  systems: BuildingBlock[];
  channels: BuildingBlock[];
  services: BuildingBlock[];
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
}

/* ------------------------------------------------------------------ */
/*  Instance settings                                                  */
/* ------------------------------------------------------------------ */

export interface InstanceMember {
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

export interface InstanceSettingsPageData {
  pageType: "instance-settings";
  members: InstanceMember[];
  billing: BillingDetails;
  contextLayers: ContextLayer[];
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
  | UserSettingsPageData
  | InstanceSettingsPageData
  | HandbookPageData;
