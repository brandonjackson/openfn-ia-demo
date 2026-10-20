import { ChevronRight } from "lucide-react";
import type { WorkOrder } from "../../mock-data/workflow";
import StatusPill from "./StatusPill";

/**
 * A work order in the history panel: the status of its latest run, its id,
 * when it last ran, and how many runs it has when it has been retried.
 * Clicking it shows or hides its runs.
 */
export default function WorkOrderRow({
  workOrder,
  expanded = false,
  onToggle,
}: {
  workOrder: WorkOrder;
  expanded?: boolean;
  onToggle?: (workOrder: WorkOrder) => void;
}) {
  const runCount = workOrder.runs.length;
  return (
    <button
      type="button"
      onClick={() => onToggle?.(workOrder)}
      aria-expanded={expanded}
      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
    >
      <ChevronRight
        size={14}
        className={`flex-shrink-0 text-gray-300 transition-transform ${expanded ? "rotate-90" : ""}`}
      />
      <StatusPill status={workOrder.status} variant="dot" />
      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700">{workOrder.id}</code>
      <span className="flex-1 truncate text-xs text-gray-500">{workOrder.lastActivity}</span>
      {runCount > 1 && <span className="flex-shrink-0 text-xs text-gray-400">{runCount} runs</span>}
    </button>
  );
}
