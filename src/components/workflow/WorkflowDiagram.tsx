import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { formatLocalDateTime } from "../../utils/format";
import { adaptorIconUrl, adaptorShortName } from "../../utils/adaptors";
import type { WorkflowGraph } from "../../types/workflow-graph";
import DiagramControls from "./DiagramControls";
import DiagramEdge from "./DiagramEdge";
import DiagramMiniMap from "./DiagramMiniMap";
import DiagramNode from "./DiagramNode";
import { clampZoom, fitViewport, graphBounds, type NodeRunState, type Viewport } from "./diagramGeometry";

export type Selection = { kind: "job" | "trigger" | "edge"; id: string } | null;

/** What the canvas shows while a run is selected. */
export interface RunOverlay {
  /** Exit state per job id. */
  steps: Record<string, { state: NodeRunState; duration?: string }>;
  /** The node the run started from (a trigger or a job). */
  startNodeId: string | null;
  startedBy: string;
  /** ISO timestamp, shown on the start node. */
  startedAt?: string;
}

interface Props {
  graph: WorkflowGraph;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  /** The "+" under a job: add a new step after it. */
  onAddPath?: (jobId: string) => void;
  run?: RunOverlay | null;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  /** Overlays drawn on the canvas, e.g. the history card. */
  children?: ReactNode;
  /** A read-only preview (template browser): no controls or minimap. */
  preview?: boolean;
}

/**
 * The workflow canvas (collaborative-editor/components/diagram/
 * WorkflowDiagram.tsx), hand-rolled instead of @xyflow/react: dotted
 * background, pan by dragging, zoom with the wheel or the controls, fit view
 * on load (padding 0.3, max zoom 1), nodes, paths with condition badges, the
 * control stack bottom-left and the minimap bottom-right.
 */
