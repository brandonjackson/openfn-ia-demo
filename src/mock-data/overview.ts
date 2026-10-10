import type { ActivityItem, DashboardPageData } from "../page-data";
import { connectedSystemSummaries } from "./connected-systems";
import { openIssues } from "./status";
import { errorRate, errorTrend, runTrend, totalErrors, totalRuns } from "./insights";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const issueCount = openIssues.systems.length + openIssues.workflows.length;

/** Open problems from Status, worst first. */
const attention: ActivityItem[] = [
  ...openIssues.workflows.map((w) => ({
    id: `wf-${w.id}`,
    kind: (w.status === "down" ? "error" : "warning") as ActivityItem["kind"],
    parts: [{ strong: w.name }, ` is failing. ${w.note}`],
    when: w.lastRun,
    linkTo: "/status",
  })),
  ...openIssues.systems.map((s) => ({
    id: `sys-${s.id}`,
    kind: (s.status === "down" ? "error" : "warning") as ActivityItem["kind"],
    parts: [{ strong: s.name }, ` is ${s.status}. ${s.note}`],
    when: "Now",
    linkTo: "/status",
  })),
];

const recentActivity: ActivityItem[] = [
  {
    id: "act-1",
    kind: "deployed",
    parts: ["Amina deployed ", { strong: "planning-application-workflow" }, " to production"],
    when: "2 hours ago",
    linkTo: "/projects/project-a/workflows",
  },
  {
    id: "act-2",
    kind: "tested",
    parts: ["Tomás added a test to ", { strong: "case-sync-workflow" }],
    when: "5 hours ago",
    linkTo: "/projects/project-b/workflows",
  },
  {
    id: "act-3",
    kind: "created",
    parts: ["Jane created a new workflow called ", { strong: "referral-followup-workflow" }],
    when: "Yesterday",
    linkTo: "/projects/malawi-chw-referrals/workflows",
  },
  {
    id: "act-4",
    kind: "updated",
    parts: ["Kwame connected ", { strong: "Google Sheets" }, " as a shared system"],
    when: "2 days ago",
    linkTo: "/connected-systems/google-sheets",
  },
];

export const overviewData: DashboardPageData = {
  pageType: "dashboard",
  tiles: [
    {
      label: "Status",
      value: issueCount === 0 ? "All clear" : `${issueCount} issue${issueCount === 1 ? "" : "s"}`,
      detail: `${plural(openIssues.systems.length, "system")}, ${plural(openIssues.workflows.length, "workflow")}`,
      badge:
        issueCount === 0
          ? { label: "Operational", tone: "green" }
          : { label: "Needs attention", tone: "red" },
      linkTo: "/status",
    },
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
  attention,
  recentActivity,
  connectedSystems: connectedSystemSummaries,
  recommendedSystems: [
    { name: "OpenMRS", description: "Electronic medical records" },
    { name: "PostgreSQL", description: "Relational database" },
    { name: "WhatsApp Business", description: "Messaging & notifications" },
  ],
  suggestedServices: [
    {
      id: "commcare-dhis2",
      title: "Mobile data sync to national reporting",
      description:
        "Automatically push form submissions from CommCare to DHIS2 aggregates — no manual exports, no data gaps.",
      fromSystems: ["CommCare"],
      toSystems: ["DHIS2"],
      category: "Data sync",
      why: "CommCare and DHIS2 are both connected. This is the most common integration for programs using both.",
    },
    {
      id: "opencrvs-dhis2",
      title: "Civil registration to population analytics",
      description:
        "Stream birth and death events from OpenCRVS into DHIS2 population dashboards in real time.",
      fromSystems: ["OpenCRVS"],
      toSystems: ["DHIS2"],
      category: "Event-driven",
      why: "OpenCRVS events can feed DHIS2 population data automatically — a high-value, low-effort integration.",
    },
    {
      id: "fhir-dhis2",
      title: "Patient record interoperability",
      description:
        "Translate HL7 FHIR patient records into DHIS2 tracked entities for longitudinal health tracking.",
      fromSystems: ["FHIR Server"],
      toSystems: ["DHIS2"],
      category: "Interoperability",
      why: "Your FHIR Server and DHIS2 are both connected — this is a standard HIE integration pattern.",
    },
    {
      id: "kobo-sheets",
      title: "Survey data to dashboard",
      description:
        "Push KoBoToolbox survey responses to Google Sheets automatically, keeping stakeholder dashboards up to date.",
      fromSystems: ["KoBoToolbox"],
      toSystems: ["Google Sheets"],
      category: "Reporting",
      why: "Both systems are connected and this is a popular lightweight reporting workflow.",
    },
  ],
  recommended: 10,
};
