import { useEffect, useRef } from "react";
import Button from "../Button";
import Pagination from "../Pagination";
import { Table, Th, Tr } from "../Table";
import type { WorkOrder } from "../../mock-data/history";
import { activeStates, workOrderDataclipAvailable } from "../../mock-data/history-extra";
import WorkOrderRow from "./WorkOrderRow";

export type WorkOrderSort = { by: "inserted_at" | "last_activity"; direction: "asc" | "desc" };

/**
 * History's work orders table (run_live/index.html.heex `work-orders-table`):
 * select-all checkbox with the bulk Cancel / Retry / Retry from bar, the
 * sortable Created and Last Activity columns, one WorkOrderRow per entry,
 * and the pagination bar with the export button.
 */
export default function WorkOrdersTable({
  workOrders,
  projectId,
  sort,
  onSort,
  selectedIds,
  onSelectionChange,
  onBulkCancel,
  onBulkRetry,
  onBulkRetryFrom,
  onExport,
  canRunWorkflow = true,
  pageSize = 10,
}: {
  workOrders: WorkOrder[];
  projectId: string;
  sort: WorkOrderSort;
  onSort: (by: WorkOrderSort["by"]) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onBulkCancel?: () => void;
  onBulkRetry?: () => void;
  onBulkRetryFrom?: () => void;
  onExport?: () => void;
  canRunWorkflow?: boolean;
  pageSize?: number;
}) {
  const selectable = workOrders.filter(workOrderDataclipAvailable);
  const selected = workOrders.filter((w) => selectedIds.includes(w.id));
  const allSelected = workOrders.length > 0 && selected.length === workOrders.length;
  const partial = selected.length > 0 && !allSelected;
  const selectAll = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selectAll.current) selectAll.current.indeterminate = partial;
  }, [partial]);

  const canCancel = selected.length > 0 && selected.every((w) => w.state === "pending");
  const canRetry = selected.length > 0 && selected.every((w) => !activeStates.includes(w.state));
  const oneWorkflow = new Set(selected.map((w) => w.workflowId)).size === 1;

  const bulkButton = (label: string, enabled: boolean, onClick: (() => void) | undefined, disabledMsg: string) =>
    enabled ? (
      <Button size="sm" theme="secondary" className="!py-1" onClick={onClick}>
        {label}
      </Button>
    ) : (
      <span title={disabledMsg}>
        <Button size="sm" theme="secondary" className="!py-1" disabled>
          {label}
        </Button>
      </span>
    );

  return (
    <Table
      id="work-orders-table"
      header={
        <Tr>
          <Th className="!pr-1">
            <div className="relative">
              <input
                ref={selectAll}
                type="checkbox"
                id="select_all"
                checked={allSelected}
                disabled={workOrders.length === 0}
                onChange={(e) => onSelectionChange(e.target.checked ? selectable.map((w) => w.id) : [])}
                className={
                  workOrders.length === 0
                    ? "left-4 top-1/2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 opacity-50 cursor-not-allowed"
                    : "left-4 top-1/2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                }
              />
              {selected.length > 0 && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 flex items-center gap-1 bg-gray-50 whitespace-nowrap">
                  {bulkButton(
                    "Cancel",
                    canCancel,
                    onBulkCancel,
                    "Cancel is only available when all selected work orders are pending"
                  )}
                  {bulkButton(
                    "Retry",
                    canRetry,
                    onBulkRetry,
                    "Retry is only available when all selected work orders have finished running"
                  )}
                  {oneWorkflow &&
                    bulkButton(
                      "Retry from",
                      canRetry,
                      onBulkRetryFrom,
                      "Retry from is only available when all selected work orders have finished running"
                    )}
                </div>
              )}
            </div>
          </Th>
          <Th>ID</Th>
          <Th>Workflow</Th>
          <Th>Input</Th>
          <Th
            onSort={() => onSort("inserted_at")}
            sortDirection={sort.by === "inserted_at" ? sort.direction : null}
          >
            Created
          </Th>
          <Th
            onSort={() => onSort("last_activity")}
            sortDirection={sort.by === "last_activity" ? sort.direction : null}
          >
            Last Activity
          </Th>
          <Th className="text-right">Duration</Th>
          <Th className="text-right">
            <span className="mr-2">Status</span>
          </Th>
          <Th className="text-right">Runs</Th>
        </Tr>
      }
      footer={
        <Pagination
          pageNumber={1}
          pageSize={pageSize}
          totalEntries={workOrders.length}
          actions={
            canRunWorkflow &&
            workOrders.length > 0 && (
              <button
                id="export-history-button"
                type="button"
                onClick={onExport}
                title={`Export all ${workOrders.length} results matching your query`}
                className="cursor-pointer hover:text-primary-500 font-bold text-secondary-600 transition hover:rotate-[-6deg] inline-flex items-center"
              >
                <span className="hero-cloud-arrow-down w-5 h-5" />
              </button>
            )
          }
        />
      }
    >
      {workOrders.map((wo) => (
        <WorkOrderRow
          key={wo.id}
          workOrder={wo}
          projectId={projectId}
          canRunWorkflow={canRunWorkflow}
          selected={selectedIds.includes(wo.id)}
          onSelect={(on) => onSelectionChange(on ? [...selectedIds, wo.id] : selectedIds.filter((id) => id !== wo.id))}
        />
      ))}
    </Table>
  );
}
