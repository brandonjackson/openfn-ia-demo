import type { ProjectComponentType, ProjectSummary, SandboxItem } from "../page-data";

export interface ProjectService {
  id: string;
  name: string;
  description: string;
  status: "Live" | "Draft";
}

export interface ProjectComponent {
  id: string;
  name: string;
  description: string;
  type: ProjectComponentType;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  /** Environment shown on the project card (e.g. "production"). */
  environment: string;
  /** Human-readable time since the project last ran or changed. */
  lastActivity: string;
  memberCount: number;
  /** Sandboxes (branches) of this project. The first is always "main". */
  sandboxes: string[];
  services: ProjectService[];
  components: ProjectComponent[];
}

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
        name: "Planning Application Intake",
        description:
          "Receives planning applications from the e-planning portal and routes them to the local authority case management system.",
        status: "Live",
      },
      {
        id: "decision-status-sync",
        name: "Decision Status Sync",
        description:
          "Syncs planning decision statuses back to the applicant portal on a daily schedule.",
        status: "Draft",
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
        name: "CommCare Case Sync",
        description:
          "Syncs case data from CommCare to the shared data warehouse.",
        status: "Live",
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
        name: "CHW Referral Sync",
        description: "Pushes CommCare referrals into DHIS2 Tracker every 15 minutes.",
        status: "Live",
      },
      {
        id: "client-registry-lookup",
        name: "Client Registry Lookup",
        description: "Matches incoming patients against the national client registry.",
        status: "Live",
      },
      {
        id: "district-monthly-report",
        name: "District Monthly Report",
        description: "Aggregates referral outcomes into a monthly district report.",
        status: "Draft",
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

/** Card-sized summary of a project, used by the Projects list. */
export function summarizeProject(project: Project): ProjectSummary {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    environment: project.environment,
    lastActivity: project.lastActivity,
    memberCount: project.memberCount,
    workflowCount: project.components.filter((c) => c.type === "Workflow").length,
    serviceCount: project.services.length,
    liveServiceCount: project.services.filter((s) => s.status === "Live").length,
  };
}

export const projectSummaries: ProjectSummary[] = projects.map(summarizeProject);

/** The projects the current user opened most recently, newest first. */
export const recentProjects: Project[] = [
  "malawi-chw-referrals",
  "project-a",
  "project-b",
  "data-quality-checks",
]
  .map((id) => projects.find((p) => p.id === id))
  .filter((p): p is Project => p !== undefined);

/** Details for each sandbox shown on a project's Sandboxes list. */
const sandboxDetails: Record<string, Omit<SandboxItem, "name" | "isMain">> = {
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

/** A project's sandboxes with their details, "main" first. */
export function projectSandboxes(project: Project): SandboxItem[] {
  return project.sandboxes.map((name) =>
    name === "main"
      ? {
          name,
          isMain: true,
          description: "The live version of this project. Sandboxes merge back into main.",
          createdBy: "Project owner",
          lastActivity: project.lastActivity,
        }
      : {
          name,
          isMain: false,
          ...(sandboxDetails[name] ?? {
            description: "",
            createdBy: "Unknown",
            lastActivity: "Never",
          }),
        }
  );
}
