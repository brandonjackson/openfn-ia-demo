/**
 * Work orders, runs and their dataclips on Lightning's API
 * (api/work-orders.md, api/runs.md, api/dataclips.md): the API's shapes,
 * keys, and the hooks the editor and History call. Runs come whole, as the
 * demo draws them (the planned `include=runs`).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Dataclip, RunDetails, RunStatus, WorkOrder } from "../model/workflow";
import { listAll, request } from "./client";
import { statusOf, type LoadStatus } from "./status";

/** A work order as `GET …/work_orders?include=runs` sends it. */
export interface ApiWorkOrder {
  id: string;
  attributes: {
    state: RunStatus;
    last_activity: string;
    workflow_id: string;
    dataclip_id: string;
    /** Only with `include=runs`, which Lightning doesn't send yet (docs/api-gaps.md). */
    runs?: RunDetails[];
    input: Dataclip | null;
    inserted_at: string;
    /** The demo's: when its first run started, in the fixtures' words. Lightning sends only `inserted_at`. */
    received_at?: string;
  };
}

/** A work order as the demo draws it, with what History lists it by. */
export interface WorkOrderRecord {
  workOrder: WorkOrder;
  workflowId: string;
  projectId: string;
  input: Dataclip;
  receivedAt: string;
}

/**
 * Reads a work order in. Lightning sends one without its runs (`include=runs`
 * is Planned), so it reads as having none, rather than leaving `runs` unset
 * for Overview and Insights to add up.
 */
export const toRecord = ({ id, attributes: a }: ApiWorkOrder, projectId: string): WorkOrderRecord => ({
  workOrder: { id, status: a.state, lastActivity: a.last_activity, runs: a.runs ?? [] },
  workflowId: a.workflow_id,
  projectId,
  input: a.input ?? { id: a.dataclip_id, type: "http_request", body: "{}", created: a.last_activity },
  receivedAt: a.received_at ?? a.inserted_at,
});

export const runKeys = {
  all: ["work_orders"] as const,
  inProjects: (projectIds: string[]) => ["work_orders", ...projectIds] as const,
  dataclips: (projectId: string) => ["work_orders", "dataclips", projectId] as const,
};

/** Every work order in these projects, with its runs, newest first. */
export function useWorkOrders(projectIds: string[]): { status: LoadStatus; workOrders: WorkOrderRecord[] } {
  const query = useQuery({
    queryKey: runKeys.inProjects(projectIds),
    enabled: projectIds.length > 0,
    queryFn: async () => {
      const lists = await Promise.all(projectIds.map((p) => listAll<ApiWorkOrder>(`/api/projects/${p}/work_orders?include=runs`).then((rows) => rows.map((r) => toRecord(r, p)))));
      return lists.flat();
    },
  });
  return { status: projectIds.length ? statusOf(query) : { state: "ready" }, workOrders: query.data ?? [] };
}

/** A project's dataclips (inputs, step results, saved inputs). */
export function useDataclips(projectId: string | undefined): { status: LoadStatus; dataclips: (Dataclip & { workflow_id: string })[] } {
  const query = useQuery({
    queryKey: runKeys.dataclips(projectId ?? ""),
    enabled: !!projectId,
    queryFn: () => listAll<Dataclip & { workflow_id: string }>(`/api/projects/${projectId}/dataclips`),
  });
  return { status: projectId ? statusOf(query) : { state: "ready" }, dataclips: query.data ?? [] };
}

/**
 * Retrying and cancelling work orders, and recording a run the editor made.
 * Each resolves once History and the editor's run lists have reloaded.
 */
export function useRunSaves() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: runKeys.all });
  const run = useMutation({ mutationFn: (work: () => Promise<unknown>) => work(), onSuccess: refresh });
  const go = (work: () => Promise<unknown>) => run.mutateAsync(work).then(() => undefined);
  /** Groups ids by the project they're in, for the project-scoped bulk routes. */
  const byProject = (orders: { id: string; projectId: string }[]) => {
    const groups = new Map<string, string[]>();
    for (const o of orders) groups.set(o.projectId, [...(groups.get(o.projectId) ?? []), o.id]);
    return groups;
  };
  return {
    /** A new run of each work order, from the start or from a step. */
    retry: (orders: { id: string; projectId: string }[], fromJobId?: string) =>
      go(async () => {
        for (const [projectId, ids] of byProject(orders)) {
          await request("POST", `/api/projects/${projectId}/work_orders/retries`, { work_order_ids: ids, ...(fromJobId && { job_id: fromJobId }) });
        }
      }),
    /** Cancels each work order's runs that haven't started. */
    cancel: (orders: { id: string; projectId: string }[]) =>
      go(async () => {
        for (const [projectId, ids] of byProject(orders)) await request("POST", `/api/projects/${projectId}/work_orders/cancellations`, { work_order_ids: ids });
      }),
    /** Records a run the editor made, on a new work order or as another run of one (standing in for Lightning's worker). */
    record: (projectId: string, workflowId: string, made: RunDetails, dataclips: Dataclip[], workOrderId?: string) =>
      go(() =>
        request("POST", `/api/projects/${projectId}/workflows/${workflowId}/work_orders`, {
          run: made,
          dataclips,
          ...(workOrderId && { work_order_id: workOrderId }),
        }),
      ),
  };
}
