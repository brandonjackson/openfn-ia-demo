export interface IANode {
  id: string;
  label: string;
  description?: string;
  badges?: string[];
  actions?: string[];
  children?: IANode[];
  linkedFrom?: string;
  /** Filter options for list views (e.g., Connected Systems, History) */
  filters?: { label: string; options: string[] }[];
  /** Determines which template renders this node. Defaults to "generic". */
  pageType?: "dashboard" | "list" | "detail" | "catalog" | "table" | "project" | "generic";
  /** When true, this node acts as a template that matches any sibling slug not found by exact ID */
  dynamic?: boolean;
}

/**
 * Main navigation items (shown at top of sidebar)
 */
export const mainNavTree: IANode[] = [
  {
    id: "overview",
    label: "Overview",
    description:
      "High-level dashboard showing system health, recent activity, and key metrics.",
    pageType: "dashboard",
  },
  {
    id: "connected-systems",
    label: "Connected Systems",
    description: "Browse and manage all connected external systems.",
    pageType: "list",
    filters: [{ label: "Visibility", options: ["Available", "Shared", "Private"] }],
    children: [
      {
        id: "connected-system",
        label: "Connected System",
        description: "View details of a specific connected system.",
        pageType: "detail",
        dynamic: true,
        actions: ["Edit", "Delete"],
        children: [
          {
            id: "channels",
            label: "Channels",
            description: "Channels associated with this connected system.",
          },
        ],
      },
      {
        id: "credentials",
        label: "Credentials",
        description: "View and manage credentials across the organization.",
        children: [
          {
            id: "org-credentials",
            label: "Org Credentials",
            description: "Organization-wide shared credentials.",
          },
          {
            id: "user-credentials",
            label: "User Credentials",
            description: "Credentials scoped to individual users.",
          },
        ],
      },
    ],
  },
  {
    id: "service-catalog",
    label: "Service Catalog",
    description: "Browse the catalog of published services.",
    pageType: "catalog",
    children: [
      {
        id: "live-services",
        label: "Live Services",
        description:
          "All live services published from projects across the organization.",
        linkedFrom: "/projects",
      },
      {
        id: "channels",
        label: "Channels",
        description:
          "Channels exposed by connected systems.",
        linkedFrom: "/connected-systems",
      },
    ],
  },
  {
    id: "history",
    label: "History",
    description: "View historical work orders and channel requests across all projects.",
    pageType: "table",
    filters: [
      { label: "Project", options: ["All Projects", "Project A", "Project B"] },
      { label: "Type", options: ["All", "Work Order", "Channel Request"] },
      { label: "Status", options: ["All", "Success", "Failed", "Pending"] },
    ],
  },
];

/**
 * Projects listed separately in the sidebar under a "Projects" heading
 */
