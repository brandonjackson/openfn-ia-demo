import type {
  AdminCollection,
  AdminProject,
  AdminSettingsPageData,
  AdminUser,
  AuditEvent,
  AuthProviderConfig,
  MaintenanceTask,
  ProjectMembership,
} from "../model/page-data";
import { projects } from "./projects";
import { currentUser } from "./user";

/*
 * The whole instance as a superuser sees it in Admin settings. Every person
 * and address here is made up.
 */

/** Where this instance is served from. */
export const instanceUrl = "https://openfn.example.org";

/** Days a scheduled deletion waits, as `PURGE_DELETED_AFTER_DAYS` sets it (Lightning's default). */
export const deletionGraceDays = 7;

/** A user as the server stores them; whether they can be deleted is worked out from these facts. */
export interface InstanceUser extends Omit<AdminUser, "isSelf" | "canDelete" | "canDeleteNow"> {
  /** Has runs, audit events or other activity in projects, which stops them being deleted outright. */
  hasActivity: boolean;
}

export const instanceUsers: InstanceUser[] = [
  {
    id: "user-jane",
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    role: "superuser",
    supportUser: false,
    disabled: false,
    lastLogin: "Just now",
    hasActivity: true,
  },
  {
    id: "user-amadou",
    firstName: "Amadou",
    lastName: "Diallo",
    email: "adiallo@example.org",
    role: "user",
    supportUser: false,
    disabled: false,
    lastLogin: "Yesterday",
    hasActivity: true,
  },
  {
    id: "user-priya",
    firstName: "Priya",
    lastName: "Nair",
    email: "pnair@example.org",
    role: "user",
    supportUser: false,
    disabled: false,
    lastLogin: "2 hours ago",
    hasActivity: true,
  },
  {
    id: "user-kofi",
    firstName: "Kofi",
    lastName: "Boateng",
    email: "kboateng@example.org",
    role: "superuser",
    supportUser: false,
    disabled: false,
    lastLogin: "4 days ago",
    hasActivity: true,
  },
  {
    id: "user-john",
    firstName: "John",
    lastName: "Smith",
    email: "jsmith@example.org",
    role: "user",
    supportUser: false,
    disabled: false,
    lastLogin: "3 days ago",
    hasActivity: true,
  },
  {
    id: "user-beth",
    firstName: "Beth",
    lastName: "Wilson",
    email: "bwilson@example.org",
    role: "user",
    supportUser: false,
    disabled: false,
    lastLogin: "2 weeks ago",
    hasActivity: true,
  },
  {
    id: "user-support",
    firstName: "OpenFn",
    lastName: "Support",
    email: "support@example.org",
    role: "user",
    supportUser: true,
    disabled: false,
    lastLogin: "1 month ago",
    hasActivity: false,
  },
  {
    id: "user-lena",
    firstName: "Lena",
    lastName: "Okafor",
    email: "lokafor@example.org",
    role: "user",
    supportUser: false,
    disabled: false,
    scheduledDeletion: "9 Nov 2026",
    lastLogin: "3 months ago",
    hasActivity: false,
  },
  {
    id: "user-sam",
    firstName: "Sam",
    lastName: "Okoro",
    email: "sokoro@example.org",
    role: "user",
    supportUser: false,
    disabled: true,
    scheduledDeletion: "11 Nov 2026",
    lastLogin: "8 months ago",
    hasActivity: true,
  },
  {
    id: "user-grace",
    firstName: "Grace",
    lastName: "Mwangi",
    email: "gmwangi@example.org",
    role: "user",
    supportUser: false,
    disabled: false,
    hasActivity: false,
  },
];

/** The server's view of who may be deleted: users only, never yourself, and not straight away while they have activity. */
export function asAdminUser(user: InstanceUser): AdminUser {
  const { hasActivity, ...rest } = user;
  const isSelf = user.email === currentUser.email;
  const canDelete = user.role === "user" && !isSelf;
  return { ...rest, isSelf, canDelete, canDeleteNow: canDelete && !hasActivity };
}

/** Every account, as Admin settings shows them. */
export const adminUsers: AdminUser[] = instanceUsers.map(asAdminUser);

