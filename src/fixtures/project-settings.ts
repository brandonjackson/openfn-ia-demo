import type {
  Collaborator,
  CollectionItem,
  DataStorageSettings,
  GitHubInstallation,
  GitHubSyncState,
  HistoryExport,
  ProjectCollection,
  ProjectSettingsPageData,
  WebhookAuthMethod,
  WebhookTriggerOption,
} from "../model/page-data";
import {
  assignableRoles,
  permissionsFor,
  removeBlockedReason,
  urlSafeName,
  type DigestFrequency,
  type ProjectRole,
} from "../model/project-settings";
import type { Project } from "../model/projects";
import { currentUser } from "./user";
import { orgCredentials } from "./connected-systems";

/*
 * What a server holds about a project's settings: its people, collections,
 * webhook auth methods, GitHub connection, data storage and history exports.
 * The settings page's wrapper copies these into state and changes its copy.
 */

/** Someone with an OpenFn account on this instance. */
export interface OpenFnUser {
  firstName: string;
  lastName: string;
  email: string;
}

/** Everyone with an OpenFn account, so adding a collaborator by email can find them. */
export const openFnUsers: OpenFnUser[] = [
  { firstName: currentUser.firstName, lastName: currentUser.lastName, email: currentUser.email },
  { firstName: "Amadou", lastName: "Diallo", email: "adiallo@example.org" },
  { firstName: "John", lastName: "Smith", email: "jsmith@example.org" },
  { firstName: "Beth", lastName: "Wilson", email: "bwilson@example.org" },
  { firstName: "Taylor", lastName: "Mensah", email: "tmensah@example.org" },
  { firstName: "Priya", lastName: "Natarajan", email: "pnatarajan@example.org" },
];

/** A person's membership of a project, as stored. */
export interface ProjectMembership {
  id: string;
  email: string;
  role: ProjectRole;
  failureAlert: boolean;
  digest: DigestFrequency;
}

const memberships: Record<string, ProjectMembership[]> = {
  "project-a": [
    { id: "pu-a-1", email: currentUser.email, role: "owner", failureAlert: true, digest: "weekly" },
    { id: "pu-a-2", email: "adiallo@example.org", role: "admin", failureAlert: true, digest: "daily" },
    { id: "pu-a-3", email: "jsmith@example.org", role: "editor", failureAlert: false, digest: "never" },
    { id: "pu-a-4", email: "bwilson@example.org", role: "viewer", failureAlert: false, digest: "monthly" },
  ],
  "project-b": [
    { id: "pu-b-1", email: "adiallo@example.org", role: "owner", failureAlert: true, digest: "never" },
    { id: "pu-b-2", email: currentUser.email, role: "admin", failureAlert: false, digest: "weekly" },
    { id: "pu-b-3", email: "tmensah@example.org", role: "editor", failureAlert: true, digest: "daily" },
  ],
};

/** A project's members; any project without its own list has just you, as owner. */
export function projectMemberships(projectId: string): ProjectMembership[] {
  return (
    memberships[projectId] ?? [
      { id: `pu-${projectId}-1`, email: currentUser.email, role: "owner", failureAlert: true, digest: "never" },
    ]
  );
}

/* ------------------------------------------------------------------ */
/*  Collections                                                        */
/* ------------------------------------------------------------------ */

const collections: Record<string, ProjectCollection[]> = {
  "project-a": [
    { id: "col-a-1", name: "applicant-cache", itemCount: 1284, byteSize: 2_480_000, updatedAt: "12 minutes ago" },
    { id: "col-a-2", name: "authority-codes", itemCount: 42, byteSize: 6_300, updatedAt: "3 weeks ago" },
    { id: "col-a-3", name: "decision-sync.cursor", itemCount: 1, byteSize: 64, updatedAt: "1 day ago" },
  ],
  "malawi-chw-referrals": [
    { id: "col-m-1", name: "facility-mappings", itemCount: 612, byteSize: 98_400, updatedAt: "2 days ago" },
    { id: "col-m-2", name: "referral-cursors", itemCount: 3, byteSize: 180, updatedAt: "4 hours ago" },
  ],
};

export function projectCollections(projectId: string): ProjectCollection[] {
  return collections[projectId] ?? [];
}

