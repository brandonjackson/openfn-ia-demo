import type { SandboxItem } from "../model/sandboxes";
import type { WorkflowListItem } from "../model/workflow-list";
import { isoAgo } from "../model/time";
import { isCallableFromStep, type StepService } from "../model/services";
import { seedId } from "./ids";
import type { Project, ProjectService, ProjectSummary } from "../model/projects";

export const projects: Project[] = [
  {
    id: "project-a",
    name: "Project A",
    description:
      "Automates the intake and routing of planning applications from the e-planning portal to local authority case management systems.",
    environment: "production",
    lastActivity: "12 minutes ago",
    memberCount: 4,
    sandboxes: ["main", "intake-validation-v2", "decision-sync-fix"],
    services: [
      {
        id: "planning-application-intake",
        name: "Submit a planning application",
        description:
          "Receives planning applications from the e-planning portal and routes them to the local authority case management system.",
        status: "Live",
        mcpEnabled: true,
        usage: { organisations: 2, calls30d: 412, trend: [9, 14, 11, 16, 12, 15, 18] },
        record: {
          owner: "Department of Planning",
          purpose: "Get every planning application to the right local authority without re-keying it.",
          dataExchanged: "Application reference, applicant contact details, site address, proposal and plans.",
          legalBasis: "Town and Country Planning Act 2017, s.22 (electronic applications)",
          classification: "Internal",
          sla: "99% monthly uptime",
          version: "1.4",
          accessConditions: "Open to local authorities and the e-planning portal.",
        },
        workflowId: "planning-application-workflow",
        api: {
          trigger: "webhook",
          invocation: "POST https://app.openfn.org/i/project-a/planning-application-intake",
          auth: "API key in the x-api-key header",
          inputFields: [
            { name: "applicationRef", type: "string", required: true, description: "Reference issued by the e-planning portal." },
            { name: "applicant", type: "object", required: true, description: "Applicant name, email and postal address." },
            { name: "siteAddress", type: "string", required: true, description: "Address of the site the application covers." },
            { name: "proposal", type: "string", required: true, description: "Short description of the proposed development." },
            { name: "documents", type: "string[]", required: false, description: "URLs of supporting plans and drawings." },
          ],
          requestExample: `curl -X POST https://app.openfn.org/i/project-a/planning-application-intake \\
  -H "x-api-key: $OPENFN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "applicationRef": "EP-2026-04417",
    "applicant": { "name": "A. Mensah", "email": "a.mensah@example.org" },
    "siteAddress": "14 Harbour Road",
    "proposal": "Single-storey rear extension"
  }'`,
          outputDescription: "Returns the work order ID straight away; the case is created in the local authority's case management system a few seconds later.",
          outputExample: `{
  "workOrderId": "wo_8f2c1e",
  "status": "accepted"
}`,
        },
      },
      {
        id: "decision-status-sync",
        name: "Send decision statuses to applicants",
        description:
          "Syncs planning decision statuses back to the applicant portal on a daily schedule.",
        status: "Draft",
        workflowId: "decision-notification-workflow",
      },
    ],
    components: [
      {
        id: "planning-application-workflow",
        name: "planning-application-workflow",
        description:
          "Workflow that validates and routes incoming planning application data.",
        type: "Workflow",
      },
      {
        id: "decision-notification-workflow",
        name: "decision-notification-workflow",
        description:
          "Scheduled workflow for syncing decision statuses back to the applicant portal.",
        type: "Workflow",
      },
      {
        id: "hardship-grant-workflow",
        name: "hardship-grant-workflow",
        description: "Checks a hardship grant application in the social registry, has a district officer approve it, and pays it by mobile money.",
        type: "Workflow",
      },
      {
        id: "eplanning-submission-received",
        name: "eplanning-submission-received",
        description: "Fires when a new application is submitted on the e-planning portal.",
        type: "Channel",
      },
      {
        id: "case-management-create-case",
        name: "case-management-create-case",
        description: "Opens a case in the local authority case management system.",
        type: "Channel",
      },
      {
        id: "application-field-mapping",
        name: "application-field-mapping.json",
        description:
          "Maps e-planning portal fields to the local authority case management schema.",
        type: "Artifact",
      },
      {
        id: "planning-submission-form",
        name: "planning-submission-form",
        description:
          "Kobo form for collecting supporting information for planning applications.",
        type: "Form",
      },
      {
        id: "planning-authority-codes",
        name: "planning-authority-codes",
        description:
          "Lookup table of planning authority codes and jurisdictions.",
        type: "Collection",
      },
      {
        id: "planning-officer-guide",
        name: "planning-officer-guide",
        description: "How planning officers handle an application from submission to decision.",
        type: "Document",
      },
      {
        id: "triage-planning-applications",
        name: "triage-planning-applications",
        description: "Lets the assistant sort new applications by type and urgency before they're routed.",
        type: "AI Skill",
      },
      {
        id: "application-status-site",
        name: "application-status-site",
        description: "A public page where applicants check where their application has got to.",
        type: "Static Website",
      },
    ],
  },
  {
    id: "project-b",
    name: "Project B",
    description: "Another integration project.",
    environment: "production",
    lastActivity: "2 hours ago",
    memberCount: 2,
    sandboxes: ["main", "warehouse-schema-update"],
    services: [
      {
        id: "commcare-case-sync",
        name: "Copy CommCare cases to the data warehouse",
        description:
          "Syncs case data from CommCare to the shared data warehouse.",
        status: "Live",
        usage: { organisations: 1, calls30d: 6420, trend: [180, 220, 205, 240, 230, 210, 250] },
        workflowId: "case-sync-workflow",
        api: {
          trigger: "webhook",
          invocation: "POST https://app.openfn.org/i/project-b/commcare-case-sync",
          auth: "CommCare data forwarding, signed with a shared secret",
          inputFields: [
            { name: "case_id", type: "string", required: true, description: "CommCare case ID." },
            { name: "case_type", type: "string", required: true, description: "CommCare case type, e.g. household." },
            { name: "properties", type: "object", required: true, description: "Case properties to copy to the warehouse." },
          ],
          requestExample: `curl -X POST https://app.openfn.org/i/project-b/commcare-case-sync \\
  -H "Content-Type: application/json" \\
  -d '{ "case_id": "a1b2c3", "case_type": "household", "properties": { "district": "Lilongwe" } }'`,
          outputDescription: "Upserts one row per case into the shared data warehouse.",
          outputExample: `{
  "workOrderId": "wo_31d9aa",
  "status": "accepted"
}`,
        },
      },
    ],
    components: [
      {
        id: "case-sync-workflow",
        name: "case-sync-workflow",
        description:
          "Workflow for processing CommCare case updates.",
        type: "Workflow",
      },
      {
        id: "commcare-case-updated",
        name: "commcare-case-updated",
        description: "Fires when a case is created or updated in CommCare.",
        type: "Channel",
      },
      {
        id: "case-mapping",
        name: "case-mapping.json",
        description:
          "Field mapping from CommCare cases to warehouse schema.",
        type: "Artifact",
      },
    ],
  },
  {
    // Stress test: a long name and description, and lots of components.
    id: "malawi-chw-referrals",
    name: "Malawi Community Health Worker Referrals to National HMIS (DHIS2 Tracker)",
    description:
      "Collects household visit and referral data from community health workers in CommCare, de-duplicates patients against the national client registry, and pushes tracked entity enrolments and events into the national DHIS2 Tracker instance for district and national reporting.",
    environment: "staging",
    lastActivity: "3 days ago",
    memberCount: 11,
    sandboxes: ["main", "dhis2-41-upgrade", "dedup-tuning", "district-report-pilot"],
    services: [
      {
        id: "chw-referral-sync",
        name: "Send CHW referrals to DHIS2 Tracker",
        description: "Pushes CommCare referrals into DHIS2 Tracker every 15 minutes.",
        status: "Live",
        workflowId: "chw-referral-workflow",
        api: {
          trigger: "schedule",
          invocation: "Every 15 minutes",
          outputDescription: "Creates a DHIS2 Tracker enrolment and referral event for each new CommCare referral since the last run.",
          outputExample: `{
  "trackedEntity": "PQfMcpmXeFE",
  "program": "chw-referrals",
  "enrollment": "nQ7ULa0aR2A",
  "events": [{ "programStage": "referral", "status": "ACTIVE" }]
}`,
        },
      },
      {
        id: "client-registry-lookup",
        name: "Look up a client's national ID",
        description: "Matches incoming patients against the national client registry.",
        status: "Live",
        mcpEnabled: true,
        usage: { organisations: 3, calls30d: 2310, trend: [62, 70, 81, 77, 90, 84, 96] },
        record: {
          owner: "Ministry of Health",
          purpose: "Give each patient one national ID across community and facility records.",
          dataExchanged: "Sent: name, date of birth, district. Returned: national ID and match confidence.",
          legalBasis: "Health Records Regulations 2021, reg. 9 (continuity of care)",
          classification: "Confidential",
          sla: "99.5% monthly uptime; answers within 3 seconds",
          version: "2.0",
          accessConditions: "Health sector programmes, once registered with the HMIS team.",
        },
        workflowId: "client-dedup-workflow",
        api: {
          trigger: "webhook",
          invocation: "POST https://app.openfn.org/i/malawi-chw-referrals/client-registry-lookup",
          auth: "API key in the x-api-key header",
          inputFields: [
            { name: "givenName", type: "string", required: true, description: "Patient's given name." },
            { name: "familyName", type: "string", required: true, description: "Patient's family name." },
            { name: "dateOfBirth", type: "string", required: true, description: "Date of birth, YYYY-MM-DD." },
            { name: "district", type: "string", required: false, description: "Home district, to narrow the match." },
          ],
          requestExample: `curl -X POST https://app.openfn.org/i/malawi-chw-referrals/client-registry-lookup \\
  -H "x-api-key: $OPENFN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "givenName": "Chikondi", "familyName": "Banda", "dateOfBirth": "2019-03-02", "district": "Lilongwe" }'`,
          outputDescription: "Returns the best match from the national client registry, with a confidence score.",
          outputExample: `{
  "match": true,
  "nationalId": "MW-0042-7781",
  "confidence": 0.94
}`,
        },
      },
      {
        id: "district-monthly-report",
        name: "Report district monthly totals",
        description: "Aggregates referral outcomes into a monthly district report.",
        status: "Draft",
        workflowId: "monthly-aggregate-workflow",
      },
    ],
    components: [
      {
        id: "chw-referral-workflow",
        name: "chw-referral-workflow",
        description: "Pulls new CommCare referrals and creates DHIS2 Tracker enrolments.",
        type: "Workflow",
      },
      {
        id: "client-dedup-workflow",
        name: "client-dedup-workflow",
        description: "De-duplicates patients against the national client registry.",
        type: "Workflow",
      },
      {
        id: "referral-followup-workflow",
        name: "referral-followup-workflow",
        description: "Sends follow-up events back to CommCare when a referral is closed.",
        type: "Workflow",
      },
      {
        id: "monthly-aggregate-workflow",
        name: "monthly-aggregate-workflow",
        description: "Builds monthly aggregate data values for district reporting.",
        type: "Workflow",
      },
      {
        id: "commcare-referral-created",
        name: "commcare-referral-created",
        description: "Fires when a community health worker logs a referral.",
        type: "Channel",
      },
      {
        id: "dhis2-enrol-tracked-entity",
        name: "dhis2-enrol-tracked-entity",
        description: "Creates a DHIS2 Tracker enrolment for a referred patient.",
        type: "Channel",
      },
      {
        id: "client-registry-search",
        name: "client-registry-search",
        description: "Looks up a patient in the national client registry.",
        type: "Channel",
      },
      {
        id: "commcare-dhis2-mapping",
        name: "commcare-to-dhis2-tracker-mapping.json",
        description: "Maps CommCare case properties to DHIS2 tracked entity attributes.",
        type: "Artifact",
      },
      {
        id: "district-org-units",
        name: "district-org-units",
        description: "Lookup of DHIS2 organisation units by district and facility.",
        type: "Collection",
      },
    ],
  },
  {
    id: "case-surveillance",
    name: "Case-based surveillance",
    description:
      "Takes reports of suspected notifiable disease cases from facilities over X-Road, checks each patient's national ID and hospital record, and sends weekly counts to the national DHIS2.",
    environment: "production",
    lastActivity: "18 minutes ago",
    memberCount: 3,
    sandboxes: ["main"],
    services: [
      {
        id: "register-suspected-case",
        name: "Register a suspected case",
        description:
          "Records a suspected case of a notifiable disease reported by a facility, after checking the patient's national ID and finding or registering them in the hospital's OpenMRS.",
        status: "Live",
        workflowId: "register-case-workflow",
        mcpEnabled: false,
        usage: { organisations: 4, calls30d: 1284, trend: [31, 38, 35, 44, 52, 47, 58] },
        xroad: { serviceCode: "register-case", published: true, clients: ["FJ/GOV/NRH/OPENMRS", "FJ/GOV/NDHO/SURVEILLANCE"] },
        record: {
          owner: "Ministry of Health",
          purpose: "Find outbreaks early by recording every suspected case of a notifiable disease the day it's seen.",
          dataExchanged: "Sent: disease, onset date, reporting facility and the patient's national ID, name, sex and date of birth. Returned: case ID.",
          legalBasis: "Public Health Act 2015, s.41 (notifiable diseases)",
          classification: "Restricted",
          sla: "99.9% monthly uptime; accepts a report within 1 second",
          version: "1.2",
          accessConditions: "Health facilities and district health offices on X-Road, granted per subsystem by the surveillance unit.",
        },
        api: {
          trigger: "webhook",
          invocation: "POST https://app.openfn.org/i/case-surveillance/register-suspected-case",
          auth: "Over X-Road as FJ/GOV/MOH/OPENFN/register-case, or an API key in the x-api-key header",
          inputFields: [
            { name: "disease", type: "string", required: true, description: "The suspected disease, as an ICD-11 code." },
            { name: "onsetDate", type: "string", required: true, description: "When symptoms started, YYYY-MM-DD." },
            { name: "facility", type: "string", required: true, description: "The reporting facility's code." },
            { name: "patient", type: "object", required: true, description: "National ID, given and family name, sex and date of birth." },
          ],
          requestExample: `curl -X POST https://ss1.nrh.gov.fj/r1/FJ/GOV/MOH/OPENFN/register-case \\
  -H "X-Road-Client: FJ/GOV/NRH/OPENMRS" \\
  -H "X-Road-UserId: FJ-HW-20431" \\
  -H "Content-Type: application/json" \\
  -d '{
    "disease": "1D47",
    "onsetDate": "2026-10-18",
    "facility": "NRH-OPD",
    "patient": { "nationalId": "FJ-1990-004417", "givenName": "Chisomo", "familyName": "Phiri", "sex": "F", "dateOfBirth": "1990-06-11" }
  }'`,
          outputDescription: "Returns the case ID straight away; the patient checks run in the background.",
          outputExample: `{
  "workOrderId": "wo_c4e18a",
  "caseId": "CASE-2026-1182",
  "status": "accepted"
}`,
        },
      },
    ],
    components: [
      {
        id: "register-case-workflow",
        name: "register-case-workflow",
        description: "Checks the caller, verifies the patient's national ID and finds or registers them in OpenMRS.",
        type: "Workflow",
      },
      {
        id: "weekly-case-report-workflow",
        name: "weekly-case-report-workflow",
        description: "Counts last week's suspected cases by district and sends the totals to DHIS2.",
        type: "Workflow",
      },
      {
        id: "suspected-cases",
        name: "suspected-cases",
        description: "Every suspected case registered, keyed by case ID.",
        type: "Collection",
      },
    ],
  },
  {
    // Stress test: a brand new project with nothing in it yet.
    id: "data-quality-checks",
    name: "Data Quality Checks",
    description: "",
    environment: "development",
    lastActivity: "Never",
    memberCount: 1,
    sandboxes: ["main"],
    services: [],
    components: [],
  },
];

