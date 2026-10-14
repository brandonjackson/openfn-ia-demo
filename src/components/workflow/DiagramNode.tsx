import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { NODE_SIZE, STROKE, nodeShapeStyle, type NodeRunState, EDGE_COLOR, EDGE_COLOR_SELECTED } from "./diagramGeometry";

const RUN_ICONS: Record<string, [icon: string, color: string]> = {
  running: ["hero-arrow-path-solid animate-spin", "text-blue-500"],
  success: ["hero-check-circle-solid", "text-green-500"],
  fail: ["hero-x-circle-solid", "text-red-500"],
  crash: ["hero-x-circle-solid", "text-orange-800"],
};

interface Props {
  id: string;
  shape: "circle" | "rect";
  label: string;
  sublabel?: string;
  /** Drawn inside the shape: an adaptor icon or a trigger glyph. */
  icon: ReactNode;
  /** Small icon in the top-left corner (the lock on an authenticated webhook). */
  secondaryIcon?: ReactNode;
  selected?: boolean;
  /** Disabled triggers draw at half opacity (styles.ts styleNode). */
  disabled?: boolean;
  runState?: NodeRunState;
  /** When a run is shown, nodes it didn't reach fade to 30%. */
  didRun?: boolean;
  /** Duration (jobs) or start time (trigger) shown to the right while viewing a run. */
  runMeta?: string;
  /** Who started the run, shown as a play badge on the start node. */
  startedBy?: string;
  /** Shows the "+" path button under the node on hover (jobs only). */
  onAddPath?: () => void;
  onClick?: () => void;
}

/**
 * A node on the canvas (workflow-diagram/nodes/Node.tsx): a 100px rounded
 * square (job) or circle (trigger) with its icon, the name and sublabel to
 * the right, and run state badges when a run is selected.
 */
export default function DiagramNode({
  id,
  shape,
  label,
  sublabel,
  icon,
  secondaryIcon,
  selected = false,
  disabled = false,
  runState = null,
  didRun = true,
  runMeta,
  startedBy,
  onAddPath,
  onClick,
}: Props) {
  const style = nodeShapeStyle(selected, runState);
  const run = runState ? RUN_ICONS[runState] : null;
  return (
    <div
      className={cn("group", didRun ? "opacity-100" : "opacity-30")}
      style={disabled ? { opacity: 0.5 } : undefined}
      data-id={id}
      data-testid={shape === "circle" ? `trigger-node-${id}` : `job-node-${id}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-row cursor-pointer">
        <div className="relative">
          {run && shape === "rect" && (
            <div className="absolute -left-2 -top-2 pointer-events-auto z-10" title={runState === "running" ? "Step is running" : undefined}>
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 w-6 h-6 ml-1 mt-1 bg-white rounded-full" />
                <div className={cn("relative flex justify-center items-center w-8 h-8 rounded-full", run[1])}>
                  <span className={cn(run[0], "w-full h-full")} />
                </div>
              </div>
            </div>
          )}
          {startedBy && (
            <div className="absolute -top-2 flex gap-2 items-center z-10" style={{ left: "calc(100% - 24px)" }} title={`Started by ${startedBy}`}>
              <div className="flex justify-center items-center w-7 h-7 rounded-full text-slate-50 border-slate-700 bg-slate-600">
                <span className="hero-play-solid w-3 h-3" />
              </div>
            </div>
          )}
          {runMeta && (
            <div className="absolute top-2 ml-2 flex gap-2 items-center text-nowrap font-mono" style={{ left: "calc(100% + 6px)" }}>
              {runMeta}
            </div>
          )}
          <svg width={NODE_SIZE + STROKE * 2} height={NODE_SIZE + STROKE * 2} style={{ overflow: "visible" }}>
            {shape === "circle" ? (
              <ellipse
                cx={STROKE + NODE_SIZE / 2}
                cy={STROKE + NODE_SIZE / 2}
                rx={NODE_SIZE / 2}
                ry={NODE_SIZE / 2}
                strokeWidth={STROKE}
                {...style}
              />
            ) : (
              <rect x={STROKE} y={STROKE} rx={16} width={NODE_SIZE} height={NODE_SIZE} strokeWidth={STROKE} {...style} />
            )}
          </svg>
          <div
            style={{
              position: "absolute",
              left: 0.175 * NODE_SIZE + STROKE,
              top: 0.175 * NODE_SIZE + STROKE,
              height: 0.65 * NODE_SIZE,
              width: 0.65 * NODE_SIZE,
              color: selected ? EDGE_COLOR_SELECTED : EDGE_COLOR,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
          {secondaryIcon && (
            <div
              style={{
                position: "absolute",
                left: "2%",
                top: "2%",
                height: 0.3 * NODE_SIZE,
                width: 0.3 * NODE_SIZE,
                color: selected ? EDGE_COLOR_SELECTED : EDGE_COLOR,
              }}
            >
              {secondaryIcon}
            </div>
          )}
        </div>
        <div className="flex flex-col mt-8 absolute left-[116px] top-0 pointer-events-none min-w-[275px]">
          <p className="line-clamp-2 text-base max-w-[220px] text-ellipsis overflow-hidden">{label}</p>
          {sublabel && <p className="line-clamp-2 text-sm text-slate-500">{sublabel}</p>}
        </div>
      </div>
      {onAddPath && (
        <div
          style={{ width: NODE_SIZE, marginLeft: 2, marginTop: -18, justifyContent: "center" }}
          className="flex flex-row items-center opacity-0 transition duration-150 ease-in-out group-hover:opacity-100 relative z-10"
        >
          <button
            type="button"
            title="Add a path to a new step"
            onClick={(e) => {
              e.stopPropagation();
              onAddPath();
            }}
            className="transition duration-150 ease-in-out rounded-lg bg-indigo-600 hover:bg-indigo-500 py-1 px-2 text-[0.8125rem] font-semibold leading-5 text-white flex items-center justify-center ml-1 h-6"
          >
            <span className="hero-plus h-4 w-4 pointer-events-none" />
          </button>
        </div>
      )}
    </div>
  );
}
