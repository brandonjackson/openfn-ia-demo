/**
 * Every date, duration, size and name formatter the app uses, in one place.
 * Ports of Lightning's LocalTimeConverter / ElapsedIndicator hooks
 * (assets/js/hooks/index.ts), utils/duration.ts and Lightning.Helpers.
 */
import type { WebhookAuthMethod } from "../types/project-settings";
import type { User } from "../types/users";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** date-fns `p`: "6:36 PM". */
function shortTime(d: Date) {
  const h = d.getHours() % 12 || 12;
  return `${h}:${pad(d.getMinutes())} ${d.getHours() < 12 ? "AM" : "PM"}`;
}

/** "h:mm:ss a": "6:36:12 PM". */
export function formatTimeOnly(iso: string) {
  const d = new Date(iso);
  const h = d.getHours() % 12 || 12;
  return `${h}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${d.getHours() < 12 ? "AM" : "PM"}`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function relative(iso: string, time: (d: Date) => string, now: Date) {
  const d = new Date(iso);
  const days = Math.round((startOfDay(d) - startOfDay(now)) / 86_400_000);
  if (days === 0) return `today at ${time(d)}`;
  if (days === -1) return `yesterday at ${time(d)}`;
  if (days === 1) return `tomorrow at ${time(d)}`;
  if (days < -1 && days >= -6) return `last ${WEEKDAYS[d.getDay()]} at ${time(d)}`;
  if (days > 1 && days <= 6) return `${WEEKDAYS[d.getDay()]} at ${time(d)}`;
  const date =
    d.getFullYear() === now.getFullYear()
      ? `${MONTHS[d.getMonth()]} ${ordinal(d.getDate())}`
      : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return `${date}, ${time(d)}`;
}

/** Lightning's default `Common.datetime` format: "today at 6:36 PM". */
export function formatRelative(iso: string, now: Date = new Date()) {
  return relative(iso, shortTime, now);
}

/** The `:relative_detailed` format: "today at 6:36:12 PM". */
export function formatRelativeDetailed(iso: string, now: Date = new Date()) {
  return relative(iso, (d) => formatTimeOnly(d.toISOString()), now);
}

/** The ISO tooltip Lightning shows on hover: "2026-10-14 09:12:00 UTC". */
export function formatUtc(iso: string) {
  return new Date(iso).toISOString().replace("T", " ").replace(/\.\d+Z$|Z$/, " UTC");
}

/** "2 hours ago", via Intl.RelativeTimeFormat. */
export function formatAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(seconds, "second");
}

/** "14-Sep" (adds "-2025" outside the current year), as on the filter chips. */
export function formatChipDate(d: Date) {
  const base = `${d.getDate()}-${MONTHS_SHORT[d.getMonth()]}`;
  return d.getFullYear() === new Date().getFullYear() ? base : `${base}-${d.getFullYear()}`;
}

/** ElapsedIndicator: "212 ms", "4 s", "2 m", or "Not started". */
export function formatElapsed(startedAt: string | null, finishedAt: string | null) {
  if (!startedAt) return "Not started";
  const ms = (finishedAt ? new Date(finishedAt).getTime() : Date.now()) - new Date(startedAt).getTime();
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60_000) return `${Math.floor(ms / 1000)} s`;
  return `${Math.floor(ms / 60_000)} m`;
}

/** The editor's utils/duration.ts: "1.25s", "3.10m", "2.00hrs". */
export function formatDuration(from: string, to: string): string {
  const ms = Math.abs(new Date(to).getTime() - new Date(from).getTime());
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(2)}hrs`;
  if (ms >= 60000) return `${(ms / 60000).toFixed(2)}m`;
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
}

/** Microseconds to milliseconds: "284", "1.2", or "—". */
export function formatUs(us: number | null) {
  if (us === null) return "—";
  const ms = us / 1000;
  return Number.isInteger(ms) ? String(ms) : String(Math.round(ms * 10) / 10);
}

/**
 * Lightning.Helpers.bytes_to_human/1: decimal units, one decimal place,
 * trailing ".0" dropped. 1500 -> "1.5 KB", 2_000_000 -> "2 MB". "—" for null.
 */
export function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  const units: [number, string][] = [
    [1e12, "TB"],
    [1e9, "GB"],
    [1e6, "MB"],
    [1e3, "KB"],
  ];
  for (const [divisor, unit] of units) {
    if (bytes >= divisor) {
      const rounded = Math.round((bytes / divisor) * 10) / 10;
      return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded} ${unit}`;
    }
  }
  return `${bytes} B`;
}

