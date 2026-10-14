import type { RunBucket } from "../../../mock-data/workflow-health";
import { CANCELLED, DOT, EMPTY, FAILED, FRAME, LEGEND, SUCCESS } from "./palette";

const SERIES = [
  { key: "success", label: "Success", color: SUCCESS },
  { key: "cancelled", label: "Cancelled", color: CANCELLED },
  { key: "failed", label: "Failed", color: FAILED },
] as const;

type SeriesKey = (typeof SERIES)[number]["key"];

/** A run has no `rejected` state, so the red band folds the other five. */
const RUN_FAILURE_KEYS = ["failed", "crashed", "killed", "exception", "lost"] as const;

const dayLabel = (d: Date, tz: string) => d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: tz });
const hour = (d: Date, tz: string) =>
  Number(d.toLocaleString("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: tz }));
const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;

function rangeLabel(at: string, hours: number, tz: string) {
  const start = new Date(at);
  if (hours >= 24) return dayLabel(start, tz);
  const from = hour(start, tz);
  return `${dayLabel(start, tz)}, ${hourLabel(from)} – ${hourLabel((from + hours) % 24)}`;
}

function tickLabel(at: string, hours: number, tz: string) {
  const d = new Date(at);
  if (hours >= 24) return dayLabel(d, tz);
  if (hours >= 12) return hour(d, tz) < 12 ? dayLabel(d, tz) : "";
  return hourLabel(hour(d, tz));
}

/**
 * "Runs over time": run volume per bucket, stacked Failed / Cancelled /
 * Success from the axis up (VolumeBars.tsx). Plain divs in place of
 * Recharts; each bar's title gives its counts.
 */
export default function VolumeBars({
  buckets,
  hours,
  timezone,
  emptyMessage,
}: {
  buckets: RunBucket[];
  hours: number;
  timezone: string;
  emptyMessage: string;
}) {
  const rows = buckets.map((b) => ({
    at: b.at,
    success: b.success,
    cancelled: b.cancelled,
    failed: RUN_FAILURE_KEYS.reduce((sum, k) => sum + b[k], 0),
  }));
  const totals = SERIES.map((s) => ({ ...s, value: rows.reduce((sum, r) => sum + r[s.key], 0) })).filter(
    ({ key, value }) => key !== "cancelled" || value > 0
  );
  if (totals.every(({ value }) => value === 0)) return <p className={EMPTY}>{emptyMessage}</p>;

  const max = Math.max(...rows.map((r) => r.success + r.cancelled + r.failed));
  // A tenth of headroom, rounded up to four whole-number steps.
  const step = Math.max(1, Math.ceil((max * 1.1) / 4));
  const ceiling = step * 4;
  const ticks = [0, 1, 2, 3, 4].map((i) => i * step);
  const shown = totals.map((t) => t.key) as SeriesKey[];

  return (
    <>
      <div className={`${FRAME} flex`} aria-hidden="true">
        <div className="flex w-11 shrink-0 flex-col text-xs text-gray-500">
          <div className="relative flex-1">
            {ticks.map((t, i) => (
              <span key={i} className="absolute right-2 translate-y-1/2" style={{ bottom: `${(t / ceiling) * 100}%` }}>
                {t}
              </span>
            ))}
          </div>
          <div className="h-5" />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="relative flex flex-1 items-end gap-[1%] border-b border-gray-100">
            {ticks.slice(1).map((t, i) => (
              <div key={i} className="absolute inset-x-0 border-t border-gray-100" style={{ bottom: `${(t / ceiling) * 100}%` }} />
            ))}
            {rows.map((r) => (
              <div
                key={r.at}
                className="flex h-full flex-1 flex-col-reverse hover:bg-gray-50"
                title={`${rangeLabel(r.at, hours, timezone)}: ${totals.map((t) => `${t.label} ${r[t.key]}`).join(", ")}`}
              >
                {[...shown].reverse().map((k) => {
                  const color = SERIES.find((s) => s.key === k)!.color;
                  return <div key={k} className="mx-auto w-4/5 max-w-16" style={{ height: `${(r[k] / ceiling) * 100}%`, backgroundColor: color }} />;
                })}
              </div>
            ))}
          </div>
          <div className="flex h-5 gap-[1%] pt-1 text-xs text-gray-500">
            {rows.map((r, i) => (
              <span key={r.at} className="flex-1 truncate text-center">
                {hours >= 12 || i % 2 === 0 ? tickLabel(r.at, hours, timezone) : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="sr-only">{`Window totals: ${totals.map(({ label, value }) => `${label} ${value.toLocaleString()}`).join(", ")}.`}</p>
      <ul aria-hidden="true" className={LEGEND}>
        {totals.map(({ key, label, color }) => (
          <li key={key} className="flex items-center gap-2">
            <span className={DOT} style={{ backgroundColor: color }} />
            {label}
          </li>
        ))}
      </ul>
    </>
  );
}
