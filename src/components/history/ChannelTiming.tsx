import type { ChannelEvent } from "../../mock-data/channel-requests";
import { cn } from "../../utils/cn";
import Pill from "../Pill";
import { DisclosureSection } from "./ChannelRequestParts";
import { formatUs } from "../../utils/format";

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
    <DisclosureSection id="timing-section" title="Timing">
      <div className="space-y-3 pt-1 text-xs">
        <div className="relative">
          <div
            className="relative flex h-10 w-full items-center overflow-hidden rounded-lg p-1.5"
            style={{ background: showOverhead ? hatch : "var(--color-gray-100)" }}
          >
            <div className="flex h-7 w-full min-w-0">
              {segs.map((s) => (
                <div
                  key={s.label}
                  className={cn("relative flex items-center justify-center first:rounded-l last:rounded-r", s.color)}
                  style={{ width: `${s.pct}%`, minWidth: 20 }}
                  title={`${s.label}: ${formatUs(s.us)} ms`}
                >
                  {s.badge && (
                    <Pill color="orange" square className="absolute -top-5 left-1/2 -translate-x-1/2 px-1 py-0">
                      {s.badge}
                    </Pill>
                  )}
                  <span className={cn("truncate px-0.5 font-medium", s.textColor)}>{segmentLabel(s)}</span>
                </div>
              ))}
            </div>
            {ttfbPct && <div className="absolute inset-y-0 z-10 w-0.5 bg-gray-700" style={{ left: `${ttfbPct}%` }} />}
          </div>
          {ttfbPct && (
            <div className="relative mt-1.5 h-4">
              <div
                className="absolute flex items-center gap-1 whitespace-nowrap font-mono font-medium text-gray-600"
                style={{ left: `clamp(0px, calc(${ttfbPct}% - 36px), calc(100% - 110px))` }}
              >
                <span className="hero-arrow-up-mini h-3 w-3 text-gray-500" />
                TTFB: {formatUs(data.ttfbUs)} ms
              </div>
            </div>
          )}
          <div className="mt-1 flex justify-between font-mono text-gray-500">
            <span>0 ms</span>
            <span>{formatUs(data.totalUs)} ms</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-gray-500">
          {data.segments.map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-sm", s.color)} />
              {s.label}
            </span>
          ))}
          {showOverhead && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-3 rounded-sm border border-gray-200" style={{ background: hatch }} />
              Proxy overhead
            </span>
          )}
          {data.ttfbUs && <span className="ml-auto font-mono text-gray-400">TTFB: {formatUs(data.ttfbUs)} ms</span>}
        </div>
      </div>
    </DisclosureSection>
  );
}
