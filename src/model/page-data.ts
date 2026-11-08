import type { Environment } from "./credentials";

/* ------------------------------------------------------------------ */
/*  Shared primitive types                                             */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Catalog page (Service Catalog)                                     */
/* ------------------------------------------------------------------ */

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
  | StatusPageData;
