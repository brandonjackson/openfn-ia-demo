import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import type { EcosystemStation, EcosystemWorkflow } from "../../fixtures/ecosystem";
import type { EcosystemSelection, LineMode, Link, Point } from "../../model/ecosystem-map";
import {
  buildLinks,
  healthOf,
  healthStyles,
  lineColors,
  lineLength,
  linkId,
  linkPoints,
  linkTraffic,
  mapBounds,
  offsetLine,
  laneOffset,
  roundedPath,
  stationPoint,
  workflowLine,
  workflowTraffic,
  xroadZone,
} from "../../model/ecosystem-map";
import AdaptorLogo from "../domain/AdaptorLogo";
import IconButton from "../primitives/IconButton";
import Surface from "../primitives/Surface";

interface Props {
  stations: EcosystemStation[];
  workflows: EcosystemWorkflow[];
  /** Corners for links that can't be straight, keyed by link id. */
  routes?: Record<string, { col: number; row: number }[]>;
  /** One merged line per pair of systems, coloured by health, or one line per workflow in its own colour. */
  mode?: LineMode;
  /** How far back the numbers look, in hours. Sets line weights and colours. */
  hours?: number;
  selection?: EcosystemSelection;
  onSelect?: (selection: EcosystemSelection) => void;
  /** Height of the map, as a class. */
  heightClass?: string;
}

const TILE = 40;
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 4;
/** On-screen size of a station's name, in pixels, at any zoom. */
const LABEL_PX = 12;

/**
 * The organisation's systems and workflows as a transport map. Systems are
 * stations, shown by their adaptor logos; workflows run between them along
 * right-angled lines, with their runs moving along them. Systems reached over
 * X-Road sit in their own zone, so every line crossing into it goes through
 * the Security Server. Drag to pan; pinch or Ctrl/⌘ + scroll to zoom.
 */
