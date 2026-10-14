import type { WorkOrderDisplayState } from "../../mock-data/dashboard-stats";
import { cn } from "../../utils/cn";
import DateTime from "../DateTime";

const DOT: Record<WorkOrderDisplayState, string> = {
  pending: "bg-gray-600",
  running: "bg-blue-600",
  success: "bg-green-600",
  failed: "bg-red-600",
  crashed: "bg-orange-600",
  cancelled: "bg-gray-500",
  killed: "bg-yellow-600",
  exception: "bg-gray-300 border-2 border-gray-800",
  lost: "bg-gray-300 border-2 border-gray-800",
};

const TEXT: Record<WorkOrderDisplayState, string> = {
  pending: "text-gray-500",
  running: "text-blue-500",
  success: "text-green-500",
  failed: "text-red-500",
  crashed: "text-orange-500",
  cancelled: "text-gray-500",
  killed: "text-yellow-800",
  exception: "text-gray-600",
  lost: "text-gray-600",
};

const LABEL: Partial<Record<WorkOrderDisplayState, string>> = { pending: "Enqueued" };

/**
 * The "Latest Work Order" cell (DashboardComponents.state_card /
 * status_card): a coloured dot (pinging while active), the state, and when.
 * With no work order it reads "Nothing last 30 days".
 */
export default function WorkOrderStatus({
  state,
  updatedAt,
  period = "last 30 days",
}: {
  state: WorkOrderDisplayState | null;
  updatedAt?: string;
  period?: string;
}) {
  if (!state) {
    return (
      <div className="flex items-center gap-x-2">
        <span className="h-2 w-2 rounded-full bg-gray-200" />
        <span className="italic">Nothing {period}</span>
      </div>
    );
  }
  const active = state === "pending" || state === "running";
  const text = LABEL[state] ?? state.charAt(0).toUpperCase() + state.slice(1);
  return (
    <div>
      <div className="flex items-center gap-x-2">
        <span className="relative flex h-2 w-2">
          {active && <span className={cn("absolute h-full w-full animate-ping rounded-full opacity-75", DOT[state])} />}
          <span className={cn("relative h-2 w-2 rounded-full", DOT[state])} />
        </span>
        <span className={cn(TEXT[state], "font-medium")}>{text}</span>
      </div>
      {updatedAt && <DateTime value={updatedAt} className="mt-1 ml-4 block text-xs" />}
    </div>
  );
}
