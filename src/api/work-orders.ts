/**
 * Work orders, runs and their dataclips on Lightning's API
 * (api/work-orders.md, api/runs.md, api/dataclips.md): the API's shapes,
 * keys, and the hooks the editor and History call. Runs come whole, as the
 * demo draws them (the planned `include=runs`).
 */
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Dataclip, RunDetails, RunStatus, WorkOrder } from "../model/workflow";
import type { ApprovalDecision, OutcomeStatus } from "../model/step-tools";
import { listAll, request } from "./client";
import { follow } from "./realtime";
import { statusOf, type LoadStatus } from "./status";

/** A work order as `GET …/work_orders?include=runs` sends it. */
export interface ApiWorkOrder {
  id: string;
  attributes: {
    state: RunStatus;
    last_activity: string;
    workflow_id: string;
    dataclip_id: string;
    /** Planned (docs/api-plans/step-tools.md): the business outcome its latest run reported. */
    outcome_status?: OutcomeStatus | null;
    outcome_description?: string | null;
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
  workOrder: {
    id,
    status: a.state,
    lastActivity: a.last_activity,
    runs: a.runs ?? [],
    ...(a.outcome_status && { outcome: { status: a.outcome_status, description: a.outcome_description ?? "" } }),
  },
  workflowId: a.workflow_id,
  projectId,
  input: a.input ?? { id: a.dataclip_id, type: "http_request", body: "{}", created: a.last_activity },
  receivedAt: a.received_at ?? a.inserted_at,
});

/**
 * What a list reads as before it loads, or when the API has none to send (Lightning answers a project's
 * dataclips 404). One array, the same every render: the editor takes a new list as new history and
 * starts over from it, which would drop a run it's in the middle of.
 */
const none: never[] = [];

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
  return { status: projectIds.length ? statusOf(query) : { state: "ready" }, workOrders: query.data ?? none };
}

/** A project's dataclips (inputs, step results, saved inputs). */
export function useDataclips(projectId: string | undefined): { status: LoadStatus; dataclips: (Dataclip & { workflow_id: string | null })[] } {
  const query = useQuery({
    queryKey: runKeys.dataclips(projectId ?? ""),
    enabled: !!projectId,
    queryFn: () => listAll<Dataclip & { workflow_id: string | null }>(`/api/projects/${projectId}/dataclips`),
  });
  return { status: projectId ? statusOf(query) : { state: "ready" }, dataclips: query.data ?? none };
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
    /** Answers the Human in the loop step a run is waiting on; the run carries on with the answer. */
    answer: (runId: string, decision: ApprovalDecision, comment?: string) =>
      go(() => request("POST", `/api/demo/runs/${runId}/approval`, { decision, ...(comment && { comment }) })),
    /**
     * Starts a work order by hand, as the Run button does: from a job, or from the trigger's first, on a
     * dataclip already there or a new input (`{}` when neither is given). Resolves with the run it started,
     * once the lists have it; the server runs it, and `useFollowRun` hears how it goes.
     */
    start: (projectId: string, workflowId: string, from: { jobId: string } | { triggerId: string }, input: { dataclipId: string } | { body: unknown } | undefined) => {
      let started: { runId: string | undefined; workOrderId: string } | undefined;
      return go(async () => {
        const { data } = await request<{ data: ApiWorkOrder }>("POST", `/api/projects/${projectId}/workflows/${workflowId}/work_orders`, {
          ...("jobId" in from ? { job_id: from.jobId } : { trigger_id: from.triggerId }),
          ...(input && ("dataclipId" in input ? { dataclip_id: input.dataclipId } : { body: input.body })),
        });
        // Lightning doesn't send a work order's runs yet (docs/api-gaps.md): the run is started, but there's none to name.
        started = { runId: data.attributes.runs?.[0]?.runId, workOrderId: data.id };
      }).then(() => started!);
    },
    /** A new run on the same work order: from one of the run's steps (by the step's id, or its job's), or from the start. Resolves with the new run's id, once the lists have it. */
    retryRun: (runId: string, stepId?: string) => {
      let made: string | undefined;
      return go(async () => {
        const { data } = await request<{ data: { id: string } }>("POST", `/api/runs/${runId}/retries`, stepId ? { step_id: stepId } : {});
        made = data.id;
      }).then(() => ({ runId: made! }));
    },
  };
}

/**
 * Keeps the run lists in step with a run while it's going: each time the
 * server says something about it (a step started or finished, the run
 * ended), work orders and dataclips are asked for again, so whoever shows
 * the run redraws from the server's copy. Pass undefined to follow nothing,
 * e.g. once the run is over.
 */
export function useFollowRun(runId: string | undefined) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!runId) return;
    return follow(`run:${runId}`, () => void queryClient.invalidateQueries({ queryKey: runKeys.all }));
  }, [runId, queryClient]);
}

/** Keeps the run lists in step with a workflow's history: a work order made, or run again, by anyone. */
export function useFollowWorkflowRuns(workflowId: string | undefined) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!workflowId) return;
    return follow(`workflow:${workflowId}`, (event) => {
      // Without a socket there's nothing to hear, and asking every few seconds for a history nobody is waiting on isn't worth it.
      if (event !== "poll") void queryClient.invalidateQueries({ queryKey: runKeys.all });
    });
  }, [workflowId, queryClient]);
}
