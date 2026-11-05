import { useState } from "react";
import { Ban, Download, History, RotateCcw } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { HistoryPageData } from "../model/page-data";
import type { RunDetails } from "../model/workflow";
import {
  bulkActions,
  matchesFilters,
  matchesRequestFilters,
  type ChannelRequest,
  type HistoryFilters,
  type HistoryWorkOrder,
} from "../model/history";
import PageHeader from "../components/patterns/PageHeader";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import HistoryFilterBar from "../components/domain/HistoryFilterBar";
import WorkOrderEntry from "../components/domain/WorkOrderEntry";
import ChannelRequestTable from "../components/domain/ChannelRequestTable";
import Stack from "../components/primitives/Stack";
import Card from "../components/primitives/Card";
import Button from "../components/primitives/Button";
import Checkbox from "../components/primitives/Checkbox";
import ListHeader from "../components/primitives/ListHeader";
import Callout from "../components/primitives/Callout";
import EmptyState from "../components/primitives/EmptyState";
import SegmentedControl from "../components/primitives/SegmentedControl";
import SelectionBar from "../components/primitives/SelectionBar";
import ConfirmModal from "../components/primitives/ConfirmModal";
import MenuButton from "../components/primitives/MenuButton";

export interface HistoryPageProps extends PageProps<HistoryPageData> {
  /**
   * The tab showing and what its list is filtered by. The wrapper keeps them
   * (in the URL, as Lightning does), so a link opens History filtered, a
   * reload keeps the filters and Back undoes a change.
   */
  filters: HistoryFilters;
  /** Changes the tab or the filters. */
  onFiltersChange: (filters: HistoryFilters) => void;
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
  filters,
  onFiltersChange,
  onRetry,
  onRetryFromStep,
  onCancel,
  onInspectRun,
  onOpenChannelRun,
  onExport,
}: HistoryPageProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // A link to one work order opens it.
  const [expandedIds, setExpandedIds] = useState<string[]>(filters.workOrderId ? [filters.workOrderId] : []);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState<{ title: string; detail?: string }>();

  const { tab } = filters;
  const multiProject = !!data.projects;
  const shown = data.workOrders.filter((o) => matchesFilters(o, filters));
  // Only work orders still showing stay picked, so a bulk action never reaches one the filters hide.
  const pickedIds = selectedIds.filter((id) => shown.some((o) => o.workOrder.id === id));
  const selected = shown.filter((o) => pickedIds.includes(o.workOrder.id));
  const allowed = bulkActions(selected);
  const selectedWorkflow = allowed.retryFrom ? data.workflows.find((w) => w.id === selected[0].workflowId) : undefined;
  const allShownSelected = shown.length > 0 && pickedIds.length === shown.length;
  const requests = data.channelRequests.filter((r) => matchesRequestFilters(r, filters));

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
        onChange={(v) => onFiltersChange({ ...filters, tab: v as HistoryFilters["tab"] })}
      />

      {notice && (
        <Callout variant="success" title={notice.title}>
          {notice.detail}
        </Callout>
      )}

      <HistoryFilterBar
        filters={filters}
        onChange={onFiltersChange}
        workOrders={data.workOrders}
        channelRequests={data.channelRequests}
        workflows={data.workflows}
        projects={data.projects}
      />

      {tab === "work-orders" ? (
        <Stack gap="sm">
          <SelectionBar count={pickedIds.length} noun="work order" onClear={() => setSelectedIds([])}>
            {cancel && (
              <Button size="sm" variant="secondary" icon={Ban} disabled={!allowed.cancel} title="Only work orders still waiting to run can be cancelled" onClick={() => cancel(pickedIds)}>
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
                  onSelect={(jobId) => retryFrom(pickedIds, jobId, selectedWorkflow.steps.find((s) => s.id === jobId)?.label ?? jobId)}
                />
              ) : (
                <Button size="sm" variant="secondary" disabled title="Pick finished work orders of one workflow to retry them from a step">
                  Retry from
                </Button>
              ))}
            {retry && (
              <Button size="sm" icon={RotateCcw} disabled={!allowed.retry} title="Only finished work orders can be retried" onClick={() => retry(pickedIds)}>
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
                  : "Try another search, or clear a filter."
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
                      indeterminate={pickedIds.length > 0 && !allShownSelected}
                      onChange={(on) => setSelectedIds(on ? shown.map((o) => o.workOrder.id) : [])}
                    />
                  }
                >
                  {`${plural(shown.length, "work order")}${shown.length < data.workOrders.length ? ` of ${data.workOrders.length}` : ""}, newest first`}
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
                      selected={pickedIds.includes(id)}
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
        <ChannelRequestTable
          requests={requests}
          showProject={multiProject}
          onOpenRun={onOpenChannelRun}
          emptyMessage={data.channelRequests.length === 0 ? "No channel requests yet." : "No requests match."}
        />
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
