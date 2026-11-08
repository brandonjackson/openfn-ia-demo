import type { ServiceRecord, XRoadConnectionStatus, XRoadMember } from "./xroad";
import type { Environment } from "./credentials";
import type { ConnectionMethod } from "./connected-systems";
import type { LucideIcon } from "lucide-react";
import type { Adaptor } from "./adaptors";
import type { EcosystemStation, EcosystemWorkflow } from "./ecosystem";

/* ------------------------------------------------------------------ */
/*  Shared primitive types                                             */
/* ------------------------------------------------------------------ */

/** One point in a feature's intro banner. */
export interface FeatureIntroItem {
  icon: LucideIcon;
  title: string;
  description: string;
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
/*  Project Create page                                                */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Project Settings page                                              */
/* ------------------------------------------------------------------ */

export interface OrgCredential {
  id: string;
  name: string;
  system: string;
  environment: Environment;
  owner: string;
  hasAccess: boolean;
}

export type PageData =
  | ListPageData
  | CatalogPageData
  | StatusPageData;