/** Who's in each of the demo's projects, by project id. */
const memberships: Record<string, ProjectMembership[]> = {
  "project-a": [
    { userId: "user-jane", role: "owner" },
    { userId: "user-amadou", role: "admin" },
    { userId: "user-john", role: "editor" },
    { userId: "user-beth", role: "viewer" },
  ],
  "project-b": [
    { userId: "user-beth", role: "owner" },
    { userId: "user-jane", role: "editor" },
  ],
  "malawi-chw-referrals": [
    { userId: "user-amadou", role: "owner" },
    { userId: "user-priya", role: "admin" },
    { userId: "user-kofi", role: "editor" },
    { userId: "user-jane", role: "editor" },
    { userId: "user-john", role: "viewer" },
    { userId: "user-lena", role: "viewer" },
  ],
  "case-surveillance": [
    { userId: "user-priya", role: "owner" },
    { userId: "user-kofi", role: "editor" },
    { userId: "user-amadou", role: "viewer" },
  ],
  "data-quality-checks": [{ userId: "user-priya", role: "owner" }],
};

const createdAt: Record<string, string> = {
  "project-a": "14 Mar 2024",
  "project-b": "2 Jul 2024",
  "malawi-chw-referrals": "19 Nov 2024",
  "case-surveillance": "6 Feb 2025",
  "data-quality-checks": "28 Aug 2025",
};

/** Every project on the instance: the demo's projects, with their members. */
export const instanceProjects: AdminProject[] = projects.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  createdAt: createdAt[p.id] ?? "1 Jan 2025",
  members: memberships[p.id] ?? [],
  scheduledDeletion: p.id === "data-quality-checks" ? "10 Nov 2026" : undefined,
}));

const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? id;

/** Every collection on the instance, across all projects. */
export const instanceCollections: AdminCollection[] = [
  { id: "col-1", name: "planning-authority-codes", projectName: projectName("project-a"), items: 412, bytes: 96_240 },
  { id: "col-2", name: "dedupe-keys", projectName: projectName("project-b"), items: 18_240, bytes: 1_874_002 },
  { id: "col-3", name: "district-org-units", projectName: projectName("malawi-chw-referrals"), items: 2_316, bytes: 734_118 },
  { id: "col-4", name: "facility-registry-cache", projectName: projectName("malawi-chw-referrals"), items: 640, bytes: 3_412_880 },
  { id: "col-5", name: "suspected-cases", projectName: projectName("case-surveillance"), items: 9_871, bytes: 14_203_554 },
  { id: "col-6", name: "referral-cursor", projectName: projectName("malawi-chw-referrals"), items: 1, bytes: 212 },
];

/** The instance's single sign-on provider. */
export const instanceAuthProvider: AuthProviderConfig = {
  name: "sim-dtu-sso",
  discoveryUrl: "https://login.example.org/.well-known/openid-configuration",
  clientId: "openfn-lightning",
  hasClientSecret: true,
  redirectHost: instanceUrl,
  allowUnverifiedEmail: false,
};

export const maintenanceTasks: MaintenanceTask[] = [
  {
    id: "refresh-adaptors",
    title: "Refresh adaptor registry",
    description: "Re-fetch the list of available adaptors and their versions.",
    lastRun: { at: "5 Nov 2026, 03:00", result: "214 adaptors, no new versions" },
  },
  {
    id: "refresh-icons",
    title: "Refresh adaptor icons",
    description:
      "Re-fetch icons for every adaptor and replace any that have changed. Doesn't touch adaptor metadata or version history.",
    lastRun: { at: "12 Oct 2026, 14:22", result: "6 updated, 208 unchanged" },
  },
];

/** Whether the instance sends OpenFn anonymous usage metrics. */
export const usageMetricsEnabled = true;

const jane = { label: "Jane Doe", identifier: currentUser.email };
const amadou = { label: "Amadou Diallo", identifier: "adiallo@example.org" };
const priya = { label: "Priya Nair", identifier: "pnair@example.org" };
const kofi = { label: "Kofi Boateng", identifier: "kboateng@example.org" };
const github = { label: "GitHub sync", identifier: "openfn/project-a" };
const cli = { label: "Provisioner", identifier: "API token ••a91f" };