/** A fixture project's card, for stories. */
function summarizeProject(project: Project): ProjectSummary {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    environment: project.environment,
    lastActivity: isoAgo(project.lastActivity),
    memberCount: project.memberCount,
    workflowCount: project.components.filter((c) => c.type === "Workflow").length,
    serviceCount: project.services.length,
    liveServiceCount: project.services.filter((s) => s.status === "Live").length,
  };
}

export const projectSummaries: ProjectSummary[] = projects.map(summarizeProject);

/** The projects the current user opened most recently, newest first. */
export const recentProjects: Project[] = [
  "case-surveillance",
  "malawi-chw-referrals",
  "project-a",
  "project-b",
  "data-quality-checks",
]
  .map((id) => projects.find((p) => p.id === id))
  .filter((p): p is Project => p !== undefined);

/** Details for each sandbox shown on a project's Sandboxes list. */
/** A sandbox as the fixtures record it: its last activity in words ("2 days ago"), as the fake server seeds it. */
export type SandboxRecord = Omit<SandboxItem, "lastActivity"> & { lastActivity: string };

const sandboxDetails: Record<string, Pick<SandboxRecord, "description" | "createdBy" | "lastActivity">> = {
  "intake-validation-v2": {
    description: "Stricter validation of incoming planning applications before routing.",
    createdBy: "Amara Okafor",
    lastActivity: "25 minutes ago",
  },
  "decision-sync-fix": {
    description: "Fixes duplicate decision updates sent back to the applicant portal.",
    createdBy: "Brandon Jackson",
    lastActivity: "2 days ago",
  },
  "warehouse-schema-update": {
    description: "Maps CommCare cases onto the new warehouse schema.",
    createdBy: "Lucas Ferreira",
    lastActivity: "5 hours ago",
  },
  "dhis2-41-upgrade": {
    description: "Updates Tracker enrolment payloads for DHIS2 2.41.",
    createdBy: "Grace Banda",
    lastActivity: "1 day ago",
  },
  "dedup-tuning": {
    description: "Tightens the client registry match threshold to cut duplicate patients.",
    createdBy: "Chikondi Phiri",
    lastActivity: "4 days ago",
  },
  "district-report-pilot": {
    description: "Pilots the monthly district report with two districts.",
    createdBy: "Brandon Jackson",
    lastActivity: "1 week ago",
  },
};

