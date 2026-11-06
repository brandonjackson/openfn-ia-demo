/** The instance's maintenance jobs, on the demo's own routes (api/ has none; docs/api-gaps.md). */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MaintenanceTask } from "../model/admin";
import { listAll, request } from "./client";
import { statusOf, type LoadStatus } from "./status";

/** A job as GET /api/demo/maintenance lists it. */
interface ApiMaintenanceJob {
  id: string;
  title: string;
  description: string;
  last_run_at: string | null;
  last_run_result: string | null;
}

const toTask = (j: ApiMaintenanceJob): MaintenanceTask => ({
  id: j.id,
  title: j.title,
  description: j.description,
  ...(j.last_run_at && { lastRun: { at: j.last_run_at, result: j.last_run_result ?? "" } }),
});

const keys = { all: ["maintenance"] as const };

/** Every maintenance job, with when it last ran. Superusers only. */
export function useMaintenanceTasks(): { status: LoadStatus; tasks: MaintenanceTask[] } {
  const query = useQuery({ queryKey: keys.all, queryFn: () => listAll<ApiMaintenanceJob>("/api/demo/maintenance"), select: (rows) => rows.map(toTask) });
  return { status: statusOf(query), tasks: query.data ?? [] };
}

/** Running a job. Resolves once the list has reloaded with its result. */
export function useMaintenanceSaves() {
  const queryClient = useQueryClient();
  const run = useMutation({
    mutationFn: (id: string) => request("POST", `/api/demo/maintenance/${id}/runs`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
  return { run: async (id: string) => void (await run.mutateAsync(id)) };
}
