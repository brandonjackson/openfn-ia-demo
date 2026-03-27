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
  },
  {
    id: "connected-systems",
    label: "Connected Systems",
    description: "Browse and manage all connected external systems.",
    filters: [{ label: "Visibility", options: ["Available", "Shared", "Private"] }],
    children: [
      {
        id: "connected-system",
        label: "Connected System",
        description: "View details of a specific connected system.",
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
        id: "opencrvs",
        label: "OpenCRVS",
        description:
          "Civil registration platform for recording births and deaths.",
        children: [
          {
            id: "opencrvs-channels",
            label: "Channels",
            description: "Channels exposed by the OpenCRVS integration.",
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
    description:
      "An example project with services and reusable components.",
    children: [
      {
        id: "services",
        label: "Services",
        description: "Published services built from project components.",
        children: [
          {
            id: "crvs-birth-registration",
            label: "CRVS Birth Registration",
            badges: ["Live"],
            description:
              "Registers births from OpenCRVS and syncs records to the national CRVS database.",
            linkedFrom: "/service-builder",
          },
          {
            id: "dhis2-facility-sync",
            label: "DHIS2 Facility Data Sync",
            badges: ["Draft"],
            description:
              "Syncs facility-level health data to DHIS2 on a nightly schedule.",
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
            id: "birth-registration-workflow",
            label: "birth-registration-workflow",
            description: "Workflow that maps and routes birth notification data.",
            badges: ["Workflow"],
          },
          {
            id: "facility-sync-workflow",
            label: "facility-sync-workflow",
            description: "Scheduled workflow for syncing facility data to DHIS2.",
            badges: ["Workflow"],
          },
          {
            id: "birth-field-mapping",
            label: "birth-field-mapping.json",
            description: "Maps OpenCRVS birth fields to national CRVS schema.",
            badges: ["Artifact"],
          },
          {
            id: "facility-registration-form",
            label: "facility-registration-form",
            description: "Kobo form for collecting facility registration data.",
            badges: ["Form"],
          },
          {
            id: "facility-codes",
            label: "facility-codes",
            description: "Lookup table of facility codes and names.",
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