const sandboxColors: SandboxItem["color"][] = ["green", "pink", "yellow", "indigo", "red"];

/**
 * A project's sandboxes with their details, "main" first, as the fake server
 * seeds them. Each sandbox was made from main and has changed one of the
 * project's workflows (the second also another, which main has changed
 * since), with a credential of its own.
 */
export function projectSandboxRecords(project: Project): SandboxRecord[] {
  const workflows = project.components.filter((c) => c.type === "Workflow");
  return project.sandboxes.map((name, i) =>
    name === "main"
      ? {
          name,
          isMain: true,
          description: "The live version of this project. Sandboxes merge back into main.",
          createdBy: "Project owner",
          lastActivity: project.lastActivity,
          color: "gray",
          changes: [],
          credentials: [],
        }
      : {
          name,
          isMain: false,
          ...(sandboxDetails[name] ?? {
            description: "",
            createdBy: "Unknown",
            lastActivity: "Never",
          }),
          color: sandboxColors[(i - 1) % sandboxColors.length],
          parent: "main",
          changes: workflows.slice(0, i === 2 ? 2 : 1).map((w, j) => ({ workflowId: w.id, workflowName: w.name, diverged: j === 1 })),
          credentials: [`${name} test credential`],
        }
  );
}

/** A project's sandboxes as the Sandboxes page takes them, for stories: last activity as a timestamp. */
export function projectSandboxes(project: Project): SandboxItem[] {
  return projectSandboxRecords(project).map((s) => ({ ...s, lastActivity: isoAgo(s.lastActivity) }));
}

