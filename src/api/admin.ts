/**
 * What Admin settings reads and changes on Lightning's API: every user
 * (api/users.md), every project with its members (api/projects.md, a
 * superuser's view) and the audit trail (api/audit-events.md).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminProject, AdminProjectDraft, AdminUser, AdminUserDraft, AuditChange, AuditEvent, AuditItemType } from "../model/page-data";
import { formatDate, formatDateTime, timeAgo } from "../model/time";
import { listAll, request } from "./client";
import { projectKeys, toProject, userKeys, type ApiMember, type ApiProject } from "./projects";
import { statusOf, type LoadStatus } from "./status";

/** A user as GET /api/users sends them, planned attributes included. */
interface ApiAdminUser {
  id: string;
  attributes: {
    email: string;
    first_name: string;
    last_name: string;
    role: "user" | "superuser";
    support_user?: boolean;
    disabled?: boolean;
    scheduled_deletion?: string | null;
    has_activity_in_projects?: boolean;
    last_login_at?: string | null;
  };
}

/** An audit event as GET /api/audit_events sends it. */
interface ApiAuditEvent {
  id: string;
  attributes: {
    event: string;
    item_type: string;
    item_id: string;
    actor_display: { identifier: string | null; label: string };
    changes: { before?: Record<string, unknown>; after?: Record<string, unknown> };
    metadata: { item_name?: string };
    inserted_at: string;
  };
}

const show = (v: unknown) => (v === undefined ? undefined : typeof v === "string" ? v : JSON.stringify(v));

function toAdminUser({ id, attributes: a }: ApiAdminUser, you: string): AdminUser {
  const isSelf = a.email === you;
  return {
    id,
    firstName: a.first_name,
    lastName: a.last_name,
    email: a.email,
    role: a.role,
    supportUser: a.support_user ?? false,
    disabled: a.disabled ?? false,
    scheduledDeletion: a.scheduled_deletion ? formatDate(a.scheduled_deletion) : undefined,
    lastLogin: a.last_login_at ? timeAgo(a.last_login_at) : undefined,
    isSelf,
    // A superuser can't be scheduled, and nor can you. There's no "delete now" on the API (misfits.md, immediate purges).
    canDelete: a.role === "user" && !isSelf,
    canDeleteNow: false,
  };
}

function toAuditEvent({ id, attributes: a }: ApiAuditEvent): AuditEvent {
  const fields = [...new Set([...Object.keys(a.changes.before ?? {}), ...Object.keys(a.changes.after ?? {})])];
  const changes: AuditChange[] = fields.map((field) => ({ field, before: show(a.changes.before?.[field]), after: show(a.changes.after?.[field]) }));
  return {
    id,
    occurredAt: formatDateTime(a.inserted_at),
    event: a.event,
    itemType: a.item_type as AuditItemType,
    item: { name: a.metadata.item_name, id: a.item_id.slice(0, 8) },
    actor: { label: a.actor_display.label, identifier: a.actor_display.identifier ?? undefined },
    changes,
  };
}

const adminKeys = {
  users: [...userKeys.all, "admin"] as const,
  projects: [...projectKeys.all, "admin"] as const,
  audit: ["audit_events"] as const,
};

/** Every account on the instance, as Admin settings lists them. `you` is the signed-in person's email. */
export function useAdminUsers(you: string): { status: LoadStatus; users: AdminUser[] } {
  const query = useQuery({
    queryKey: adminKeys.users,
    queryFn: () => listAll<ApiAdminUser>("/api/users"),
    select: (rows) => rows.map((r) => toAdminUser(r, you)),
  });
  return { status: statusOf(query), users: query.data ?? [] };
}

