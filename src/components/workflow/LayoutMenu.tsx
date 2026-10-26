import { MoreHorizontal } from "lucide-react";
import type { EditorLayout, PanelDock, PanelViewId } from "../../editor-layout";
import { panelViews } from "./panel-views";
import DropdownMenu from "../DropdownMenu";
import type { DropdownMenuItem } from "../DropdownMenu";

interface Props {
  layout: EditorLayout;
  onChange: (patch: Partial<EditorLayout>) => void;
  onReset?: () => void;
  /** Which areas apply: the explorer and details column only exist in code mode. */
  view: "canvas" | "code";
  defaultOpen?: boolean;
}

/**
 * The ⋯ button at the top-right corner of the code area that opens the
 * layout menu: checkboxes for each area (explorer, panel, details,
 * assistant), on the canvas where the panel docks, and for each view the
 * panel shows, then a reset. It's the
 * one place that lists everything the layout can show or hide.
 */
export default function LayoutMenu({ layout, onChange, onReset, view, defaultOpen = false }: Props) {
  const code = view === "code";
  const items: DropdownMenuItem[] = [
    ...(code ? [{ id: "explorer", label: "Explorer", description: "Files, steps and components", checked: layout.explorer }] : []),
    { id: "panel", label: "Panel", description: "Runs, step, log, input and output", checked: layout.panel },
    ...(code ? [{ id: "details", label: "Details", description: "Settings and adaptor reference", checked: layout.details }] : []),
    { id: "assistant", label: "Assistant", checked: layout.assistant },
    ...(code
      ? []
      : [
          { id: "dock:right", label: "Panel on the right", selected: layout.canvasPanelDock === "right", divider: true },
          { id: "dock:bottom", label: "Panel along the bottom", selected: layout.canvasPanelDock === "bottom" },
        ]),
    ...panelViews.map((v, i) => ({
      id: `view:${v.id}`,
      label: v.label,
      description: v.description,
      checked: !layout.hiddenViews.includes(v.id),
      divider: i === 0,
    })),
    ...(onReset ? [{ id: "reset", label: "Reset layout", divider: true }] : []),
  ];

  const select = (id: string) => {
    if (id === "reset") return onReset?.();
    if (id.startsWith("dock:")) return onChange({ canvasPanelDock: id.slice(5) as PanelDock, panel: true });
    if (id.startsWith("view:")) {
      const v = id.slice(5) as PanelViewId;
      const hidden = layout.hiddenViews.includes(v) ? layout.hiddenViews.filter((h) => h !== v) : [...layout.hiddenViews, v];
      return onChange({ hiddenViews: hidden });
    }
    const key = id as "explorer" | "panel" | "details" | "assistant";
    onChange({ [key]: !layout[key] });
  };

  return (
    <DropdownMenu
      ariaLabel="Layout"
      title="Show"
      align="right"
      widthClass="w-64"
      items={items}
      onSelect={select}
      defaultOpen={defaultOpen}
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Layout"
          title="Layout: show or hide areas and panel views"
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 ${
            open ? "bg-gray-100 text-gray-700" : ""
          }`}
        >
          <MoreHorizontal size={16} />
        </button>
      )}
    />
  );
}
