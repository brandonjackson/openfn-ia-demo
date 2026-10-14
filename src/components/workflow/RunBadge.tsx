import Pill from "../Pill";
import { shortUuid } from "../../utils/format";

/**
 * "Run abc1234" chip with a dismiss X (collaborative-editor/components/common/
 * RunBadge.tsx), shown when a run is selected.
 */
export default function RunBadge({
  runId,
  onClose,
  variant = "default",
  className,
}: {
  runId: string;
  onClose?: () => void;
  variant?: "default" | "warning";
  className?: string;
}) {
  return (
    <Pill color={variant === "default" ? "blue" : "yellow"} onRemove={onClose} className={className}>
      Run {shortUuid(runId, 7)}
    </Pill>
  );
}
