/** Lightning's utils/duration.ts. */
export function duration(from: string, to: string): string {
  const ms = Math.abs(new Date(to).getTime() - new Date(from).getTime());
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(2)}hrs`;
  if (ms >= 60000) return `${(ms / 60000).toFixed(2)}m`;
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
}

function time(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** date-fns formatRelative with Lightning's relativeLocale (assets/js/hooks). */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(d) - day(now)) / 86400000);
  if (diff === 0) return `today at ${time(d)}`;
  if (diff === -1) return `yesterday at ${time(d)}`;
  if (diff === 1) return `tomorrow at ${time(d)}`;
  if (diff < -1 && diff >= -6) return `last ${d.toLocaleDateString("en-US", { weekday: "long" })} at ${time(d)}`;
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const n = d.getDate();
  const suffix = n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th";
  return d.getFullYear() === now.getFullYear()
    ? `${month} ${n}${suffix}, ${time(d)}`
    : `${d.toISOString().slice(0, 10)}, ${time(d)}`;
}
