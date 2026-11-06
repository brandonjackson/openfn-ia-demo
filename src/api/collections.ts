/** Collections and their items on Lightning's API (api/collections.md): shapes, mappers, keys and hooks. */
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminCollection, CollectionItem, ProjectCollection } from "../model/collections";
import { timeAgo } from "../model/time";
import { listAll, request } from "./client";
import { combine, statusOf, type LoadStatus } from "./status";

/** A collection as the API lists it: planned `byte_size_sum`, and the demo's count and last write. */
interface ApiCollection {
  id: string;
  project_id: string;
  name: string;
  byte_size_sum: number;
  item_count: number;
  updated_at: string;
  project_name?: string | null;
}

/** An item as `GET /collections/:name` sends it. */
interface ApiItem {
  key: string;
  value: string;
  created: string;
  updated: string;
}

const toCollection = (c: ApiCollection): ProjectCollection => ({
  id: c.id,
  name: c.name,
  itemCount: c.item_count,
  byteSize: c.byte_size_sum,
  updatedAt: timeAgo(c.updated_at),
});

export const collectionKeys = {
  all: ["collections"] as const,
  inProject: (projectId: string) => ["collections", "project", projectId] as const,
  instance: ["collections", "instance"] as const,
};

/** A project's collections, by name. Owners and admins only: anyone else gets `forbidden`, so pass `enabled` false for them. */
export function useCollections(projectId: string, enabled = true): { status: LoadStatus; collections: ProjectCollection[] } {
  const query = useQuery({
    queryKey: collectionKeys.inProject(projectId),
    enabled,
    queryFn: () => listAll<ApiCollection>(`/api/projects/${projectId}/collections`),
    select: (rows) => rows.map(toCollection),
  });
  return { status: enabled ? statusOf(query) : { state: "ready" }, collections: query.data ?? [] };
}

/** Every collection on the instance, for a superuser, with its project. */
export function useInstanceCollections(): { status: LoadStatus; collections: AdminCollection[] } {
  const query = useQuery({
    queryKey: collectionKeys.instance,
    queryFn: () => listAll<ApiCollection>("/api/collections"),
    select: (rows) => rows.map((c) => ({ id: c.id, name: c.name, projectName: c.project_name ?? "", projectId: c.project_id, items: c.item_count, bytes: c.byte_size_sum })),
  });
  return { status: statusOf(query), collections: query.data ?? [] };
}

/** The first few items of a collection, newest first. */
export async function fetchCollectionItems(projectId: string, name: string, limit = 5): Promise<CollectionItem[]> {
  const { items } = await request<{ items: ApiItem[] }>("GET", `/collections/${encodeURIComponent(name)}?project_id=${projectId}&limit=${limit}`);
  return items.map((i) => ({ key: i.key, value: i.value, updatedAt: timeAgo(i.updated) }));
}

/** Making, renaming and deleting collections. Each resolves once the lists have reloaded; a refusal names the field (`name`). */
export function useCollectionSaves() {
  const queryClient = useQueryClient();
  // Collection changes are audited, so the trail reloads too.
  const refresh = () =>
    Promise.all([queryClient.invalidateQueries({ queryKey: collectionKeys.all }), queryClient.invalidateQueries({ queryKey: ["audit_events"] })]);
  const put = useMutation({
    mutationFn: ({ projectId, id, name }: { projectId: string; id: string; name: string }) => request("PUT", `/api/projects/${projectId}/collections/${id}`, { name }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: ({ projectId, id }: { projectId: string; id: string }) => request("DELETE", `/api/projects/${projectId}/collections/${id}`),
    onSuccess: refresh,
  });
  return {
    /** Makes a collection; answers with its id. */
    create: async (projectId: string, name: string) => {
      const id = crypto.randomUUID();
      await put.mutateAsync({ projectId, id, name });
      return id;
    },
    rename: async (projectId: string, id: string, name: string) => void (await put.mutateAsync({ projectId, id, name })),
    remove: async (projectId: string, id: string) => void (await remove.mutateAsync({ projectId, id })),
  };
}

export const collectionItemKeys = { of: (projectId: string, name: string) => ["collections", "items", projectId, name] as const };

/** Every key of one of a project's collections (up to the API's page of 1,000), newest first. Any member reads them. */
export function useCollectionItems(projectId: string | undefined, name: string | undefined): { status: LoadStatus; items: CollectionItem[] } {
  const query = useQuery({
    queryKey: collectionItemKeys.of(projectId ?? "", name ?? ""),
    enabled: !!projectId && !!name,
    queryFn: () => fetchCollectionItems(projectId!, name!, 1000),
  });
  return { status: projectId && name ? statusOf(query) : { state: "ready" }, items: query.data ?? [] };
}

/** Every key of each of these collections of a project, by collection name, for a view that may open any of them. */
export function useCollectionsItems(projectId: string | undefined, names: string[]): { status: LoadStatus; items: Record<string, CollectionItem[]> } {
  const queries = useQueries({
    queries: names.map((name) => ({
      queryKey: collectionItemKeys.of(projectId ?? "", name),
      enabled: !!projectId,
      queryFn: () => fetchCollectionItems(projectId!, name, 1000),
    })),
  });
  return {
    status: projectId ? combine(...queries.map(statusOf)) : { state: "ready" },
    items: Object.fromEntries(names.map((name, i) => [name, queries[i]?.data ?? []])),
  };
}

/**
 * Writing and deleting a collection's keys, by the collection's name. Each
 * resolves once its keys and the project's collections have reloaded.
 * Editors and up write keys; a viewer is refused.
 */
export function useCollectionItemSaves(projectId: string) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: collectionKeys.all });
  const put = useMutation({
    mutationFn: ({ name, key, value }: { name: string; key: string; value: string }) =>
      request("PUT", `/collections/${encodeURIComponent(name)}/${encodeURIComponent(key)}?project_id=${projectId}`, { value }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: ({ name, key }: { name: string; key: string }) => request("DELETE", `/collections/${encodeURIComponent(name)}/${encodeURIComponent(key)}?project_id=${projectId}`),
    onSuccess: refresh,
  });
  return {
    save: async (name: string, key: string, value: string) => void (await put.mutateAsync({ name, key, value })),
    remove: async (name: string, key: string) => void (await remove.mutateAsync({ name, key })),
  };
}
