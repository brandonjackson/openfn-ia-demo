import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { RunDetails, Workflow, WorkflowNode } from "../../mock-data/workflow";
import type { RunActivity } from "../../mock-data/runs";
import WorkflowNodeCard, { NODE_HEIGHT, NODE_WIDTH } from "./WorkflowNodeCard";
import type { NodeAction } from "./WorkflowNodeCard";
import EdgeBadge from "./EdgeBadge";
import CanvasControls from "./CanvasControls";

const HALF_H = NODE_HEIGHT / 2;
const HALF_W = NODE_WIDTH / 2;
/** Room a card's menu needs to its right before it opens below instead. */
const MENU_ROOM = 210;
/** Space above the graph so the top card isn't pressed against the toolbar or the runs bar. */
const TOP_MARGIN = 56;
/** The busiest connector's width under the history overlay; the rest scale down from it. */
const MAX_EDGE_WIDTH = 12;
/** The header's height (e.g. the runs bar) and its gap above the top card. */
const HEADER_HEIGHT = 40;
const HEADER_GAP = 16;
/** The least room the header keeps from the top of the canvas when it starts. */
const HEADER_TOP = 12;

/**
 * The diagram surface: an absolutely-positioned set of node cards with SVG
 * bezier connectors drawn between them (bottom edge to top edge), plus the
 * edge condition badges and zoom controls. Node coordinates are the cards'
 * centres.
 *
 * With a `run`, the canvas shows how that run went, live while it's going:
 * each step it reached shows its status and duration on its card, the
 * connectors it travelled are drawn darker, the connector into the step
 * that's running carries moving dots, and the rest of the workflow fades
 * back.
 *
 * With `activity` and no run, the run history is laid over the workflow
 * instead: each card shows how many runs reached it and how many failed
 * there (a way into the failures view), and each connector that runs went
 * along is light violet with slow-moving dots, its width in proportion to the
 * busiest one and its count beside the badge. The editor's runs bar, passed
 * as the `header`, picks the period and sums it up; it sits just above the
 * top card and moves with the workflow when the canvas pans.
 *
 * The canvas pans: scroll (mouse wheel or trackpad) or drag any empty part of
 * it to move around, and the controls' Center button puts it back. Node
 * coordinates come from the workflow data; there is no zoom or node drag yet.
 *
 * With `onAddAfter`, each card shows a + on its bottom edge while hovered,
 * to add a step after it.
 */
