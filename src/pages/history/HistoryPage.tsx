import { useState } from "react";
import type { ApprovalDecision } from "../../model/step-tools";
import { Ban, Download, History, RotateCcw } from "lucide-react";
import type { PageProps } from "../../model/ia-tree";
import type { RunDetails } from "../../model/workflow";
import {
  bulkActions,
  historyColumns,
  historyEntries,
  matchesEntry,
  type ChannelRequest,
  type HistoryColumnId,
  type HistoryFilters,
  type HistoryWorkOrder,
  type HistoryWorkflowOption,
} from "../../model/history";
import ListPage from "../../components/patterns/ListPage";
import PageHeader from "../../components/patterns/PageHeader";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import HistoryFilterBar from "../../components/domain/HistoryFilterBar";
import HistoryTable from "../../components/domain/HistoryTable";
import Stack from "../../components/primitives/Stack";
import Button from "../../components/primitives/Button";
import ColumnPicker from "../../components/primitives/ColumnPicker";
import EmptyState from "../../components/primitives/EmptyState";
import SelectionBar from "../../components/primitives/SelectionBar";
import ConfirmModal from "../../components/primitives/ConfirmModal";
import MenuButton from "../../components/primitives/MenuButton";

export interface HistoryPageProps extends PageProps<HistoryPageData> {
  /**
   * What the list is filtered by. The wrapper keeps them (in the URL, as
   * Lightning does), so a link opens History filtered, a reload keeps the
   * filters and Back undoes a change.
   */
  filters: HistoryFilters;
  /** Changes the filters. */
  onFiltersChange: (filters: HistoryFilters) => void;
  /** The optional columns showing beside the name and status, which always show. The wrapper remembers them for you. */
  columns: HistoryColumnId[];
  /** Adds or takes away optional columns, from the Columns button. */
  onColumnsChange: (columns: HistoryColumnId[]) => void;
  /** Runs these work orders again from the start, with the input they first received. Left out where you can't run workflows. */
  onRetry?: (workOrderIds: string[]) => Promise<void>;
  /** Runs these work orders again from one step, with the input that step had last time. They're all of one workflow. */
  onRetryFromStep?: (workOrderIds: string[], jobId: string) => Promise<void>;
  /** Cancels these work orders while they're still waiting to run. */
  onCancel?: (workOrderIds: string[]) => Promise<void>;
  /** Answers a run waiting on a Human in the loop step, which then carries on. Left out without tools. */
  onAnswerApproval?: (runId: string, decision: ApprovalDecision, comment: string) => Promise<void>;
  /** Whether work orders can be filtered by the outcome a Report outcome step recorded. Off without tools. */
  showOutcomes?: boolean;
  /** Opens a run in the editor. */
  onInspectRun: (order: HistoryWorkOrder, run: RunDetails) => void;
  /** Opens the run a channel request started or came from. */
  onOpenChannelRun?: (request: ChannelRequest) => void;
  /** Starts an export of these work orders, to download from the project's settings once it's ready. */
  onExport?: (workOrderIds: string[]) => Promise<void>;
}

/**
 * History: every work order received and every request a channel carried,
 * in one list, the most recently active first. Each row is one record, with
 * its name and id, and its status with when it last moved; more columns can
 * be added from Columns. Everything can be searched and filtered; work
 * orders open to show their runs and steps, and can be picked to retry,
 * retry from a step, cancel or export, as in Lightning. A run waiting on
 * someone is approved or rejected from its work order.
 */
