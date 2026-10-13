import { projects } from "./mock-data/projects";

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
  pageType?:
    | "dashboard"
    | "status"
    | "insights"
    | "list"
    | "detail"
    | "catalog"
    | "table"
    | "projects"
    | "project"
    | "project-workflows"
    | "project-components"
    | "project-create"
    | "project-sandboxes"
    | "project-settings"
    | "service"
    | "user-settings"
    | "instance-settings"
    | "handbook"
    | "generic";
  /** When true, this node acts as a template that matches any sibling slug not found by exact ID */
  dynamic?: boolean;
}

/**
 * Dynamic project template (matches any project slug under /projects/)
 */
export const projectTemplateTree: IANode[] = [
  {
    id: "project",
    label: "Project",
    pageType: "project",
    dynamic: true,
    children: [
      // Build
      {
        id: "create",
        label: "Create",
        description:
          "Start a new public service from an idea, drawing on every system, channel and service your organization already has.",
        pageType: "project-create",
      },
      {
        id: "workflows",
        label: "Workflows",
        description: "Every workflow in this project.",
        pageType: "project-workflows",
      },
      {
        id: "components",
        label: "Components",
        description:
          "Every building block in this project, grouped by type: channels, forms, artifacts, collections, AI skills, documents and static websites.",
        pageType: "project-components",
        children: [
          {
            id: "component",
            label: "Component",
            dynamic: true,
          },
        ],
      },
      {
        id: "sandboxes",
        label: "Sandboxes",
        description:
          "Isolated copies of this project for trying out changes before merging them back.",
        pageType: "project-sandboxes",
        actions: ["New Sandbox"],
      },
      // Maintain
      {
        id: "history",
        label: "History",
        description: "Work orders and channel requests for this project.",
        pageType: "table",
      },
      {
        id: "insights",
        label: "Insights",
        description: "Runs, errors and run times for this project over time.",
        pageType: "insights",
      },
      {
        id: "deployments",
        label: "Deployments",
        description:
          "What's running in production, when it was deployed, and from which sandbox.",
        actions: ["Deploy"],
      },
      {
        id: "settings",
        label: "Settings",
        description: "View and manage project settings.",
        pageType: "project-settings",
      },
      // Not in the project nav, but linked from the project Overview and Services.
      {
        id: "services",
        label: "Services",
        description: "Published services built from project components.",
        children: [
          {
            id: "service",
            label: "Service",
            description: "A published service's catalog entry: how to call it and what it returns.",
            pageType: "service",
            dynamic: true,
          },
        ],
      },
    ],
  },
];

/**
 * Instance-level pages. Every page reachable from the sidebar lives here; the
 * sidebar groups them (see {@link mainNavGroups}) but URLs stay flat.
 */
export const mainNavTree: IANode[] = [
  {
    id: "overview",
    label: "Overview",
    description:
      "What needs your attention and what's happened recently, with links into Status and Insights.",
    pageType: "dashboard",
  },
  {
    id: "handbook",
    label: "Handbook",
    description:
      "How this organization works: who you integrate with, the agreements behind each system, conventions, and the files that go with them.",
    pageType: "handbook",
  },
  {
    id: "connected-systems",
    label: "Systems",
    description: "Browse and manage all connected external systems.",
    pageType: "list",
    filters: [{ label: "Access", options: ["All", "I have access", "No access"] }],
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
    label: "Services",
    description: "Browse the catalog of published services and channels.",
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
    id: "status",
    label: "Status",
    description:
      "Right now: which systems and workflows are up, degraded, or failing.",
    pageType: "status",
  },
  {
    id: "insights",
    label: "Insights",
    description:
      "Trends over time: runs, errors, and how long things take, across every project.",
    pageType: "insights",
  },
  {
    id: "history",
    label: "History",
    description: "View historical work orders and channel requests across all projects.",
    pageType: "table",
    filters: [
      { label: "Project", options: ["All Projects", ...projects.map((p) => p.name)] },
      { label: "Type", options: ["All", "Work Order", "Channel Request"] },
      { label: "Status", options: ["All", "Success", "Failed", "Pending"] },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    description: "Every integration project in your organization.",
    pageType: "projects",
    children: projectTemplateTree,
  },
];

export interface NavGroup {
  /** Small grey section label. Omitted for the unlabelled top group. */
  label?: string;
  /** IDs of {@link mainNavTree} nodes, in display order. */
  items: string[];
}

/**
 * How the instance-level sidebar groups {@link mainNavTree}. Projects and
 * Support are rendered after these by the sidebar itself, since their
 * contents aren't plain IA nodes (recent projects, external links).
 */
export const mainNavGroups: NavGroup[] = [
  { items: ["overview"] },
  { label: "Context", items: ["handbook", "connected-systems", "service-catalog"] },
  { label: "Monitoring", items: ["status", "insights", "history"] },
];

/**
 * Support pages, pinned to the bottom of the sidebar on every page.
 */
export const supportTree: IANode[] = [
  {
    id: "get-help",
    label: "Get Help Now",
    description: "Talk to someone at OpenFn about a problem you're stuck on.",
  },
];

export const openfnDocsUrl = "https://docs.openfn.org";

/**
 * Settings pages (accessed from sidebar footer)
 */
export const settingsTree: IANode[] = [
  {
    id: "user-settings",
    label: "User Settings",
    description: "Configure your personal account settings.",
    pageType: "user-settings",
    children: [
      {
        id: "profile",
        label: "Profile",
        description: "View and edit your user profile information.",
        pageType: "user-settings",
      },
      {
        id: "credentials",
        label: "Credentials",
        description: "Credentials and OAuth clients you own.",
        pageType: "user-settings",
      },
      {
        id: "api-tokens",
        label: "API Tokens",
        description: "Personal access tokens for the OpenFn CLI and API.",
        pageType: "user-settings",
      },
    ],
  },
  {
    id: "instance-settings",
    label: "Instance Settings",
    description: "Manage who's in this instance, billing, and the context layers it draws on.",
    pageType: "instance-settings",
    children: [
      {
        id: "collaboration",
        label: "Collaboration",
        description: "Manage members of this instance and their roles.",
        pageType: "instance-settings",
      },
      {
        id: "billing",
        label: "Billing",
        description: "View and manage billing, usage, and subscription details.",
        pageType: "instance-settings",
      },
      {
        id: "context",
        label: "Context",
        description: "Context layers this instance draws its handbook, systems and services from.",
        pageType: "instance-settings",
      },
    ],
  },
];

/**
 * Combined tree for route resolution (all nodes flattened under their path prefixes)
 */
export const iaTree: IANode[] = [
  ...mainNavTree,
  ...supportTree,
  ...settingsTree,
];
