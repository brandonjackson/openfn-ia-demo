import { useState } from "react";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { pageFrame } from "../../app/page-frame";
import { useAuthProvider, useAuthProviderSaves, useInstance, useMe } from "../../api/account";
import { useAdminProjects, useAdminSaves, useAdminUsers, useAuditTrail } from "../../api/admin";
import { useCollectionSaves, useInstanceCollections } from "../../api/collections";
import { useMaintenanceSaves, useMaintenanceTasks } from "../../api/maintenance";
import { combine } from "../../api/status";
import { filterAuditEvents } from "../../model/admin";
import { AUDIT_PAGE_SIZE, type AuditQuery } from "../../model/audit-events";
import AdminSettingsPage from "./AdminSettingsPage";

/**
 * Feeds Admin settings from the API. Users, projects (with their members),
 * the audit trail, every collection, the sign-on provider and the instance
 * come from Lightning's routes, so a change here is what every other page
 * sees, and every change lands in the audit trail as Lightning records it.
 * Deletions are only ever scheduled: the API has no "delete now". Testing a
 * provider before saving it and the maintenance jobs are on the demo's own
 * routes (docs/api-gaps.md).
 */
export default function AdminSettingsPageQuery({ route }: { route: PageRoute }) {
  const { status: meStatus, me } = useMe();
  const { status: instanceStatus, instance } = useInstance();
  const { status: usersStatus, users } = useAdminUsers(me?.email ?? "");
  const { status: projectsStatus, projects } = useAdminProjects();
  const { status: auditStatus, events } = useAuditTrail();
  const saves = useAdminSaves();
  const { status: collectionsStatus, collections } = useInstanceCollections();
  const collectionSaves = useCollectionSaves();
  const { status: providerStatus, provider: authProvider } = useAuthProvider(instance?.url ?? "");
  const providerSaves = useAuthProviderSaves();
  const { status: maintenanceStatus, tasks: maintenance } = useMaintenanceTasks();
  const maintenanceSaves = useMaintenanceSaves();
  // Filtered here until the server pages and filters the audit trail (docs/convergence.md, Next).
  const [auditQuery, setAuditQuery] = useState<AuditQuery>({ search: "", event: "", itemType: "", page: 1 });

  const filtered = filterAuditEvents(events, auditQuery);
  const start = (auditQuery.page - 1) * AUDIT_PAGE_SIZE;
  const emailOf = (userId: string) => users.find((u) => u.id === userId)?.email;
  const status = combine(meStatus, instanceStatus, usersStatus, projectsStatus, auditStatus, collectionsStatus, providerStatus, maintenanceStatus);

  return (
    <Loaded status={status} path={route.currentPath}>
      {() => (
        <AdminSettingsPage
          {...pageFrame(route)}
          data={{
            users,
            projects,
            audit: {
              entries: filtered.slice(start, start + AUDIT_PAGE_SIZE),
              total: filtered.length,
              pageSize: AUDIT_PAGE_SIZE,
              eventNames: [...new Set(events.map((e) => e.event))].sort(),
            },
            auditQuery,
            authProvider,
            instanceUrl: instance!.url,
            collections,
            maintenance,
            usageMetricsEnabled: instance!.usageMetricsEnabled,
            deletionGraceDays: instance!.deletionGraceDays,
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
          onTestAuthProvider={(draft) => providerSaves.test(draft.discoveryUrl)}
          onSaveAuthProvider={(draft) => providerSaves.save(draft)}
          onRemoveAuthProvider={providerSaves.remove}
          onDeleteCollection={(id) => collectionSaves.remove(collections.find((c) => c.id === id)!.projectId!, id)}
          onRunMaintenance={maintenanceSaves.run}
        />
      )}
    </Loaded>
  );
}
