import { PanelBottom, PanelLeft, PanelRight } from "lucide-react";
import type { Dock } from "./trays";
import { DOCKS } from "./trays";

const icons = { left: PanelLeft, right: PanelRight, bottom: PanelBottom };

/**
 * Three buttons that open and close the editor's left, bottom and right
 * docks, filled in while open. A dock with no trays in it is disabled.
 * Tooltips carry the keyboard shortcut for each.
 */
export default function TrayToggles({
  open,
  available = { left: true, right: true, bottom: true },
  onToggle,
}: {
  open: Record<Dock, boolean>;
  /** Docks that hold at least one tray. */
  available?: Record<Dock, boolean>;
  onToggle?: (dock: Dock) => void;
}) {
  return (
    <div role="group" aria-label="Panels" className="flex items-center gap-0.5">
      {DOCKS.map((d) => {
        const Icon = icons[d.id];
        const isOpen = open[d.id] && available[d.id];
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => onToggle?.(d.id)}
            disabled={!available[d.id]}
            aria-pressed={isOpen}
            aria-label={`${isOpen ? "Hide" : "Show"} ${d.label.toLowerCase()}`}
            title={`${isOpen ? "Hide" : "Show"} ${d.label.toLowerCase()} (${d.shortcut})`}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
              isOpen ? "text-gray-900 hover:bg-gray-200/60" : "text-gray-400 hover:bg-gray-200/60 hover:text-gray-700"
            }`}
          >
            <Icon size={17} strokeWidth={isOpen ? 2.25 : 1.75} />
          </button>
        );
      })}
    </div>
  );
}
