import type { EcosystemStation, EcosystemWorkflow, LineColor } from "./mock-data/ecosystem";

/**
 * Geometry and numbers for the ecosystem's transport map. Everything here is
 * pure data: `EcosystemMap` turns it into SVG and `EcosystemPanel` into text.
 */

/** Edge of one grid cell, in map units. */
export const CELL = 120;
/** Space between lines running side by side, in map units. */
export const LANE_GAP = 7;

export interface Point {
  x: number;
  y: number;
}

/** What's selected on the map: a workflow, a station, or the link between two stations. */
export type EcosystemSelection = { type: "workflow" | "station" | "link"; id: string } | null;

/** What a line on the map stands for: one merged link per pair of systems, or one line per workflow. */
export type LineMode = "connections" | "workflows";

/** Each line colour as a stroke (lines), fill (runs) and background (swatches). */
export const lineColors: Record<LineColor, { stroke: string; fill: string; bg: string }> = {
  indigo: { stroke: "stroke-indigo-500", fill: "fill-indigo-500", bg: "bg-indigo-500" },
  sky: { stroke: "stroke-sky-500", fill: "fill-sky-500", bg: "bg-sky-500" },
  teal: { stroke: "stroke-teal-500", fill: "fill-teal-500", bg: "bg-teal-500" },
  violet: { stroke: "stroke-violet-500", fill: "fill-violet-500", bg: "bg-violet-500" },
  pink: { stroke: "stroke-pink-500", fill: "fill-pink-500", bg: "bg-pink-500" },
  orange: { stroke: "stroke-orange-500", fill: "fill-orange-500", bg: "bg-orange-500" },
  emerald: { stroke: "stroke-emerald-500", fill: "fill-emerald-500", bg: "bg-emerald-500" },
  cyan: { stroke: "stroke-cyan-500", fill: "fill-cyan-500", bg: "bg-cyan-500" },
  fuchsia: { stroke: "stroke-fuchsia-500", fill: "fill-fuchsia-500", bg: "bg-fuchsia-500" },
  amber: { stroke: "stroke-amber-500", fill: "fill-amber-500", bg: "bg-amber-500" },
  lime: { stroke: "stroke-lime-500", fill: "fill-lime-500", bg: "bg-lime-500" },
};

/* ------------------------------------------------------------------ */
/*  Numbers                                                            */
/* ------------------------------------------------------------------ */

export interface Traffic {
  runs: number;
  failed: number;
}

/** A workflow's runs and failures over the last `hours`. Drafts don't run. */
export function workflowTraffic(wf: EcosystemWorkflow, hours: number): Traffic {
  if (wf.state !== "live") return { runs: 0, failed: 0 };
  const runs = Math.round((wf.runsPerDay * hours) / 24);
  return { runs, failed: Math.round(runs * (1 - wf.successRate)) };
}

export function sumTraffic(list: Traffic[]): Traffic {
  return list.reduce((a, t) => ({ runs: a.runs + t.runs, failed: a.failed + t.failed }), { runs: 0, failed: 0 });
}

/** Success rate as a whole percentage, or null with no runs. */
export function successPercent(t: Traffic): number | null {
  return t.runs === 0 ? null : Math.round(((t.runs - t.failed) / t.runs) * 100);
}

/** How a link or workflow is doing, for its colour on the map. */
export type Health = "healthy" | "degraded" | "failing" | "idle";

export function healthOf(t: Traffic): Health {
  if (t.runs === 0) return "idle";
  const ok = (t.runs - t.failed) / t.runs;
  return ok >= 0.97 ? "healthy" : ok >= 0.9 ? "degraded" : "failing";
}

export const healthStyles: Record<Health, { label: string; stroke: string; bg: string; dashed?: boolean }> = {
  healthy: { label: "Healthy", stroke: "stroke-green-500", bg: "bg-green-500" },
  degraded: { label: "Some failures", stroke: "stroke-amber-500", bg: "bg-amber-500" },
  failing: { label: "Failing", stroke: "stroke-red-500", bg: "bg-red-500" },
  idle: { label: "No runs", stroke: "stroke-gray-300", bg: "bg-gray-300", dashed: true },
};

/** Every workflow that passes through a station. */
export function workflowsAt(stationId: string, workflows: EcosystemWorkflow[]) {
  return workflows.filter((w) => w.stations.includes(stationId));
}

/** Runs through a station, and the failures that happened at it. */
export function stationTraffic(stationId: string, workflows: EcosystemWorkflow[], hours: number): Traffic {
  return sumTraffic(
    workflowsAt(stationId, workflows).map((w) => {
      const t = workflowTraffic(w, hours);
      return { runs: t.runs, failed: w.failsAt !== undefined && w.stations[w.failsAt] === stationId ? t.failed : 0 };
    })
  );
}

/* ------------------------------------------------------------------ */
/*  Links                                                              */
/* ------------------------------------------------------------------ */

/** Every hop between one pair of stations, whichever way the data goes. */
export interface Link {
  id: string;
  a: string;
  b: string;
  /** In lane order. */
  workflowIds: string[];
}

