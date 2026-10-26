import type { RunDetails, Workflow, WorkflowNode } from "../../mock-data/workflow";
import type { RunActivity } from "../../mock-data/runs";
import WorkflowNodeCard, { NODE_HEIGHT, NODE_WIDTH } from "./WorkflowNodeCard";
import type { NodeAction } from "./WorkflowNodeCard";
import EdgeBadge from "./EdgeBadge";
import CanvasControls from "./CanvasControls";
import Minimap from "./Minimap";
import ActivitySummaryChip from "./ActivitySummaryChip";

const HALF_H = NODE_HEIGHT / 2;
const HALF_W = NODE_WIDTH / 2;
/** Room a card's menu needs to its right before it opens below instead. */
const MENU_ROOM = 210;
/** Space above the graph so the top card isn't pressed against the toolbar or the activity chip. */
const TOP_MARGIN = 56;
/** The busiest connector's width under the history overlay; the rest scale down from it. */
const MAX_EDGE_WIDTH = 12;

/**
 * The diagram surface: an absolutely-positioned set of node cards with SVG
 * bezier connectors drawn between them (bottom edge to top edge), plus the
 * edge condition badges, zoom controls and minimap overlays. Node
 * coordinates are the cards' centres.
 *
 * With a `run`, the canvas shows how that run went, live while it's going:
 * each step it reached shows its status and duration on its card, the
 * connectors it travelled are drawn darker, the connector into the step
 * that's running carries moving dots, and the rest of the workflow fades
 * back.
 *
 * With `activity` and no run, the run history is laid over the workflow
 * instead: each card shows how many runs reached it and how many failed
 * there (a way into the last failure), and each connector's width is in
 * proportion to the busiest one and flows faster the more runs went along it, with its count beside the
 * badge. A chip at the top-left sums it up and opens the run history.
 *
 * This is a static prototype layout — node coordinates come from the workflow
 * data, there is no real pan/zoom or drag yet.
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
  onViewRuns,
  width = 980,
  height = 720,
  showMinimap = true,
  showControls = true,
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
  /** Opens the runs that failed at a node, from its failed count. */
  onShowFailures?: (nodeId: string) => void;
  /** Opens the run history, from the activity chip. */
  onViewRuns?: () => void;
  width?: number;
  height?: number;
  showMinimap?: boolean;
  showControls?: boolean;
}) {
  const nodeById = (id: string) => workflow.nodes.find((n) => n.id === id);

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
      className="relative overflow-hidden bg-gray-50 bg-[radial-gradient(theme(colors.gray.200)_1px,transparent_1px)] [background-size:22px_22px]"
      style={{ width: "100%", height }}
    >
      <div className="relative mx-auto" style={{ width, height, marginTop: TOP_MARGIN }}>
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
                  <path d={d} fill="none" stroke={ran ? "#64748b" : "#e2e8f0"} strokeWidth={ran ? 2.5 : 2} />
                  {live && (
                    <path
                      d={d}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeDasharray="4 11"
                      className="animate-[edge-flow_0.8s_linear_infinite] motion-reduce:animate-none"
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
                    stroke={n === 0 ? "#e2e8f0" : "#cbd5e1"}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                  >
                    <title>{`${n} ${n === 1 ? "run" : "runs"}`}</title>
                  </path>
                  {n > 0 && (
                    <path
                      d={d}
                      fill="none"
                      stroke="#1d4ed8"
                      strokeOpacity={0.9}
                      strokeWidth={Math.max(3, strokeWidth * 0.5)}
                      strokeLinecap="round"
                      strokeDasharray="1 14"
                      className="motion-reduce:animate-none"
                      style={{ animation: `edge-flow ${(3.2 - share(edge.id) * 2.2).toFixed(1)}s linear infinite` }}
                    />
                  )}
                </g>
              );
            }
            return <path key={edge.id} d={d} fill="none" stroke="#cbd5e1" strokeWidth={2} />;
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
              className={`absolute z-10 flex items-center gap-1 ${run && !travelled(edge.source, edge.target) ? "opacity-40" : ""}`}
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
          <div key={node.id} className="absolute z-20 hover:z-40 focus-within:z-40" style={{ left: node.x - HALF_W, top: node.y - HALF_H }}>
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
            />
          </div>
        ))}
      </div>

      {overlay && (
        <div className="absolute left-4 top-3 z-30">
          <ActivitySummaryChip activity={overlay} onViewRuns={onViewRuns} />
        </div>
      )}
      {showControls && (
        <div className="absolute bottom-4 left-4 z-30">
          <CanvasControls />
        </div>
      )}
      {showMinimap && (
        <div className="absolute bottom-4 right-4 z-30">
          <Minimap workflow={workflow} />
        </div>
      )}
    </div>
  );
}