/** Every project on the instance with its members, scheduled ones included. */
export function useAdminProjects(): { status: LoadStatus; projects: AdminProject[] } {
  const query = useQuery({
    queryKey: adminKeys.projects,
    queryFn: async () => {
      const rows = (await listAll<ApiProject>("/api/projects")).filter((p) => !p.attributes.parent_id);
      const members = await Promise.all(rows.map((p) => listAll<ApiMember>(`/api/projects/${p.id}/members`)));
      return rows.map((p, i) => ({ project: toProject(p), members: members[i]! }));
    },
    select: (rows) =>
      rows.map(({ project, members }) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: formatDate(project.createdAt),
        members: members.map((m) => ({ userId: m.id, role: m.attributes.role })),
        scheduledDeletion: project.scheduledDeletion ? formatDate(project.scheduledDeletion) : undefined,
      })),
  });
  return { status: statusOf(query), projects: query.data ?? [] };
}

/** The whole audit trail, newest first. */
export function useAuditTrail(): { status: LoadStatus; events: AuditEvent[] } {
  const query = useQuery({
    queryKey: adminKeys.audit,
    queryFn: () => listAll<ApiAuditEvent>("/api/audit_events"),
    select: (rows) => rows.map(toAuditEvent),
  });
  return { status: statusOf(query), events: query.data ?? [] };
}

/** Admin settings' changes to accounts and projects. Each resolves once the lists and the audit trail have reloaded. */
export function useAdminSaves() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: userKeys.all }),
      queryClient.invalidateQueries({ queryKey: projectKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminKeys.audit }),
    ]);
  const run = useMutation({ mutationFn: (work: () => Promise<unknown>) => work(), onSuccess: refresh });
  const go = async (work: () => Promise<unknown>) => void (await run.mutateAsync(work));

  const userBody = (draft: AdminUserDraft) => ({
    first_name: draft.firstName,
    last_name: draft.lastName,
    role: draft.role,
    support_user: draft.supportUser,
    disabled: draft.disabled,
  });

  return {
    createUser: (draft: AdminUserDraft) => go(() => request("POST", "/api/users", { ...userBody(draft), email: draft.email, password: draft.password })),
    updateUser: (id: string, draft: AdminUserDraft) =>
      go(() => request("PATCH", `/api/users/${id}`, { ...userBody(draft), email: draft.email, ...(draft.password && { password: draft.password }) })),
    setUserDisabled: (id: string, disabled: boolean) => go(() => request("PATCH", `/api/users/${id}`, { disabled })),
    scheduleUserDeletion: (id: string) => go(() => request("DELETE", `/api/users/${id}`)),
    cancelUserDeletion: (id: string) => go(() => request("DELETE", `/api/users/${id}/scheduled_deletion`)),

    /** Creates a project with its members, by email; exactly one is the owner. */
    createProject: (draft: AdminProjectDraft, emailOf: (userId: string) => string | undefined) =>
      go(() =>
        request("PUT", `/api/projects/${crypto.randomUUID()}`, {
          name: draft.name,
          description: draft.description,
          members: draft.members.map((m) => ({ email: emailOf(m.userId), role: m.role })),
        }),
      ),
    /**
     * Renames a project and brings its members in line with the draft: adds
     * and changes roles one member at a time, and removes whoever's gone. The
     * owner can't change (the API's one-owner rule), so a draft that changes
     * them is refused.
     */
    updateProject: (id: string, before: AdminProject, draft: AdminProjectDraft) =>
      go(async () => {
        await request("PUT", `/api/projects/${id}`, { name: draft.name, description: draft.description });
        for (const m of draft.members) {
          const was = before.members.find((b) => b.userId === m.userId);
          if (!was || was.role !== m.role) await request("PUT", `/api/projects/${id}/members/${m.userId}`, { role: m.role });
        }
        for (const b of before.members) {
          if (!draft.members.some((m) => m.userId === b.userId)) await request("DELETE", `/api/projects/${id}/members/${b.userId}`);
        }
      }),
    scheduleProjectDeletion: (id: string) => go(() => request("DELETE", `/api/projects/${id}`)),
    cancelProjectDeletion: (id: string) => go(() => request("DELETE", `/api/projects/${id}/scheduled_deletion`)),
  };
}
