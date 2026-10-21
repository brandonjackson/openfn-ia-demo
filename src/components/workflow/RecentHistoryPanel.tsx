import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, ChartColumn } from "lucide-react";
import type { RunDetails, WorkOrder } from "../../mock-data/workflow";
import WorkOrderRow from "./WorkOrderRow";
import RunRow from "./RunRow";
import RunChip from "./RunChip";

/**
 * The "Recent History" panel pinned to the top-left of the canvas.
 *
 * It lists work orders, newest first. Expanding one shows its runs; when it
 * has only one run, expanding it selects that run straight away. Selecting a
 * run draws its results on the canvas. The work order holding the selected
 * run always stays open so the selection is visible.
 *
 * Collapsing the panel leaves just its header and a chip for the selected
 * run. `footer` sits at the bottom either way, e.g. a version mismatch banner.
 */
export default function RecentHistoryPanel({
  workOrders,
  selectedRunId,
  latestVersion,
  onSelectRun,
  onDeselectRun,
  footer,
  defaultCollapsed = false,
}: {
  workOrders: WorkOrder[];
  selectedRunId?: string;
  /** The workflow's latest version; runs on older ones get a yellow tag. */
  latestVersion?: string;
  onSelectRun?: (run: RunDetails) => void;
  onDeselectRun?: () => void;
  footer?: ReactNode;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [opened, setOpened] = useState<string[]>([]);

  const selectedOrder = workOrders.find((o) => o.runs.some((r) => r.runId === selectedRunId));
  const selectedRun = selectedOrder?.runs.find((r) => r.runId === selectedRunId);
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
    <div className="w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Recent History</span>
          <ChartColumn size={14} className="text-gray-300" />
        </div>
        <div className="flex items-center gap-2">
          {collapsed && selectedRun && <RunChip run={selectedRun} onClear={onDeselectRun} />}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="text-gray-300 hover:text-gray-500"
            title={collapsed ? "Show history" : "Hide history"}
            aria-label={collapsed ? "Show history" : "Hide history"}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {workOrders.length === 0 && (
            <p className="px-3 py-4 text-xs text-gray-400">No runs yet. Run the workflow to see it here.</p>
          )}
          <ul className="max-h-[420px] divide-y divide-gray-50 overflow-y-auto">
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
        </>
      )}

      {footer}
    </div>
  );
}