export const projectsTree: IANode[] = [
  {
    id: "project-a",
    label: "Project A",
    pageType: "project",
    description:
      "Automates the intake and routing of planning applications from the e-planning portal to local authority case management systems.",
    children: [
      {
        id: "services",
        label: "Services",
        description: "Published services built from project components.",
        children: [
          {
            id: "planning-application-intake",
            label: "Planning Application Intake",
            badges: ["Live"],
            description:
              "Receives planning applications from the e-planning portal and routes them to the local authority case management system.",
            linkedFrom: "/service-builder",
          },
          {
            id: "decision-status-sync",
            label: "Decision Status Sync",
            badges: ["Draft"],
            description:
              "Syncs planning decision statuses back to the applicant portal on a daily schedule.",
            linkedFrom: "/service-builder",
          },
        ],
      },
      {
        id: "components",
        label: "Components",
        description: "Reusable building blocks — workflows, artifacts, forms, and collections.",
        children: [
          {
            id: "planning-application-workflow",
            label: "planning-application-workflow",
            description: "Workflow that validates and routes incoming planning application data.",
            badges: ["Workflow"],
          },
          {
            id: "decision-notification-workflow",
            label: "decision-notification-workflow",
            description: "Scheduled workflow for syncing decision statuses back to the applicant portal.",
            badges: ["Workflow"],
          },
          {
            id: "application-field-mapping",
            label: "application-field-mapping.json",
            description: "Maps e-planning portal fields to the local authority case management schema.",
            badges: ["Artifact"],
          },
          {
            id: "planning-submission-form",
            label: "planning-submission-form",
            description: "Kobo form for collecting supporting information for planning applications.",
            badges: ["Form"],
          },
          {
            id: "planning-authority-codes",
            label: "planning-authority-codes",
            description: "Lookup table of planning authority codes and jurisdictions.",
            badges: ["Collection"],
          },
        ],
      },
      {
        id: "work-orders",
        label: "Work Orders",
        description: "View and manage work orders for this project.",
        children: [
          {
            id: "runs",
            label: "Runs",
            description: "Execution runs triggered by work orders.",
          },
        ],
      },
    ],
  },
  {
    id: "project-b",
    label: "Project B",
    pageType: "project",
    description: "Another integration project.",
    children: [
      {
        id: "services",
        label: "Services",
        description: "Published services for this project.",
        children: [
          {
            id: "commcare-case-sync",
            label: "CommCare Case Sync",
            badges: ["Live"],
            description:
              "Syncs case data from CommCare to the shared data warehouse.",
          },
        ],
      },
      {
        id: "components",
        label: "Components",
        description: "Reusable building blocks for this project.",
        children: [
          {
            id: "case-sync-workflow",
            label: "case-sync-workflow",
            description: "Workflow for processing CommCare case updates.",
            badges: ["Workflow"],
          },
          {
            id: "case-mapping",
            label: "case-mapping.json",
            description: "Field mapping from CommCare cases to warehouse schema.",
            badges: ["Artifact"],
          },
        ],
      },
      {
        id: "work-orders",
        label: "Work Orders",
        description: "View and manage work orders for this project.",
      },
    ],
  },
];

/**
 * Service builder is accessed from within a project context
 */
export const serviceBuilderTree: IANode = {
  id: "service-builder",
  label: "Service Builder",
  description:
    "Design and configure services with specs, inputs, workflows, and outputs.",
  children: [
    {
      id: "spec",
      label: "Spec",
      description: "Define the service specification.",
      children: [
        {
          id: "input",
          label: "Input",
          description:
            "Configure the input schema and sources for the service.",
        },
        {
          id: "workflow-modules",
          label: "Workflow / Modules",
          description:
            "Design the workflow steps and modules that process data.",
        },
        {
          id: "output",
          label: "Output",
          description: "Define the output format and destinations.",
        },
      ],
    },
  ],
};

/**
 * Settings pages (accessed from sidebar footer)
 */
export const settingsTree: IANode[] = [
  {
    id: "user-settings",
    label: "User Settings",
    description: "Configure your personal account settings.",
    children: [
      {
        id: "profile",
        label: "Profile",
        description: "View and edit your user profile information.",
      },
    ],
  },
  {
    id: "org-settings",
    label: "Org Settings",
    description: "Configure organization-level settings.",
    children: [
      {
        id: "team-members",
        label: "Team / Members",
        description: "Manage team members and their roles.",
      },
      {
        id: "billing",
        label: "Billing",
        description:
          "View and manage billing, usage, and subscription details.",
      },
      {
        id: "project-settings",
        label: "Project Settings",
        description:
          "Configure settings for projects within the organization.",
        children: [
          {
            id: "members",
            label: "Members",
            description: "Manage project-level member access and roles.",
          },
          {
            id: "concurrency",
            label: "Concurrency",
            description: "Configure concurrency limits for project runs.",
          },
          {
            id: "data-retention",
            label: "Data Retention",
            description: "Set data retention policies for this project.",
          },
          {
            id: "webhooks",
            label: "Webhooks",
            description: "Configure webhook endpoints for this project.",
          },
          {
            id: "delete",
            label: "Delete",
            description: "Permanently delete this project.",
            actions: ["Delete"],
          },
        ],
      },
    ],
  },
];

/**
 * Combined tree for route resolution (all nodes flattened under their path prefixes)
 */
export const iaTree: IANode[] = [
  ...mainNavTree,
  {
    id: "projects",
    label: "Projects",
    description: "Manage your integration projects.",
    children: projectsTree,
  },
  serviceBuilderTree,
  ...settingsTree,
];