/** The first few keys of a collection, by its id. */
export const collectionItems: Record<string, CollectionItem[]> = {
  "col-a-1": [
    {
      key: "applicant:PA-2026-00412",
      value: '{\n  "name": "R. Okafor",\n  "email": "r.okafor@example.org",\n  "authority": "LA-07"\n}',
      updatedAt: "12 minutes ago",
    },
    {
      key: "applicant:PA-2026-00411",
      value: '{\n  "name": "M. Lindqvist",\n  "email": "m.lindqvist@example.org",\n  "authority": "LA-02"\n}',
      updatedAt: "40 minutes ago",
    },
    {
      key: "applicant:PA-2026-00409",
      value: '{\n  "name": "S. Haddad",\n  "email": "s.haddad@example.org",\n  "authority": "LA-07"\n}',
      updatedAt: "2 hours ago",
    },
  ],
  "col-a-2": [
    { key: "LA-02", value: '{ "name": "Northfield District Council", "caseSystem": "idox" }', updatedAt: "3 weeks ago" },
    { key: "LA-07", value: '{ "name": "Riverside Borough", "caseSystem": "tascomi" }', updatedAt: "3 weeks ago" },
  ],
  "col-a-3": [{ key: "last-synced", value: '"2026-11-04T06:00:00Z"', updatedAt: "1 day ago" }],
  "col-m-1": [
    { key: "commcare:site-0193", value: '{ "dhis2OrgUnit": "fdc6uOvgoji", "district": "Lilongwe" }', updatedAt: "2 days ago" },
    { key: "commcare:site-0207", value: '{ "dhis2OrgUnit": "O6uvpzGd5pu", "district": "Blantyre" }', updatedAt: "2 days ago" },
  ],
  "col-m-2": [{ key: "referrals", value: '"2026-11-05T08:15:00Z"', updatedAt: "4 hours ago" }],
};

/* ------------------------------------------------------------------ */
/*  Webhook security                                                   */
/* ------------------------------------------------------------------ */

/** Workflows that start on a schedule rather than a webhook. */
const scheduledWorkflows = new Set([
  "decision-notification-workflow",
  "monthly-aggregate-workflow",
  "weekly-case-report-workflow",
]);

/** The project's webhook triggers: one per workflow that starts from a webhook. */
export function webhookTriggers(project: Project): WebhookTriggerOption[] {
  return project.components
    .filter((c) => c.type === "Workflow" && !scheduledWorkflows.has(c.id))
    .map((c) => ({ id: `${c.id}:webhook`, workflowName: c.name }));
}

const authMethods: Record<string, WebhookAuthMethod[]> = {
  "project-a": [
    {
      id: "wam-a-1",
      name: "e-planning portal",
      type: "api",
      maskedSecret: "•••••••••••••••3f9c1",
      triggerIds: ["planning-application-workflow:webhook"],
    },
    {
      id: "wam-a-2",
      name: "Legacy intake (basic)",
      type: "basic",
      username: "legacy-intake",
      maskedSecret: "••••••••••••",
      triggerIds: [],
    },
  ],
  "malawi-chw-referrals": [
    {
      id: "wam-m-1",
      name: "CommCare forwarding",
      type: "api",
      maskedSecret: "•••••••••••••••a07be",
      triggerIds: ["chw-referral-workflow:webhook", "referral-followup-workflow:webhook"],
    },
  ],
};

export function projectWebhookAuthMethods(projectId: string): WebhookAuthMethod[] {
  return authMethods[projectId] ?? [];
}

/* ------------------------------------------------------------------ */
/*  GitHub sync                                                        */
/* ------------------------------------------------------------------ */

/** The GitHub App installations your GitHub account can use. */
export const githubInstallations: GitHubInstallation[] = [
  {
    id: "48211907",
    account: "openfn-dtu",
    repos: [
      { fullName: "openfn-dtu/planning-integrations", defaultBranch: "main", branches: ["main", "staging", "dev"] },
      { fullName: "openfn-dtu/health-workflows", defaultBranch: "main", branches: ["main", "release"] },
    ],
  },
  {
    id: "50133282",
    account: "jane-doe",
    repos: [{ fullName: "jane-doe/openfn-sandbox", defaultBranch: "master", branches: ["master"] }],
  },
];

const githubConnections: Record<string, GitHubSyncState["connection"]> = {
  "project-a": {
    installationId: "48211907",
    repo: "openfn-dtu/planning-integrations",
    branch: "main",
    configPath: "",
    syncDirection: "pull",
    lastSyncedAt: "Today at 09:12",
  },
};

