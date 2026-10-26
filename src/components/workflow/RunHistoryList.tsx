import { useState } from "react";
import type { ReactNode } from "react";
import type { RunDetails, WorkOrder } from "../../mock-data/workflow";
import WorkOrderRow from "./WorkOrderRow";
import RunRow from "./RunRow";

/**
 * The run history as a list of work orders, newest first, for the history
 * tray. Expanding a work order shows its runs; when it has only one run,
 * expanding it selects that run straight away. Selecting a run draws it on
 * the canvas and follows it in code mode. The work order holding the
 * selected run always stays open so the selection is visible.
 *
 * `footer` sits at the bottom, e.g. a version mismatch banner.
 */
export default function RunHistoryList({
  workOrders,
  selectedRunId,
  latestVersion,
  onSelectRun,
  onDeselectRun,
  footer,
}: {
  workOrders: WorkOrder[];
  selectedRunId?: string;
  /** The workflow's latest version; runs on older ones get a yellow tag. */
  latestVersion?: string;
  onSelectRun?: (run: RunDetails) => void;
  onDeselectRun?: () => void;
  footer?: ReactNode;
}) {
  const [opened, setOpened] = useState<string[]>([]);

  const selectedOrder = workOrders.find((o) => o.runs.some((r) => r.runId === selectedRunId));
  const isOpen = (order: WorkOrder) => order.id === selectedOrder?.id || opened.includes(order.id);

  const toggle = (order: WorkOrder) => {
    if (isOpen(order)) {
      setOpened((ids) => ids.filter((id) => id !== order.id));
      return;
    }
    setOpened((ids) => [...ids, order.id]);
    if (order.runs.length === 1) onSelectRun?.(order.runs[0]);
  };

  return (
    <div className="flex h-full flex-col">
      {workOrders.length === 0 && (
        <p className="px-4 py-6 text-sm text-gray-400">No runs yet. Run the workflow to see it here.</p>
      )}
      <ul className="min-h-0 flex-1 divide-y divide-gray-50 overflow-y-auto">
        {workOrders.map((order) => (
          <li key={order.id}>
            <WorkOrderRow workOrder={order} expanded={isOpen(order)} onToggle={toggle} />
            {isOpen(order) && (
              <ul className="pb-1">
                {order.runs.map((run) => (
                  <li key={run.runId}>
                    <RunRow
                      run={run}
                      selected={run.runId === selectedRunId}
                      latestVersion={latestVersion}
                      onSelect={onSelectRun}
                      onDeselect={onDeselectRun}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {footer && <div className="flex-none">{footer}</div>}
    </div>
  );
}
