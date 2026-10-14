/**
 * Date and duration formatting shared by the History components. Ports of
 * Lightning's LocalTimeConverter hook (assets/js/hooks/index.ts, date-fns
 * `formatRelative` with custom locales) and the ElapsedIndicator hook.
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

function relative(iso: string, time: (d: Date) => string) {
  const d = new Date(iso);
  const now = new Date();
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
export function formatRelative(iso: string) {
  return relative(iso, shortTime);
}

/** The `:relative_detailed` format: "today at 6:36:12 PM". */
export function formatRelativeDetailed(iso: string) {
  return relative(iso, (d) => formatTimeOnly(d.toISOString()));
}

/** The ISO tooltip Lightning shows on hover: "2026-10-14 09:12:00 UTC". */
export function formatUtc(iso: string) {
  return new Date(iso).toISOString().replace("T", " ").replace(/\.\d+Z$|Z$/, " UTC");
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

/** Channel request helpers: microseconds to "284" / "1.2" ms. */
export function formatUs(us: number | null) {
  if (us === null) return "—";
  const ms = us / 1000;
  return Number.isInteger(ms) ? String(ms) : String(Math.round(ms * 10) / 10);
}

export function formatBytes(bytes: number | null) {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${Math.round((bytes / 1024) * 10) / 10} KB`;
  return `${Math.round((bytes / 1_048_576) * 10) / 10} MB`;
}
