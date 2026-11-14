import Badge from "../primitives/Badge";
import type { BadgeTone } from "../primitives/Badge";
import { outcomeStatus, type OutcomeStatus, type OutcomeTone } from "../../model/step-tools";

const tones: Record<OutcomeTone, BadgeTone> = { green: "green", red: "red", amber: "yellow", blue: "indigo", gray: "gray" };

/**
 * A run's business outcome, as a Report outcome step recorded it: Success,
 * Refused, Needs follow-up and the rest, each in its own colour. It's a
 * different thing from the run's status, which `StatusPill` draws: a refusal
 * sent without a hitch is a successful run with a Refused outcome.
 */
export default function OutcomeBadge({
  status,
  shape = "pill",
}: {
  status: OutcomeStatus;
  /** `tag` for the small square note beside a name, e.g. on a canvas card. */
  shape?: "pill" | "tag";
}) {
  const outcome = outcomeStatus(status);
  return <Badge label={outcome.label} tone={tones[outcome.tone]} shape={shape} />;
}
