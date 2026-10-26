import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, Maximize2, Minimize2, MoreHorizontal, RotateCcw, X } from "lucide-react";
import type { PanelViewId } from "../../editor-layout";
import { panelViews } from "./panel-views";
import SegmentedControl from "../SegmentedControl";
import DropdownMenu from "../DropdownMenu";

interface Props {
  view: PanelViewId;
  onViewChange: (view: PanelViewId) => void;
  /** Views that can't show anything right now, e.g. Log with no run loaded. */
  disabledViews?: PanelViewId[];
  /** Views the reader has taken out of the tab bar. */
  hiddenViews?: PanelViewId[];
  onToggleView?: (view: PanelViewId) => void;
  onResetViews?: () => void;
  /** Collapsed shows just the tab bar. */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  maximized?: boolean;
  onToggleMaximized?: () => void;
  /** Closes the panel entirely; it comes back from the layout toggle. */
  onClose?: () => void;
  /** What the active view is about, e.g. the step and run, with any controls. */
  context?: ReactNode;
  /** Floats as a card over the canvas; otherwise sits inline under the code. */
  floating?: boolean;
  children: ReactNode;
}

/**
 * The bottom panel, as in an IDE: a bar of view tabs that's always there,
 * with the active view's body under it. Views can be hidden from the bar
 * through the ⋯ menu, the panel collapses to the bar, maximises, or closes
 * and comes back from the toolbar's layout toggle. Runs, the selected step,
 * its log, input and output, and the adaptor reference all live here, so
 * there's one place to look for anything that isn't the canvas or the code.
 */
export default function EditorPanel({
  view,
  onViewChange,
  disabledViews = [],
  hiddenViews = [],
  onToggleView,
  onResetViews,
  collapsed = false,
  onToggleCollapsed,
  maximized = false,
  onToggleMaximized,
  onClose,
  context,
  floating = false,
  children,
}: Props) {
  const tabs = panelViews
    .filter((v) => !hiddenViews.includes(v.id))
    .map((v) => ({ id: v.id, label: v.label, disabled: disabledViews.includes(v.id) }));

  const height = collapsed ? "" : maximized ? (floating ? "h-[calc(100vh-9rem)]" : "h-[60vh]") : floating ? "h-80" : "h-60";
  const frame = floating
    ? "flex flex-col rounded-xl border border-gray-200 bg-white shadow-xl"
    : "flex flex-col border-t border-gray-200 bg-white";

  return (
    <section aria-label="Panel" className={frame}>
      <header className="flex h-11 flex-none items-center gap-3 border-b border-gray-100 px-3">
        <SegmentedControl variant="pill" options={tabs} value={view} onChange={(v) => onViewChange(v as PanelViewId)} />
        <div className="ml-auto flex min-w-0 flex-shrink items-center gap-1">
          {context && <div className="mr-2 flex min-w-0 items-center gap-2 text-xs text-gray-500">{context}</div>}
          {onToggleView && (
            <DropdownMenu
              ariaLabel="Panel views"
              title="Views in this panel"
              align="right"
              widthClass="w-64"
              items={[
                ...panelViews.map((v) => ({
                  id: v.id,
                  label: v.label,
                  description: v.description,
                  icon: v.icon,
                  selected: !hiddenViews.includes(v.id),
                })),
                ...(onResetViews ? [{ id: "reset", label: "Reset panel", icon: RotateCcw, divider: true }] : []),
              ]}
              onSelect={(id) => (id === "reset" ? onResetViews?.() : onToggleView(id as PanelViewId))}
              trigger={({ open, toggle }) => (
                <button
                  type="button"
                  onClick={toggle}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  aria-label="Panel views"
                  title="Choose which views the panel shows"
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 ${
                    open ? "bg-gray-100 text-gray-700" : ""
                  }`}
                >
                  <MoreHorizontal size={16} />
                </button>
              )}
            />
          )}
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
