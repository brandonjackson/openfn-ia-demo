import { Check, CheckCircle2, Circle, Loader2, X, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RunStatus } from "../../mock-data/workflow";

const config: Record<
  RunStatus,
  { label: string; classes: string; dot: string; icon: LucideIcon; iconClasses: string; mark?: LucideIcon }
> = {
  success: { label: "Success", classes: "bg-green-100 text-green-700", dot: "bg-green-500", icon: CheckCircle2, iconClasses: "text-green-500", mark: Check },
  failed: { label: "Failed", classes: "bg-red-100 text-red-600", dot: "bg-red-500", icon: XCircle, iconClasses: "text-red-500", mark: X },
  running: { label: "Running", classes: "bg-indigo-100 text-indigo-600", dot: "bg-indigo-500 animate-pulse", icon: Loader2, iconClasses: "animate-spin text-indigo-500", mark: Loader2 },
  pending: { label: "Pending", classes: "bg-gray-100 text-gray-500", dot: "bg-gray-300", icon: Circle, iconClasses: "text-gray-300" },
};

/**
 * A run's status, and the only way the app draws one: a small badge in the
 * run inspector, just a coloured dot where space is tight, such as rows in
 * the history panel, an icon with a detail such as the step's duration, as
 * on a canvas card, or a bare mark (check, cross, spinner) at the end of an
 * explorer row.
 */
export default function StatusPill({
  status,
  variant = "pill",
  detail,
}: {
  status: RunStatus;
  /**
   * "dot" shows only the colour, with the status as its label for screen
   * readers; "icon" a circled check, cross or spinner; "mark" a bare check,
   * cross or spinner, with a small dot for pending.
   */
  variant?: "pill" | "dot" | "icon" | "mark";
  /** Small text after the icon, e.g. "179 ms". */
  detail?: string;
}) {
  const { label, classes, dot, icon: Icon, iconClasses, mark: Mark } = config[status];
  if (variant === "mark") {
    return Mark ? (
      <Mark size={14} className={`flex-shrink-0 ${iconClasses}`} aria-label={label} role="img" />
    ) : (
      <span role="img" aria-label={label} title={label} className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${dot}`} />
    );
  }
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
