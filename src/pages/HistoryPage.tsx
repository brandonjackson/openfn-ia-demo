import { useMemo, useState } from "react";
import { Ban, Download, History, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { HistoryPageData } from "../model/page-data";
import type { RunDetails, RunStatus } from "../model/workflow";
import {
  bulkActions,
  historySearchFields,
  historyStatuses,
  matchesSearch,
  type ChannelRequest,
  type HistorySearchField,
  type HistoryWorkOrder,
} from "../model/history";
import { activityPeriods, filterWorkOrders, type ActivityPeriod } from "../model/runs";
import PageHeader from "../components/patterns/PageHeader";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import WorkOrderEntry from "../components/domain/WorkOrderEntry";
import ChannelRequestTable from "../components/domain/ChannelRequestTable";
import Stack from "../components/primitives/Stack";
import Inline from "../components/primitives/Inline";
import Card from "../components/primitives/Card";
import Button from "../components/primitives/Button";
import Checkbox from "../components/primitives/Checkbox";
import ListHeader from "../components/primitives/ListHeader";
import Callout from "../components/primitives/Callout";
import EmptyState from "../components/primitives/EmptyState";
import SearchInput from "../components/primitives/SearchInput";
import SegmentedControl from "../components/primitives/SegmentedControl";
import SelectionBar from "../components/primitives/SelectionBar";
import ConfirmModal from "../components/primitives/ConfirmModal";
import DropdownMenu from "../components/primitives/DropdownMenu";
import MenuButton from "../components/primitives/MenuButton";
import { Select } from "../components/primitives/FormControls";

/** Where History starts, from a link that points at part of it. */
export interface HistoryFilters {
  /** "channels" opens on channel requests. */
  tab?: "work-orders" | "channels";
  /** A run status to show only work orders whose latest run ended that way. */
  status?: RunStatus;
  /** A workflow's id, to show only its work orders. */
  workflowId?: string;
  /** A project's id, in History across every project. */
  projectId?: string;
}

export interface HistoryPageProps extends PageProps<HistoryPageData> {
  /** Filters to start with, e.g. from a link to a project's failed work orders. */
  initialFilters?: HistoryFilters;
  /** Runs these work orders again from the start, with the input they first received. Left out where you can't run workflows. */
  onRetry?: (workOrderIds: string[]) => Promise<void>;
  /** Runs these work orders again from one step, with the input that step had last time. They're all of one workflow. */
  onRetryFromStep?: (workOrderIds: string[], jobId: string) => Promise<void>;
  /** Cancels these work orders while they're still waiting to run. */
  onCancel?: (workOrderIds: string[]) => Promise<void>;
  /** Opens a run in the editor. */
  onInspectRun: (order: HistoryWorkOrder, run: RunDetails) => void;
  /** Opens the run a channel request started or came from. */
  onOpenChannelRun?: (request: ChannelRequest) => void;
  /** Starts an export of these work orders, to download from the project's settings once it's ready. */
  onExport?: (workOrderIds: string[]) => Promise<void>;
}

const ANY_TIME = "Any time";
const periodOptions = [ANY_TIME, ...activityPeriods.map((p) => p.label)];
const ALL_WORKFLOWS = "All workflows";
const ALL_PROJECTS = "All projects";

/**
 * History: every work order received, with the runs made for each, and every
 * request a channel carried. Work orders can be searched and filtered,
 * opened to see their runs and steps, and picked to retry, retry from a
 * step, cancel or export, as in Lightning.
 */
export default function HistoryPage({
  node,
  ancestors,
  data,
  initialFilters = {},
  onRetry,
  onRetryFromStep,
  onCancel,
  onInspectRun,
  onOpenChannelRun,
  onExport,
}: HistoryPageProps) {
  const [tab, setTab] = useState(initialFilters.tab ?? "work-orders");
  const [term, setTerm] = useState("");
  const [fields, setFields] = useState<HistorySearchField[]>(["id", "dataclipName"]);
  const [status, setStatus] = useState<string>(initialFilters.status ?? "all");
  const [period, setPeriod] = useState(ANY_TIME);
  const [workflowId, setWorkflowId] = useState(initialFilters.workflowId ?? "");
  const [projectId, setProjectId] = useState(initialFilters.projectId ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState<{ title: string; detail?: string }>();
  const [requestFilter, setRequestFilter] = useState("all");

  const multiProject = !!data.projects;
  const workflowsShown = data.workflows.filter((w) => !projectId || w.projectId === projectId);

  // Everything but the status, so the status counts say what picking each would show.
  const beforeStatus = useMemo(() => {
    const periodId = activityPeriods.find((p) => p.label === period)?.id as ActivityPeriod | undefined;
    const inPeriod = periodId ? new Set(filterWorkOrders(data.workOrders.map((o) => o.workOrder), periodId).map((o) => o.id)) : undefined;
    return data.workOrders.filter(
      (o) =>
        (!projectId || o.projectId === projectId) &&
        (!workflowId || o.workflowId === workflowId) &&
        (!inPeriod || inPeriod.has(o.workOrder.id)) &&
        matchesSearch(o, term, fields)
    );
  }, [data.workOrders, projectId, workflowId, period, term, fields]);

  const shown = status === "all" ? beforeStatus : beforeStatus.filter((o) => o.workOrder.status === status);
  const selected = data.workOrders.filter((o) => selectedIds.includes(o.workOrder.id));
  const allowed = bulkActions(selected);
  const selectedWorkflow = allowed.retryFrom ? data.workflows.find((w) => w.id === selected[0].workflowId) : undefined;
  const allShownSelected = shown.length > 0 && shown.every((o) => selectedIds.includes(o.workOrder.id));
  const someShownSelected = shown.some((o) => selectedIds.includes(o.workOrder.id));

  const statusOptions = [
    { id: "all", label: "Any", count: beforeStatus.length },
    ...historyStatuses.map((s) => ({ id: s.id, label: s.label, count: beforeStatus.filter((o) => o.workOrder.status === s.id).length })),
  ];

  const toggle = (list: string[], id: string, on: boolean) => (on ? [...list, id] : list.filter((x) => x !== id));
  const plural = (n: number, noun: string) => `${n} ${noun}${n === 1 ? "" : "s"}`;

  async function act(ids: string[], run: (ids: string[]) => Promise<void>, title: string, detail?: string) {
    await run(ids);
    setSelectedIds([]);
    setNotice({ title, detail });
  }

  const retry = onRetry && ((ids: string[]) => act(ids, onRetry, `${plural(ids.length, "new run")} enqueued.`, "Open a work order to follow its runs."));
  const retryFrom =
    onRetryFromStep &&
    ((ids: string[], jobId: string, label: string) =>
      act(ids, (x) => onRetryFromStep(x, jobId), `${plural(ids.length, "new run")} enqueued from ${label}.`, "Open a work order to follow its runs."));
  const cancel = onCancel && ((ids: string[]) => act(ids, onCancel, `${plural(ids.length, "work order")} cancelled.`));

  const requests = data.channelRequests.filter(
    (r) =>
      (!projectId || r.projectId === projectId) &&
      (requestFilter === "all" || (requestFilter === "failed" ? r.status >= 400 : r.status < 400)) &&
      (!term.trim() || [r.channelName, r.endpoint, r.summary, r.runId ?? ""].some((v) => v.toLowerCase().includes(term.trim().toLowerCase())))
  );

  return (
    <Stack gap="lg">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
        title={node.label}
        description={node.description}
        actions={
          tab === "work-orders" &&
          onExport && (
            <Button size="sm" variant="secondary" icon={Download} onClick={() => setExporting(true)} disabled={shown.length === 0}>
              Export
            </Button>
          )
        }
      />

      <SegmentedControl
        variant="pill"
        options={[
          { id: "work-orders", label: "Work orders", count: data.workOrders.length },
          { id: "channels", label: "Channel requests", count: data.channelRequests.length },
        ]}
        value={tab}
        onChange={(v) => setTab(v as typeof tab)}
      />

      {notice && (
        <Callout variant="success" title={notice.title}>
          {notice.detail}
        </Callout>
      )}

      <Inline wrap gap="sm">
        <SearchInput
          placeholder={tab === "work-orders" ? "Search work orders" : "Search requests"}
          aria-label="Search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        {tab === "work-orders" && (
          <DropdownMenu
            ariaLabel="Search in"
            title="Search in"
            items={historySearchFields.map((f) => ({ id: f.id, label: f.label, description: f.description, checked: fields.includes(f.id) }))}
            onSelect={(id) => setFields((f) => toggle(f, id, !f.includes(id as HistorySearchField)) as HistorySearchField[])}
            trigger={({ toggle: open }) => (
              <Button size="sm" variant="secondary" icon={SlidersHorizontal} onClick={open}>
                {`Search in ${fields.length} of ${historySearchFields.length}`}
              </Button>
            )}
          />
        )}
        {multiProject && (
          <Select
            fit
            aria-label="Project"
            options={[ALL_PROJECTS, ...data.projects!.map((p) => p.name)]}
            value={data.projects!.find((p) => p.id === projectId)?.name ?? ALL_PROJECTS}
            onChange={(e) => {
              setProjectId(data.projects!.find((p) => p.name === e.target.value)?.id ?? "");
              setWorkflowId("");
            }}
          />
        )}
        {tab === "work-orders" && (
          <>
            <Select
              fit
              aria-label="Workflow"
              options={[ALL_WORKFLOWS, ...workflowsShown.map((w) => w.name)]}
              value={data.workflows.find((w) => w.id === workflowId)?.name ?? ALL_WORKFLOWS}
              onChange={(e) => setWorkflowId(workflowsShown.find((w) => w.name === e.target.value)?.id ?? "")}
            />
            <Select fit aria-label="Last run" options={periodOptions} value={period} onChange={(e) => setPeriod(e.target.value)} />
          </>
        )}
      </Inline>

      {tab === "work-orders" ? (
        <Stack gap="sm">
          <SegmentedControl label="Status" options={statusOptions} value={status} onChange={setStatus} />

          <SelectionBar count={selectedIds.length} noun="work order" onClear={() => setSelectedIds([])}>
            {cancel && (
              <Button size="sm" variant="secondary" icon={Ban} disabled={!allowed.cancel} title="Only work orders still waiting to run can be cancelled" onClick={() => cancel(selectedIds)}>
                Cancel
              </Button>
            )}
            {retryFrom &&
              (selectedWorkflow ? (
                <MenuButton
                  label="Retry from"
                  variant="secondary"
                  menuTitle={`Steps of ${selectedWorkflow.name}`}
                  align="right"
                  items={selectedWorkflow.steps.map((s) => ({ id: s.id, label: s.label }))}
                  onSelect={(jobId) => retryFrom(selectedIds, jobId, selectedWorkflow.steps.find((s) => s.id === jobId)?.label ?? jobId)}
                />
              ) : (
                <Button size="sm" variant="secondary" disabled title="Pick finished work orders of one workflow to retry them from a step">
                  Retry from
                </Button>
              ))}
            {retry && (
              <Button size="sm" icon={RotateCcw} disabled={!allowed.retry} title="Only finished work orders can be retried" onClick={() => retry(selectedIds)}>
                Retry
              </Button>
            )}
          </SelectionBar>

          {shown.length === 0 ? (
            <EmptyState
              icon={History}
              title={data.workOrders.length === 0 ? "No work orders yet" : "No work orders match"}
              description={
                data.workOrders.length === 0
                  ? "Work orders appear here as your workflows' triggers receive work."
                  : "Try another status, period or search."
              }
            />
          ) : (
            <Card flush>
              <Stack divided>
                <ListHeader
                  leading={
                    <Checkbox
                      label="Select every work order shown"
                      hideLabel
                      checked={allShownSelected}
                      indeterminate={someShownSelected && !allShownSelected}
                      onChange={(on) => setSelectedIds(on ? shown.map((o) => o.workOrder.id) : [])}
                    />
                  }
                >
                  {`${plural(shown.length, "work order")}, newest first`}
                </ListHeader>
                {shown.map((order) => {
                  const id = order.workOrder.id;
                  const workflow = data.workflows.find((w) => w.id === order.workflowId);
                  return (
                    <WorkOrderEntry
                      key={id}
                      order={order}
                      showProject={multiProject}
                      latestVersion={workflow?.latestVersion}
                      selected={selectedIds.includes(id)}
                      onSelectChange={(on) => setSelectedIds((s) => toggle(s, id, on))}
                      expanded={expandedIds.includes(id)}
                      onToggle={() => setExpandedIds((e) => toggle(e, id, !e.includes(id)))}
                      onRetry={retry && (() => retry([id]))}
                      onCancel={cancel && (() => cancel([id]))}
                      onInspectRun={(run) => onInspectRun(order, run)}
                      onRetryFromStep={retryFrom && ((_run, step) => retryFrom([id], step.jobId, step.label))}
                    />
                  );
                })}
              </Stack>
            </Card>
          )}
        </Stack>
      ) : (
        <Stack gap="sm">
          <SegmentedControl
            label="Status"
            options={[
              { id: "all", label: "Any", count: data.channelRequests.length },
              { id: "ok", label: "Succeeded", count: data.channelRequests.filter((r) => r.status < 400).length },
              { id: "failed", label: "Failed", count: data.channelRequests.filter((r) => r.status >= 400).length },
            ]}
            value={requestFilter}
            onChange={setRequestFilter}
          />
          <ChannelRequestTable
            requests={requests}
            showProject={multiProject}
            onOpenRun={onOpenChannelRun}
            emptyMessage={data.channelRequests.length === 0 ? "No channel requests yet." : "No requests match."}
          />
        </Stack>
      )}

      {onExport && (
        <ConfirmModal
          open={exporting}
          title={`Export ${plural(shown.length, "work order")}?`}
          tone="primary"
          confirmLabel="Start export"
          onClose={() => setExporting(false)}
          onConfirm={async () => {
            setExporting(false);
            await act(shown.map((o) => o.workOrder.id), onExport, "Export started.", "Download it from the project's settings, under History exports, once it's ready.");
          }}
        >
          Every work order matching your filters, with its runs, steps and logs, goes into one file. Inputs and outputs are
          included unless the project doesn't keep them.
        </ConfirmModal>
      )}
    </Stack>
  );
}
