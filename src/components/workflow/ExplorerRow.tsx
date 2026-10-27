import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { RunStatus } from "../../mock-data/workflow";
import StatusPill from "./StatusPill";

interface Props {
  label: string;
  icon?: LucideIcon;
  /** Shown in place of `icon` when the row needs more than a glyph, e.g. a step's adaptor icon. */
  leading?: ReactNode;
  /** What sits at the right edge, e.g. a component's kind. */
  trailing?: ReactNode;
  /** The row's step status in the selected run, shown as a mark at the far right. */
  status?: RunStatus;
  selected?: boolean;
  onClick?: () => void;
}

/**
 * One row in the code explorer: a workflow file, the trigger, a step or a
 * component.
 * The selected row is tinted; a row's step status in the selected run shows
 * as a mark at the right.
 */
export default function ExplorerRow({ label, icon: Icon, leading, trailing, status, selected = false, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? "true" : undefined}
      title={label}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
        selected ? "bg-gray-100 font-medium text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {leading ? (
        <span className="inline-flex w-4 flex-shrink-0 justify-center">{leading}</span>
      ) : (
        Icon && <Icon size={14} className="flex-shrink-0 text-gray-400" />
      )}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing && <span className="flex-shrink-0">{trailing}</span>}
      {status && (
        <span className="inline-flex w-4 flex-shrink-0 justify-center">
          <StatusPill status={status} variant="mark" />
        </span>
      )}
    </button>
  );
}
