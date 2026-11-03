import { Maximize2 } from "lucide-react";
import type { NetworkMember } from "../mock-data/xroad";
import IconButton from "./IconButton";

interface Props {
  /** Your organisation, drawn at the centre. */
  centre: { name: string; code: string };
  members: NetworkMember[];
  /**
   * `mini` is a small framed preview for the top of a list, with an expand
   * button; `full` is the whole map with every member named, for a dialog.
   */
  variant?: "mini" | "full";
  /** Opens the full map. Mini only. */
  onExpand?: () => void;
}

const directionLabels: Record<NonNullable<NetworkMember["direction"]>, string> = {
  outbound: "You call them",
  inbound: "They call you",
  both: "Both ways",
};

const sizes = {
  mini: { w: 320, h: 150, rx: 125, ry: 52, node: 6, centre: 13 },
  full: { w: 760, h: 480, rx: 290, ry: 165, node: 22, centre: 34 },
};

/**
 * Your organisation at the centre of the X-Road members you exchange data
 * with, joined by a line to each. Members in the directory you haven't
 * connected to yet are drawn faded, as the next integrations you could make.
 */
export default function XRoadNetworkMap({ centre, members, variant = "full", onExpand }: Props) {
  const s = sizes[variant];
  const cx = s.w / 2;
  const cy = s.h / 2;
  const mini = variant === "mini";
  const linked = members.filter((m) => m.linked).length;
  const placed = members.map((m, i) => {
    const angle = -Math.PI / 2 + (i / members.length) * Math.PI * 2;
    return { ...m, x: cx + s.rx * Math.cos(angle), y: cy + s.ry * Math.sin(angle) };
  });

  const map = (
    <svg
      viewBox={`0 0 ${s.w} ${s.h}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${centre.name} is connected to ${linked} of ${members.length} X-Road members`}
    >
      {placed
        .filter((m) => m.linked)
        .map((m) => (
          <line
            key={`edge-${m.id}`}
            x1={cx}
            y1={cy}
            x2={m.x}
            y2={m.y}
            strokeWidth={mini ? 1.5 : 2}
            strokeDasharray={m.direction === "inbound" ? "5 4" : undefined}
            className="stroke-indigo-300"
          />
        ))}
      {placed.map((m) => (
        <g key={m.id} className={m.linked ? "" : "opacity-35"}>
          <title>{`${m.name}${m.linked && m.direction ? ` · ${directionLabels[m.direction]}` : " · Not connected yet"}`}</title>
          <circle
            cx={m.x}
            cy={m.y}
            r={s.node}
            strokeWidth={mini ? 1.5 : 2}
            className={m.linked ? "fill-white stroke-indigo-500" : "fill-white stroke-gray-300"}
          />
          {!mini && (
            <>
              <text
                x={m.x}
                y={m.y + 3.5}
                textAnchor="middle"
                className={`text-[10px] font-semibold ${m.linked ? "fill-indigo-700" : "fill-gray-500"}`}
              >
                {m.code.length > 5 ? m.code.slice(0, 4) + "…" : m.code}
              </text>
              {/* Labels go above members in the top half, so lines from the centre don't cross them. */}
              <text
                x={m.x}
                y={m.y < cy - 1 ? m.y - s.node - 22 : m.y + s.node + 15}
                textAnchor="middle"
                className="fill-gray-800 text-[12px] font-medium"
              >
                {m.name}
              </text>
              <text
                x={m.x}
                y={m.y < cy - 1 ? m.y - s.node - 8 : m.y + s.node + 29}
                textAnchor="middle"
                className="fill-gray-400 text-[11px]"
              >
                {m.linked && m.direction ? directionLabels[m.direction] : "Not connected yet"}
              </text>
            </>
          )}
        </g>
      ))}
      <circle cx={cx} cy={cy} r={s.centre} className="fill-indigo-600" />
      <text
        x={cx}
        y={cy + (mini ? 3 : 4.5)}
        textAnchor="middle"
        className={`fill-white font-bold ${mini ? "text-[8px]" : "text-[13px]"}`}
      >
        {centre.code}
      </text>
      {!mini && (
        <text x={cx} y={cy + s.centre + 17} textAnchor="middle" className="fill-gray-900 text-[13px] font-semibold">
          {centre.name} (you)
        </text>
      )}
    </svg>
  );

  if (!mini) {
    return (
      <div className="space-y-3">
        {map}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-5 rounded bg-indigo-300" /> You call them, or both ways
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-5 border-t-2 border-dashed border-indigo-300" /> They call you
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-gray-300 opacity-50" /> In the directory, not connected yet
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3 pr-2">
      <button
        type="button"
        onClick={onExpand}
        className="w-60 flex-shrink-0 rounded-md bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        aria-label="Open the X-Road network map"
      >
        {map}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">X-Road network</p>
        <p className="mt-0.5 text-xs text-gray-500">
          You exchange data with {linked} of the {members.length} members in the directory. Every other member is a
          potential integration.
        </p>
      </div>
      {onExpand && <IconButton icon={Maximize2} label="Expand network map" onClick={onExpand} />}
    </div>
  );
}