/**
 * Lightning.Helpers.url_safe_name/1: lowercases and swaps anything that isn't
 * a letter, digit, "_", "." or "-" for a dash, then trims dashes.
 * "My Project!!" -> "my-project".
 */
export function urlSafeName(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[^\p{L}0-9_.-]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** "failed" → "Failed": upper-cases the first character, leaves the rest. */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * The first `length` characters of a UUID, as shown in id chips and links.
 * Lightning truncates two ways: the collaborative editor's `truncateUid`
 * keeps 7 characters, LiveView's `display_short_uuid` keeps 8. Pass 7 where
 * the screen being matched is an editor (React) one.
 */
export function shortUuid(id: string, length = 8): string {
  return id.slice(0, length);
}

/** Calendar.strftime(dt, "%d %b  %H:%M") in UTC: "14 Oct  18:36" (two spaces). */
export function formatShortDateTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getUTCDate())} ${MONTHS_SHORT[d.getUTCMonth()]}  ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** "21 Oct 2026", in UTC. */
export function formatUtcDate(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getUTCDate())} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "Oct 14, 6:36:12 PM", in the browser's time zone. */
export function formatShortLocalDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" });
}

/** The browser's default date and time, `Date#toLocaleString()`. */
export function formatLocalDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

/** The browser's default date, `Date#toLocaleDateString()`. */
export function formatLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

/**
 * The AI assistant's session list age: "just now", "5 minutes ago",
 * "2 days ago", then "Oct 3" after a week.
 */
export function formatSessionAge(iso: string, now: Date = new Date()): string {
  const diff = now.getTime() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1) return "just now";
  if (min < 60) return `${min} ${min === 1 ? "minute" : "minutes"} ago`;
  if (hr < 24) return `${hr} ${hr === 1 ? "hour" : "hours"} ago`;
  if (day < 7) return `${day} ${day === 1 ? "day" : "days"} ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** A count with the browser's digit grouping, `Number#toLocaleString()`: 12345 → "12,345". */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function fullName(user: Pick<User, "firstName" | "lastName">): string {
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

/** Lightning's `format_schema_name`: "dhis2" → "Dhis2", "aws-s3" → "Aws-s3". */
export function formatSchemaName(schema: string): string {
  if (schema === "raw") return "Raw JSON";
  if (schema === "oauth") return "OAuth";
  if (schema === "http") return "HTTP";
  return schema
    .split("_")
    .map(capitalize)
    .join(" ");
}

/**
 * Lightning shows full UUIDs (and their first 8 characters as "short ids").
 * The shared fixtures use readable ids like "run-1", so derive a stable,
 * UUID-shaped id from each one for display.
 */
export function uuidOf(id: string): string {
  let hex = "";
  for (let round = 0; hex.length < 32; round++) {
    let h = 0x811c9dc5 ^ (round * 0x9e3779b9);
    for (let i = 0; i < id.length; i++) {
      h = Math.imul(h ^ id.charCodeAt(i), 0x01000193);
    }
    // murmur3 finaliser, so similar ids give unrelated hex.
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    h ^= h >>> 16;
    hex += (h >>> 0).toString(16).padStart(8, "0");
  }
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

/** Lightning's `display_short_uuid`: the first 8 characters of the UUID. */
export function shortId(id: string): string {
  return shortUuid(uuidOf(id));
}

/** The "Linked Triggers & Channels" summary, e.g. "1 trigger, 2 channels". */
export function linkedUsageSummary(method: WebhookAuthMethod): string {
  return (
    [
      [method.triggers.length, "trigger"],
      [method.channels.length, "channel"],
    ] as const
  )
    .filter(([count]) => count > 0)
    .map(([count, noun]) => (count === 1 ? `1 ${noun}` : `${count} ${noun}s`))
    .join(", ");
}
