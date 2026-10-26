import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, Maximize2, Minimize2, X } from "lucide-react";
import type { PanelViewId } from "../../editor-layout";
import { panelViews } from "./panel-views";
import SegmentedControl from "../SegmentedControl";

interface Props {
  view: PanelViewId;
  onViewChange: (view: PanelViewId) => void;
  /** Views that can't show anything right now, e.g. Log with no run loaded. */
  disabledViews?: PanelViewId[];
  /** Views the reader has taken out of the tab bar (through the layout menu). */
  hiddenViews?: PanelViewId[];
  /** Extra header controls. */
  actions?: ReactNode;
  /** Collapsed shows just the tab bar. */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  maximized?: boolean;
  onToggleMaximized?: () => void;
  /** Closes the panel entirely; it comes back from the layout toggle. */
  onClose?: () => void;
  /** What the active view is about, e.g. the step and run, with any controls. */
  context?: ReactNode;
  children: ReactNode;
}

/**
 * The panel under the code, as in an IDE: a bar of view tabs that's always
 * there, with the active view's body under it. The panel collapses to the
 * bar, maximises, or closes and comes back from the layout menu (or
 * Ctrl/⌘ + J); which views it shows is set there too. Runs, failures, and
 * the step's log, input and output in the loaded run all live here, so
 * there's one place in the code view to look for anything about runs. The
 * canvas has no panel: its inspector shows the same things for the node
 * selected, and opens them here in full.
 */
export default function EditorPanel({
  view,
  onViewChange,
  disabledViews = [],
  hiddenViews = [],
  actions,
  collapsed = false,
  onToggleCollapsed,
  maximized = false,
  onToggleMaximized,
  onClose,
  context,
  children,
}: Props) {
  const tabs = panelViews
    .filter((v) => !hiddenViews.includes(v.id))
    .map((v) => ({ id: v.id, label: v.label, disabled: disabledViews.includes(v.id) }));

  const height = collapsed ? "" : maximized ? "h-[60vh]" : "h-60";

  return (
    <section aria-label="Panel" className="flex flex-col border-t border-gray-200 bg-white">
      <header className="flex-none border-b border-gray-100">
        <div className="flex h-11 items-center gap-3 px-3">
          <SegmentedControl variant="pill" options={tabs} value={view} onChange={(v) => onViewChange(v as PanelViewId)} />
          <div className="ml-auto flex min-w-0 flex-shrink items-center gap-1">
            {context && <div className="mr-2 flex min-w-0 items-center gap-2 text-xs text-gray-500">{context}</div>}
            {actions}
            {onToggleMaximized && !collapsed && (
              <HeaderButton
                label={maximized ? "Restore panel size" : "Maximise panel"}
                icon={maximized ? Minimize2 : Maximize2}
                onClick={onToggleMaximized}
              />
            )}
            {onToggleCollapsed && (
              <HeaderButton
                label={collapsed ? "Expand panel" : "Collapse panel"}
                icon={collapsed ? ChevronUp : ChevronDown}
                onClick={onToggleCollapsed}
              />
            )}
            {onClose && <HeaderButton label="Close panel" icon={X} onClick={onClose} />}
          </div>
        </div>
      </header>
      {!collapsed && <div className={`min-h-0 overflow-auto ${height}`}>{children}</div>}
    </section>
  );
}

function HeaderButton({ label, icon: Icon, onClick }: { label: string; icon: typeof X; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
    >
      <Icon size={15} />
    </button>
  );
}
