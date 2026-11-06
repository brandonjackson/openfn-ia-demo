/** Projects and their members on Lightning's API (api/projects.md): the API's shape, its mappers, its keys, and the hooks a .query wrapper calls. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DigestFrequency, ProjectRole } from "../model/project-settings";
import { projectSummaries, type InstanceUserSummary, type ProjectAction, type ProjectDetails, type ProjectMember, type ProjectSummary, type RetentionPolicy } from "../model/projects";
import { useAllServices } from "./services";
import { listAll, request } from "./client";
import { statusOf, type LoadStatus } from "./status";

/** A project as GET /api/projects/:id sends it, planned attributes included. */
export interface ApiProject {
  id: string;
  attributes: {
    name: string;
    description: string | null;
    env?: string;
    color?: string | null;
    concurrency?: number | null;
    retention_policy?: RetentionPolicy;
    history_retention_period?: number | null;
    dataclip_retention_period?: number | null;
    allowed_retention_periods?: number[];
    requires_mfa?: boolean;
    allow_support_access?: boolean;
    parent_id?: string | null;
    root_id?: string;
    scheduled_deletion?: string | null;
    inserted_at?: string;
    role?: ProjectRole | null;
    workflows_count?: number;
    collaborators_count?: number;
    last_activity?: string | null;
    owner?: { id: string; email: string; first_name: string; last_name: string } | null;
    permissions?: Partial<Record<ProjectAction, boolean>>;
  };
}

/** A member as GET /api/projects/:id/members lists them. */
export interface ApiMember {
  id: string;
  attributes: { email: string; first_name: string; last_name: string; role: ProjectRole; failure_alert: boolean; digest: DigestFrequency };
}

/** A user as GET /api/users lists them. */
export interface ApiUser {
  id: string;
  attributes: { email: string; first_name: string; last_name: string };
}

export function toProject({ id, attributes: a }: ApiProject): ProjectDetails {
  return {
    id,
    name: a.name,
    description: a.description ?? "",
    env: a.env ?? "main",
    parentId: a.parent_id ?? null,
    rootId: a.root_id ?? id,
    color: a.color ?? null,
    concurrency: a.concurrency ?? null,
    retentionPolicy: a.retention_policy ?? "retain_all",
    historyRetentionDays: a.history_retention_period ?? null,
    dataclipRetentionDays: a.dataclip_retention_period ?? null,
    allowedRetentionDays: a.allowed_retention_periods ?? [],
    requiresMfa: a.requires_mfa ?? false,
    allowSupportAccess: a.allow_support_access ?? false,
    scheduledDeletion: a.scheduled_deletion ?? null,
    createdAt: a.inserted_at ?? "",
    role: a.role ?? undefined,
    workflowsCount: a.workflows_count,
    collaboratorsCount: a.collaborators_count,
    lastActivity: a.last_activity,
    owner: a.owner && { id: a.owner.id, email: a.owner.email, firstName: a.owner.first_name, lastName: a.owner.last_name },
    permissions: a.permissions,
  };
}

const toMember = ({ id, attributes: a }: ApiMember): ProjectMember => ({
  userId: id,
  email: a.email,
  firstName: a.first_name,
  lastName: a.last_name,
  role: a.role,
  failureAlert: a.failure_alert,
  digest: a.digest,
});

const toUser = ({ id, attributes: a }: ApiUser): InstanceUserSummary => ({ id, email: a.email, firstName: a.first_name, lastName: a.last_name });

export const projectKeys = {
  all: ["projects"] as const,
  list: ["projects", "list"] as const,
  one: (id: string) => ["projects", id] as const,
  members: (id: string) => ["projects", id, "members"] as const,
};
export const userKeys = { all: ["users"] as const };

/**
 * Every project you can see, with its stats: your projects, and for a
 * superuser every project on the instance, scheduled ones included (planned).
 */
export function useProjectList(): { status: LoadStatus; projects: ProjectDetails[] } {
  const query = useQuery({
    queryKey: projectKeys.list,
    queryFn: () => listAll<ApiProject>("/api/projects?include=stats"),
    select: (rows) => rows.map(toProject),
  });
  return { status: statusOf(query), projects: query.data ?? [] };
}

/**
 * The cards for the projects you can open (members only, none being
 * deleted), for the Projects list and Overview. With `withServices`, each
 * counts its published services once they've loaded; without, or if they
 * fail to load, the cards show no counts rather than wrong ones, and the list
 * still shows.
 */
export function useProjectSummaries(withServices: boolean): { status: LoadStatus; projects: ProjectSummary[] } {
  const { status, projects } = useProjectList();
  const { status: servicesStatus, services } = useAllServices(withServices);
  const counted = withServices && servicesStatus.state === "ready" ? services : undefined;
  return { status, projects: projectSummaries(projects, counted) };
}

/** One project, with your permissions in it. Not found (or not yours to see) is `notFound`. */
export function useProject(id: string | undefined): { status: LoadStatus; project: ProjectDetails | undefined } {
  const query = useQuery({
    queryKey: projectKeys.one(id ?? ""),
    enabled: !!id,
    queryFn: () => request<{ data: ApiProject }>("GET", `/api/projects/${id}`).then((a) => a.data),
    select: toProject,
  });
  return { status: id ? statusOf(query) : { state: "notFound" }, project: query.data };
}

/** A project's members, sorted by first name. */
export function useProjectMembers(id: string): { status: LoadStatus; members: ProjectMember[] } {
  const query = useQuery({
    queryKey: projectKeys.members(id),
    queryFn: () => listAll<ApiMember>(`/api/projects/${id}/members`),
    select: (rows) => rows.map(toMember),
  });
  return { status: statusOf(query), members: query.data ?? [] };
}

