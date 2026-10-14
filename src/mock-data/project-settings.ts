/**
 * Fixtures for project settings (live/project_live/settings.ex): the
 * per-project values the shared projects.ts doesn't carry, plus the lists
 * each settings panel shows (collections, webhook auth methods, history
 * exports, the GitHub connection). Static only: nothing here talks to a
 * backend.
 */

import type { ProjectRole } from "./projects";

const OPENHIE = "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa";
const DHIS2 = "1f0b7c2e-9d3a-4a4b-8f5e-2c6d7e8f9a01";

/** Options for both retention selects (Project.data_retention_options/0). */
export const dataRetentionPeriods = [7, 14, 30, 90, 180, 365];

/** Roles offered when adding or inviting collaborators. */
export const collaboratorRoles = ["viewer", "editor", "admin"] as const;

export const digestOptions = ["never", "daily", "weekly", "monthly"] as const;

// ---------------------------------------------------------------------------
// Project-level settings

export interface ProjectSettings {
  /** Project environment ("Credentials will be loaded with values from this environment."). */
  env: string;
  allowSupportAccess: boolean;
}

const settingsByProject: Record<string, ProjectSettings> = {
  [OPENHIE]: { env: "main", allowSupportAccess: false },
  [DHIS2]: { env: "main", allowSupportAccess: true },
};

export function projectSettingsFor(projectId: string): ProjectSettings {
  return settingsByProject[projectId] ?? { env: "main", allowSupportAccess: false };
}

// ---------------------------------------------------------------------------
// Collections (#collections)

export interface Collection {
  id: string;
  projectId: string;
  name: string;
  /** Sum of the byte size of every item (shown as "Used storage"). */
  byteSizeSum: number;
  /** The first record, pretty-printed, for the preview modal. null = empty. */
  previewJson: string | null;
}

export const collections: Collection[] = [
  {
    id: "col-patients",
    projectId: OPENHIE,
    name: "patient-registrations",
    byteSizeSum: 2_457_600,
    previewJson: JSON.stringify(
      { key: "patient-00042", value: { given: "Amina", family: "Okafor", facility: "FAC-118", registered: "2026-10-12" } },
      null,
      2
    ),
  },
  {
    id: "col-facilities",
    projectId: OPENHIE,
    name: "facility-lookup",
    byteSizeSum: 48_230,
    previewJson: JSON.stringify({ key: "FAC-118", value: { name: "Kibera Health Centre", district: "Nairobi" } }, null, 2),
  },
  {
    id: "col-cursor",
    projectId: OPENHIE,
    name: "sync-cursors",
    byteSizeSum: 0,
    previewJson: null,
  },
];

export function collectionsIn(projectId: string): Collection[] {
  return collections.filter((c) => c.projectId === projectId);
}

// ---------------------------------------------------------------------------
// Webhook auth methods (#webhook_security)

export type WebhookAuthType = "basic" | "api";

export interface WebhookAuthMethod {
  id: string;
  projectId: string;
  name: string;
  authType: WebhookAuthType;
  username?: string;
  /** Placeholder secrets: fixture values, never real credentials. */
  password?: string;
  apiKey?: string;
  /** Workflows whose webhook trigger uses this method. */
  triggers: { workflowId: string; workflowName: string; triggerId: string }[];
  /** Channels using this method for client auth. */
  channels: { id: string; name: string }[];
}

export const webhookAuthMethods: WebhookAuthMethod[] = [
  {
    id: "wam-commcare",
    projectId: OPENHIE,
    name: "CommCare forwarder",
    authType: "basic",
    username: "commcare",
    password: "fixture-password",
    triggers: [{ workflowId: "wf-openhie", workflowName: "OpenHIE Workflow", triggerId: "trg-openhie" }],
    channels: [],
  },
  {
    id: "wam-partner-api",
    projectId: OPENHIE,
    name: "Partner API key",
    authType: "api",
    apiKey: "fixture0000000000000000000000000000key01",
    triggers: [],
    channels: [{ id: "5c3e9a1d-7b2f-4e8a-9c6d-1f0e2d3c4b5a", name: "SHR proxy" }],
  },
  {
    id: "wam-unused",
    projectId: OPENHIE,
    name: "Legacy basic auth",
    authType: "basic",
    username: "legacy",
    password: "fixture-password",
    triggers: [],
    channels: [],
  },
];

export function webhookAuthMethodsIn(projectId: string): WebhookAuthMethod[] {
  return webhookAuthMethods.filter((m) => m.projectId === projectId);
}

