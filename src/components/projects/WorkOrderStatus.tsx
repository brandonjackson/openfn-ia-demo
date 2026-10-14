import type { WorkOrderDisplayState } from "../../mock-data/dashboard-stats";
import { cn } from "../../utils/cn";
import RelativeTime from "./RelativeTime";

const DOT: Record<WorkOrderDisplayState, string> = {
  pending: "bg-gray-600",
  running: "bg-blue-600",
  success: "bg-green-600",
  failed: "bg-red-600",
  crashed: "bg-orange-600",
  cancelled: "bg-gray-500",
  killed: "bg-yellow-600",
  exception: "bg-gray-300 border-solid border-2 border-gray-800",
  lost: "bg-gray-300 border-solid border-2 border-gray-800",
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
      <div className="flex flex-col text-center">
        <div className="flex items-center gap-x-2">
          <span className="inline-block h-2 w-2 bg-gray-200 rounded-full" />
          <span className="italic">Nothing {period}</span>
        </div>
      </div>
    );
  }
  const active = state === "pending" || state === "running";
  const text = LABEL[state] ?? state.charAt(0).toUpperCase() + state.slice(1);
  return (
    <div className="flex flex-col text-center">
      <div>
        <div className="flex items-center gap-x-2">
          <span className="relative inline-flex h-2 w-2">
            {active && (
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", DOT[state])} />
            )}
            <span className={cn("relative inline-flex rounded-full h-2 w-2", DOT[state])} />
          </span>
          <span className={cn(TEXT[state], "font-medium")}>{text}</span>
        </div>
        {updatedAt && (
          <span className="block text-left text-gray-500 text-xs ml-4 mt-1">
            <RelativeTime datetime={updatedAt} />
          </span>
        )}
      </div>
    </div>
  );
}
