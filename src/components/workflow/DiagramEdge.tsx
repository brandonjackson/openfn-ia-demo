import type { EdgeConditionType, Position } from "../../mock-data/workflow";
import {
  EDGE_COLOR,
  EDGE_COLOR_NEIGHBOUR,
  EDGE_COLOR_SELECTED,
  bezierPath,
  conditionGlyph,
  edgeColor,
  edgeEndpoints,
} from "./diagramGeometry";

interface Props {
  id: string;
  source: Position;
  target: Position;
  conditionType: EdgeConditionType;
  conditionLabel?: string | null;
  enabled?: boolean;
  selected?: boolean;
  /** Connected to the selected node. */
  neighbour?: boolean;
  /** While viewing a run: the path wasn't taken. */
  didntRun?: boolean;
  onClick?: () => void;
}

/**
 * A path between two nodes (workflow-diagram/edges/Edge.tsx + styles.ts):
 * a bezier with a closed arrow, dashed when disabled, and the round
 * condition badge (✓, X, ∞ or { }) at its midpoint, with the condition
 * label alongside when there is one. Rendered in canvas coordinates.
 */
export default function DiagramEdge({
  id,
  source,
  target,
  conditionType,
  conditionLabel,
  enabled = true,
  selected = false,
  neighbour = false,
  didntRun = false,
  onClick,
}: Props) {
  const { sx, sy, tx, ty } = edgeEndpoints(source, target);
  const path = bezierPath(sx, sy, tx, ty);
  const color = edgeColor({ selected, neighbour, enabled, didntRun });
  const stroke = selected ? EDGE_COLOR_SELECTED : neighbour ? EDGE_COLOR_NEIGHBOUR : EDGE_COLOR;
  const markerId = `arrow-${id}`;
  const label =
    conditionLabel && conditionLabel.length > 22 ? conditionLabel.slice(0, 22) + "..." : conditionLabel;

  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <>
      <svg className="absolute left-0 top-0 overflow-visible" width={1} height={1} style={{ zIndex: selected ? 2 : 0 }}>
        <defs>
          <marker
            id={markerId}
            markerWidth={15}
            markerHeight={32}
            viewBox="-10 -10 20 20"
            markerUnits="strokeWidth"
            orient="auto-start-reverse"
            refX={0}
            refY={0}
          >
            <polyline
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              points="-5,-4 0,0 -5,4 -5,-4"
              style={{ stroke, fill: stroke }}
            />
          </marker>
        </defs>
        <path
          d={path}
          fill="none"
          style={{ stroke }}
          strokeWidth={2}
          strokeDasharray={enabled ? undefined : "6, 6"}
          opacity={enabled ? (didntRun ? 0.3 : 1) : 0.5}
          markerEnd={`url(#${markerId})`}
        />
        <path
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth={20}
          className="cursor-pointer"
          style={{ pointerEvents: "stroke" }}
          onClick={handle}
          onPointerDown={(e) => e.stopPropagation()}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translate(-50%, -50%) translate(${(sx + tx) / 2}px,${(sy + ty) / 2}px)`,
          zIndex: selected ? 3 : 1,
          borderColor: color,
          color,
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
          opacity: enabled ? 1 : 0.9,
        }}
        className="cursor-pointer"
        onClick={handle}
        onPointerDown={(e) => e.stopPropagation()}
        data-testid={`edge-label-${id}`}
      >
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            display: "flex",
            height: 46,
            width: 46,
            borderStyle: "solid",
            borderWidth: 2,
            borderRadius: "100%",
            borderColor: "inherit",
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {conditionGlyph(conditionType)}
        </span>
        {label && (
          <span
            style={{
              borderStyle: "solid",
              borderWidth: 2,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              borderColor: "inherit",
              backgroundColor: "white",
              padding: "2px 6px",
              paddingLeft: 8,
              marginLeft: -11,
              height: 34,
              borderLeft: "solid 2px white",
              whiteSpace: "nowrap",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
            }}
          >
            {label}
          </span>
        )}
      </div>
    </>
  );
}
