/** Where each system sits on the map. */
import { directoryMember, networkLinks } from "./xroad";
import { connectionOf } from "../model/connected-systems";
import { connectedSystems } from "./connected-systems";
import type { EcosystemStation, EcosystemWorkflow } from "../model/ecosystem";
const positions: Record<string, { col: number; row: number }> = {
  "kobo-toolbox": { col: 0, row: 1 },
  salesforce: { col: 0, row: 3 },
  dhis2: { col: 2, row: 1 },
  commcare: { col: 2, row: 3 },
  "google-sheets": { col: 2, row: 5 },
  ndho: { col: 5, row: 1 },
  "national-id": { col: 5, row: 3 },
  opencrvs: { col: 5, row: 5 },
  openmrs: { col: 7, row: 3 },
  fhir: { col: 7, row: 5 },
  "social-registry": { col: 9, row: 3 },
};

const systemStations: EcosystemStation[] = connectedSystems.flatMap((s) => {
  const at = positions[s.id];
  if (!at) return [];
  const c = connectionOf(s);
  return [
    {
      id: s.id,
      name: s.name,
      adaptor: s.adaptor,
      ...at,
      kind: "system" as const,
      owner: s.owner,
      xroad: c.method === "xroad" ? { member: directoryMember(c.route.memberId)?.name ?? c.route.memberId, status: c.status } : undefined,
    },
  ];
});

/** X-Road members that call services you publish, drawn where their calls come in. */
const clientStations: EcosystemStation[] = networkLinks
  .filter((l) => l.direction === "inbound")
  .flatMap((l) => {
    const member = directoryMember(l.memberId);
    const at = positions[l.memberId];
    if (!member || !at) return [];
    return [{ id: member.id, name: member.name, ...at, kind: "client" as const, owner: member.name, xroad: { member: member.name, status: "live" as const } }];
  });

export const ecosystemStations: EcosystemStation[] = [...systemStations, ...clientStations];

export const ecosystemWorkflows: EcosystemWorkflow[] = [
  {
    id: "case-sync-workflow",
    name: "Copy CommCare cases to the data warehouse",
    project: "Project B",
    trigger: "webhook",
    triggerDetail: "When a CommCare case is updated",
    state: "live",
    stations: ["commcare", "google-sheets"],
    runsPerDay: 320,
    successRate: 0.99,
    failsAt: 1,
    failureReason: "Sheet is protected",
    color: "sky",
  },
  {
    id: "chw-referral-workflow",
    name: "Send CHW referrals to DHIS2 Tracker",
    project: "Malawi CHW Referrals",
    trigger: "webhook",
    triggerDetail: "When a CHW creates a referral in CommCare",
    state: "live",
    stations: ["commcare", "dhis2"],
    runsPerDay: 180,
    successRate: 0.97,
    failsAt: 1,
    failureReason: "Org unit not found",
    color: "indigo",
  },
  {
    id: "referral-followup-workflow",
    name: "Send referral follow-ups to CommCare",
    project: "Malawi CHW Referrals",
    trigger: "cron",
    triggerDetail: "Every hour",
    state: "live",
    stations: ["dhis2", "commcare"],
    runsPerDay: 24,
    successRate: 1,
    color: "teal",
  },
  {
    id: "monthly-aggregate-workflow",
    name: "Report district monthly totals",
    project: "Malawi CHW Referrals",
    trigger: "cron",
    triggerDetail: "On the 1st of each month",
    state: "draft",
    stations: ["commcare", "dhis2"],
    runsPerDay: 0,
    successRate: 1,
    note: "Still a draft",
    color: "cyan",
  },
  {
    id: "client-dedup-workflow",
    name: "Look up a client's national ID",
    project: "Malawi CHW Referrals",
    trigger: "webhook",
    triggerDetail: "When a referral names a new client",
    state: "live",
    stations: ["commcare", "national-id", "openmrs"],
    runsPerDay: 70,
    successRate: 0.95,
    failsAt: 1,
    failureReason: "No match in the population register",
    color: "violet",
  },
  {
    id: "register-case-workflow",
    name: "Register a suspected case",
    project: "Case-based surveillance",
    trigger: "webhook",
    triggerDetail: "When the district health office calls the service over X-Road",
    state: "live",
    stations: ["ndho", "national-id", "openmrs"],
    runsPerDay: 25,
    successRate: 0.84,
    failsAt: 1,
    failureReason: "National ID service timed out",
    color: "pink",
  },
  {
    id: "weekly-case-report-workflow",
    name: "Send weekly case totals to DHIS2",
    project: "Case-based surveillance",
    trigger: "cron",
    triggerDetail: "Every Monday at 06:00",
    state: "live",
    stations: ["openmrs", "dhis2"],
    runsPerDay: 1 / 7,
    successRate: 1,
    color: "orange",
  },
  {
    id: "lab-results-workflow",
    name: "Attach lab results to patient records",
    project: "Case-based surveillance",
    trigger: "kafka",
    triggerDetail: "When the FHIR server publishes a DiagnosticReport",
    state: "live",
    stations: ["fhir", "openmrs"],
    runsPerDay: 55,
    successRate: 0.98,
    failsAt: 1,
    failureReason: "Patient not found",
    color: "emerald",
  },
  {
    id: "apply-national-id",
    name: "Apply for a national ID",
    project: "Civil registration",
    trigger: "webhook",
    triggerDetail: "When OpenCRVS registers a birth",
    state: "live",
    stations: ["opencrvs", "national-id"],
    runsPerDay: 90,
    successRate: 0.93,
    failsAt: 1,
    failureReason: "Duplicate application",
    color: "amber",
  },
  {
    id: "survey-contacts-workflow",
    name: "Sync survey contacts to Salesforce",
    project: "Project A",
    trigger: "cron",
    triggerDetail: "Every night at 02:00",
    state: "live",
    stations: ["kobo-toolbox", "salesforce"],
    runsPerDay: 1,
    successRate: 1,
    color: "fuchsia",
  },
  {
    id: "fee-waiver-workflow",
    name: "Check fee waivers against the social registry",
    project: "Case-based surveillance",
    trigger: "webhook",
    triggerDetail: "When OpenMRS opens a billing encounter",
    state: "draft",
    stations: ["openmrs", "social-registry"],
    runsPerDay: 0,
    successRate: 1,
    note: "Waiting on the X-Road agreement with the Ministry of Social Protection",
    color: "lime",
  },
];

/**
 * Corners for links that can't be a straight line, keyed by the link's id
 * (the two station ids, sorted and joined by "|"), given from the first
 * station in that order to the second.
 */
export const ecosystemRoutes: Record<string, { col: number; row: number }[]> = {
  "dhis2|openmrs": [
    { col: 2, row: 0 },
    { col: 7, row: 0 },
  ],
};
