import type { ChannelEvent } from "../../mock-data/channel-requests";
import { cn } from "../../utils/cn";
import { DisclosureSection } from "./ChannelRequestParts";
import { formatUs } from "./format";

interface Segment {
  label: string;
  us: number;
  color: string;
  textColor: string;
  badge?: string;
}

interface TimingData {
  segments: Segment[];
  totalUs: number;
  ttfbUs: number | null;
  tier: "full" | "partial" | "minimal";
}

/** channel_request_live/timing.ex `compute_timing_segments`. */
function computeTiming(event: ChannelEvent | undefined): TimingData | null {
  if (!event || event.latencyUs == null) return null;
  const { latencyUs, ttfbUs } = event;
  if (event.requestSendUs != null && ttfbUs != null && event.responseDurationUs != null) {
    const queue = event.queueUs ?? 0;
    const connect = event.connectUs ?? 0;
    const wait = Math.max(ttfbUs - queue - connect - event.requestSendUs, 0);
    const reused = event.reusedConnection && !connect;
    const segments: Segment[] = [];
    if (queue > 0) segments.push({ label: "Queue", us: queue, color: "bg-amber-300", textColor: "text-amber-900" });
    if (reused)
      segments.push({ label: "Connect", us: 0, color: "bg-orange-400", textColor: "text-orange-900", badge: "(reused)" });
    else if (connect > 0)
      segments.push({ label: "Connect", us: connect, color: "bg-orange-400", textColor: "text-orange-900" });
    segments.push(
      { label: "Send", us: event.requestSendUs, color: "bg-blue-400", textColor: "text-blue-900" },
      { label: "Processing", us: wait, color: "bg-gray-300", textColor: "text-gray-700" },
      { label: "Recv", us: event.responseDurationUs, color: "bg-green-400", textColor: "text-green-900" }
    );
    return { segments, totalUs: latencyUs, ttfbUs, tier: "full" };
  }
  if (ttfbUs != null) {
    return {
      segments: [
        { label: "TTFB", us: ttfbUs, color: "bg-blue-400", textColor: "text-blue-900" },
        { label: "Download", us: Math.max(latencyUs - ttfbUs, 0), color: "bg-green-400", textColor: "text-green-900" },
      ],
      totalUs: latencyUs,
      ttfbUs,
      tier: "partial",
    };
  }
  return {
    segments: [{ label: "Total", us: latencyUs, color: "bg-blue-400", textColor: "text-blue-900" }],
    totalUs: latencyUs,
    ttfbUs: null,
    tier: "minimal",
  };
}

// timing.ex @hatch_gradient_style, kept as Lightning writes it.
const hatch =
  "repeating-linear-gradient(-45deg, rgba(156, 163, 175, 0.18) 0px, rgba(156, 163, 175, 0.18) 3px, rgba(209, 213, 219, 0.55) 3px, rgba(209, 213, 219, 0.55) 6px)";

function segmentLabel(s: Segment) {
  if (s.badge || s.us === 0) return "";
  const ms = s.us / 1000;
  return ms >= 1000 ? `${Math.round(ms / 100) / 10}s` : `${formatUs(s.us)}ms`;
}

/**
 * The channel request Timing section (channel_request_live/timing.ex): a
 * waterfall bar of the request's phases with a TTFB marker, and a legend.
 */
export default function ChannelTiming({ event }: { event: ChannelEvent | undefined }) {
  const data = computeTiming(event);
  if (!data) return null;
  const inner = data.segments.reduce((a, s) => a + s.us, 0) || 1;
  const segs = data.segments.map((s) => ({ ...s, pct: Math.max(Math.round((s.us / inner) * 1000) / 10, 0.5) }));
  const ttfbPct = data.ttfbUs ? Math.round((data.ttfbUs / inner) * 1000) / 10 : null;
  const showOverhead = data.tier === "full";

  return (
    <div id="timing-section">
      <DisclosureSection title="Timing">
        <div className="space-y-3">
          <div className="mt-1">
            <div className="relative">
              <div
                className="w-full h-10 rounded-lg relative overflow-hidden flex items-center justify-center p-1.5"
                style={{ background: showOverhead ? hatch : "var(--color-gray-100)" }}
              >
                <div className="flex h-7 min-w-0 w-full">
                  {segs.map((s, i) => (
                    <div
                      key={s.label}
                      className={cn(
                        "flex items-center justify-center relative",
                        s.color,
                        i === 0 && "rounded-l",
                        i === segs.length - 1 && "rounded-r"
                      )}
                      style={{ width: `${s.pct}%`, minWidth: 20 }}
                      title={`${s.label}: ${formatUs(s.us)} ms`}
                    >
                      {s.badge && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded px-1 py-0 whitespace-nowrap">
                          {s.badge}
                        </span>
                      )}
                      <span className={cn("text-[10px] font-medium truncate px-0.5", s.textColor)}>{segmentLabel(s)}</span>
                    </div>
                  ))}
                </div>
                {ttfbPct && (
                  <div className="absolute top-0 bottom-0 w-0.5 bg-secondary-700 z-10" style={{ left: `${ttfbPct}%` }} />
                )}
              </div>
              {ttfbPct && (
                <div className="relative mt-1.5 h-4">
                  <div
                    className="absolute flex items-center gap-1 whitespace-nowrap"
                    style={{ left: `clamp(0px, calc(${ttfbPct}% - 36px), calc(100% - 110px))` }}
                  >
                    <span className="hero-arrow-up-mini h-3 w-3 text-secondary-500" />
                    <span className="text-[11px] font-mono font-medium text-secondary-600">
                      TTFB: {formatUs(data.ttfbUs)} ms
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-secondary-500 font-mono">0 ms</span>
              <span className="text-[11px] text-secondary-500 font-mono">{formatUs(data.totalUs)} ms</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-secondary-500">
            {data.segments.map((s) => (
              <span key={s.label} className="inline-flex items-center gap-1.5">
                <span className={cn("inline-block w-2.5 h-2.5 rounded-sm shrink-0", s.color)} />
                <span className="leading-none">{s.label}</span>
              </span>
            ))}
            {showOverhead && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block w-3 h-2.5 rounded-sm shrink-0 bg-secondary-100 border border-secondary-200"
                  style={{ background: hatch }}
                />
                <span className="leading-none">Proxy overhead</span>
              </span>
            )}
            {data.ttfbUs && (
              <span className="ml-auto inline-flex items-center font-mono text-secondary-400 leading-none">
                TTFB: {formatUs(data.ttfbUs)} ms
              </span>
            )}
          </div>
        </div>
      </DisclosureSection>
    </div>
  );
}
