import { useSearchParams } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { pageFrame } from "../../app/page-frame";
import { useAuthProvider, useAuthProviderSaves, useInstance, useMe } from "../../api/account";
import { useAdminProjects, useAdminSaves, useAdminUsers, useAuditTrail } from "../../api/admin";
import { useCollectionSaves, useInstanceCollections } from "../../api/collections";
import { useMaintenanceSaves, useMaintenanceTasks } from "../../api/maintenance";
import { combine } from "../../api/status";
import { auditItemTypeLabels } from "../../model/admin";
import { AUDIT_PAGE_SIZE, auditEventNames, type AuditItemType, type AuditQuery } from "../../model/audit-events";
import AdminSettingsPage from "./AdminSettingsPage";

/** The audit trail's query, as the URL holds it: `?q=…&event=…&item_type=…&page=…`. */
function auditQueryFrom(params: URLSearchParams): AuditQuery {
  const itemType = params.get("item_type") ?? "";
  return {
    search: params.get("q") ?? "",
    event: params.get("event") ?? "",
    itemType: itemType in auditItemTypeLabels ? (itemType as AuditItemType) : "",
    page: Math.max(1, Math.floor(Number(params.get("page"))) || 1),
  };
}

/** The URL's parameters for an audit query, leaving out what's unset. */
function auditParamsFor(query: AuditQuery): URLSearchParams {
  const entries: [string, string][] = [
    ["q", query.search],
    ["event", query.event],
    ["item_type", query.itemType],
    ["page", query.page > 1 ? String(query.page) : ""],
  ];
  return new URLSearchParams(entries.filter(([, v]) => v));
}

/**
 * Feeds Admin settings from the API. Users, projects (with their members),
 * the audit trail, every collection, the sign-on provider and the instance
 * come from Lightning's routes, so a change here is what every other page
 * sees, and every change lands in the audit trail as Lightning records it.
 * Deletions are only ever scheduled: the API has no "delete now". Testing a
 * provider before saving it and the maintenance jobs are on the demo's own
 * routes (docs/api-gaps.md). The audit trail's filters and page live in the
 * URL, so Back steps through them and a link opens the same events.
 */
export default function AdminSettingsPageQuery({ route }: { route: PageRoute }) {
  const { status: meStatus, me } = useMe();
  const { status: instanceStatus, instance } = useInstance();
  const { status: usersStatus, users } = useAdminUsers(me?.email ?? "");
  const { status: projectsStatus, projects } = useAdminProjects();
  const [searchParams, setSearchParams] = useSearchParams();
  const auditQuery = auditQueryFrom(searchParams);
  const audit = useAuditTrail(auditQuery, AUDIT_PAGE_SIZE);
  const saves = useAdminSaves();
  const { status: collectionsStatus, collections } = useInstanceCollections();
  const collectionSaves = useCollectionSaves();
  const { status: providerStatus, provider: authProvider } = useAuthProvider(instance?.url ?? "");
  const providerSaves = useAuthProviderSaves();
  const { status: maintenanceStatus, tasks: maintenance } = useMaintenanceTasks();
  const maintenanceSaves = useMaintenanceSaves();
  const emailOf = (userId: string) => users.find((u) => u.id === userId)?.email;
  const status = combine(meStatus, instanceStatus, usersStatus, projectsStatus, audit.status, collectionsStatus, providerStatus, maintenanceStatus);

  return (
    <Loaded status={status} path={route.currentPath}>
      {() => (
        <AdminSettingsPage
          {...pageFrame(route)}
          data={{
            users,
            projects,
            audit: {
              entries: audit.entries,
              total: audit.total,
              pageSize: AUDIT_PAGE_SIZE,
              eventNames: [...auditEventNames],
            },
            auditQuery: { ...auditQuery, page: audit.page },
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
          // Each change is a step Back can undo, except typing in the search, which would leave one per letter.
          onChangeAuditQuery={(next) => setSearchParams(auditParamsFor(next), { replace: next.search !== auditQuery.search })}
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
