/**
 * Fixtures for project settings (live/project_live/settings.ex): the
 * per-project values the shared projects.ts doesn't carry, plus the lists
 * each settings panel shows (collections, webhook auth methods, history
 * exports, the GitHub connection). Static only: nothing here talks to a
 * backend.
 */

import type { Collection, ProjectFile, ProjectSettings, VcsFixture, WebhookAuthMethod } from "../types/project-settings";

const OPENHIE = "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa";
const DHIS2 = "1f0b7c2e-9d3a-4a4b-8f5e-2c6d7e8f9a01";

/** Options for both retention selects (Project.data_retention_options/0). */
export const dataRetentionPeriods = [7, 14, 30, 90, 180, 365];

// ---------------------------------------------------------------------------
// Project-level settings

const settingsByProject: Record<string, ProjectSettings> = {
  [OPENHIE]: { env: "main", allowSupportAccess: false },
  [DHIS2]: { env: "main", allowSupportAccess: true },
};

export function projectSettingsFor(projectId: string): ProjectSettings {
  return settingsByProject[projectId] ?? { env: "main", allowSupportAccess: false };
}

// ---------------------------------------------------------------------------
// Collections (#collections)

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

// ---------------------------------------------------------------------------
// History exports (#history-exports)

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