/** The "Linked Triggers & Channels" summary, e.g. "1 trigger, 2 channels". */
export function linkedUsageSummary(method: WebhookAuthMethod): string {
  return (
    [
      [method.triggers.length, "trigger"],
      [method.channels.length, "channel"],
    ] as const
  )
    .filter(([count]) => count > 0)
    .map(([count, noun]) => (count === 1 ? `1 ${noun}` : `${count} ${noun}s`))
    .join(", ");
}

// ---------------------------------------------------------------------------
// History exports (#history-exports)

export type ExportStatus = "enqueued" | "in_progress" | "completed" | "failed";

export interface ProjectFile {
  id: string;
  projectId: string;
  insertedAt: string;
  /** null until the export finishes. */
  path: string | null;
  createdByUserId: string;
  status: ExportStatus;
}

export const projectFiles: ProjectFile[] = [
  {
    id: "pf-3",
    projectId: OPENHIE,
    insertedAt: "2026-10-14T08:55:00Z",
    path: null,
    createdByUserId: "user-amy",
    status: "in_progress",
  },
  {
    id: "pf-2",
    projectId: OPENHIE,
    insertedAt: "2026-10-09T13:20:00Z",
    path: "exports/openhie-project/history-2026-10-09T13-20.zip",
    createdByUserId: "user-esther",
    status: "completed",
  },
  {
    id: "pf-1",
    projectId: OPENHIE,
    insertedAt: "2026-09-30T07:02:00Z",
    path: "exports/openhie-project/history-2026-09-30T07-02.zip",
    createdByUserId: "user-amy",
    status: "completed",
  },
];

export function projectFilesIn(projectId: string): ProjectFile[] {
  return projectFiles.filter((f) => f.projectId === projectId);
}

// ---------------------------------------------------------------------------
// Sync to GitHub (#vcs)

export interface RepoConnection {
  repo: string;
  branch: string;
  githubInstallationId: string;
  configPath: string;
  /** true = "v2 (new)", false = "v1 (legacy)". */
  syncVersion: boolean;
}

export interface VcsFixture {
  /** Whether GitHub sync is configured for this Lightning instance. */
  githubEnabled: boolean;
  /** The project's repo connection when it has one. */
  connection: RepoConnection | null;
}

/**
 * Fixture flag: openhie-project shows Lightning's demo state ("Version
 * Control is not configured for this Lightning instance"); dhis2-project
 * shows a connected repo (github_sync_component.html.heex `:show`).
 */
const vcsByProject: Record<string, VcsFixture> = {
  [OPENHIE]: { githubEnabled: false, connection: null },
  [DHIS2]: {
    githubEnabled: true,
    connection: {
      repo: "openfn/dhis2-reporting",
      branch: "main",
      githubInstallationId: "41872203",
      configPath: "./openfn-1f0b7c2e-9d3a-4a4b-8f5e-2c6d7e8f9a01-config.json",
      syncVersion: true,
    },
  },
};

export function vcsFor(projectId: string): VcsFixture {
  return vcsByProject[projectId] ?? { githubEnabled: false, connection: null };
}

/** Days before a deleted project is purged (Lightning.Config.purge_deleted_after_days). */
export const purgeDeletedAfterDays = 7;

// ---------------------------------------------------------------------------
// Permissions (policies/project_users.ex), by the viewer's project role

export interface SettingsPermissions {
  canEditProject: boolean;
  canDeleteProject: boolean;
  canCreateCollection: boolean;
  canWriteWebhookAuthMethod: boolean;
  canAddProjectUser: boolean;
  canRemoveProjectUser: boolean;
  canRequireMfa: boolean;
  canEditDataRetention: boolean;
  canInstallGithub: boolean;
  canInitiateGithubSync: boolean;
  canCreateProjectCredential: boolean;
  canCreateKeychainCredential: boolean;
}

export function settingsPermissionsFor(role: ProjectRole | undefined): SettingsPermissions {
  const ownerOrAdmin = role === "owner" || role === "admin";
  const editorUp = ownerOrAdmin || role === "editor";
  return {
    canEditProject: ownerOrAdmin,
    canDeleteProject: role === "owner",
    canCreateCollection: ownerOrAdmin,
    canWriteWebhookAuthMethod: ownerOrAdmin,
    canAddProjectUser: ownerOrAdmin,
    canRemoveProjectUser: ownerOrAdmin,
    canRequireMfa: role === "owner",
    canEditDataRetention: ownerOrAdmin,
    canInstallGithub: ownerOrAdmin,
    canInitiateGithubSync: editorUp,
    canCreateProjectCredential: editorUp,
    canCreateKeychainCredential: ownerOrAdmin,
  };
}
