import type { TriggerNode } from "../../mock-data/workflow";
import { TriggerIcon } from "./AdaptorIcon";

const names: Record<TriggerNode["triggerType"], string> = {
  webhook: "Webhook trigger",
  cron: "Cron trigger",
  kafka: "Kafka trigger",
};

/**
 * The trigger's counterpart to {@link AdaptorPill}: a small bordered pill
 * with the trigger's glyph and kind, for the head of its canvas card.
 */
export default function TriggerPill({ triggerType, compact = false }: { triggerType: TriggerNode["triggerType"]; compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-gray-200 bg-white text-gray-700 ${
        compact ? "gap-1 py-px pl-0.5 pr-1.5 text-[11px]" : "gap-1.5 py-0.5 pl-1 pr-2 text-xs"
      }`}
    >
      <TriggerIcon triggerType={triggerType} size={compact ? "xs" : "sm"} />
      {names[triggerType]}
    </span>
  );
}
