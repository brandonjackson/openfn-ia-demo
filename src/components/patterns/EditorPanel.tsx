import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from "lucide-react";
import IconButton from "../primitives/IconButton";
import EditorTray from "./EditorTray";

/** One view the panel can show, as a tab. */
export interface EditorPanelView<V extends string = string> {
  id: V;
  label: string;
}

interface Props<V extends string> {
  /** Every view the panel can show, in tab order, e.g. the editor's run views. */
  views: EditorPanelView<V>[];
  view: V;
  onViewChange: (view: V) => void;
  /** Views that can't show anything right now, e.g. Log with no run loaded. */
  disabledViews?: V[];
  /** Views the reader has taken out of the tab bar (through the layout menu). */
  hiddenViews?: V[];
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
 * The panel under the code, as in an IDE: the bottom `EditorTray`, with a
 * bar of view tabs that's always there and the active view's body under
 * it. The panel collapses to the bar, maximises, or closes and comes back from the layout menu (or
 * Ctrl/⌘ + J); which views it shows is set there too. The views are a
 * prop: in the workflow editor they're runs, failures, and the step's log,
 * input and output in the loaded run, so there's one place in the code view
 * to look for anything about runs.
 */
export default function EditorPanel<V extends string>({
  views,
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
}: Props<V>) {
  const tabs = views
    .filter((v) => !hiddenViews.includes(v.id))
    .map((v) => ({ id: v.id, label: v.label, disabled: disabledViews.includes(v.id) }));

  return (
    <EditorTray
      placement="bottom"
      tabs={{ options: tabs, value: view, onChange: (v) => onViewChange(v as V) }}
      meta={context}
      actions={
        <>
          {actions}
          {onToggleMaximized && !collapsed && (
            <IconButton
              label={maximized ? "Restore panel size" : "Maximise panel"}
              icon={maximized ? Minimize2 : Maximize2}
              onClick={onToggleMaximized}
            />
          )}
          {onToggleCollapsed && (
            <IconButton
              label={collapsed ? "Expand panel" : "Collapse panel"}
              icon={collapsed ? ChevronUp : ChevronDown}
              onClick={onToggleCollapsed}
            />
          )}
        </>
      }
      onClose={onClose}
      closeLabel="Close panel"
      collapsed={collapsed}
      heightClass={maximized ? "h-[60vh]" : "h-60"}
    >
      {children}
    </EditorTray>
  );
}