export default function WorkflowCanvas({
  workflow,
  selectedId,
  onSelect,
  onNodeAction,
  readOnly = false,
  run,
  activity,
  onShowFailures,
  width = 980,
  height = 720,
  showControls = true,
  header,
  onAddAfter,
}: {
  workflow: Workflow;
  selectedId?: string;
  onSelect?: (node: WorkflowNode) => void;
  /** An item picked from a card's ⋮ menu; without it cards have no menu. */
  onNodeAction?: (node: WorkflowNode, action: NodeAction) => void;
  /** On main steps can't be deleted. */
  readOnly?: boolean;
  /** A run to show on the canvas. */
  run?: RunDetails;
  /** The run history to lay over the workflow while no run is shown. */
  activity?: RunActivity;
  /** Opens the failures at a node, from its failed count. */
  onShowFailures?: (nodeId: string) => void;
  width?: number;
  height?: number;
  showControls?: boolean;
  /** Pinned just above the top card, centred on it, and panned with the workflow, e.g. the runs bar. */
  header?: ReactNode;
  /** Adds a step after a node, from the + that shows on a hovered card. */
  onAddAfter?: (nodeId: string) => void;
}) {
  const nodeById = (id: string) => workflow.nodes.find((n) => n.id === id);

  // The header sits over the top card; the graph starts low enough to fit it.
  const topNode = workflow.nodes.reduce<WorkflowNode | undefined>((top, n) => (!top || n.y < top.y ? n : top), undefined);
  const headerTop = (topNode ? topNode.y - HALF_H : 0) - HEADER_GAP - HEADER_HEIGHT;
  const marginTop = header ? Math.max(TOP_MARGIN, HEADER_TOP - headerTop) : TOP_MARGIN;

  // Panning: how far the graph has been moved from where it starts.
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragFrom = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // Wheel and trackpad scrolling pan the canvas instead of the page. Bound
  // natively because React's wheel listener is passive and can't prevent it.
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom and ctrl+scroll stay with the browser
      if ((e.target as Element).closest("[data-canvas-header]")) return; // the header's lists scroll themselves
      e.preventDefault();
      // Shift+wheel scrolls sideways on a plain mouse.
      const dx = e.shiftKey && e.deltaX === 0 ? e.deltaY : e.deltaX;
      const dy = e.shiftKey && e.deltaX === 0 ? 0 : e.deltaY;
      setPan((p) => ({ x: p.x - dx, y: p.y - dy }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Dragging an empty part of the canvas pans it; cards, badges and the controls keep their own clicks.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as Element).closest("[data-canvas-item]")) return;
    dragFrom.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const from = dragFrom.current;
    if (!from) return;
    setPan({ x: from.panX + e.clientX - from.x, y: from.panY + e.clientY - from.y });
  };
  const endDrag = () => {
    dragFrom.current = null;
    setDragging(false);
  };

  // Which nodes the run reached: every step's job, plus the trigger when the
  // run started from it rather than being retried from a later step.
  const stepFor = (id: string) => run?.steps.find((s) => s.jobId === id);
  const trigger = workflow.nodes.find((n) => n.type === "trigger");
  const startedAtTrigger =
    run !== undefined &&
    trigger !== undefined &&
    workflow.edges.some((e) => e.source === trigger.id && e.target === run.steps[0]?.jobId);
  const reached = (id: string) => (id === trigger?.id ? startedAtTrigger : Boolean(stepFor(id)));
  const travelled = (source: string, target: string) => reached(source) && reached(target);
  // The edge the run is on right now: into the running step, out of a finished one.
  const runningInto = run?.steps.find((s) => s.status === "running")?.jobId;
  const flowing = (source: string, target: string) =>
    target === runningInto && (source === trigger?.id ? startedAtTrigger : stepFor(source)?.status === "success");

  // The history overlay only applies while no run is loaded.
  const overlay = run ? undefined : activity;
  const volume = (edgeId: string) => overlay?.edges[edgeId] ?? 0;
  const share = (edgeId: string) => (overlay && overlay.busiest > 0 ? volume(edgeId) / overlay.busiest : 0);

  const edgePath = (edge: Workflow["edges"][number]) => {
    const s = nodeById(edge.source);
    const t = nodeById(edge.target);
    if (!s || !t) return undefined;
    const x1 = s.x;
    const y1 = s.y + HALF_H;
    const x2 = t.x;
    const y2 = t.y - HALF_H;
    const midY = (y1 + y2) / 2;
    // Vertical cubic bezier — control points pulled toward the midline
    return { d: `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`, cx: (x1 + x2) / 2, cy: midY };
  };

  return (
    <div
      ref={surfaceRef}
      className={`relative touch-none select-none overflow-hidden bg-gray-50 bg-[radial-gradient(theme(colors.gray.200)_1px,transparent_1px)] [background-size:22px_22px] ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{ width: "100%", height: "100%", minHeight: height, backgroundPosition: `${pan.x}px ${pan.y}px` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className="relative mx-auto"
        style={{ width, height, marginTop, transform: `translate(${pan.x}px, ${pan.y}px)` }}
      >
        {/* Edge layer */}
        <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
          {workflow.edges.map((edge) => {
            const geometry = edgePath(edge);
            if (!geometry) return null;
            const { d } = geometry;
            if (run) {
              const ran = travelled(edge.source, edge.target);
              const live = flowing(edge.source, edge.target);
              return (
                <g key={edge.id}>
                  <path d={d} fill="none" className={ran ? "stroke-slate-500" : "stroke-slate-200"} strokeWidth={ran ? 2.5 : 2} />
                  {live && (
                    <path
                      d={d}
                      fill="none"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeDasharray="4 11"
                      className="stroke-violet-500 animate-[edge-flow_0.8s_linear_infinite] motion-reduce:animate-none"
                    />
                  )}
                </g>
              );
            }
            if (overlay) {
              const n = volume(edge.id);
              const strokeWidth = n === 0 ? 1.5 : Math.max(1.5, share(edge.id) * MAX_EDGE_WIDTH);
              return (
                <g key={edge.id}>
                  <path
                    d={d}
                    fill="none"
                    className={n === 0 ? "stroke-slate-200" : "stroke-violet-200"}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                  >
                    <title>{`${n} ${n === 1 ? "run" : "runs"}`}</title>
                  </path>
                  {n > 0 && (
                    <path
                      d={d}
                      fill="none"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeDasharray="1 14"
                      className="stroke-violet-400 animate-[edge-flow_3.2s_linear_infinite] motion-reduce:animate-none"
                    />
                  )}
                </g>
              );
            }
            return <path key={edge.id} d={d} fill="none" className="stroke-slate-300" strokeWidth={2} />;
          })}
        </svg>

        {/* Edge badges (positioned at connector midpoints), with the run count beside them under the overlay */}
        {workflow.edges.map((edge) => {
          const geometry = edgePath(edge);
          if (!geometry) return null;
          const { cx, cy } = geometry;
          const n = volume(edge.id);
          return (
            <div
              key={edge.id}
              data-canvas-item
              className={`absolute z-10 cursor-default flex items-center gap-1 ${run && !travelled(edge.source, edge.target) ? "opacity-40" : ""}`}
              style={{ left: cx - 14, top: cy - 14 }}
            >
              <EdgeBadge condition={edge.condition} />
              {overlay && n > 0 && (
                <span
                  className={`rounded-full border bg-white px-1.5 text-[10px] font-medium leading-4 shadow-sm ${
                    edge.condition === "on_failure" ? "border-red-200 text-red-600" : "border-gray-200 text-gray-500"
                  }`}
                  title={`${n} ${n === 1 ? "run" : "runs"} went this way`}
                >
                  {n}
                </span>
              )}
            </div>
          );
        })}

        {/* Nodes. A card comes forward while hovered or holding focus so its open menu clears the other cards and the inspector. */}
        {workflow.nodes.map((node) => (
          <div key={node.id} data-canvas-item className="absolute z-20 cursor-default hover:z-40 focus-within:z-40" style={{ left: node.x - HALF_W, top: node.y - HALF_H }}>
            <WorkflowNodeCard
              node={node}
              selected={node.id === selectedId}
              onClick={onSelect}
              onAction={onNodeAction}
              readOnly={readOnly}
              menuPlacement={node.x + HALF_W + MENU_ROOM <= width ? "beside" : "below"}
              step={stepFor(node.id)}
              dimmed={run !== undefined && !reached(node.id)}
              activity={overlay?.nodes[node.id]}
              onShowFailures={onShowFailures && overlay?.nodes[node.id]?.failed ? () => onShowFailures(node.id) : undefined}
              note={node.type === "trigger" && startedAtTrigger ? `Started by ${run!.startedBy}` : undefined}
              onAddAfter={onAddAfter ? (n) => onAddAfter(n.id) : undefined}
            />
          </div>
        ))}

        {header && (
          <div
            data-canvas-item
            data-canvas-header
            className="absolute z-50 flex -translate-x-1/2 cursor-default justify-center"
            style={{ left: topNode?.x ?? width / 2, top: headerTop }}
          >
            {header}
          </div>
        )}
      </div>

      {showControls && (
        <div data-canvas-item className="absolute bottom-4 left-4 z-30 cursor-default">
          <CanvasControls onCenter={() => setPan({ x: 0, y: 0 })} />
        </div>
      )}
    </div>
  );
}
