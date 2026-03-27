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
  type: "Workflow" | "Form" | "Artifact" | "Collection";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  services: ProjectService[];
  components: ProjectComponent[];
}

export const projects: Project[] = [
  {
    id: "project-a",
    name: "Project A",
    description:
      "Automates the intake and routing of planning applications from the e-planning portal to local authority case management systems.",
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
        id: "case-mapping",
        name: "case-mapping.json",
        description:
          "Field mapping from CommCare cases to warehouse schema.",
        type: "Artifact",
      },
    ],
  },
];
