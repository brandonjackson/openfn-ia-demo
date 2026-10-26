import { MoreHorizontal } from "lucide-react";
import type { EditorLayout } from "../../editor-layout";
import DropdownMenu from "../DropdownMenu";
import type { DropdownMenuItem } from "../DropdownMenu";

interface Props {
  layout: EditorLayout;
  onChange: (patch: Partial<EditorLayout>) => void;
  onReset?: () => void;
  defaultOpen?: boolean;
}

/**
 * The ⋯ button at the top-right corner of the code area that opens the
 * layout menu: a checkbox each for the bottom and right panels, then a
 * reset. The explorer (Ctrl/⌘ + B) and the assistant (its toolbar button)
 * have their own ways in. The canvas has no layout to set: its runs bar
 * and inspector cover it.
 */
export default function LayoutMenu({ layout, onChange, onReset, defaultOpen = false }: Props) {
  const items: DropdownMenuItem[] = [
    { id: "panel", label: "Bottom panel", description: "Runs, failures, log, input and output", checked: layout.panel },
    { id: "details", label: "Right panel", description: "Config and snippets", checked: layout.details },
    ...(onReset ? [{ id: "reset", label: "Reset layout", divider: true }] : []),
  ];

  const select = (id: string) => {
    if (id === "reset") return onReset?.();
    const key = id as "panel" | "details";
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
          title="Layout: show or hide areas"
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
