import type { DashboardPageData, StatTileData } from "../model/page-data";
import { connectedSystemSummaries, recommendedSystems } from "./connected-systems";
import { openIssues } from "./status";
import { projectSummaries } from "./projects";
import { errorRate, errorTrend, runTrend, totalErrors, totalRuns } from "./insights";
import { adaptors } from "./adaptors";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** The Status tile: open issues, counting systems' only when the organisation has connected systems. */
export function statusTile(withSystems: boolean): StatTileData {
  const issueCount = openIssues.workflows.length + (withSystems ? openIssues.systems.length : 0);
  return {
    label: "Status",
    value: issueCount === 0 ? "All clear" : `${issueCount} issue${issueCount === 1 ? "" : "s"}`,
    detail: withSystems
      ? `${plural(openIssues.systems.length, "system")}, ${plural(openIssues.workflows.length, "workflow")}`
      : plural(openIssues.workflows.length, "workflow"),
    badge: issueCount === 0 ? { label: "Operational", tone: "green" } : { label: "Needs attention", tone: "red" },
    linkTo: "/status",
  };
}




export const overviewData: DashboardPageData = {
  pageType: "dashboard",
  adaptors,
  tiles: [
    statusTile(true),
    {
      label: "Runs this week",
      value: totalRuns.toLocaleString("en-US"),
      trend: runTrend,
      linkTo: "/insights",
    },
    {
      label: "Errors this week",
      value: totalErrors,
      detail: `${errorRate} of runs`,
      trend: errorTrend,
      linkTo: "/insights",
    },
  ],
  connectedSystems: connectedSystemSummaries,
  recommendedSystems,
  projects: projectSummaries,
  recommended: connectedSystemSummaries.length + recommendedSystems.length,
};
