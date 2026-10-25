import type { RunDetails, Workflow, WorkflowNode } from "../../mock-data/workflow";
import WorkflowNodeCard from "./WorkflowNodeCard";
import EdgeBadge from "./EdgeBadge";
import CanvasControls from "./CanvasControls";
import Minimap from "./Minimap";

const ICON_HALF = 28; // half the 56px icon tile

/** The canvas's dotted background, also drawn behind the editor's floating trays. */
export const CANVAS_BACKGROUND =
  "bg-gray-50 bg-[radial-gradient(theme(colors.gray.200)_1px,transparent_1px)] [background-size:22px_22px]";

/**
 * The diagram surface: an absolutely-positioned set of nodes with SVG bezier
 * connectors drawn between their icon tiles, plus the edge condition badges,
 * zoom controls and minimap overlays.
 *
 * With a `run`, the canvas shows how that run went: each job it reached shows
 * its step's status and duration, the connectors it travelled are drawn
 * darker, and the rest of the workflow fades back.
 *
 * This is a static prototype layout — node coordinates come from the workflow
 * data, there is no real pan/zoom or drag yet.
 *
 * `fill` makes the canvas take its container's height (scrolling when the
 * workflow is taller); `transparent` drops the dotted background, for when
 * the editor draws it behind floating trays instead.
 */
export default function WorkflowCanvas({
  workflow,
  selectedId,
  onSelect,
  run,
  width = 980,
  height = 720,
  showMinimap = true,
  showControls = true,
  fill = false,
  transparent = false,
}: {
  workflow: Workflow;
  selectedId?: string;
  onSelect?: (node: WorkflowNode) => void;
  /** A run to show on the canvas. */
  run?: RunDetails;
  width?: number;
  height?: number;
  showMinimap?: boolean;
  showControls?: boolean;
  fill?: boolean;
  transparent?: boolean;
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

  // Room for every node, even ones added below the default height.
  const contentHeight = Math.max(height, ...workflow.nodes.map((n) => n.y + 140));

  return (
    <div
      className={`relative overflow-hidden ${transparent ? "" : CANVAS_BACKGROUND}`}
      style={{ width: "100%", height: fill ? "100%" : height }}
    >
      <div className={fill ? "absolute inset-0 overflow-auto" : undefined}>
        <div className="relative mx-auto" style={{ width, height: contentHeight }}>
          {/* Edge layer */}
          <svg className="absolute inset-0 pointer-events-none" width={width} height={contentHeight}>
            {workflow.edges.map((edge) => {
              const s = nodeById(edge.source);
              const t = nodeById(edge.target);
              if (!s || !t) return null;
              const x1 = s.x;
              const y1 = s.y + ICON_HALF;
              const x2 = t.x;
              const y2 = t.y - ICON_HALF;
              const midY = (y1 + y2) / 2;
              // Vertical cubic bezier — control points pulled toward the midline
              const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
              const ran = run ? travelled(edge.source, edge.target) : undefined;
              return (
                <path
                  key={edge.id}
                  d={d}
                  fill="none"
                  stroke={ran ? "#64748b" : ran === false ? "#e2e8f0" : "#cbd5e1"}
                  strokeWidth={ran ? 2.5 : 2}
                />
              );
            })}
          </svg>

          {/* Edge badges (positioned at connector midpoints) */}
          {workflow.edges.map((edge) => {
            const s = nodeById(edge.source);
            const t = nodeById(edge.target);
            if (!s || !t) return null;
            const cx = (s.x + t.x) / 2;
            const cy = (s.y + ICON_HALF + (t.y - ICON_HALF)) / 2;
            return (
              <div
                key={edge.id}
                className={`absolute z-10 ${run && !travelled(edge.source, edge.target) ? "opacity-40" : ""}`}
                style={{ left: cx - 14, top: cy - 14 }}
              >
                <EdgeBadge condition={edge.condition} />
              </div>
            );
          })}

          {/* Nodes */}
          {workflow.nodes.map((node) => (
            <div key={node.id} className="absolute z-20" style={{ left: node.x - ICON_HALF, top: node.y - ICON_HALF }}>
              <WorkflowNodeCard
                node={node}
                selected={node.id === selectedId}
                onClick={onSelect}
                step={stepFor(node.id)}
                dimmed={run !== undefined && !reached(node.id)}
                note={node.type === "trigger" && startedAtTrigger ? `Started by ${run!.startedBy}` : undefined}
              />
            </div>
          ))}
        </div>
      </div>

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
