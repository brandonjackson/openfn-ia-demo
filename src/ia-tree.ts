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
    ],
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
    id: "history",
    label: "History",
    description: "View historical work orders across all projects.",
    filters: [
      { label: "Project", options: ["All Projects", "Project A", "Project B"] },
      { label: "Status", options: ["All", "Success", "Failed", "Pending"] },
    ],
    children: [
      {
        id: "overview",
        label: "Overview",
        description: "High-level overview of system activity and history.",
      },
      {
        id: "all-channels",
        label: "All Channels",
        description: "View of all channels across projects.",
      },
      {
        id: "all-work-orders",
        label: "All Work Orders",
        description: "View of all work orders across projects.",
      },
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
      "An example project with services, work orders, and resources.",
    children: [
      {
        id: "service-live",
        label: "Service (Live)",
        badges: ["Live"],
        description: "The live, published version of this project's service.",
        linkedFrom: "/service-builder",
      },
      {
        id: "service-draft",
        label: "Service (Draft)",
        badges: ["Draft"],
        description:
          "The draft version of this project's service, not yet published.",
        linkedFrom: "/service-builder",
      },
      {
        id: "sandbox",
        label: "Project A (Sandbox)",
        description:
          "A sandboxed copy of this project for safe experimentation.",
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
      {
        id: "resources",
        label: "Resources",
        description:
          "Manage project resources including artifacts, skills, and collections.",
        children: [
          {
            id: "artifacts",
            label: "Artifacts",
            description: "Files and outputs produced by this project.",
          },
          {
            id: "skills",
            label: "Skills",
            description: "Reusable skills available to this project.",
          },
          {
            id: "collections",
            label: "Collections",
            description: "Data collections managed by this project.",
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
        id: "work-orders",
        label: "Work Orders",
        description: "View and manage work orders for this project.",
      },
      {
        id: "resources",
        label: "Resources",
        description: "Manage project resources.",
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
