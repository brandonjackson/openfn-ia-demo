/* ------------------------------------------------------------------ */
/*  Shared primitive types                                             */
/* ------------------------------------------------------------------ */

export interface MetricCard {
  label: string;
  value: string | number;
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
  metrics: MetricCard[];
  connectedSystems: ConnectedSystemSummary[];
  recommendedSystems: { name: string; description: string }[];
  suggestedServices: SuggestedService[];
  recommended: number;
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
/*  Union type                                                         */
/* ------------------------------------------------------------------ */

export type PageData =
  | ListPageData
  | DetailPageData
  | CatalogPageData
  | TablePageData
  | DashboardPageData
  | ProjectPageData
  | ProjectSettingsPageData;
