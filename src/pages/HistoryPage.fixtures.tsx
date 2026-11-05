import { useNavigate, useSearchParams } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import { saveWorkOrders, useChangedHistories } from "../app/history-state";
import type { HistoryPageData } from "../model/page-data";
import type { Dataclip, RunStatus, WorkOrder } from "../model/workflow";
import { defaultHistoryFilters, historySearchFields, historyStatuses, type HistoryFilters } from "../model/history";
import { shortId } from "../model/runs";
import {
  allChannelRequests,
  allWorkOrders,
  currentWorkOrders,
  historyWorkflows,
  latestRunVersion,
  projectChannelRequests,
  projectWorkOrders,
} from "../fixtures/history";
import { projects } from "../fixtures/projects";
import { simulateRun } from "../fixtures/runs";
import { resolveWorkflow } from "../fixtures/workflow-lookup";
import { currentUser } from "../fixtures/user";
import HistoryPage from "./HistoryPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/**
 * History's filters, from the URL: `?status=failed,cancelled`,
 * `?workflow=<id>`, `?project=<id>`, `?workorder=<id>`, `?q=` with
 * `?in=id,body`, `?received_after=` / `_before=` and `?activity_after=` /
 * `_before=` (datetime-local values), and on the channel requests tab
 * (`?type=channels`; Insights links it as `Channel+Request`) `?channel=` and
 * `?request_status=ok|failed`. Anything missing or unknown is left unfiltered.
 */
function filtersFrom(params: URLSearchParams): HistoryFilters {
  const list = (key: string) => (params.get(key) ?? "").split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
  const fields = historySearchFields.filter((f) => list("in").includes(f.id.toLowerCase())).map((f) => f.id);
  const requestStatus = params.get("request_status");
  return {
    tab: params.get("type")?.toLowerCase().startsWith("channel") ? "channels" : "work-orders",
    search: params.get("q") ?? "",
    searchFields: fields.length ? fields : defaultHistoryFilters.searchFields,
    projectId: params.get("project"),
    workflowId: params.get("workflow"),
    statuses: historyStatuses.filter((s) => list("status").some((v) => v === s.id || v === s.label.toLowerCase())).map((s) => s.id),
    receivedAfter: params.get("received_after"),
    receivedBefore: params.get("received_before"),
    activityAfter: params.get("activity_after"),
    activityBefore: params.get("activity_before"),
    workOrderId: params.get("workorder"),
    channelId: params.get("channel"),
    requestStatus: requestStatus === "ok" || requestStatus === "failed" ? requestStatus : null,
  };
}

/** The URL's search for `filters`, leaving out whatever is as History opens. */
function paramsFor(filters: HistoryFilters): URLSearchParams {
  const f = filters;
  const entries: [string, string | null][] = [
    ["type", f.tab === "channels" ? "channels" : null],
    ["q", f.search || null],
    ["in", f.searchFields.join(",") === defaultHistoryFilters.searchFields.join(",") ? null : f.searchFields.join(",")],
    ["project", f.projectId],
    ["workflow", f.workflowId],
    ["status", f.statuses.join(",") || null],
    ["received_after", f.receivedAfter],
    ["received_before", f.receivedBefore],
    ["activity_after", f.activityAfter],
    ["activity_before", f.activityBefore],
    ["workorder", f.workOrderId],
    ["channel", f.channelId],
    ["request_status", f.requestStatus],
  ];
  return new URLSearchParams(entries.filter((e): e is [string, string] => !!e[1]));
}

/**
 * Feeds History from fixtures: one project's, or the organisation's across
 * every project. Retrying and cancelling change the work orders for the rest
 * of the session (see `history-state`), so the editor opens retried runs too.
 */
export default function HistoryPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const changed = useChangedHistories();
  const project = routeProject(route);
  if (project === null) return <NotFoundPage path={route.currentPath} reason="data" />;

  const changedOrders = Object.fromEntries(Object.entries(changed).map(([id, h]) => [id, h.workOrders]));
  const scope = project ? [project] : projects;
  const data: HistoryPageData = {
    pageType: "table",
    workOrders: project ? projectWorkOrders(project, changedOrders) : allWorkOrders(changedOrders),
    channelRequests: project ? projectChannelRequests(project) : allChannelRequests(),
    workflows: scope.flatMap(historyWorkflows),
    projects: project ? undefined : projects.map((p) => ({ id: p.id, name: p.name })),
  };
  const workflowOf = (workOrderId: string) => data.workOrders.find((o) => o.workOrder.id === workOrderId);

  /** Applies `change` to each of these work orders, saving each workflow's list once. */
  function update(ids: string[], change: (order: WorkOrder, workflowId: string) => { order: WorkOrder; dataclips?: Dataclip[] }) {
    const byWorkflow = new Map<string, string[]>();
    for (const id of ids) {
      const workflowId = workflowOf(id)?.workflowId;
      if (workflowId) byWorkflow.set(workflowId, [...(byWorkflow.get(workflowId) ?? []), id]);
    }
    for (const [workflowId, orderIds] of byWorkflow) {
      const made: Dataclip[] = [];
      const next = currentWorkOrders(workflowId, changedOrders).map((o) => {
        if (!orderIds.includes(o.id)) return o;
        const { order, dataclips = [] } = change(o, workflowId);
        made.push(...dataclips);
        return order;
      });
      saveWorkOrders(workflowId, next, made);
    }
  }

  /** A new run of the order, from the start or from a step, put first. */
  function retry(ids: string[], fromJobId?: string) {
    update(ids, (order, workflowId) => {
      const input = workflowOf(order.id)!.input;
      const { run, dataclips } = simulateRun({
        workflow: resolveWorkflow(workflowId),
        version: latestRunVersion(workflowId),
        input,
        workOrderId: order.id,
        runId: shortId(),
        fromJobId,
        startedBy: `${currentUser.firstName} ${currentUser.lastName}`,
      });
      return { order: { ...order, status: run.status, lastActivity: run.when, runs: [run, ...order.runs] }, dataclips };
    });
  }

  const cancelled: RunStatus = "cancelled";
  const filters = filtersFrom(searchParams);

  return (
    <HistoryPage
      // A new page starts afresh rather than keeping the last page's picks.
      key={route.currentPath}
      {...pageFrame(route)}
      data={data}
      filters={filters}
      // Each change is a step Back can undo, except typing in the search, which would leave one per letter.
      onFiltersChange={(next) => setSearchParams(paramsFor(next), { replace: next.search !== filters.search })}
      onRetry={async (ids) => retry(ids)}
      onRetryFromStep={async (ids, jobId) => retry(ids, jobId)}
      onCancel={async (ids) =>
        update(ids, (order) => ({
          order: {
            ...order,
            status: cancelled,
            runs: order.runs.map((r) => (r.status === "pending" ? { ...r, status: cancelled } : r)),
          },
        }))
      }
      onInspectRun={(order, run) => navigate(`/workflow-editor/${order.workflowId}?run=${run.runId}`)}
      onOpenChannelRun={(request) => request.workflowId && navigate(`/workflow-editor/${request.workflowId}?run=${request.runId}`)}
      // The export itself shows up in the project's settings; the fixtures have nowhere to keep it yet.
      onExport={async () => {}}
    />
  );
}