export function linkId(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function buildLinks(workflows: EcosystemWorkflow[]): Link[] {
  const links = new Map<string, Link>();
  for (const wf of workflows) {
    for (let i = 1; i < wf.stations.length; i++) {
      const id = linkId(wf.stations[i - 1], wf.stations[i]);
      const [a, b] = id.split("|");
      const link = links.get(id) ?? { id, a, b, workflowIds: [] };
      if (!link.workflowIds.includes(wf.id)) link.workflowIds.push(wf.id);
      links.set(id, link);
    }
  }
  return [...links.values()];
}

export function linkTraffic(link: Link, workflows: EcosystemWorkflow[], hours: number): Traffic {
  // A run that failed at the far end still crossed the link, so every run counts.
  return sumTraffic(workflows.filter((w) => link.workflowIds.includes(w.id)).map((w) => workflowTraffic(w, hours)));
}

/* ------------------------------------------------------------------ */
/*  Geometry                                                           */
/* ------------------------------------------------------------------ */

export function stationPoint(s: { col: number; row: number }): Point {
  return { x: s.col * CELL, y: s.row * CELL };
}

/** A link's centre line from `a` to `b`, through its corners. */
export function linkPoints(
  link: Link,
  stations: Map<string, EcosystemStation>,
  routes: Record<string, { col: number; row: number }[]>
): Point[] {
  const a = stations.get(link.a);
  const b = stations.get(link.b);
  if (!a || !b) return [];
  const via = routes[link.id];
  if (via) return [stationPoint(a), ...via.map(stationPoint), stationPoint(b)];
  const pa = stationPoint(a);
  const pb = stationPoint(b);
  // No corners given: straight when they share a row or column, otherwise across then down.
  if (pa.x === pb.x || pa.y === pb.y) return [pa, pb];
  return [pa, { x: pb.x, y: pa.y }, pb];
}

/** Shifts a right-angled line sideways by `offset` (to the left of its direction of travel). */
export function offsetLine(points: Point[], offset: number): Point[] {
  if (offset === 0 || points.length < 2) return points;
  const normals = points.slice(1).map((p, i) => {
    const q = points[i];
    const len = Math.hypot(p.x - q.x, p.y - q.y) || 1;
    return { x: (q.y - p.y) / len, y: (p.x - q.x) / len };
  });
  return points.map((p, i) => {
    const before = normals[i - 1];
    const after = normals[i];
    const nx = (before?.x ?? 0) + (after?.x ?? 0);
    const ny = (before?.y ?? 0) + (after?.y ?? 0);
    return { x: p.x + nx * offset, y: p.y + ny * offset };
  });
}

/** An SVG path through the points with rounded corners. */
export function roundedPath(points: Point[], radius = 22): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const prev = points[i - 1];
    const next = points[i + 1];
    const inLen = Math.hypot(p.x - prev.x, p.y - prev.y);
    const outLen = Math.hypot(next.x - p.x, next.y - p.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const start = { x: p.x - ((p.x - prev.x) / inLen) * r, y: p.y - ((p.y - prev.y) / inLen) * r };
    const end = { x: p.x + ((next.x - p.x) / outLen) * r, y: p.y + ((next.y - p.y) / outLen) * r };
    d += ` L ${start.x} ${start.y} Q ${p.x} ${p.y} ${end.x} ${end.y}`;
  }
  const last = points[points.length - 1];
  return `${d} L ${last.x} ${last.y}`;
}

export function lineLength(points: Point[]): number {
  return points.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - points[i].x, p.y - points[i].y), 0);
}

/** How far a workflow's lane sits from the centre of a link. */
export function laneOffset(link: Link, workflowId: string): number {
  const i = link.workflowIds.indexOf(workflowId);
  return (i - (link.workflowIds.length - 1) / 2) * LANE_GAP;
}

/**
 * The line a workflow runs along, from its first station to its last (or to
 * station `upTo`), in its own lane when `lanes` is on.
 */
export function workflowLine(
  wf: EcosystemWorkflow,
  links: Map<string, Link>,
  stations: Map<string, EcosystemStation>,
  routes: Record<string, { col: number; row: number }[]>,
  lanes: boolean,
  upTo = wf.stations.length - 1
): Point[] {
  const out: Point[] = [];
  for (let i = 1; i <= upTo; i++) {
    const from = wf.stations[i - 1];
    const to = wf.stations[i];
    const link = links.get(linkId(from, to));
    if (!link) continue;
    let pts = offsetLine(linkPoints(link, stations, routes), lanes ? laneOffset(link, wf.id) : 0);
    if (from !== link.a) pts = [...pts].reverse();
    out.push(...pts);
  }
  return out;
}

/** The area the map covers, with room for labels. */
export function mapBounds(stations: EcosystemStation[], routes: Record<string, { col: number; row: number }[]>) {
  const pts = [...stations.map(stationPoint), ...Object.values(routes).flat().map(stationPoint)];
  const pad = CELL * 0.75;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  return { x: minX, y: minY, w: Math.max(...xs) + pad - minX, h: Math.max(...ys) + pad - minY };
}

/** The box around every station reached over X-Road, drawn as a zone. */
export function xroadZone(stations: EcosystemStation[]) {
  const pts = stations.filter((s) => s.xroad).map(stationPoint);
  if (pts.length === 0) return null;
  const pad = CELL * 0.5;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return {
    x: Math.min(...xs) - pad,
    y: Math.min(...ys) - pad,
    w: Math.max(...xs) - Math.min(...xs) + pad * 2,
    h: Math.max(...ys) - Math.min(...ys) + pad * 2,
  };
}
