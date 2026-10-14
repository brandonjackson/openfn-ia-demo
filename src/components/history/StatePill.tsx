import type { RunState, WorkOrderState } from "../../mock-data/history";
import type { ChannelRequestState } from "../../mock-data/channel-requests";
import { cn } from "../../utils/cn";

type State = WorkOrderState | RunState | "running";

// run_live/components.ex `state_pill` chip_styles.
const chipStyles: Record<State, string> = {
  rejected: "bg-red-300 text-gray-800",
  pending: "bg-gray-200 text-gray-800",
  running: "bg-blue-200 text-blue-800",
  available: "bg-gray-200 text-gray-800",
  claimed: "bg-blue-200 text-blue-800",
  started: "bg-blue-200 text-blue-800",
  success: "bg-green-200 text-green-800",
  failed: "bg-red-200 text-red-800",
  crashed: "bg-orange-200 text-orange-800",
  cancelled: "bg-gray-500 text-gray-800",
  killed: "bg-yellow-200 text-yellow-800",
  exception: "bg-gray-800 text-white",
  lost: "bg-gray-800 text-white",
};

/** `display_text_from_state`. */
function stateLabel(state: State): string {
  switch (state) {
    case "rejected":
      return "Rejected";
    case "pending":
    case "available":
      return "Enqueued";
    case "running":
    case "started":
      return "Running";
    case "claimed":
      return "Starting";
    default:
      return state.charAt(0).toUpperCase() + state.slice(1);
  }
}

function BasePill({ text, classes }: { text: string; classes: string }) {
  return (
    <span
      className={cn(
        "my-auto whitespace-nowrap rounded-full py-2 px-4 text-center align-baseline text-xs font-medium leading-none",
        classes
      )}
    >
      {text}
    </span>
  );
}

/** A work order or run state pill (run_live/components.ex `state_pill`). */
export default function StatePill({ state }: { state: State }) {
  return <BasePill text={stateLabel(state)} classes={chipStyles[state]} />;
}

const channelConfig: Record<ChannelRequestState, { text: string; classes: string }> = {
  pending: { text: "In Progress", classes: "bg-blue-200 text-blue-800" },
  success: { text: "Success", classes: "bg-green-200 text-green-800" },
  failed: { text: "Failed", classes: "bg-red-200 text-red-800" },
  timeout: { text: "Timeout", classes: "bg-orange-200 text-orange-800" },
  error: { text: "Error", classes: "bg-red-200 text-red-800" },
};

/** A channel request state pill (`channel_state_pill`). */
export function ChannelStatePill({ state }: { state: ChannelRequestState }) {
  return <BasePill {...channelConfig[state]} />;
}
