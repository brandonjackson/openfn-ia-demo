import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface Props {
  /** What the row says. Clicking it shows or hides `details`. */
  children: ReactNode;
  /** Read by screen readers for the toggle, e.g. "Work order 896d2dcb". */
  label: string;
  expanded: boolean;
  onToggle: () => void;
  /** Before the chevron, outside the toggle, e.g. a checkbox to select the row. */
  leading?: ReactNode;
  /** At the right edge, outside the toggle, e.g. row actions. */
  trailing?: ReactNode;
  /** Shown under the row while it's expanded. */
  details?: ReactNode;
  /** Tints the row, e.g. while it's selected. */
  selected?: boolean;
}

/**
 * A row in a list that opens to show more under it: a work order and its
 * runs, an audit event and its changes. Sits in a `Card flush` with
 * `Stack divided`, so rows share hairlines.
 */
export default function ExpandableRow({ children, label, expanded, onToggle, leading, trailing, details, selected = false }: Props) {
  return (
    <div className={selected ? "bg-indigo-50/50" : "bg-white"}>
      <div className="flex min-w-0 items-center gap-3 px-4 py-3">
        {leading}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={label}
          className="group flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronRight
            size={16}
            className={`flex-shrink-0 text-gray-400 transition-transform group-hover:text-gray-600 ${expanded ? "rotate-90" : ""}`}
          />
          <div className="min-w-0 flex-1">{children}</div>
        </button>
        {trailing && <div className="flex flex-shrink-0 items-center gap-1">{trailing}</div>}
      </div>
      {expanded && details && <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 sm:pl-14">{details}</div>}
    </div>
  );
}