export default function WorkflowDiagram({
  graph,
  selection,
  onSelect,
  onAddPath,
  run = null,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  children,
  preview = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [manualLayout, setManualLayout] = useState(false);
  const fitted = useRef(false);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);

  const fit = useCallback(
    (width = size.width, height = size.height) => {
      const bounds = graphBounds(graph);
      if (!bounds || width === 0) return false;
      setViewport(fitViewport(bounds, width, height));
      return true;
    },
    [graph, size.width, size.height]
  );

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
      if (!fitted.current && width > 0) {
        const bounds = graphBounds(graph);
        if (bounds) {
          setViewport(fitViewport(bounds, width, height));
          fitted.current = true;
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [graph]);

  // Re-fit when a different workflow arrives or nodes are added / removed
  // (Lightning re-runs its layout and fits the view then).
  const nodeCount = Object.keys(graph.positions).length;
  useEffect(() => {
    fitted.current = fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph.id, nodeCount]);

  const zoomBy = (factor: number, cx = size.width / 2, cy = size.height / 2) => {
    setViewport((v) => {
      const zoom = clampZoom(v.zoom * factor);
      const k = zoom / v.zoom;
      return { zoom, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k };
    });
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const factor = Math.pow(2, -e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.002));
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      setViewport((v) => {
        const zoom = clampZoom(v.zoom * factor);
        const k = zoom / v.zoom;
        return { zoom, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const selectedId = selection?.id ?? null;
  const triggerIds = new Set(graph.triggers.map((t) => t.id));
  const isRun = !!run;

  const gap = 20 * viewport.zoom;
  const dot = Math.max(0.5, viewport.zoom / 2);

  return (
    <div
      ref={ref}
      className="relative h-full w-full overflow-hidden bg-gray-100 select-none touch-none"
      style={{
        backgroundImage: `radial-gradient(circle, #91919a ${dot}px, transparent ${dot}px)`,
        backgroundSize: `${gap}px ${gap}px`,
        backgroundPosition: `${viewport.x % gap}px ${viewport.y % gap}px`,
        cursor: drag.current?.moved ? "grabbing" : "grab",
      }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        drag.current = { x: e.clientX, y: e.clientY, vx: viewport.x, vy: viewport.y, moved: false };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
        if (d.moved) setViewport((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy }));
      }}
      onPointerUp={() => {
        if (drag.current && !drag.current.moved) onSelect(null);
        drag.current = null;
      }}
      data-testid="workflow-diagram"
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` }}
      >
        {graph.edges.map((edge) => {
          const sourceId = edge.sourceTriggerId ?? edge.sourceJobId!;
          const source = graph.positions[sourceId];
          const target = graph.positions[edge.targetJobId];
          if (!source || !target) return null;
          const fromTrigger = triggerIds.has(sourceId);
          const trigger = fromTrigger ? graph.triggers.find((t) => t.id === sourceId) : undefined;
          const didRun =
            !!run && (!!run.steps[sourceId] || sourceId === run.startNodeId) && !!run.steps[edge.targetJobId];
          return (
            <DiagramEdge
              key={edge.id}
              id={edge.id}
              source={source}
              target={target}
              conditionType={edge.conditionType}
              conditionLabel={edge.conditionLabel}
              enabled={trigger ? trigger.enabled : edge.enabled}
              selected={selectedId === edge.id}
              neighbour={selectedId !== null && (sourceId === selectedId || edge.targetJobId === selectedId)}
              didntRun={isRun && !didRun}
              onClick={() => onSelect({ kind: "edge", id: edge.id })}
            />
          );
        })}
        {graph.triggers.map((t) => {
          const p = graph.positions[t.id];
          if (!p) return null;
          const started = run?.startNodeId === t.id;
          return (
            <div key={t.id} className="absolute" style={{ left: p.x, top: p.y, zIndex: selectedId === t.id ? 5 : 4 }}>
              <DiagramNode
                id={t.id}
                shape="circle"
                label={t.type === "cron" ? "Cron trigger" : "Webhook trigger"}
                sublabel={t.type === "cron" ? (t.cronDescription ?? "Not configured") : "On each request received"}
                icon={<span className={cn("block h-full w-full", t.type === "cron" ? "hero-clock" : "hero-globe-alt")} />}
                secondaryIcon={t.hasAuthMethod ? <span className="hero-lock-closed block h-full w-full" /> : undefined}
                selected={selectedId === t.id}
                disabled={!t.enabled}
                didRun={!isRun || started}
                startedBy={started ? run?.startedBy : undefined}
                runMeta={started && run?.startedAt ? formatLocalDateTime(run.startedAt) : undefined}
                onClick={() => onSelect({ kind: "trigger", id: t.id })}
              />
            </div>
          );
        })}
        {graph.jobs.map((j) => {
          const p = graph.positions[j.id];
          if (!p) return null;
          const step = run?.steps[j.id];
          const started = run?.startNodeId === j.id;
          return (
            <div key={j.id} className="absolute" style={{ left: p.x, top: p.y, zIndex: selectedId === j.id ? 5 : 4 }}>
              <DiagramNode
                id={j.id}
                shape="rect"
                label={j.name}
                sublabel={adaptorShortName(j.adaptor)}
                icon={<JobIcon adaptor={j.adaptor} />}
                selected={selectedId === j.id}
                runState={step?.state ?? null}
                runMeta={step?.duration}
                didRun={!isRun || !!step}
                startedBy={started ? run?.startedBy : undefined}
                onAddPath={onAddPath && !isRun ? () => onAddPath(j.id) : undefined}
                onClick={() => onSelect({ kind: "job", id: j.id })}
              />
            </div>
          );
        })}
      </div>

      {nodeCount > 0 && !preview && (
        <>
          <DiagramControls
            onZoomIn={() => zoomBy(1.2)}
            onZoomOut={() => zoomBy(1 / 1.2)}
            onFitView={() => fit()}
            isManualLayout={manualLayout}
            onToggleLayout={() => setManualLayout((m) => !m)}
            onAutoLayout={() => fit()}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={() => onUndo?.()}
            onRedo={() => onRedo?.()}
          />
          <DiagramMiniMap
            graph={graph}
            viewport={viewport}
            canvasSize={size}
            onCenter={(x, y) => setViewport((v) => ({ ...v, x: size.width / 2 - x * v.zoom, y: size.height / 2 - y * v.zoom }))}
          />
        </>
      )}
      {children}
    </div>
  );
}

/** The adaptor icon inside a job node, or its short name when there's no icon (nodes/Job.tsx). */
function JobIcon({ adaptor }: { adaptor: string }) {
  const url = adaptorIconUrl(adaptor);
  const short = adaptorShortName(adaptor);
  return url ? (
    <img src={url} alt={short} className="w-full h-full" draggable={false} />
  ) : (
    <div className="font-bold overflow-hidden text-ellipsis whitespace-nowrap">{short}</div>
  );
}