/** Project B's settings start with your GitHub account linked but no repo, to show the form. */
const accountLinked = new Set(["project-a", "project-b"]);

export function projectGitHub(projectId: string): GitHubSyncState {
  return {
    accountConnected: accountLinked.has(projectId),
    installations: githubInstallations,
    connection: githubConnections[projectId],
  };
}

/* ------------------------------------------------------------------ */
/*  Data storage and history exports                                   */
/* ------------------------------------------------------------------ */

export const defaultDataStorage: DataStorageSettings = {
  retentionPeriod: "30 Days",
  ioDataPolicy: "retain",
  ioRetentionPeriod: "7 Days",
};

const exports: Record<string, HistoryExport[]> = {
  "project-a": [
    {
      id: "exp-a-2",
      fileName: "project-a-history-2026-10-31.json",
      requestedBy: "Amadou Diallo",
      createdAt: "31 Oct 2026, 16:02",
      status: "completed",
    },
    { id: "exp-a-1", requestedBy: "Jane Doe", createdAt: "12 Sep 2026, 10:41", status: "failed" },
  ],
};

export function projectHistoryExports(projectId: string): HistoryExport[] {
  return exports[projectId] ?? [];
}

/* ------------------------------------------------------------------ */
/*  The whole record, and the page data built from it                  */
/* ------------------------------------------------------------------ */

/** Everything the server holds about one project's settings. */
export interface ProjectSettingsRecord {
  name: string;
  environment: string;
  description: string;
  concurrencyDisabled: boolean;
  mfaRequired: boolean;
  memberships: ProjectMembership[];
  /** Everyone with an OpenFn account, including anyone invited since. */
  users: OpenFnUser[];
  collections: ProjectCollection[];
  /** Each collection's keys, by collection id. */
  collectionItems: Record<string, CollectionItem[]>;
  webhookAuthMethods: WebhookAuthMethod[];
  github: GitHubSyncState;
  dataStorage: DataStorageSettings;
  historyExports: HistoryExport[];
}

/** A project's settings as the server first sends them. */
export function projectSettingsRecord(project: Project): ProjectSettingsRecord {
  return {
    name: urlSafeName(project.name),
    environment: "main",
    description: project.description,
    concurrencyDisabled: false,
    mfaRequired: false,
    memberships: projectMemberships(project.id),
    users: openFnUsers,
    collections: projectCollections(project.id),
    collectionItems,
    webhookAuthMethods: projectWebhookAuthMethods(project.id),
    github: projectGitHub(project.id),
    dataStorage: defaultDataStorage,
    historyExports: projectHistoryExports(project.id),
  };
}

/**
 * The settings page's data for whoever is signed in (`you`, by email): what
 * their role lets them change, and for each collaborator, whether they can
 * change that person's role or remove them.
 */
export function projectSettingsPageData(
  project: Project,
  record: ProjectSettingsRecord,
  you: string = currentUser.email
): ProjectSettingsPageData {
  const yourRole: ProjectRole = record.memberships.find((m) => m.email === you)?.role ?? "viewer";
  const collaborators: Collaborator[] = record.memberships.map((m) => {
    const user = record.users.find((u) => u.email === m.email);
    const them = { role: m.role, isSelf: m.email === you };
    return {
      id: m.id,
      firstName: user?.firstName ?? m.email,
      lastName: user?.lastName ?? "",
      email: m.email,
      role: m.role,
      isSelf: them.isSelf,
      failureAlert: m.failureAlert,
      digest: m.digest,
      assignableRoles: assignableRoles(yourRole, them),
      removeBlockedReason: removeBlockedReason(yourRole, them),
    };
  });
  return {
    pageType: "project-settings",
    projectId: project.id,
    projectName: record.name,
    projectEnvironment: record.environment,
    projectDescription: record.description,
    permissions: permissionsFor(yourRole),
    concurrencyDisabled: record.concurrencyDisabled,
    orgCredentials,
    collections: record.collections,
    webhookAuthMethods: record.webhookAuthMethods,
    webhookTriggers: webhookTriggers(project),
    collaborators,
    mfaRequired: record.mfaRequired,
    github: record.github,
    dataStorage: record.dataStorage,
    historyExports: record.historyExports,
  };
}
