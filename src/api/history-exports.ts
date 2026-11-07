/** History exports on Lightning's API (api/work-orders.md, History exports). */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HistoryExport } from "../model/page-data";
import { formatDateTime } from "../model/time";
import { listAll, request } from "./client";
import { statusOf, type LoadStatus } from "./status";

interface ApiHistoryExport {
  id: string;
  attributes: {
    state: "enqueued" | "in_progress" | "completed" | "failed";
    filename: string | null;
    created_by_name: string;
    inserted_at: string;
  };
}

const toExport = ({ id, attributes: a }: ApiHistoryExport): HistoryExport => ({
  id,
  ...(a.filename && { fileName: a.filename }),
  requestedBy: a.created_by_name,
  createdAt: formatDateTime(a.inserted_at),
  status: a.state === "in_progress" ? "processing" : a.state,
});

const keys = { inProject: (projectId: string) => ["history_exports", projectId] as const };

/** A project's history exports, newest first. While one is still being made, they're asked for again every second. */
export function useHistoryExports(projectId: string): { status: LoadStatus; exports: HistoryExport[] } {
  const query = useQuery({
    queryKey: keys.inProject(projectId),
    queryFn: () => listAll<ApiHistoryExport>(`/api/projects/${projectId}/history_exports`),
    select: (rows) => rows.map(toExport),
    refetchInterval: (q) => (q.state.data?.some((e) => e.attributes.state === "enqueued" || e.attributes.state === "in_progress") ? 1000 : false),
  });
  return { status: statusOf(query), exports: query.data ?? [] };
}

/**
 * Asks for an export of the project's history: all of it, or just these work
 * orders (the list's `id` filter). Resolves once the list shows it.
 */
export function useHistoryExportSaves(projectId: string) {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: (workOrderIds?: string[]) =>
      request("POST", `/api/projects/${projectId}/history_exports`, workOrderIds ? { filter: { id: workOrderIds.join(",") } } : {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.inProject(projectId) }),
  });
  return { create: async (workOrderIds?: string[]) => void (await create.mutateAsync(workOrderIds)) };
}
