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
