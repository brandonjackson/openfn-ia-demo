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
}

export interface ProjectComponentItem {
  id: string;
  name: string;
  description: string;
  type: "Workflow" | "Form" | "Artifact" | "Collection";
}

export interface ProjectPageData {
  pageType: "project";
  projectId: string;
  metrics?: MetricCard[];
  services: ProjectServiceItem[];
  components: ProjectComponentItem[];
}

export interface ProjectWorkflowsPageData {
  pageType: "project-workflows";
  projectId: string;
  workflows: ProjectComponentItem[];
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
  production: boolean;
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
/*  Union type                                                         */
/* ------------------------------------------------------------------ */

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
  | ProjectSettingsPageData
  | UserSettingsPageData;
