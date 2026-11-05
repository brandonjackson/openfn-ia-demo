import { useState } from "react";
import type { PageRoute } from "../app/ia-utils";
import type {
  AdminProject,
  AdminUserDraft,
  AuditChange,
  AuditEvent,
  AuditItemType,
  AuditQuery,
  AuthProviderConfig,
  AuthProviderTest,
  MaintenanceTask,
} from "../model/page-data";
import { deletionDay, filterAuditEvents, formatDateTime, formatDay, fullName, projectSlug } from "../model/admin";
import {
  asAdminUser,
  auditEvents,
  auditPageSize,
  deletionGraceDays,
  instanceAuthProvider,
  instanceCollections,
  instanceProjects,
  instanceUrl,
  instanceUsers,
  maintenanceTasks,
  usageMetricsEnabled,
  type InstanceUser,
} from "../fixtures/admin";
import { currentUser } from "../fixtures/user";
import AdminSettingsPage from "./AdminSettingsPage";
import { pageFrame } from "./route.fixtures";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** A record's short id as the audit trail shows it: 8 hex characters, the same every time for the same record. */
function shortId(id: string): string {
  let hash = 2166136261;
  for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/** Numbers this session's audit events, so two recorded in one moment still differ. */
let auditSequence = 0;

/** What the fixtures' maintenance jobs report when they finish. */
const maintenanceResults: Record<string, string> = {
  "refresh-adaptors": "214 adaptors, 2 new versions",
  "refresh-icons": "3 updated, 211 unchanged",
};

/** The fields an edit to a user changed, as the audit trail records them. */
function userChanges(before: InstanceUser, after: AdminUserDraft): AuditChange[] {
  const fields: [string, keyof AdminUserDraft & keyof InstanceUser][] = [
    ["first_name", "firstName"],
    ["last_name", "lastName"],
    ["email", "email"],
    ["role", "role"],
    ["support_user", "supportUser"],
    ["disabled", "disabled"],
  ];
  return fields
    .filter(([, key]) => before[key] !== after[key])
    .map(([field, key]) => ({ field, before: String(before[key]), after: String(after[key]) }));
}

/**
 * Feeds Admin settings from fixtures. The whole instance is held here for
 * the session, the fixtures' stand-in for the server: users, projects,
 * collections, the single sign-on provider and maintenance jobs, and every
 * change made here lands in the audit trail as it would in Lightning.
 * Maintenance and provider tests take a moment, so their working state shows.
 */
export default function AdminSettingsPageFixtures({ route }: { route: PageRoute }) {
  const [users, setUsers] = useState<InstanceUser[]>(instanceUsers);
  const [projects, setProjects] = useState<AdminProject[]>(instanceProjects);
  const [collections, setCollections] = useState(instanceCollections);
  const [events, setEvents] = useState<AuditEvent[]>(auditEvents);
  const [auditQuery, setAuditQuery] = useState<AuditQuery>({ search: "", event: "", itemType: "", page: 1 });
  const [authProvider, setAuthProvider] = useState<AuthProviderConfig | undefined>(instanceAuthProvider);
  const [authTest, setAuthTest] = useState<AuthProviderTest>();
  const [maintenance, setMaintenance] = useState<MaintenanceTask[]>(maintenanceTasks);

  const record = (event: string, itemType: AuditItemType, item: AuditEvent["item"], changes: AuditChange[] = []) =>
    setEvents((all) => [
      {
        id: `aud-session-${++auditSequence}`,
        occurredAt: formatDateTime(new Date()),
        event,
        itemType,
        item,
        actor: { label: fullName(currentUser), identifier: currentUser.email },
        changes,
      },
      ...all,
    ]);

  const updateUser = (id: string, patch: Partial<InstanceUser>) =>
    setUsers((all) => all.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  const userItem = (id: string) => ({ name: users.find((u) => u.id === id)?.email, id: shortId(id) });
  const updateProject = (id: string, patch: Partial<AdminProject>) =>
    setProjects((all) => all.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const projectItem = (id: string) => ({ name: projects.find((p) => p.id === id)?.name, id: shortId(id) });

  const filtered = filterAuditEvents(events, auditQuery);
  const start = (auditQuery.page - 1) * auditPageSize;

  return (
    <AdminSettingsPage
      {...pageFrame(route)}
      data={{
        pageType: "admin-settings",
        users: users.map(asAdminUser),
        projects,
        audit: {
          entries: filtered.slice(start, start + auditPageSize),
          total: filtered.length,
          pageSize: auditPageSize,
          eventNames: [...new Set(events.map((e) => e.event))].sort(),
        },
        auditQuery,
        authProvider,
        authTest,
        instanceUrl,
        collections,
        maintenance,
        usageMetricsEnabled,
        deletionGraceDays,
      }}
      onCreateUser={async (draft) => {
        // The first password goes to the server and never comes back.
        const { password: _password, ...user } = draft;
        void _password;
        const id = `user-${Date.now()}`;
        setUsers((all) => [...all, { ...user, id, hasActivity: false }]);
        record("created", "user", { name: user.email, id: shortId(id) }, [
          { field: "email", after: user.email },
          { field: "role", after: user.role },
        ]);
      }}
      onUpdateUser={async (id, draft) => {
        const before = users.find((u) => u.id === id);
        const { password: _password, ...patch } = draft;
        void _password;
        updateUser(id, patch);
        if (before) record("updated", "user", userItem(id), userChanges(before, draft));
      }}
      onSetUserDisabled={async (id, disabled) => {
        updateUser(id, { disabled });
        record("updated", "user", userItem(id), [{ field: "disabled", before: String(!disabled), after: String(disabled) }]);
      }}
      onScheduleUserDeletion={async (id) => {
        const day = deletionDay(new Date(), deletionGraceDays);
        updateUser(id, { scheduledDeletion: day });
        record("updated", "user", userItem(id), [{ field: "scheduled_deletion", after: day }]);
      }}
      onCancelUserDeletion={async (id) => {
        const before = users.find((u) => u.id === id)?.scheduledDeletion;
        updateUser(id, { scheduledDeletion: undefined });
        record("updated", "user", userItem(id), [{ field: "scheduled_deletion", before }]);
      }}
      onDeleteUserNow={async (id) => {
        setUsers((all) => all.filter((u) => u.id !== id));
        setProjects((all) => all.map((p) => ({ ...p, members: p.members.filter((m) => m.userId !== id) })));
      }}
      onCreateProject={async (draft) => {
        const slug = projectSlug(draft.name);
        const id = projects.some((p) => p.id === slug) ? `${slug}-${Date.now()}` : slug;
        setProjects((all) => [...all, { id, ...draft, createdAt: formatDay(new Date()) }]);
        record("created", "project", { name: draft.name, id: shortId(id) }, [{ field: "name", after: draft.name }]);
      }}
      onUpdateProject={async (id, draft) => {
        const before = projects.find((p) => p.id === id);
        updateProject(id, draft);
        if (before && before.name !== draft.name)
          record("name_updated", "project", { name: draft.name, id: shortId(id) }, [
            { field: "name", before: before.name, after: draft.name },
          ]);
        if (before && before.description !== draft.description)
          record("description_updated", "project", projectItem(id), [
            { field: "description", before: before.description, after: draft.description },
          ]);
      }}
      onScheduleProjectDeletion={async (id) => {
        const day = deletionDay(new Date(), deletionGraceDays);
        updateProject(id, { scheduledDeletion: day });
        record("updated", "project", projectItem(id), [{ field: "scheduled_deletion", after: day }]);
      }}
      onCancelProjectDeletion={async (id) => {
        const before = projects.find((p) => p.id === id)?.scheduledDeletion;
        updateProject(id, { scheduledDeletion: undefined });
        record("updated", "project", projectItem(id), [{ field: "scheduled_deletion", before }]);
      }}
      onDeleteProjectNow={async (id) => setProjects((all) => all.filter((p) => p.id !== id))}
      onChangeAuditQuery={setAuditQuery}
      onTestAuthProvider={async (draft) => {
        await wait(700);
        const ok = /^https:\/\/.+\/\.well-known\/openid-configuration$/.test(draft.discoveryUrl);
        setAuthTest({
          discoveryUrl: draft.discoveryUrl,
          ok,
          message: ok
            ? "Found the provider's authorization, token and user info endpoints."
            : "No OpenID configuration at that URL. Check it's HTTPS and ends in .well-known/openid-configuration.",
        });
      }}
      onSaveAuthProvider={async (draft) => {
        const { clientSecret, ...config } = draft;
        setAuthProvider({ ...config, hasClientSecret: !!clientSecret || !!authProvider?.hasClientSecret });
      }}
      onRemoveAuthProvider={async () => {
        setAuthProvider(undefined);
        setAuthTest(undefined);
      }}
      onDeleteCollection={async (id) => {
        const collection = collections.find((c) => c.id === id);
        setCollections((all) => all.filter((c) => c.id !== id));
        if (collection) record("deleted", "collection", { name: collection.name, id: shortId(id) });
      }}
      onRunMaintenance={async (id) => {
        await wait(1500);
        setMaintenance((all) =>
          all.map((t) =>
            t.id === id ? { ...t, lastRun: { at: formatDateTime(new Date()), result: maintenanceResults[id] ?? "Done" } } : t
          )
        );
      }}
    />
  );
}
