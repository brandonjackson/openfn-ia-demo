/**
 * The organisation's systems and the workflows running between them, drawn
 * as a transport map on the systems page: systems are stations, workflows
 * are lines, and runs move along them.
 *
 * Stations are placed by hand on a grid, the way a transport map is designed:
 * each system sits a whole number of cells from the one it talks to most, on
 * the same row or column, so its busiest link is a straight line. Lines are
 * drawn at right angles only; a link that can't be straight bends at the
 * corners given in `ecosystemRoutes`.
 */
import type { TriggerType } from "./workflow";
import type { XRoadConnectionStatus } from "./xroad";

/** The colour of a workflow's line, from the design system's palette. */
/** Every line colour, in order: the first is the fallback for one the server names that isn't here. */
export const lineColors = ["indigo", "sky", "teal", "violet", "pink", "orange", "emerald", "cyan", "fuchsia", "amber", "lime"] as const;

export type LineColor =
  | "indigo"
  | "sky"
  | "teal"
  | "violet"
  | "pink"
  | "orange"
  | "emerald"
  | "cyan"
  | "fuchsia"
  | "amber"
  | "lime";

export interface EcosystemStation {
  id: string;
  name: string;
  /** Adaptor package id, for the station's logo. */
  adaptor?: string;
  /** Grid column and row. */
  col: number;
  row: number;
  /** One of your connected systems, or an X-Road member calling a service you publish. */
  kind: "system" | "client";
  /** For a station reached over X-Road (or calling in over it): the member and how far access has got. */
  xroad?: { member: string; status: XRoadConnectionStatus };
  owner?: string;
}

export interface EcosystemWorkflow {
  /** The workflow's id, which opens it in the editor. */
  id: string;
  name: string;
  project: string;
  trigger: TriggerType;
  /** When it starts, e.g. "When CommCare closes a referral". */
  triggerDetail: string;
  /** Draft workflows are drawn but carry no runs. */
  state: "live" | "draft";
  /** The stations it walks, in order. */
  stations: string[];
  /** Typical runs a day while live. */
  runsPerDay: number;
  /** Share of runs that succeed (0..1). */
  successRate: number;
  /** Index into `stations` of the step its failures happen at. */
  failsAt?: number;
  failureReason?: string;
  /** Why a draft isn't live yet. */
  note?: string;
  color: LineColor;
}

/**
 * The map without X-Road: systems reached over it and members calling in
 * over it are gone, and so are the workflows that ran through them.
 */
export function ecosystemWithoutXRoad<E extends { stations: EcosystemStation[]; workflows: EcosystemWorkflow[] }>(eco: E): E {
  const stations = eco.stations.filter((s) => !s.xroad);
  const kept = new Set(stations.map((s) => s.id));
  return { ...eco, stations, workflows: eco.workflows.filter((w) => w.stations.every((id) => kept.has(id))) };
}

/** The organisation's ecosystem map: its systems placed on a grid, the workflows between them, and corners for links that can't be straight. */
export interface Ecosystem {
  stations: EcosystemStation[];
  workflows: EcosystemWorkflow[];
  /** Corners, keyed by the link's id (`linkId` in model/ecosystem-map.ts). */
  routes: Record<string, { col: number; row: number }[]>;
}
