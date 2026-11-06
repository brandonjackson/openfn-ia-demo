import { useState } from "react";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useAdminProjects, useAdminSaves, useAdminUsers, useAuditTrail } from "../api/admin";
import { combine } from "../api/status";
import { useCollectionSaves, useInstanceCollections } from "../api/collections";
import { useAuthProvider, useAuthProviderSaves } from "../api/account";
import type { AuditQuery, AuthProviderTest, MaintenanceTask } from "../model/page-data";
import { filterAuditEvents } from "../model/admin";
import { formatDateTime } from "../model/time";
import {
  auditPageSize,
  deletionGraceDays,
  instanceUrl,
  maintenanceTasks,
  usageMetricsEnabled,
} from "../fixtures/admin";
import { currentUser } from "../fixtures/user";
import AdminSettingsPage from "./AdminSettingsPage";
import { pageFrame } from "./route.fixtures";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** What the fixtures' maintenance jobs report when they finish. */
const maintenanceResults: Record<string, string> = {
  "refresh-adaptors": "214 adaptors, 2 new versions",
  "refresh-icons": "3 updated, 211 unchanged",
};

/**
 * Feeds Admin settings. Users, projects (with their members) and the audit
 * trail come from the API, so a change here is what every other page sees,
 * and every change lands in the audit trail as Lightning records it.
 * Deletions are only ever scheduled: the API has no "delete now". Every
 * collection on the instance and the single sign-on provider come from the
 * API too. Testing a provider before saving it, and the maintenance jobs,
 * are still played here: the API has no routes for them.
 */
export default function AdminSettingsPageQuery({ route }: { route: PageRoute }) {
  const { status: usersStatus, users } = useAdminUsers(currentUser.email);
  const { status: projectsStatus, projects } = useAdminProjects();
  const { status: auditStatus, events } = useAuditTrail();
  const saves = useAdminSaves();
  const { status: collectionsStatus, collections } = useInstanceCollections();
  const collectionSaves = useCollectionSaves();
  const [auditQuery, setAuditQuery] = useState<AuditQuery>({ search: "", event: "", itemType: "", page: 1 });
  const { status: providerStatus, provider: authProvider } = useAuthProvider(instanceUrl);
  const providerSaves = useAuthProviderSaves();
  const [authTest, setAuthTest] = useState<AuthProviderTest>();
  const [maintenance, setMaintenance] = useState<MaintenanceTask[]>(maintenanceTasks);

  const filtered = filterAuditEvents(events, auditQuery);
  const start = (auditQuery.page - 1) * auditPageSize;
  const emailOf = (userId: string) => users.find((u) => u.id === userId)?.email;

  return (
    <Loaded status={combine(usersStatus, projectsStatus, auditStatus, collectionsStatus, providerStatus)} path={route.currentPath}>
      {() => (
        <AdminSettingsPage
          {...pageFrame(route)}
          data={{
            pageType: "admin-settings",
            users,
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
          onCreateUser={saves.createUser}
          onUpdateUser={saves.updateUser}
          onSetUserDisabled={saves.setUserDisabled}
          onScheduleUserDeletion={saves.scheduleUserDeletion}
          onCancelUserDeletion={saves.cancelUserDeletion}
          onCreateProject={(draft) => saves.createProject(draft, emailOf)}
          onUpdateProject={(id, draft) => saves.updateProject(id, projects.find((p) => p.id === id)!, draft)}
          onScheduleProjectDeletion={saves.scheduleProjectDeletion}
          onCancelProjectDeletion={saves.cancelProjectDeletion}
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
          onSaveAuthProvider={(draft) => providerSaves.save(draft)}
          onRemoveAuthProvider={async () => {
            await providerSaves.remove();
            setAuthTest(undefined);
          }}
          onDeleteCollection={(id) => collectionSaves.remove(collections.find((c) => c.id === id)!.projectId!, id)}
          onRunMaintenance={async (id) => {
            await wait(1500);
            setMaintenance((all) =>
              all.map((t) =>
                t.id === id ? { ...t, lastRun: { at: formatDateTime(new Date().toISOString()), result: maintenanceResults[id] ?? "Done" } } : t
              )
            );
          }}
        />
      )}
    </Loaded>
  );
}