/**
 * The published service a workflow backs, if any, with the path to its
 * listing and the URL that starts it (webhook services only).
 */
export function serviceForWorkflow(
  workflowId: string
): { project: Project; service: ProjectService; path: string; url?: string } | undefined {
  for (const project of projects) {
    const service = project.services.find((s) => s.workflowId === workflowId);
    if (service) {
      const url = service.api?.invocation.match(/https?:\/\/\S+/)?.[0];
      return { project, service, path: `/projects/${project.id}/services/${service.id}`, url };
    }
  }
  return undefined;
}

/** Every Live service a step can call, offered by its project, for stories of "Add a step". */
export const stepServices: StepService[] = projects.flatMap((p) =>
  p.services.filter(isCallableFromStep).map((s) => ({ ...s, offeredBy: p.name })),
);

/** A workflow on a project's Workflows list, before its run activity, which comes from its history. */
export type WorkflowDetails = Omit<WorkflowListItem, "latestRun" | "lastRunAt" | "workOrders" | "failedWorkOrders">;

/** Who edits each workflow, when it changed and how it's triggered. Its run counts come from its history (`projectWorkflowItems` in workflow-lookup). */
const workflowFacts: Record<string, Pick<WorkflowDetails, "members" | "updatedAt" | "enabled" | "triggerType">> = {
  "planning-application-workflow": {
    members: ["Amadou Diallo", "Jane Doe", "Beth Wilson", "John Smith", "Priya Nair", "Kofi Boateng", "Lena Okafor"],
    updatedAt: "2026-07-09T17:24:00Z",
    enabled: true,
    triggerType: "webhook",
  },
  "decision-notification-workflow": {
    members: ["Jane Doe", "Beth Wilson"],
    updatedAt: "2026-09-18T11:05:00Z",
    enabled: true,
    triggerType: "cron",
  },
  "case-sync-workflow": {
    members: ["John Smith", "Amadou Diallo", "Jane Doe"],
    updatedAt: "2026-10-02T14:30:00Z",
    enabled: true,
    triggerType: "webhook",
  },
  "chw-referral-workflow": {
    members: ["Amadou Diallo", "Priya Nair", "Kofi Boateng", "Jane Doe", "John Smith"],
    updatedAt: "2026-10-27T16:48:00Z",
    enabled: true,
    triggerType: "webhook",
  },
  "client-dedup-workflow": {
    members: ["Priya Nair"],
    updatedAt: "2026-08-14T09:20:00Z",
    enabled: true,
    triggerType: "cron",
  },
  "referral-followup-workflow": {
    members: ["Kofi Boateng", "Amadou Diallo"],
    updatedAt: "2026-10-21T12:10:00Z",
    enabled: false,
    triggerType: "cron",
  },
  "hardship-grant-workflow": {
    members: ["Jane Doe"],
    updatedAt: "2026-10-16T09:05:00Z",
    enabled: true,
    triggerType: "webhook",
  },
  "register-case-workflow": {
    members: ["Jane Doe", "Amadou Diallo"],
    updatedAt: "2026-10-15T10:40:00Z",
    enabled: true,
    triggerType: "webhook",
  },
  "weekly-case-report-workflow": {
    members: ["Jane Doe"],
    updatedAt: "2026-10-06T08:12:00Z",
    enabled: true,
    triggerType: "cron",
  },
  "monthly-aggregate-workflow": {
    members: ["Jane Doe"],
    updatedAt: "2026-10-29T15:55:00Z",
    enabled: false,
    triggerType: "cron",
  },
};

