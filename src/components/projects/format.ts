/** Formatting helpers shared by the projects-area components. */

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
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const time = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/**
 * date-fns `formatRelative` with Lightning's `relativeLocale`
 * (assets/js/hooks/index.ts): "today at 6:36 PM", "yesterday at …",
 * "last Monday at …", "October 3rd, 6:36 PM", "2025-10-03, 6:36 PM".
 */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const dayDiff = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000);
  if (dayDiff === 0) return `today at ${time(date)}`;
  if (dayDiff === -1) return `yesterday at ${time(date)}`;
  if (dayDiff === 1) return `tomorrow at ${time(date)}`;
  if (dayDiff < -1 && dayDiff >= -6) return `last ${DAYS[date.getDay()]} at ${time(date)}`;
  if (dayDiff > 1 && dayDiff <= 6) return `${DAYS[date.getDay()]} at ${time(date)}`;
  if (date.getFullYear() === now.getFullYear()) {
    return `${MONTHS[date.getMonth()]} ${ordinal(date.getDate())}, ${time(date)}`;
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}, ${time(date)}`;
}

/** Lightning's `Helpers.url_safe_name`: lower-case, a dash for each run of other characters. */
export function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^\p{L}0-9_.-]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** Lightning's time-of-day greeting (TypewriterHook in assets/js/hooks). */
export function greetingFor(name: string, hour: number): string {
  if (hour >= 22 || hour < 3) return `Good evening, ${name}. You're up late!`;
  if (hour < 7) return `Good morning, ${name}. You're up early!`;
  if (hour < 12) return `Good morning, ${name}!`;
  if (hour < 18) return `Good afternoon, ${name}!`;
  return `Good evening, ${name}!`;
}