export default function EcosystemMap({
  stations,
  workflows,
  routes = {},
  mode = "connections",
  hours = 24 * 7,
  selection = null,
  onSelect,
  heightClass = "h-[420px] sm:h-[520px]",
}: Props) {
  const byId = useMemo(() => new Map(stations.map((s) => [s.id, s])), [stations]);
  const links = useMemo(() => buildLinks(workflows), [workflows]);
  const linkMap = useMemo(() => new Map(links.map((l) => [l.id, l])), [links]);
  const bounds = useMemo(() => mapBounds(stations, routes), [stations, routes]);
  const zone = useMemo(() => xroadZone(stations), [stations]);

  /* ---------------------------------------------------------- View --- */

  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [centre, setCentre] = useState<Point>({ x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 });
  const framed = useRef(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitScale = size.w && size.h ? Math.min(size.w / bounds.w, size.h / bounds.h) : 1;
  const scale = fitScale * zoom;
  const view = { w: size.w ? size.w / scale : bounds.w, h: size.h ? size.h / scale : bounds.h };

  // On a narrow screen the whole map is too small to read: open closer in, on the middle.
  useEffect(() => {
    if (framed.current || !size.w) return;
    framed.current = true;
    if (fitScale < 0.55) setZoom(Math.min(MAX_ZOOM, 0.55 / fitScale));
  }, [size.w, fitScale]);

  const clampCentre = (p: Point): Point => ({
    x: Math.min(bounds.x + bounds.w, Math.max(bounds.x, p.x)),
    y: Math.min(bounds.y + bounds.h, Math.max(bounds.y, p.y)),
  });

  const zoomBy = (factor: number, at?: Point) => {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor));
    if (at) {
      const k = zoom / next;
      setCentre((c) => clampCentre({ x: at.x + (c.x - at.x) * k, y: at.y + (c.y - at.y) * k }));
    }
    setZoom(next);
  };

  const fit = () => {
    setZoom(1);
    setCentre({ x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 });
  };

  // Pinch, or Ctrl/⌘ + scroll, zooms at the pointer. Plain scrolling is left to the page.
  const zoomRef = useRef(zoomBy);
  zoomRef.current = zoomBy;
  const toMap = useRef<(clientX: number, clientY: number) => Point>(() => ({ x: 0, y: 0 }));
  toMap.current = (clientX, clientY) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return centre;
    return { x: centre.x + (clientX - r.left - r.width / 2) / scale, y: centre.y + (clientY - r.top - r.height / 2) / scale };
  };
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomRef.current(Math.exp(-e.deltaY / 200), toMap.current(e.clientX, e.clientY));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const drag = useRef<{ x: number; y: number; centre: Point; moved: boolean } | null>(null);
  const onPointerDown = (e: ReactPointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, centre, moved: false };
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    if (!d.moved) (e.currentTarget as Element).setPointerCapture(e.pointerId);
    d.moved = true;
    setCentre(clampCentre({ x: d.centre.x - dx / scale, y: d.centre.y - dy / scale }));
  };
  const onPointerUp = () => {
    // A drag isn't a click: keep it from selecting or clearing.
    const d = drag.current;
    drag.current = null;
    if (d?.moved) suppressClick.current = true;
  };
  const suppressClick = useRef(false);
  const choose = (sel: EcosystemSelection) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    onSelect?.(sel);
  };

  /* ---------------------------------------------------- Emphasis --- */

  const selectedWorkflow = selection?.type === "workflow" ? workflows.find((w) => w.id === selection.id) : undefined;
  const linkOn = (link: Link) => {
    if (!selection) return true;
    if (selection.type === "link") return selection.id === link.id;
    if (selection.type === "station") return link.a === selection.id || link.b === selection.id;
    return link.workflowIds.includes(selection.id);
  };
  const workflowOn = (wf: EcosystemWorkflow) => {
    if (!selection) return true;
    if (selection.type === "workflow") return selection.id === wf.id;
    if (selection.type === "station") return wf.stations.includes(selection.id);
    return linkMap.get(selection.id)?.workflowIds.includes(wf.id) ?? false;
  };
  const stationOn = (s: EcosystemStation) => {
    if (!selection) return true;
    if (selection.type === "station") return selection.id === s.id || links.some((l) => linkOn(l) && (l.a === s.id || l.b === s.id));
    if (selection.type === "workflow") return selectedWorkflow?.stations.includes(s.id) ?? false;
    const link = linkMap.get(selection.id);
    return link?.a === s.id || link?.b === s.id;
  };

  // A station rings red when a workflow is failing at it.
  const failingAt = new Set(
    workflows
      .filter((w) => w.failsAt !== undefined && healthOf(workflowTraffic(w, hours)) === "failing")
      .map((w) => w.stations[w.failsAt!])
  );

  /* ------------------------------------------------------- Lines --- */

  const lanes = mode === "workflows";
  const lines = lanes
    ? workflows.flatMap((wf) =>
        wf.stations.slice(1).map((to, i) => {
          const link = linkMap.get(linkId(wf.stations[i], to))!;
          const pts = offsetLine(linkPoints(link, byId, routes), laneOffset(link, wf.id));
          const health = healthOf(workflowTraffic(wf, hours));
          return {
            key: `${wf.id}-${i}`,
            d: roundedPath(pts),
            width: 4,
            stroke: wf.state === "draft" ? "stroke-gray-300" : lineColors[wf.color].stroke,
            dashed: wf.state === "draft" || health === "failing",
            on: workflowOn(wf),
            title: `${wf.name}${wf.state === "draft" ? " (draft)" : ""}`,
            select: { type: "workflow" as const, id: wf.id },
          };
        })
      )
    : links.map((link) => {
        const t = linkTraffic(link, workflows, hours);
        const style = healthStyles[healthOf(t)];
        const perDay = (t.runs / hours) * 24;
        return {
          key: link.id,
          d: roundedPath(linkPoints(link, byId, routes)),
          width: 3 + Math.min(7, Math.sqrt(perDay) / 2.5),
          stroke: style.stroke,
          dashed: !!style.dashed,
          on: linkOn(link),
          title: `${byId.get(link.a)?.name} – ${byId.get(link.b)?.name}: ${link.workflowIds.length} workflow${link.workflowIds.length === 1 ? "" : "s"}`,
          select: { type: "link" as const, id: link.id },
        };
      });

  /* -------------------------------------------------------- Runs --- */

  const runs = workflows
    .filter((wf) => wf.state === "live" && wf.runsPerDay >= 5 && workflowOn(wf))
    .flatMap((wf) => {
      const pts = workflowLine(wf, linkMap, byId, routes, lanes);
      const d = roundedPath(pts);
      const dur = Math.max(2.5, lineLength(pts) / 80);
      const count = Math.min(4, Math.max(1, Math.ceil(wf.runsPerDay / 60)));
      const fill = lanes ? lineColors[wf.color].fill : "fill-gray-700";
      const dots = Array.from({ length: count }, (_, i) => ({
        key: `${wf.id}-run-${i}`,
        d,
        dur,
        begin: -(i * dur) / count,
        fill,
        failed: false,
      }));
      // Workflows with failures send a red run that stops where they fail.
      if (wf.failsAt !== undefined && wf.successRate < 0.97) {
        const failPts = workflowLine(wf, linkMap, byId, routes, lanes, wf.failsAt);
        dots.push({
          key: `${wf.id}-run-failed`,
          d: roundedPath(failPts),
          dur: Math.max(2, lineLength(failPts) / 80),
          begin: -dur / (count * 2),
          fill: "fill-red-500",
          failed: true,
        });
      }
      return dots;
    });

  /* ----------------------------------------------------- Drawing --- */

  const font = LABEL_PX / scale;
  const showOwners = scale > 0.75;

  return (
    <div ref={wrapRef} className={`relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 ${heightClass}`}>
      <svg
        ref={svgRef}
        className="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
        viewBox={`${centre.x - view.w / 2} ${centre.y - view.h / 2} ${view.w} ${view.h}`}
        role="group"
        aria-label={`${stations.length} systems and ${workflows.length} workflows`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => choose(null)}
      >
        {zone && (
          <g>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.w}
              height={zone.h}
              rx={24}
              className="fill-indigo-50 stroke-indigo-200"
              strokeWidth={1.5}
              strokeDasharray="6 5"
              vectorEffect="non-scaling-stroke"
            />
            <text x={zone.x + 6} y={zone.y - font * 0.6} fontSize={font} className="fill-indigo-600 font-semibold">
              X-Road
              <tspan dx={font * 0.5} fontSize={font * 0.85} className="fill-indigo-400 font-normal">
                through your Security Server
              </tspan>
            </text>
          </g>
        )}

        {/* Casing under every line, so lines read cleanly where they cross. */}
        <g>
          {lines.map((l) => (
            <path key={`case-${l.key}`} d={l.d} fill="none" strokeWidth={l.width + 4} strokeLinecap="round" className="stroke-gray-50" />
          ))}
        </g>
        <g>
          {lines.map((l) => (
            <g
              key={l.key}
              className={`cursor-pointer transition-opacity ${l.on ? "" : "opacity-15"}`}
              onClick={(e) => {
                e.stopPropagation();
                choose(l.select);
              }}
            >
              <title>{l.title}</title>
              <path
                d={l.d}
                fill="none"
                strokeWidth={l.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={l.dashed ? "8 7" : undefined}
                className={l.stroke}
              />
              <path d={l.d} fill="none" strokeWidth={18} className="stroke-transparent" />
            </g>
          ))}
        </g>

        <g className="pointer-events-none motion-reduce:hidden">
          {runs.map((r) => (
            <circle key={r.key} r={r.failed ? 4.5 : 3.5} className={`${r.fill} stroke-white`} strokeWidth={1.5}>
              <animateMotion dur={`${r.dur}s`} begin={`${r.begin}s`} repeatCount="indefinite" path={r.d} />
              {r.failed && (
                <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.85;1" dur={`${r.dur}s`} begin={`${r.begin}s`} repeatCount="indefinite" />
              )}
            </circle>
          ))}
        </g>

        {stations.map((s) => {
          const p = stationPoint(s);
          const on = stationOn(s);
          const selected = selection?.type === "station" && selection.id === s.id;
          const failing = failingAt.has(s.id);
          const sub = s.kind === "client" ? "Calls you over X-Road" : s.xroad?.member;
          return (
            <g
              key={s.id}
              transform={`translate(${p.x} ${p.y})`}
              className={`cursor-pointer transition-opacity ${on ? "" : "opacity-35"}`}
              role="button"
              tabIndex={0}
              aria-label={s.name}
              onClick={(e) => {
                e.stopPropagation();
                choose({ type: "station", id: s.id });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect?.({ type: "station", id: s.id });
                }
              }}
            >
              <title>{s.name}</title>
              <rect
                x={-TILE / 2 - 5}
                y={-TILE / 2 - 5}
                width={TILE + 10}
                height={TILE + 10}
                rx={13}
                strokeWidth={selected || failing ? 2.5 : 1.5}
                strokeDasharray={s.kind === "client" ? "4 3" : undefined}
                className={`fill-white ${selected ? "stroke-indigo-500" : failing ? "stroke-red-400" : "stroke-gray-300"}`}
              />
              <foreignObject x={-TILE / 2} y={-TILE / 2} width={TILE} height={TILE} className="pointer-events-none">
                <AdaptorLogo adaptor={s.adaptor} name={s.name} size="md" />
              </foreignObject>
              <text
                y={TILE / 2 + 10 + font}
                textAnchor="middle"
                fontSize={font}
                className={`stroke-gray-50 font-medium ${selected ? "fill-indigo-700" : "fill-gray-800"}`}
                paintOrder="stroke"
                strokeWidth={4 / scale}
              >
                {s.name}
              </text>
              {sub && showOwners && (
                <text
                  y={TILE / 2 + 12 + font * 2.1}
                  textAnchor="middle"
                  fontSize={font * 0.85}
                  className="fill-gray-500 stroke-gray-50"
                  paintOrder="stroke"
                  strokeWidth={4 / scale}
                >
                  {sub}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <Surface variant="raised" className="absolute right-3 top-3 flex flex-col p-0.5">
        <IconButton icon={Plus} label="Zoom in" size="sm" onClick={() => zoomBy(1.3)} />
        <IconButton icon={Minus} label="Zoom out" size="sm" onClick={() => zoomBy(1 / 1.3)} />
        <IconButton icon={Maximize2} label="Fit to view" size="sm" onClick={fit} />
      </Surface>

      <Surface variant="raised" className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] px-3 py-2 text-[11px] text-gray-600">
        {mode === "connections" ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {(["healthy", "degraded", "failing", "idle"] as const).map((h) => (
              <span key={h} className="inline-flex items-center gap-1.5">
                <span className={`h-1 w-4 rounded-full ${healthStyles[h].bg}`} />
                {healthStyles[h].label}
              </span>
            ))}
            <span className="text-gray-400">Thicker lines carry more runs</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Each line is a workflow</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0 w-4 border-t-2 border-dashed border-gray-400" />
              Failing or draft
            </span>
          </div>
        )}
      </Surface>

      {selectedWorkflow && (
        <span className="sr-only" aria-live="polite">
          {selectedWorkflow.name} selected
        </span>
      )}
    </div>
  );
}