/** Everyone on the instance (a superuser's view; planned for personal tokens). */
export function useInstanceUsers(enabled = true): { status: LoadStatus; users: InstanceUserSummary[] } {
  const query = useQuery({
    queryKey: userKeys.all,
    enabled,
    queryFn: () => listAll<ApiUser>("/api/users"),
    select: (rows) => rows.map(toUser),
  });
  return { status: statusOf(query), users: query.data ?? [] };
}

/** What a create or rename sends: the API's own field names. */
export interface ProjectInput {
  name: string;
  description?: string;
  /** Only when creating. */
  env?: string;
  concurrency?: number | null;
}

export interface DataRetentionInput {
  retention_policy: RetentionPolicy;
  history_retention_period: number | null;
  dataclip_retention_period: number | null;
}

/**
 * Creating, changing and deleting projects. Each resolves once every list
 * showing projects has reloaded, and rejects with the `ApiError` (field
 * errors keyed `name`, `description`).
 */
export function useProjectSaves() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: projectKeys.all });
  const create = useMutation({
    mutationFn: (input: ProjectInput) => {
      const id = crypto.randomUUID();
      return request<{ data: ApiProject }>("PUT", `/api/projects/${id}`, input).then((a) => toProject(a.data));
    },
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({ id, ...input }: ProjectInput & { id: string }) => request("PUT", `/api/projects/${id}`, input),
    onSuccess: refresh,
  });
  const scheduleDeletion = useMutation({ mutationFn: (id: string) => request("DELETE", `/api/projects/${id}`), onSuccess: refresh });
  const cancelDeletion = useMutation({ mutationFn: (id: string) => request("DELETE", `/api/projects/${id}/scheduled_deletion`), onSuccess: refresh });
  const setDataRetention = useMutation({
    mutationFn: ({ id, ...input }: DataRetentionInput & { id: string }) => request("PUT", `/api/projects/${id}/data_retention`, input),
    onSuccess: refresh,
  });
  const setMfaRequired = useMutation({
    mutationFn: ({ id, requiresMfa }: { id: string; requiresMfa: boolean }) => request("PUT", `/api/projects/${id}/mfa_requirement`, { requires_mfa: requiresMfa }),
    onSuccess: refresh,
  });
  const setSupportAccess = useMutation({
    mutationFn: ({ id, allow }: { id: string; allow: boolean }) => request("PUT", `/api/projects/${id}/support_access`, { allow_support_access: allow }),
    onSuccess: refresh,
  });
  return {
    /** Creates a project, you its owner, and answers with it. */
    create: (input: ProjectInput) => create.mutateAsync(input),
    update: async (id: string, input: ProjectInput) => void (await update.mutateAsync({ id, ...input })),
    scheduleDeletion: async (id: string) => void (await scheduleDeletion.mutateAsync(id)),
    cancelDeletion: async (id: string) => void (await cancelDeletion.mutateAsync(id)),
    setDataRetention: async (id: string, input: DataRetentionInput) => void (await setDataRetention.mutateAsync({ id, ...input })),
    setMfaRequired: async (id: string, requiresMfa: boolean) => void (await setMfaRequired.mutateAsync({ id, requiresMfa })),
    setSupportAccess: async (id: string, allow: boolean) => void (await setSupportAccess.mutateAsync({ id, allow })),
  };
}

/** Adding, changing and removing a project's members. Each resolves once the member list has reloaded. */
export function useMemberSaves(projectId: string) {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) }),
      queryClient.invalidateQueries({ queryKey: projectKeys.list }),
      queryClient.invalidateQueries({ queryKey: userKeys.all }),
    ]);
  const put = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: ProjectRole }) => request("PUT", `/api/projects/${projectId}/members/${userId}`, { role }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (userId: string) => request("DELETE", `/api/projects/${projectId}/members/${userId}`),
    onSuccess: refresh,
  });
  const invite = useMutation({
    mutationFn: (body: { email: string; first_name: string; last_name: string; role: ProjectRole }) =>
      request("POST", `/api/projects/${projectId}/invitations`, body),
    onSuccess: refresh,
  });
  const notifications = useMutation({
    mutationFn: ({ userId, failureAlert, digest }: { userId: string; failureAlert: boolean; digest: DigestFrequency }) =>
      request("PUT", `/api/projects/${projectId}/members/${userId}/notifications`, { failure_alert: failureAlert, digest }),
    onSuccess: refresh,
  });
  return {
    /** Adds someone who has an account, found by email. Answers false when no account has that email. */
    addByEmail: async (email: string, role: ProjectRole): Promise<boolean> => {
      const { data } = await request<{ data: ApiUser[] }>("GET", `/api/users?email=${encodeURIComponent(email)}`);
      const user = data[0];
      if (!user) return false;
      await put.mutateAsync({ userId: user.id, role });
      return true;
    },
    setRole: async (userId: string, role: ProjectRole) => void (await put.mutateAsync({ userId, role })),
    remove: async (userId: string) => void (await remove.mutateAsync(userId)),
    invite: async (person: { email: string; firstName: string; lastName: string; role: ProjectRole }) =>
      void (await invite.mutateAsync({ email: person.email, first_name: person.firstName, last_name: person.lastName, role: person.role })),
    setNotifications: async (userId: string, failureAlert: boolean, digest: DigestFrequency) =>
      void (await notifications.mutateAsync({ userId, failureAlert, digest })),
  };
}
