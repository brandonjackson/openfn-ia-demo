import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useUrlParams } from "../../utils/useUrlParams";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import Tabs from "../../components/Tabs";
import ProjectBreadcrumbs from "../../components/shell/ProjectBreadcrumbs";
import FilterChip, { FilterCheckboxes, FilterDateRange, FilterMenu } from "../../components/history/FilterChip";
import HistorySearchBar from "../../components/history/HistorySearchBar";
import {
  BulkCancelModal,
  BulkRerunModal,
  ExportConfirmationModal,
  RerunFromJobModal,
} from "../../components/history/HistoryModals";
import WorkOrdersTable, { type WorkOrderSort } from "../../components/history/WorkOrdersTable";
import { formatChipDate } from "../../utils/format";
import { findDataclip, workOrdersIn, type WorkOrder } from "../../mock-data/history";
import {
  historyChannelsEnabled,
  historyPermissions,
  historySearchFields,
  historyStatuses,
  logsOf,
  runsOfWorkOrder,
  shortId,
  uuidOf,
  workflowJobs,
  type SearchFieldId,
} from "../../mock-data/history-extra";
import { findProject } from "../../mock-data/projects";
import { workflowsIn } from "../../mock-data/workflows";

/** Lightning's default filter: last activity in the past 30 days. */
function thirtyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function dateRange(after: string, before: string) {
  const a = after ? formatChipDate(new Date(after)) : null;
  const b = before ? formatChipDate(new Date(before)) : null;
  if (a && b) return `${a} to ${b}`;
  if (a) return `after ${a}`;
  if (b) return `before ${b}`;
  return "any time";
}

function inRange(iso: string, after: string, before: string) {
  const t = new Date(iso).getTime();
  return (!after || t >= new Date(after).getTime()) && (!before || t <= new Date(before).getTime());
}

function matchesStatus(wo: WorkOrder, statuses: string[]) {
  if (!statuses.length) return true;
  return statuses.some((s) => {
    if (s === "running") return wo.state === "started" || wo.state === "claimed";
    if (s === "pending") return wo.state === "pending" || wo.state === "available";
    return wo.state === s;
  });
}

function matchesSearch(wo: WorkOrder, term: string, fields: SearchFieldId[]) {
  if (!term) return true;
  const t = term.toLowerCase();
  const runs = runsOfWorkOrder(wo);
  const dataclip = findDataclip(wo.dataclipId);
  return fields.some((f) => {
    switch (f) {
      case "id":
        return [wo.id, wo.dataclipId, ...runs.map((r) => r.id)].some((id) => uuidOf(id).includes(t));
      case "dataclip_name":
        return (dataclip?.name ?? "").toLowerCase().includes(t);
      case "body":
        return JSON.stringify(dataclip?.body ?? "").toLowerCase().includes(t);
      case "log":
        return runs.some((r) => logsOf(r).some((l) => l.message.toLowerCase().includes(t)));
    }
  });
}