/** The audit trail, newest first. */
export const auditEvents: AuditEvent[] = [
  {
    id: "aud-26",
    occurredAt: "5 Nov 2026, 09:14",
    event: "snapshot_created",
    itemType: "workflow",
    item: { name: "planning-application-workflow", id: "4f2a91c0" },
    actor: amadou,
    changes: [
      { field: "lock_version", before: "41", after: "42" },
      { field: "jobs.route-to-authority.body", before: "fn(state => state)", after: "post('/cases', state => state.data)" },
    ],
  },
  {
    id: "aud-25",
    occurredAt: "5 Nov 2026, 08:52",
    event: "collaborator_added",
    itemType: "project",
    item: { name: "Case-based surveillance", id: "c81d07aa" },
    actor: priya,
    changes: [{ field: "kboateng@example.org", after: "editor" }],
  },
  {
    id: "aud-24",
    occurredAt: "4 Nov 2026, 17:40",
    event: "token_refreshed",
    itemType: "credential",
    item: { name: "DHIS2 Tracker (production)", id: "9b30e4d2" },
    actor: { label: "Lightning", identifier: "OAuth refresh" },
    changes: [],
  },
  {
    id: "aud-23",
    occurredAt: "4 Nov 2026, 16:05",
    event: "updated",
    itemType: "user",
    item: { name: "sokoro@example.org", id: "e7a2c513" },
    actor: jane,
    changes: [{ field: "disabled", before: "false", after: "true" }],
  },
  {
    id: "aud-22",
    occurredAt: "4 Nov 2026, 11:31",
    event: "snapshot_created",
    itemType: "workflow",
    item: { name: "chw-referral-sync", id: "0d6f55b9" },
    actor: github,
    changes: [{ field: "lock_version", before: "17", after: "18" }],
  },
  {
    id: "aud-21",
    occurredAt: "3 Nov 2026, 15:12",
    event: "added_to_project",
    itemType: "credential",
    item: { name: "Google Sheets reporting", id: "51ac9e03" },
    actor: jane,
    changes: [{ field: "project", after: "Project B" }],
  },
  {
    id: "aud-20",
    occurredAt: "3 Nov 2026, 10:02",
    event: "requires_mfa_updated",
    itemType: "project",
    item: { name: "Malawi Community Health Worker Referrals", id: "a4c2e118" },
    actor: amadou,
    changes: [{ field: "requires_mfa", before: "false", after: "true" }],
  },
  {
    id: "aud-19",
    occurredAt: "2 Nov 2026, 18:47",
    event: "created",
    itemType: "collection",
    item: { name: "referral-cursor", id: "77e0b6f1" },
    actor: amadou,
    changes: [{ field: "name", after: "referral-cursor" }],
  },
  {
    id: "aud-18",
    occurredAt: "2 Nov 2026, 09:30",
    event: "enabled",
    itemType: "workflow",
    item: { name: "suspected-case-alerts", id: "3ab8d020" },
    actor: priya,
    changes: [{ field: "enabled", before: "false", after: "true" }],
  },
  {
    id: "aud-17",
    occurredAt: "1 Nov 2026, 14:16",
    event: "updated",
    itemType: "channel",
    item: { name: "dhis2-tracker-write", id: "f19c4a7e" },
    actor: kofi,
    changes: [{ field: "destination_url", before: "https://dhis2.example.org/api/40", after: "https://dhis2.example.org/api/41" }],
  },
  {
    id: "aud-16",
    occurredAt: "31 Oct 2026, 12:08",
    event: "updated_by_provisioner",
    itemType: "workflow",
    item: { name: "decision-notification-workflow", id: "be4410c7" },
    actor: cli,
    changes: [{ field: "triggers.cron.expression", before: "0 6 * * *", after: "30 5 * * *" }],
  },
  {
    id: "aud-15",
    occurredAt: "30 Oct 2026, 16:55",
    event: "collaborator_role_changed",
    itemType: "project",
    item: { name: "Project A", id: "1e09fa63" },
    actor: jane,
    changes: [{ field: "adiallo@example.org", before: "editor", after: "admin" }],
  },
  {
    id: "aud-14",
    occurredAt: "29 Oct 2026, 08:21",
    event: "created",
    itemType: "credential",
    item: { name: "CommCare mock server", id: "6d7b2e90" },
    actor: jane,
    changes: [
      { field: "name", after: "CommCare mock server" },
      { field: "schema", after: "commcare" },
    ],
  },
  {
    id: "aud-13",
    occurredAt: "28 Oct 2026, 13:44",
    event: "created",
    itemType: "user",
    item: { name: "gmwangi@example.org", id: "2c55d8e4" },
    actor: jane,
    changes: [
      { field: "first_name", after: "Grace" },
      { field: "last_name", after: "Mwangi" },
      { field: "role", after: "user" },
    ],
  },
  {
    id: "aud-12",
    occurredAt: "27 Oct 2026, 10:19",
    event: "token_revoked",
    itemType: "credential",
    item: { name: "Salesforce sandbox", id: "c03a71e5" },
    actor: kofi,
    changes: [],
  },
  {
    id: "aud-11",
    occurredAt: "26 Oct 2026, 17:02",
    event: "history_retention_period_updated",
    itemType: "project",
    item: { name: "Project B", id: "8f4e2b19" },
    actor: jane,
    changes: [{ field: "history_retention_period", before: "90", after: "30" }],
  },
  {
    id: "aud-10",
    occurredAt: "24 Oct 2026, 11:38",
    event: "marked_for_deletion",
    itemType: "workflow",
    item: { name: "legacy-weekly-export", id: "da91c62b" },
    actor: priya,
    changes: [{ field: "deleted_at", after: "24 Oct 2026, 11:38" }],
  },
  {
    id: "aud-09",
    occurredAt: "22 Oct 2026, 09:05",
    event: "created",
    itemType: "oauth_client",
    item: { name: "Google Workspace", id: "47b1f0de" },
    actor: jane,
    changes: [{ field: "name", after: "Google Workspace" }],
  },
  {
    id: "aud-08",
    occurredAt: "21 Oct 2026, 15:27",
    event: "repo_connection_created",
    itemType: "project",
    item: { name: "Project A", id: "1e09fa63" },
    actor: amadou,
    changes: [{ field: "repo", after: "openfn/project-a" }],
  },
  {
    id: "aud-07",
    occurredAt: "20 Oct 2026, 12:50",
    event: "removed_from_project",
    itemType: "credential",
    item: { name: "DHIS2 Play (personal)", id: "e2f8a604" },
    actor: jane,
    changes: [{ field: "project", before: "Project B" }],
  },
  {
    id: "aud-06",
    occurredAt: "18 Oct 2026, 08:14",
    event: "collaborator_removed",
    itemType: "project",
    item: { name: "Case-based surveillance", id: "c81d07aa" },
    actor: priya,
    changes: [{ field: "lokafor@example.org", before: "viewer" }],
  },
  {
    id: "aud-05",
    occurredAt: "16 Oct 2026, 16:33",
    event: "disabled",
    itemType: "workflow",
    item: { name: "legacy-weekly-export", id: "da91c62b" },
    actor: priya,
    changes: [{ field: "enabled", before: "true", after: "false" }],
  },
  {
    id: "aud-04",
    occurredAt: "15 Oct 2026, 10:10",
    event: "updated",
    itemType: "collection",
    item: { name: "district-org-units", id: "5a0c3e9f" },
    actor: amadou,
    changes: [{ field: "name", before: "district-orgunits", after: "district-org-units" }],
  },
  {
    id: "aud-03",
    occurredAt: "14 Oct 2026, 13:58",
    event: "deleted",
    itemType: "credential",
    item: { name: "Old Kobo token", id: "08bd47ca" },
    actor: kofi,
    changes: [],
  },
  {
    id: "aud-02",
    occurredAt: "12 Oct 2026, 09:41",
    event: "created",
    itemType: "project",
    item: { name: "Data Quality Checks", id: "b6e3d11f" },
    actor: jane,
    changes: [
      { field: "name", after: "data-quality-checks" },
      { field: "owner", after: "pnair@example.org" },
    ],
  },
  {
    id: "aud-01",
    occurredAt: "10 Oct 2026, 07:55",
    event: "allow_support_access_updated",
    itemType: "project",
    item: { name: "Malawi Community Health Worker Referrals", id: "a4c2e118" },
    actor: amadou,
    changes: [{ field: "allow_support_access", before: "false", after: "true" }],
  },
];

/** How many audit events show on one page. */
export const auditPageSize = 10;

/** Admin settings as it first loads: the first page of the audit trail, unfiltered. For stories. */
export const adminSettingsData: AdminSettingsPageData = {
  pageType: "admin-settings",
  users: adminUsers,
  projects: instanceProjects,
  audit: {
    entries: auditEvents.slice(0, auditPageSize),
    total: auditEvents.length,
    pageSize: auditPageSize,
    eventNames: [...new Set(auditEvents.map((e) => e.event))].sort(),
  },
  auditQuery: { search: "", event: "", itemType: "", page: 1 },
  authProvider: instanceAuthProvider,
  instanceUrl,
  collections: instanceCollections,
  maintenance: maintenanceTasks,
  usageMetricsEnabled,
  deletionGraceDays,
};
