import { useNavigate, useSearchParams } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useProject, useProjectList } from "../../api/projects";
import { useWorkflowsInProjects } from "../../api/workflows";
import { useRunSaves, useWorkOrders } from "../../api/work-orders";
import { useChannelRequests } from "../../api/channels";
import { useHistoryExportSaves } from "../../api/history-exports";
import { combine } from "../../api/status";
import { defaultHistoryFilters, historySearchFields, historyStatuses, newestFirst, type HistoryFilters, type HistoryWorkOrder } from "../../model/history";
import HistoryPage, { type HistoryPageData } from "./HistoryPage";
import { pageFrame } from "../../app/page-frame";
import { isOpenable } from "../../model/projects";

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
 * Feeds History from the API: one project's work orders and channel
 * requests, or, outside a project, those of every project you can open.
 * Retrying (from the start or from a step) adds a run to each work order on
 * the server, on the workflow as it now stands; cancelling stops the runs
 * that haven't started. Every page that shows runs (the editor included)
 * reads the same work orders. Exporting asks the project for a history
 * export, which appears in its settings.
 */
export default function HistoryPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = route.params["project"];
  const { status: projectStatus, project } = useProject(projectId);
  const { status: listStatus, projects: all } = useProjectList();
  const scope = projectId ? (project ? [project] : []) : all.filter((p) => isOpenable(p) && !p.parentId);
  const ids = scope.map((p) => p.id);
  const { status: ordersStatus, workOrders } = useWorkOrders(ids);
  const { status: workflowsStatus, workflows } = useWorkflowsInProjects(ids);
  const { status: requestsStatus, requests } = useChannelRequests(scope.map((p) => ({ id: p.id, name: p.name })));
  const runs = useRunSaves();
  const exports = useHistoryExportSaves(projectId ?? "");

  const nameOf = (id: string) => scope.find((p) => p.id === id)?.name ?? "";
  const rows: HistoryWorkOrder[] = workOrders
    .flatMap((o) => {
      const workflow = workflows.find((w) => w.id === o.workflowId);
      return workflow ? [{ workOrder: o.workOrder, workflowId: o.workflowId, workflowName: workflow.name, projectId: o.projectId, projectName: nameOf(o.projectId), input: o.input, receivedAt: o.receivedAt }] : [];
    })
    .sort(newestFirst);
  const data: HistoryPageData = {
    workOrders: rows,
    channelRequests: requests,
    workflows: workflows.map((w) => ({
      id: w.id,
      name: w.name,
      projectId: w.project_id,
      steps: w.jobs.map((j) => ({ id: j.id, label: j.name })),
      latestVersion: `v${w.lock_version}`,
    })),
    projects: projectId ? undefined : scope.map((p) => ({ id: p.id, name: p.name })),
  };
  const located = (ids: string[]) => ids.flatMap((id) => rows.filter((r) => r.workOrder.id === id).map((r) => ({ id, projectId: r.projectId })));
  const filters = filtersFrom(searchParams);

  return (
    <Loaded status={combine(projectId ? projectStatus : { state: "ready" }, listStatus, ordersStatus, workflowsStatus, requestsStatus)} path={route.currentPath}>
      {() => (
        <HistoryPage
          // A new page starts afresh rather than keeping the last page's picks.
          key={route.currentPath}
          {...pageFrame(route, {}, project?.name)}
          data={data}
          filters={filters}
          // Each change is a step Back can undo, except typing in the search, which would leave one per letter.
          onFiltersChange={(next) => setSearchParams(paramsFor(next), { replace: next.search !== filters.search })}
          onRetry={(ids) => runs.retry(located(ids))}
          onRetryFromStep={(ids, jobId) => runs.retry(located(ids), jobId)}
          onCancel={(ids) => runs.cancel(located(ids))}
          onInspectRun={(order, run) => navigate(`/workflow-editor/${order.workflowId}?run=${run.runId}`)}
          onOpenChannelRun={(request) => request.workflowId && navigate(`/workflow-editor/${request.workflowId}?run=${request.runId}`)}
          // An export is made by the project, and shows up in its settings; History across projects has no one project to ask, so offers none.
          onExport={projectId ? (ids) => exports.create(ids) : undefined}
        />
      )}
    </Loaded>
  );
}
