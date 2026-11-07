/**
 * Insights: what the runs of the last 7 days add up to, for one project or
 * across every project you can open. Worked out from the work orders the API
 * sends, so the numbers are the ones History lists for the same week.
 */
import type { StatTileData } from "./page-data";
import { activityNow, stampTime } from "./runs";
import type { RunDetails, WorkOrder } from "./workflow";

/** One day's runs, by how they ended. */
export interface DailyRuns {
  /** The day's short name, e.g. "Mon". */
  day: string;
  succeeded: number;
  failed: number;
}

/** A project's week, for the table across projects. */
export interface ProjectInsight {
  id: string;
  name: string;
  runs: number;
  failed: number;
  /** "3.2s", or "—" with no timed runs. */
  avgDuration: string;
}

/** What Insights shows. */
export interface Insights {
  /** The period the numbers cover, e.g. "Last 7 days". */
  range: string;
  tiles: StatTileData[];
  /** Oldest first, ending today. */
  daily: DailyRuns[];
  /** Each project's week, or none inside a project. */
  projects: ProjectInsight[];
}

const DAY = 24 * 3600_000;
const DAYS = 7;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** How long a run took, in seconds, from its "179 ms" or "3 s"; undefined if it doesn't say. */
export function durationSeconds(duration: string): number | undefined {
  const m = /^([\d.]+)\s*(ms|s|m|min)$/.exec(duration.trim());
  if (!m) return undefined;
  const n = Number(m[1]);
  return m[2] === "ms" ? n / 1000 : m[2] === "s" ? n : n * 60;
}

/** Whether a run has ended, one way or the other; one waiting, running or cancelled doesn't count. */
const finished = (r: RunDetails) => r.status === "success" || r.status === "failed";

const rate = (failed: number, runs: number) => (runs ? (failed / runs) * 100 : 0);
const percent = (value: number) => `${value.toFixed(1)}%`;

/** The average time of the runs that say how long they took: "3.2s", or "—". */
function averageDuration(runs: RunDetails[]): string {
  const timed = runs.filter(finished).map((r) => durationSeconds(r.duration)).filter((s): s is number => s !== undefined);
  return timed.length ? `${(timed.reduce((a, b) => a + b, 0) / timed.length).toFixed(1)}s` : "—";
}

/** How the error rate moved since the week before. */
function versusLastWeek(now: number, before: number, hadRuns: boolean): string {
  if (!hadRuns) return "No runs the week before";
  if (now.toFixed(1) === before.toFixed(1)) return "Same as the week before";
  return `${now > before ? "Up" : "Down"} from ${percent(before)} the week before`;
}

/**
 * Insights over the last 7 days (today and the 6 before it, counting back
 * from run history's "now"), for `projects` and their work orders. A run
 * counts on the day it started, if it has finished: succeeded or failed,
 * and failed runs are the errors. `scope` words the average's tile ("This
 * project", "Across all projects"); `byProject` adds each project's row.
 */
export function insightsFor(projects: { id: string; name: string; workOrders: WorkOrder[] }[], scope: string, byProject: boolean): Insights {
  const now = activityNow();
  const endOfToday = new Date(now).setHours(24, 0, 0, 0);
  // Days back from the end of today: 0 is today. A run started after "now" counts as today.
  const daysBack = (r: RunDetails) => Math.floor((endOfToday - 1 - Math.min(stampTime(r.started), now)) / DAY);
  const thisWeek = (r: RunDetails) => daysBack(r) < DAYS;
  const lastWeek = (r: RunDetails) => daysBack(r) >= DAYS && daysBack(r) < 2 * DAYS;

  const all = projects.flatMap((p) => p.workOrders.flatMap((o) => o.runs)).filter(finished);
  const runs = all.filter(thisWeek);
  const before = all.filter(lastWeek);
  const failed = runs.filter((r) => r.status === "failed").length;

  const daily: DailyRuns[] = Array.from({ length: DAYS }, (_, i) => ({ day: WEEKDAYS[new Date(endOfToday - (DAYS - i) * DAY).getDay()]!, succeeded: 0, failed: 0 }));
  for (const run of runs) {
    const day = daily[DAYS - 1 - daysBack(run)]!;
    if (run.status === "failed") day.failed += 1;
    else day.succeeded += 1;
  }

  const errorRate = rate(failed, runs.length);
  return {
    range: "Last 7 days",
    tiles: [
      { label: "Runs", value: runs.length.toLocaleString("en-US"), detail: "Last 7 days", trend: daily.map((d) => d.succeeded + d.failed) },
      { label: "Errors", value: failed.toLocaleString("en-US"), detail: `${percent(errorRate)} of runs`, trend: daily.map((d) => d.failed) },
      { label: "Error rate", value: percent(errorRate), detail: versusLastWeek(errorRate, rate(before.filter((r) => r.status === "failed").length, before.length), before.length > 0) },
      { label: "Average run time", value: averageDuration(runs), detail: scope },
    ],
    daily,
    projects: byProject
      ? projects.map((p) => {
          const own = p.workOrders.flatMap((o) => o.runs).filter((r) => finished(r) && thisWeek(r));
          return { id: p.id, name: p.name, runs: own.length, failed: own.filter((r) => r.status === "failed").length, avgDuration: averageDuration(own) };
        })
      : [],
  };
}
