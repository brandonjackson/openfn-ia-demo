/**
 * The organisation's connected systems and their access grants, on the
 * demo's own routes (`/api/demo/connected_systems`; Lightning's API has no
 * connected systems yet).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ConnectedSystem, SystemChanges } from "../model/connected-systems";
import type { AccessGrant } from "../model/page-data";
import { listAll, request } from "./client";
import { statusOf, type LoadStatus } from "./status";

interface ApiSystem {
  id: string;
  attributes: Omit<ConnectedSystem, "id"> & { access_grant_count: number };
}

export const systemKeys = { all: ["connected_systems"] as const, grants: (id: string) => ["connected_systems", id, "grants"] as const };

/** Every connected system, by name. */
export function useConnectedSystems(): { status: LoadStatus; systems: ConnectedSystem[] } {
  const query = useQuery({
    queryKey: systemKeys.all,
    queryFn: () => listAll<ApiSystem>("/api/demo/connected_systems"),
    select: (rows) => rows.map(({ id, attributes }) => ({ ...attributes, id })),
  });
  return { status: statusOf(query), systems: query.data ?? [] };
}

/** Who has access to a system. */
export function useAccessGrants(systemId: string | undefined): { status: LoadStatus; grants: AccessGrant[] } {
  const query = useQuery({
    queryKey: systemKeys.grants(systemId ?? ""),
    enabled: !!systemId,
    queryFn: () => listAll<AccessGrant & { system_id: string }>(`/api/demo/connected_systems/${systemId}/access_grants`),
  });
  return { status: systemId ? statusOf(query) : { state: "ready" }, grants: query.data ?? [] };
}

/** What adding a system asks for. */
export interface SystemDraft {
  name: string;
  description: string;
  adaptor: string;
  endpointUrl?: string;
  docsUrl?: string;
}

/** Adding, editing, removing and revoking access to systems. Each resolves once the systems have reloaded. */
export function useSystemSaves() {
  const queryClient = useQueryClient();
  const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: systemKeys.all }), queryClient.invalidateQueries({ queryKey: ["audit_events"] })]);
  const run = useMutation({ mutationFn: (work: () => Promise<unknown>) => work(), onSuccess: refresh });
  const go = <T,>(work: () => Promise<T>) => run.mutateAsync(work) as Promise<T>;
  const blank = { url: "", credential: "" };
  return {
    /** Adds a system; answers with its id. */
    add: (draft: SystemDraft) =>
      go(async () => {
        const id = crypto.randomUUID();
        await request("PUT", `/api/demo/connected_systems/${id}`, {
          name: draft.name,
          description: draft.description,
          adaptor: draft.adaptor,
          ...(draft.docsUrl && { apiDocsUrl: draft.docsUrl }),
          environments: { production: { ...blank, url: draft.endpointUrl ?? "" }, staging: blank, mock: blank },
        });
        return id;
      }),
    /** Adds a system from what the X-Road directory says about a service. */
    addFromXRoad: (system: Omit<ConnectedSystem, "id">) =>
      go(async () => {
        const id = crypto.randomUUID();
        await request("PUT", `/api/demo/connected_systems/${id}`, system);
        return id;
      }),
    /** Saves changes to a system's details and, for a direct one, where it lives; each environment keeps its credential. */
    edit: (system: ConnectedSystem, changes: SystemChanges) =>
      go(() =>
        request("PUT", `/api/demo/connected_systems/${system.id}`, {
          name: changes.name,
          description: changes.description,
          apiDocsUrl: changes.docsUrl,
          ...(changes.urls && {
            environments: Object.fromEntries(
              Object.entries(system.environments).map(([env, value]) => [env, { ...value, url: changes.urls![env as keyof typeof changes.urls].trim() }]),
            ),
          }),
        }),
      ).then(() => undefined),
    remove: (id: string) => go(() => request("DELETE", `/api/demo/connected_systems/${id}`)).then(() => undefined),
    revokeGrant: (systemId: string, grantId: string) =>
      go(async () => {
        await request("DELETE", `/api/demo/connected_systems/${systemId}/access_grants/${grantId}`);
        await queryClient.invalidateQueries({ queryKey: systemKeys.grants(systemId) });
      }),
  };
}
