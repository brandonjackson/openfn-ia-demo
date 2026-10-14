/**
 * Every date, duration, size and name formatter the app uses, in one place.
 * Ports of Lightning's LocalTimeConverter / ElapsedIndicator hooks
 * (assets/js/hooks/index.ts), utils/duration.ts and Lightning.Helpers.
 */

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