/** A project's workflows with whether each is published, their members and trigger. */
export function projectWorkflowDetails(project: Project): WorkflowDetails[] {
  return project.components
    .filter((c) => c.type === "Workflow")
    .map((c) => ({
      ...c,
      type: "Workflow" as const,
      published: project.services.some((s) => s.workflowId === c.id),
      ...(workflowFacts[c.id] ?? { members: [], updatedAt: "2026-01-01T00:00:00Z", enabled: false }),
    }));
}

/** Every project by id and name, for anything that offers a choice of project. */
export const projectOptions = projects.map((p) => ({ id: p.id, name: p.name }));

/**
 * The fixture project behind an id from the API (or still a fixture slug), for
 * the parts of a project that haven't moved to the API yet: its services,
 * components and sandboxes. Undefined for a project made on the API.
 */
export function fixtureProject(id: string | undefined): Project | undefined {
  if (!id) return undefined;
  return projects.find((p) => p.id === id || seedId("project", p.id) === id);
}

/** A fixture project's id on the API. */
export const apiProjectId = (slug: string) => seedId("project", slug);

/**
 * The fixture behind a workflow id from the API (or still a slug): its slug,
 * and its row on the workflows list (description, service status, members). Undefined for a workflow
 * made on the API.
 */
export function fixtureWorkflow(id: string | undefined): { slug: string; item?: WorkflowDetails } | undefined {
  if (!id) return undefined;
  for (const p of projects) {
    for (const item of projectWorkflowDetails(p)) {
      if (item.id === id || seedId("workflow", item.id) === id) return { slug: item.id, item };
    }
  }
  if (id === "apply-national-id" || seedId("workflow", "apply-national-id") === id) return { slug: "apply-national-id" };
  return undefined;
}
