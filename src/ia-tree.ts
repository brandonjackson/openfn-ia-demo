export interface IANode {
  id: string;
  label: string;
  description?: string;
  badges?: string[];
  actions?: string[];
  children?: IANode[];
  linkedFrom?: string;
}

export const iaTree: IANode[] = [
  {
    id: "system-observability",
    label: "System Observability",
    description: "Monitor system health, channels, and connected systems.",
    children: [
      {
        id: "channels",
        label: "Channels",
        description: "View and manage communication channels.",
        actions: ["Edit", "Delete"],
      },
    ],
  },
  {
    id: "connected-systems",
    label: "Connected Systems",
    badges: ["Aggregation"],
    description: "Browse and manage all connected external systems.",
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
          {
            id: "edit",
            label: "Edit",
            description: "Edit this connected system's configuration.",
          },
          {
            id: "delete",
            label: "Delete",
            description: "Delete this connected system.",
          },
        ],
      },
      {
        id: "credentials",
        label: "Aggregation of Credentials",
        badges: ["Aggregation"],
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
    description: "View historical data across all projects.",
    children: [
      {
        id: "overview",
        label: "Overview",
        description: "High-level overview of system activity and history.",
      },
      {
        id: "all-channels",
        label: "Aggregation of All Channels",
        badges: ["Aggregation"],
        description: "Aggregated view of all channels across projects.",
      },
      {
        id: "all-work-orders",
        label: "Aggregation of All Work Orders",
        badges: ["Aggregation"],
        description: "Aggregated view of all work orders across projects.",
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
        label: "Aggregation of Live Services",
        badges: ["Aggregation"],
        description:
          "All live services published from projects across the organization.",
        linkedFrom: "/projects",
      },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    description: "Manage your integration projects.",
    children: [
      {
        id: "project-a",
        label: "Project A",
        description: "An example project with services, work orders, and resources.",
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
            description: "The draft version of this project's service, not yet published.",
            linkedFrom: "/service-builder",
          },
          {
            id: "sandbox",
            label: "Project A (Sandbox)",
            description: "A sandboxed copy of this project for safe experimentation.",
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
            description: "Manage project resources including artifacts, skills, and collections.",
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
    ],
  },
  {
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
            description: "Configure the input schema and sources for the service.",
          },
          {
            id: "workflow-modules",
            label: "Workflow / Modules",
            description: "Design the workflow steps and modules that process data.",
          },
          {
            id: "output",
            label: "Output",
            description: "Define the output format and destinations.",
          },
        ],
      },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    description: "View and manage billing, usage, and subscription details.",
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
        id: "project-settings",
        label: "Project Settings",
        description: "Configure settings for projects within the organization.",
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
];
