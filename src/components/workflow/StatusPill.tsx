import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RunStatus } from "../../mock-data/workflow";

const config: Record<RunStatus, { label: string; classes: string; dot: string; icon: LucideIcon; iconClasses: string }> = {
  success: { label: "Success", classes: "bg-green-100 text-green-700", dot: "bg-green-500", icon: CheckCircle2, iconClasses: "text-green-500" },
  failed: { label: "Failed", classes: "bg-red-100 text-red-600", dot: "bg-red-500", icon: XCircle, iconClasses: "text-red-500" },
  running: { label: "Running", classes: "bg-violet-100 text-violet-600", dot: "bg-violet-500 animate-pulse", icon: Loader2, iconClasses: "animate-spin text-violet-500" },
  pending: { label: "Pending", classes: "bg-gray-100 text-gray-500", dot: "bg-gray-300", icon: Circle, iconClasses: "text-gray-300" },
};

/**
 * A run's status: a small badge in the run inspector, just a coloured dot
 * where space is tight, such as rows in the history panel, or an icon with
 * a detail such as the step's duration, as on a canvas card.
 */
export default function StatusPill({
  status,
  variant = "pill",
  detail,
}: {
  status: RunStatus;
  /** "dot" shows only the colour, with the status as its label for screen readers; "icon" a check, cross or spinner. */
  variant?: "pill" | "dot" | "icon";
  /** Small text after the icon, e.g. "179 ms". */
  detail?: string;
}) {
  const { label, classes, dot, icon: Icon, iconClasses } = config[status];
  if (variant === "icon") {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] text-gray-500" title={label}>
        <Icon size={15} className={iconClasses} aria-label={label} />
        {detail && <span>{detail}</span>}
      </span>
    );
  }
  if (variant === "dot") {
    return (
      <span
        role="img"
        aria-label={label}
        title={label}
        className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${dot}`}
      />
    );
  }
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );
}
