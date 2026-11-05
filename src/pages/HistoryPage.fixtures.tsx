import { useNavigate, useSearchParams } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import { saveWorkOrders, useChangedHistories } from "../app/history-state";
import type { HistoryPageData } from "../model/page-data";
import type { Dataclip, RunStatus, WorkOrder } from "../model/workflow";
import { historyStatuses } from "../model/history";
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
import HistoryPage, { type HistoryFilters } from "./HistoryPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/**
 * Where History starts, from the URL: `?status=failed`, `?workflow=<id>`,
 * `?project=<id>`, and `?type=Channel+Request` (as Insights links it) for
 * the channel requests.
 */
function filtersFrom(params: URLSearchParams): HistoryFilters {
  const status = params.get("status")?.toLowerCase();
  return {
    tab: params.get("type")?.toLowerCase().startsWith("channel") ? "channels" : undefined,
    status: historyStatuses.find((s) => s.id === status || s.label.toLowerCase() === status)?.id,
    workflowId: params.get("workflow") ?? undefined,
    projectId: params.get("project") ?? undefined,
  };
}

/**
 * Feeds History from fixtures: one project's, or the organisation's across
 * every project. Retrying and cancelling change the work orders for the rest
 * of the session (see `history-state`), so the editor opens retried runs too.
 */
export default function HistoryPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  return (
    <HistoryPage
      // A new page, or new filters in the URL, start afresh rather than keeping the last page's filters.
      key={`${route.currentPath}?${searchParams.toString()}`}
      {...pageFrame(route)}
      data={data}
      initialFilters={filtersFrom(searchParams)}
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