/** Inventory view `history-work-orders` (RunLive.Index :index, run_live/index.html.heex). */
export default function HistoryWorkOrdersPage() {
  const { projectId = "" } = useParams();
  const { params, update } = useUrlParams();
  const project = findProject(projectId);
  const workflows = workflowsIn(projectId);
  const workorderId = params["filters[workorder_id]"] ?? null;

  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [received, setReceived] = useState({ after: "", before: "" });
  const [activity, setActivity] = useState(() => ({ after: thirtyDaysAgo(), before: "" }));
  const [searchFields, setSearchFields] = useState<SearchFieldId[]>(["log"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<WorkOrderSort>({ by: "last_activity", direction: "desc" });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modal, setModal] = useState<null | "cancel" | "retry" | "retry-from" | "export">(null);

  const entries = useMemo(() => {
    const key = sort.by === "inserted_at" ? "insertedAt" : "lastActivity";
    return workOrdersIn(projectId)
      .filter((wo) => !workorderId || wo.id === workorderId)
      .filter((wo) => !workflowId || wo.workflowId === workflowId)
      .filter((wo) => matchesStatus(wo, statuses))
      .filter((wo) => inRange(wo.insertedAt, received.after, received.before))
      .filter((wo) => inRange(wo.lastActivity, activity.after, activity.before))
      .filter((wo) => matchesSearch(wo, searchTerm, searchFields))
      .sort((a, b) => (sort.direction === "asc" ? 1 : -1) * a[key].localeCompare(b[key]));
  }, [projectId, workorderId, workflowId, statuses, received, activity, searchTerm, searchFields, sort]);

  const selectedWorkflow = entries.find((w) => selectedIds.includes(w.id))?.workflowId;
  const selectedStatuses = historyStatuses.filter((s) => statuses.includes(s.id));
  const hasReceived = Boolean(received.after || received.before);
  const hasActivity = Boolean(activity.after || activity.before);
  const closeModal = () => setModal(null);
  // Remounts "Run from a specific step" on each open, so its job choice starts fresh.
  const [retryFromKey, setRetryFromKey] = useState(0);

  return (
    <PageContent
      header={
        <Header breadcrumbs={project && <ProjectBreadcrumbs project={project} current="History" />}>
          {historyChannelsEnabled && (
            <Tabs
              variant="pill"
              label="History"
              active="work-orders"
              tabs={[
                { id: "work-orders", label: "Work Orders", to: `/projects/${projectId}/history` },
                { id: "channel-logs", label: "Channel Logs", to: `/projects/${projectId}/history/channels` },
              ]}
            />
          )}
        </Header>
      }
    >
      <Centered>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <FilterChip
            id="workflow-filter-chip"
            active={workflowId !== null}
            onClear={() => setWorkflowId(null)}
            menu={
              <FilterMenu
                options={[{ value: null, label: "Any" }, ...workflows.map((w) => ({ value: w.id, label: w.name }))]}
                selected={workflowId}
                onSelect={setWorkflowId}
              />
            }
          >
            Workflow is {workflowId ? workflows.find((w) => w.id === workflowId)?.name : "any"}
          </FilterChip>

          <FilterChip
            id="status-filter-chip"
            active={statuses.length > 0}
            onClear={() => setStatuses([])}
            dropdownClassName="w-44"
            dropdown={() => (
              <FilterCheckboxes
                options={historyStatuses}
                checked={statuses}
                onToggle={(id) => setStatuses((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))}
              />
            )}
          >
            Status {selectedStatuses.length > 1 ? "in" : "is"}{" "}
            {selectedStatuses.length ? selectedStatuses.map((s) => s.label).join(", ") : "any"}
          </FilterChip>

          <FilterChip
            id="received-filter-chip"
            active={hasReceived}
            onClear={() => setReceived({ after: "", before: "" })}
            dropdownClassName=""
            dropdown={() => (
              <FilterDateRange
                title="Filter by Date Received"
                afterLabel="Received After"
                beforeLabel="Received Before"
                after={received.after}
                before={received.before}
                onChange={(after, before) => setReceived({ after, before })}
              />
            )}
          >
            Received {dateRange(received.after, received.before)}
          </FilterChip>

          <FilterChip
            id="activity-filter-chip"
            active={hasActivity}
            onClear={() => setActivity({ after: "", before: "" })}
            dropdownClassName=""
            dropdown={() => (
              <FilterDateRange
                title="Filter by Last Activity"
                afterLabel="Activity After"
                beforeLabel="Activity Before"
                after={activity.after}
                before={activity.before}
                onChange={(after, before) => setActivity({ after, before })}
              />
            )}
          >
            Last activity {dateRange(activity.after, activity.before)}
          </FilterChip>

          {workorderId && (
            <FilterChip
              id="workorder-id-filter-chip"
              active
              onClear={() => update({ "filters[workorder_id]": null })}
            >
              Work order: {shortId(workorderId)}
            </FilterChip>
          )}
        </div>

        <HistorySearchBar
          fields={historySearchFields}
          selected={searchFields}
          onToggle={(id) => setSearchFields((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))}
          term={searchTerm}
          onSearch={setSearchTerm}
        />

        {searchTerm && (
          <div className="m-2 truncate text-sm text-gray-500">
            {entries.length} work orders with runs matching "{searchTerm}"
          </div>
        )}

        <div className="mt-2">
          <WorkOrdersTable
            workOrders={entries}
            projectId={projectId}
            sort={sort}
            onSort={(by) => setSort((s) => ({ by, direction: s.by === by && s.direction === "desc" ? "asc" : "desc" }))}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            canRunWorkflow={historyPermissions.canRunWorkflow}
            onBulkCancel={() => setModal("cancel")}
            onBulkRetry={() => setModal("retry")}
            onBulkRetryFrom={() => {
              setRetryFromKey((k) => k + 1);
              setModal("retry-from");
            }}
            onExport={() => setModal("export")}
          />
        </div>

        <BulkCancelModal open={modal === "cancel"} onClose={closeModal} selectedCount={selectedIds.length} />
        <BulkRerunModal open={modal === "retry"} onClose={closeModal} selectedCount={selectedIds.length} />
        {selectedWorkflow && (
          <RerunFromJobModal
            key={retryFromKey}
            open={modal === "retry-from"}
            onClose={closeModal}
            jobs={workflowJobs(selectedWorkflow)}
            selectedCount={selectedIds.length}
          />
        )}
        <ExportConfirmationModal open={modal === "export"} onClose={closeModal} count={entries.length} />
      </Centered>
    </PageContent>
  );
}
