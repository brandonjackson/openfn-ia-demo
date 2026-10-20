import type { Workflow } from "../../mock-data/workflow";

const MAP_W = 200;
const MAP_H = 130;
const PADDING = 16;

/**
 * A schematic minimap of the workflow, pinned bottom-right of the canvas.
 * Node positions are scaled to fit; triggers render grey, jobs red.
 */
export default function Minimap({ workflow }: { workflow: Workflow }) {
  const xs = workflow.nodes.map((n) => n.x);
  const ys = workflow.nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const innerW = MAP_W - PADDING * 2;
  const innerH = MAP_H - PADDING * 2;

  const project = (x: number, y: number) => ({
    cx: PADDING + ((x - minX) / spanX) * innerW,
    cy: PADDING + ((y - minY) / spanY) * innerH,
  });

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden"
      style={{ width: MAP_W, height: MAP_H }}
    >
      <svg width={MAP_W} height={MAP_H}>
        {workflow.edges.map((edge) => {
          const s = workflow.nodes.find((n) => n.id === edge.source);
          const t = workflow.nodes.find((n) => n.id === edge.target);
          if (!s || !t) return null;
          const a = project(s.x, s.y);
          const b = project(t.x, t.y);
          return (
            <line
              key={edge.id}
              x1={a.cx}
              y1={a.cy}
              x2={b.cx}
              y2={b.cy}
              stroke="#d1d5db"
              strokeWidth={1}
            />
          );
        })}
        {workflow.nodes.map((node) => {
          const { cx, cy } = project(node.x, node.y);
          return (
            <circle
              key={node.id}
              cx={cx}
              cy={cy}
              r={4}
              fill={node.type === "trigger" ? "#9ca3af" : "#dc2626"}
            />
          );
        })}
      </svg>
    </div>
  );
}