export default function HistoryPage({
  node,
  ancestors,
  data,
  filters,
  onFiltersChange,
  columns,
  onColumnsChange,
  onRetry,
  onRetryFromStep,
  onCancel,
  onAnswerApproval,
  showOutcomes = false,
  onInspectRun,
  onOpenChannelRun,
  onExport,
}: HistoryPageProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // A link to one work order opens it.
  const [expandedKeys, setExpandedKeys] = useState<string[]>(filters.workOrderId ? [`workflow:${filters.workOrderId}`] : []);
  const [exporting, setExporting] = useState(false);
  // The bulk action running, if any: its button says so, and every other press waits until it's done.
  const [busy, setBusy] = useState<"retry" | "retry-from" | "cancel" | "export">();

  const multiProject = !!data.projects;
  const all = historyEntries(data.workOrders, data.channelRequests);
  const entries = all.filter((e) => matchesEntry(e, filters));
  const shown = entries.flatMap((e) => (e.kind === "workflow" ? [e.order] : []));
  // Only work orders still showing stay picked, so a bulk action never reaches one the filters hide.
  const pickedIds = selectedIds.filter((id) => shown.some((o) => o.workOrder.id === id));
  const selected = shown.filter((o) => pickedIds.includes(o.workOrder.id));
  const allowed = bulkActions(selected);
  const selectedWorkflow = allowed.retryFrom ? data.workflows.find((w) => w.id === selected[0].workflowId) : undefined;
  // Outcomes are a tool's, and a project's name says nothing inside one project.
  const columnOptions = historyColumns.filter((c) => (c.id !== "outcome" || showOutcomes) && (c.id !== "project" || multiProject));
  const shownColumns = columns.filter((id) => columnOptions.some((c) => c.id === id));

  const toggle = (list: string[], id: string, on: boolean) => (on ? [...list, id] : list.filter((x) => x !== id));
  const plural = (n: number, noun: string) => `${n} ${noun}${n === 1 ? "" : "s"}`;

  /** Runs a bulk action; the wrapper says how it went. The picks clear once it's done, and stay after a refusal, to try again. */
  async function act(kind: NonNullable<typeof busy>, ids: string[], run: (ids: string[]) => Promise<void>) {
    if (busy) return;
    setBusy(kind);
    try {
      await run(ids);
    } catch {
      return;
    } finally {
      setBusy(undefined);
    }
    setSelectedIds([]);
  }

  const retry = onRetry && ((ids: string[]) => act("retry", ids, onRetry));
  const retryFrom = onRetryFromStep && ((ids: string[], jobId: string) => act("retry-from", ids, (x) => onRetryFromStep(x, jobId)));
  const cancel = onCancel && ((ids: string[]) => act("cancel", ids, onCancel));
  // The card it's answered from shows a refusal itself; the wrapper says when it's through.
  const answer = onAnswerApproval && ((run: RunDetails, decision: ApprovalDecision, comment: string) => onAnswerApproval(run.runId, decision, comment));
  const nothingYet = all.length === 0;

  return (
    <>
      <ListPage
        header={
          <PageHeader
            breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
            title={node.label}
            description={node.description}
            actions={
              onExport && (
                <Button size="sm" variant="secondary" icon={Download} onClick={() => !busy && setExporting(true)} disabled={shown.length === 0} aria-disabled={!!busy}>
                  {busy === "export" ? "Exporting…" : "Export"}
                </Button>
              )
            }
          />
        }
        toolbar={
          <HistoryFilterBar
            filters={filters}
            onChange={onFiltersChange}
            workOrders={data.workOrders}
            channelRequests={data.channelRequests}
            workflows={data.workflows}
            projects={data.projects}
            showOutcomes={showOutcomes}
            trailing={<ColumnPicker options={columnOptions} value={shownColumns} onChange={(ids) => onColumnsChange(ids as HistoryColumnId[])} />}
          />
        }
        isEmpty={entries.length === 0}
        empty={
          <EmptyState
            icon={History}
            title={nothingYet ? "No history yet" : "Nothing matches"}
            description={
              nothingYet
                ? "Work orders and channel logs appear here as your workflows and channels receive work."
                : "Try another search, or clear a filter."
            }
          />
        }
      >
        <Stack gap="sm">
          <SelectionBar count={pickedIds.length} noun="work order" onClear={() => setSelectedIds([])}>
            {cancel && (
              <Button
                size="sm"
                variant="secondary"
                icon={Ban}
                disabled={!allowed.cancel}
                aria-disabled={!!busy}
                title="Only work orders still waiting to run can be cancelled"
                onClick={() => cancel(pickedIds)}
              >
                {busy === "cancel" ? "Cancelling…" : "Cancel"}
              </Button>
            )}
            {retryFrom &&
              (selectedWorkflow ? (
                <MenuButton
                  label={busy === "retry-from" ? "Retrying…" : "Retry from"}
                  variant="secondary"
                  menuTitle={`Steps of ${selectedWorkflow.name}`}
                  align="right"
                  items={selectedWorkflow.steps.map((s) => ({ id: s.id, label: s.label }))}
                  onSelect={(jobId) => retryFrom(pickedIds, jobId)}
                />
              ) : (
                <Button size="sm" variant="secondary" disabled title="Pick finished work orders of one workflow to retry them from a step">
                  Retry from
                </Button>
              ))}
            {retry && (
              <Button size="sm" icon={RotateCcw} disabled={!allowed.retry} aria-disabled={!!busy} title="Only finished work orders can be retried" onClick={() => retry(pickedIds)}>
                {busy === "retry" ? "Retrying…" : "Retry"}
              </Button>
            )}
          </SelectionBar>
          <HistoryTable
            entries={entries}
            columns={shownColumns}
            latestVersions={Object.fromEntries(data.workflows.map((w) => [w.id, w.latestVersion]))}
            selectedIds={pickedIds}
            onSelectedChange={setSelectedIds}
            expandedKeys={expandedKeys}
            onToggle={(key) => setExpandedKeys((e) => toggle(e, key, !e.includes(key)))}
            onRetry={retry && ((id) => retry([id]))}
            onCancel={cancel && ((id) => cancel([id]))}
            onInspectRun={onInspectRun}
            onRetryFromStep={retryFrom && ((id, step) => retryFrom([id], step.jobId))}
            onAnswer={answer}
            onOpenChannelRun={onOpenChannelRun}
          />
        </Stack>
      </ListPage>

      {onExport && (
        <ConfirmModal
          open={exporting}
          title={`Export ${plural(shown.length, "work order")}?`}
          tone="primary"
          confirmLabel="Start export"
          onClose={() => setExporting(false)}
          onConfirm={async () => {
            setExporting(false);
            await act("export", shown.map((o) => o.workOrder.id), onExport);
          }}
        >
          Every work order matching your filters, with its runs, steps and logs, goes into one file. Inputs and outputs are
          included unless the project doesn't keep them. Channel logs aren't exported.
        </ConfirmModal>
      )}
    </>
  );
}

/**
 * History: a project's (or every project's) work orders with their runs, and
 * its channels' requests, which the page lists together.
 */
export interface HistoryPageData {
  /** Newest first. */
  workOrders: HistoryWorkOrder[];
  /** Every request a channel carried, listed beside the work orders. */
  channelRequests: ChannelRequest[];
  /** The workflows the work orders belong to. */
  workflows: HistoryWorkflowOption[];
  /** Set for History across every project, to filter by project and say which one each order belongs to. */
  projects?: { id: string; name: string }[];
}
