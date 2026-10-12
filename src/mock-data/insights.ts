import type { DailyRuns, InsightsPageData, ProjectInsight } from "../page-data";

const daily: DailyRuns[] = [
  { day: "Mon", succeeded: 312, failed: 1 },
  { day: "Tue", succeeded: 355, failed: 0 },
  { day: "Wed", succeeded: 298, failed: 2 },
  { day: "Thu", succeeded: 401, failed: 1 },
  { day: "Fri", succeeded: 377, failed: 0 },
  { day: "Sat", succeeded: 241, failed: 0 },
  { day: "Sun", succeeded: 350, failed: 3 },
];

const projectInsights: ProjectInsight[] = [
  { id: "project-a", name: "Project A", runs: 1120, failed: 2, avgDuration: "3.2s" },
  { id: "project-b", name: "Project B", runs: 640, failed: 1, avgDuration: "1.8s" },
  {
    id: "malawi-chw-referrals",
    name: "Malawi Community Health Worker Referrals to National HMIS (DHIS2 Tracker)",
    runs: 520,
    failed: 4,
    avgDuration: "6.4s",
  },
  { id: "data-quality-checks", name: "Data Quality Checks", runs: 61, failed: 0, avgDuration: "0.9s" },
];

export const runTrend = daily.map((d) => d.succeeded + d.failed);
export const errorTrend = daily.map((d) => d.failed);
export const totalRuns = runTrend.reduce((a, b) => a + b, 0);
export const totalErrors = errorTrend.reduce((a, b) => a + b, 0);
export const errorRate = `${((totalErrors / totalRuns) * 100).toFixed(1)}%`;

export const insightsData: InsightsPageData = {
  pageType: "insights",
  range: "Last 7 days",
  tiles: [
    { label: "Runs", value: totalRuns.toLocaleString("en-US"), detail: "Last 7 days", trend: runTrend },
    { label: "Errors", value: totalErrors, detail: `${errorRate} of runs`, trend: errorTrend },
    { label: "Error rate", value: errorRate, detail: "Up from 0.1% the week before" },
    { label: "Average run time", value: "3.5s", detail: "Across all projects" },
  ],
  daily,
  projects: projectInsights,
};

/**
 * Insights for a single project: its share of the org's daily runs, without
 * the per-project breakdown.
 */
export function buildProjectInsightsData(projectId: string): InsightsPageData {
  const project = projectInsights.find((p) => p.id === projectId);
  const runShare = project ? project.runs / totalRuns : 0;
  const errorShare = project ? project.failed / totalErrors : 0;
  const projectDaily = daily.map((d) => ({
    day: d.day,
    succeeded: Math.round(d.succeeded * runShare),
    failed: Math.round(d.failed * errorShare),
  }));
  const runs = projectDaily.map((d) => d.succeeded + d.failed);
  const errors = projectDaily.map((d) => d.failed);
  const runTotal = runs.reduce((a, b) => a + b, 0);
  const errorTotal = errors.reduce((a, b) => a + b, 0);
  const rate = runTotal ? `${((errorTotal / runTotal) * 100).toFixed(1)}%` : "0.0%";
  return {
    pageType: "insights",
    range: "Last 7 days",
    tiles: [
      { label: "Runs", value: runTotal.toLocaleString("en-US"), detail: "Last 7 days", trend: runs },
      { label: "Errors", value: errorTotal, detail: `${rate} of runs`, trend: errors },
      { label: "Error rate", value: rate, detail: "This project" },
      { label: "Average run time", value: project?.avgDuration ?? "—", detail: "This project" },
    ],
    daily: projectDaily,
    projects: [],
  };
}
