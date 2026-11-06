/*
 * The API sends timestamps (ISO 8601, UTC); pages show them the way people
 * read them. Pure functions, so every page words a time the same way.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"} ago`;

/** "Just now", "12 minutes ago", "Yesterday", "3 weeks ago"; older than a few months, the date. `null` is "Never". */
export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "Never";
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const ms = now - then;
  if (ms < MINUTE) return "Just now";
  if (ms < HOUR) return plural(Math.floor(ms / MINUTE), "minute");
  if (ms < DAY) return plural(Math.floor(ms / HOUR), "hour");
  if (ms < 2 * DAY) return "Yesterday";
  if (ms < 14 * DAY) return plural(Math.floor(ms / DAY), "day");
  if (ms < 60 * DAY) return plural(Math.floor(ms / (7 * DAY)), "week");
  if (ms < 365 * DAY) return plural(Math.floor(ms / (30 * DAY)), "month");
  return formatDate(iso);
}

/** "14 Mar 2024". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** "14 Mar 2024, 09:14", in the viewer's time zone. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}, ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

/** Whole days from now until a timestamp, at least 0. */
export function daysUntil(iso: string, now = Date.now()): number {
  return Math.max(0, Math.ceil((Date.parse(iso) - now) / DAY));
}

const UNIT_MS: Record<string, number> = { second: 1e3, minute: MINUTE, hour: HOUR, day: DAY, week: 7 * DAY, month: 30 * DAY, year: 365 * DAY };

/**
 * How long ago a fixture's relative time is ("12 minutes ago", "an hour ago",
 * "Yesterday", "Just now"), in milliseconds; `null` for anything else, such
 * as "Never" or a date. The fixtures write times the way people read them; the
 * fake server and the stories turn them back into timestamps with this.
 */
export function msAgo(text: string | null | undefined): number | null {
  const t = (text ?? "").trim().toLowerCase();
  if (t === "just now" || t === "now") return 30_000;
  if (t === "yesterday") return DAY;
  const rel = /^(an?|\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/.exec(t);
  if (!rel) return null;
  return (rel[1] === "a" || rel[1] === "an" ? 1 : Number(rel[1])) * UNIT_MS[rel[2]!]!;
}

/** A fixture's relative time as a timestamp counted back from `now`, or `null` ("Never"). */
export function isoAgo(text: string | null | undefined, now = Date.now()): string | null {
  const ms = msAgo(text);
  return ms === null ? null : new Date(now - ms).toISOString();
}
