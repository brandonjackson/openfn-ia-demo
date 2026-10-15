import type { RunState, WorkOrderState } from "../../types/history";
import type { ChannelRequestState } from "../../types/channels";
import Pill, { type PillColor } from "../Pill";
import { capitalize } from "../../utils/format";

type State = WorkOrderState | RunState | "running";

// run_live/components.ex `state_pill` chip_styles, mapped onto Pill colours.
const chipColors: Record<State, PillColor> = {
  rejected: "red",
  pending: "gray",
  running: "blue",
  available: "gray",
  claimed: "blue",
  started: "blue",
  success: "green",
  failed: "red",
  crashed: "orange",
  cancelled: "gray",
  killed: "yellow",
  exception: "dark",
  lost: "dark",
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
      return capitalize(state);
  }
}

/**
 * A work order or run state pill (run_live/components.ex `state_pill`).
 * `labelMode="raw"` shows the state itself, capitalised, as the canvas's
 * MiniHistory does ("Pending" rather than "Enqueued").
 */
export default function StatePill({ state, labelMode = "display" }: { state: State; labelMode?: "display" | "raw" }) {
  return <Pill color={chipColors[state]}>{labelMode === "raw" ? capitalize(state) : stateLabel(state)}</Pill>;
}

const channelConfig: Record<ChannelRequestState, { text: string; color: PillColor }> = {
  pending: { text: "In Progress", color: "blue" },
  success: { text: "Success", color: "green" },
  failed: { text: "Failed", color: "red" },
  timeout: { text: "Timeout", color: "orange" },
  error: { text: "Error", color: "red" },
};

/** A channel request state pill (`channel_state_pill`). `title` is its hover text. */
export function ChannelStatePill({ state, title }: { state: ChannelRequestState; title?: string }) {
  const { text, color } = channelConfig[state];
  return (
    <Pill color={color} title={title}>
      {text}
    </Pill>
  );
}
