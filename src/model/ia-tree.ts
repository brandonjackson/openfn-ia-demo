import type { FeatureFlags, FlagId } from "./feature-flags";

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
    | "component"
    | "user-settings"
    | "organization-settings"
    | "admin-settings"
    | "handbook"
    | "generic";
  /** When true, this node acts as a template that matches any sibling slug not found by exact ID */
  dynamic?: boolean;
  /** The feature flag this page belongs to. Off, the page and everything under it are gone. */
  flag?: FlagId;
  /** What the page is called when a flag is off, for a page that narrows rather than goes. */
  whenOff?: { flag: FlagId; label: string; description: string };
  /** Only superusers can reach the page and everything under it; for anyone else it doesn't exist. */
  superuserOnly?: boolean;
}

/**
 * What every page is handed besides its own actions: where it sits, and its
 * data. A page's wrapper (XPage.fixtures.tsx) fills these in; the page only
 * draws them.
 */
export interface PageProps<Data> {
  /** The page's place in the navigation: its title, description and the pages under it. */
  node: IANode;
  /** The pages above it, top first, for the breadcrumbs. */
  ancestors: { node: IANode; path: string }[];
  /** The URL being shown. */
  currentPath: string;
  /** Everything the page shows. Its shape is part of the page's contract, written beside the page as `XPageData` (older pages still keep theirs in model/page-data.ts). */
  data: Data;
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
        flag: "aiBuild",
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
        // Without components, the page lists channels only, as Lightning's Channels page does.
        whenOff: {
          flag: "components",
          label: "Channels",
          description: "Reads, writes and events on other systems, each with its own endpoint.",
        },
        description:
          "Every building block in this project, grouped by type: channels, forms, artifacts, collections, AI skills, documents and static websites.",
        pageType: "project-components",
        children: [
          {
            id: "component",
            label: "Component",
            // A channel's, collection's or other component's page.
            pageType: "component",
            dynamic: true,
          },
        ],
      },
      {
        id: "sandboxes",
        label: "Sandboxes",
        description:
          "Isolated copies of this project for trying out changes before promoting them back.",
        pageType: "project-sandboxes",
        actions: ["New sandbox"],
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
        flag: "deployments",
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
        flag: "serviceCatalog",
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
    flag: "organizations",
    label: "Overview",
    description:
      "What needs your attention and what's happened recently, with links into Status and Insights.",
    pageType: "dashboard",
  },
  {
    id: "handbook",
    flag: "handbook",
    label: "Handbook",
    description:
      "How this organization works: who you integrate with, the agreements behind each system, conventions, and the files that go with them.",
    pageType: "handbook",
  },
  {
    id: "connected-systems",
    flag: "connectedSystems",
    label: "Systems",
    description: "Browse and manage all connected external systems.",
    pageType: "list",
    filters: [{ label: "Access", options: ["All", "You have access", "No access"] }],
    children: [
      {
        id: "connected-system",
        label: "Connected system",
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
            label: "Org credentials",
            description: "Organization-wide shared credentials.",
          },
          {
            id: "user-credentials",
            label: "User credentials",
            description: "Credentials scoped to individual users.",
          },
        ],
      },
    ],
  },
  {
    id: "service-catalog",
    flag: "serviceCatalog",
    label: "Services",
    description: "Browse the catalog of published services and channels.",
    pageType: "catalog",
    children: [
      {
        id: "live-services",
        label: "Live services",
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
    flag: "organizations",
    label: "Status",
    description:
      "Right now: which systems and workflows are up, degraded, or failing.",
    pageType: "status",
  },
  {
    id: "insights",
    flag: "organizations",
    label: "Insights",
    description:
      "Trends over time: runs, errors, and how long things take, across every project.",
    pageType: "insights",
  },
  {
    id: "history",
    flag: "organizations",
    label: "History",
    description: "View historical work orders and channel requests across all projects.",
    pageType: "table",
  },
  {
    id: "projects",
    label: "Projects",
    description: "Every integration project in your organization.",
    whenOff: { flag: "organizations", label: "Projects", description: "Every integration project you're part of." },
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
  { label: "Organization", items: ["handbook", "connected-systems", "service-catalog"] },
  { label: "Monitoring", items: ["status", "insights", "history"] },
];

/**
 * Support pages, pinned to the bottom of the sidebar on every page.
 */
export const supportTree: IANode[] = [
  {
    id: "get-help",
    label: "Get help now",
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
    label: "User settings",
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
        label: "API tokens",
        description: "Personal access tokens for the OpenFn CLI and API.",
        pageType: "user-settings",
      },
    ],
  },
  {
    id: "organization-settings",
    flag: "organizations",
    label: "Organization settings",
    description: "Your organisation's name, who's in it, what others can see by default, the context it draws on, its identity on X-Road, and billing.",
    pageType: "organization-settings",
    children: [
      {
        id: "general",
        label: "General",
        description: "The organisation's name.",
        pageType: "organization-settings",
      },
      {
        id: "members",
        label: "Members",
        description: "Users in the organisation and their roles.",
        pageType: "organization-settings",
      },
      {
        id: "visibility",
        label: "Visibility",
        description: "Default discoverability and access for projects, systems and services.",
        pageType: "organization-settings",
      },
      {
        id: "context",
        label: "Context",
        description: "Context layers the organisation draws its handbook, systems and services from.",
        pageType: "organization-settings",
      },
      {
        id: "xroad",
        flag: "xroad",
        label: "X-Road",
        description: "Your organisation's X-Road identity: instance, member, subsystems, Security Servers and certificates.",
        pageType: "organization-settings",
      },
      {
        id: "billing",
        label: "Billing",
        description: "Your plan, usage this cycle and past invoices.",
        pageType: "organization-settings",
      },
    ],
  },
  {
    // Lightning's /settings area: the whole instance, across every organisation and project. Core, so no flag.
    id: "admin-settings",
    superuserOnly: true,
    label: "Admin settings",
    description: "Run the whole instance: every user and project, the audit trail, single sign-on, collections and maintenance.",
    pageType: "admin-settings",
    children: [
      {
        id: "users",
        label: "Users",
        description: "Every account on the instance: create, edit, disable and delete users, and who's a superuser.",
        pageType: "admin-settings",
      },
      {
        id: "projects",
        label: "Projects",
        description: "Every project on the instance, its owner and members, and scheduled deletions.",
        pageType: "admin-settings",
      },
      {
        id: "audit-trail",
        label: "Audit trail",
        description: "Who changed what across the instance, and when.",
        pageType: "admin-settings",
      },
      {
        id: "authentication",
        label: "Authentication",
        description: "Single sign-on through an OpenID Connect provider.",
        pageType: "admin-settings",
      },
      {
        id: "collections",
        label: "Collections",
        description: "Every collection, across all projects.",
        pageType: "admin-settings",
      },
      {
        id: "maintenance",
        label: "Maintenance",
        description: "Jobs that keep the instance up to date, such as refreshing the adaptor registry.",
        pageType: "admin-settings",
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

/** The tree without the pages whose feature flag is off, and renamed where a flag narrows a page. */
export function visibleTree(tree: IANode[], flags: FeatureFlags): IANode[] {
  return tree
    .filter((n) => !n.flag || flags[n.flag])
    .map((n) => {
      const named = n.whenOff && !flags[n.whenOff.flag] ? { ...n, label: n.whenOff.label, description: n.whenOff.description } : n;
      return n.children ? { ...named, children: visibleTree(n.children, flags) } : named;
    });
}

/** The tree without the pages only superusers can reach, unless the viewer is one. */
export function treeForViewer(tree: IANode[], isSuperuser: boolean): IANode[] {
  if (isSuperuser) return tree;
  return tree
    .filter((n) => !n.superuserOnly)
    .map((n) => (n.children ? { ...n, children: treeForViewer(n.children, isSuperuser) } : n));
}

/** The sidebar's groups, without the pages whose flag is off, and without groups left empty. */
export function visibleNavGroups(flags: FeatureFlags): NavGroup[] {
  const shown = new Set(visibleTree(mainNavTree, flags).map((n) => n.id));
  return mainNavGroups
    .map((g) => ({ ...g, items: g.items.filter((id) => shown.has(id)) }))
    .filter((g) => g.items.length > 0);
}
