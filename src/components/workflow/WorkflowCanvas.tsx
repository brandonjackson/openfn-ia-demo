import type { Workflow, WorkflowNode } from "../../mock-data/workflow";
import WorkflowNodeCard from "./WorkflowNodeCard";
import EdgeBadge from "./EdgeBadge";
import CanvasControls from "./CanvasControls";
import Minimap from "./Minimap";

const ICON_HALF = 28; // half the 56px icon tile

/**
 * The diagram surface: an absolutely-positioned set of nodes with SVG bezier
 * connectors drawn between their icon tiles, plus the edge condition badges,
 * zoom controls and minimap overlays.
 *
 * This is a static prototype layout — node coordinates come from the workflow
 * data, there is no real pan/zoom or drag yet.
 */
export default function WorkflowCanvas({
  workflow,
  selectedId,
  onSelect,
  width = 980,
  height = 720,
  showMinimap = true,
  showControls = true,
}: {
  workflow: Workflow;
  selectedId?: string;
  onSelect?: (node: WorkflowNode) => void;
  width?: number;
  height?: number;
  showMinimap?: boolean;
  showControls?: boolean;
}) {
  const nodeById = (id: string) => workflow.nodes.find((n) => n.id === id);

  return (
    <div
      className="relative overflow-hidden bg-gray-50 bg-[radial-gradient(theme(colors.gray.200)_1px,transparent_1px)] [background-size:22px_22px]"
      style={{ width: "100%", height }}
    >
      <div className="relative mx-auto" style={{ width, height }}>
        {/* Edge layer */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={width}
          height={height}
        >
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
            return (
              <path
                key={edge.id}
                d={d}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth={2}
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
              className="absolute z-10"
              style={{ left: cx - 14, top: cy - 14 }}
            >
              <EdgeBadge condition={edge.condition} />
            </div>
          );
        })}

        {/* Nodes */}
        {workflow.nodes.map((node) => (
          <div
            key={node.id}
            className="absolute z-20"
            style={{ left: node.x - ICON_HALF, top: node.y - ICON_HALF }}
          >
            <WorkflowNodeCard
              node={node}
              selected={node.id === selectedId}
              onClick={onSelect}
            />
          </div>
        ))}
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
