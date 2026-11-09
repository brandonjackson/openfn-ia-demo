/**
 * A project's environment variables on the demo's own routes
 * (`/api/demo/projects/:id/env_vars`): shapes, mappers, keys and hooks.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Environment } from "../model/credentials";
import type { EnvVar, EnvVarDraft } from "../model/env-vars";
import { timeAgo } from "../model/time";
import { listAll, request } from "./client";
import { statusOf, type LoadStatus } from "./status";

/** A variable as the API sends it. */
interface ApiEnvVar {
  id: string;
  attributes: {
    key: string;
    value: string | null;
    secret: boolean;
    environments: Environment[];
    updated_by: string;
    updated_at: string;
  };
}

const toEnvVar = ({ id, attributes: a }: ApiEnvVar): EnvVar => ({
  id,
  key: a.key,
  value: a.value,
  secret: a.secret,
  environments: a.environments,
  updatedAt: timeAgo(a.updated_at),
  updatedBy: a.updated_by,
});

export const envVarKeys = { inProject: (projectId: string) => ["env_vars", projectId] as const };

/** A project's environment variables, by key. Pass undefined to load none, e.g. with the flag off. */
export function useEnvVars(projectId: string | undefined): { status: LoadStatus; envVars: EnvVar[] } {
  const query = useQuery({
    queryKey: envVarKeys.inProject(projectId ?? ""),
    enabled: !!projectId,
    queryFn: () => listAll<ApiEnvVar>(`/api/demo/projects/${projectId}/env_vars`),
    select: (rows) => rows.map(toEnvVar),
  });
  return { status: projectId ? statusOf(query) : { state: "ready" }, envVars: query.data ?? [] };
}

/**
 * Making, changing and deleting a project's variables. Each resolves once
 * the list has reloaded; a refusal names its field (`key`, `value`,
 * `environments`).
 */
export function useEnvVarSaves(projectId: string) {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([queryClient.invalidateQueries({ queryKey: envVarKeys.inProject(projectId) }), queryClient.invalidateQueries({ queryKey: ["audit_events"] })]);
  const path = `/api/demo/projects/${projectId}/env_vars`;
  const create = useMutation({ mutationFn: (draft: EnvVarDraft) => request("POST", path, bodyOf(draft)), onSuccess: refresh });
  const update = useMutation({ mutationFn: ({ id, draft }: { id: string; draft: EnvVarDraft }) => request("PATCH", `${path}/${id}`, bodyOf(draft)), onSuccess: refresh });
  const remove = useMutation({ mutationFn: (id: string) => request("DELETE", `${path}/${id}`), onSuccess: refresh });
  return {
    create: async (draft: EnvVarDraft) => void (await create.mutateAsync(draft)),
    /** A secret's blank value keeps the stored one. */
    update: async (id: string, draft: EnvVarDraft) => void (await update.mutateAsync({ id, draft })),
    remove: async (id: string) => void (await remove.mutateAsync(id)),
  };
}

const bodyOf = (d: EnvVarDraft) => ({ key: d.key.trim(), value: d.value, secret: d.secret, environments: d.environments });
