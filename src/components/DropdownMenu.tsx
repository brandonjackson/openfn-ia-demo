import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Check, CheckSquare2, Square } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Secondary line under the label. */
  description?: string;
  /** Keyboard hint at the right edge, e.g. "R". */
  shortcut?: string;
  /** Small grey tag after the label, e.g. "Live". */
  tag?: string;
  /** Red text for destructive items. */
  tone?: "default" | "danger";
  /** Draw a divider above this item. */
  divider?: boolean;
  /** Shows a check mark, for menus that pick one of several. */
  selected?: boolean;
  /** Shows a checkbox, for menus that turn things on and off independently. */
  checked?: boolean;
  disabled?: boolean;
}

interface TriggerState {
  open: boolean;
  toggle: () => void;
}

interface Props {
  /** Renders the button that opens the menu; spread `aria-expanded` from `open`. */
  trigger: (state: TriggerState) => ReactNode;
  items: DropdownMenuItem[];
  onSelect: (id: string) => void;
  /** Accessible name for the menu. */
  ariaLabel: string;
  /** Small grey heading at the top of the menu. */
  title?: string;
  /** Which edge of the trigger the menu lines up with. */
  align?: "left" | "right";
  widthClass?: string;
  /** Start with the menu open (useful for stories and screenshots). */
  defaultOpen?: boolean;
}

/**
 * A menu of actions opened from any trigger: the editor's Fn file menu, the
 * sandbox chip, a tray's dock controls. Items can carry an icon, a shortcut
 * hint, a check mark when they are the current choice, and dividers between
 * groups. Clicking outside or pressing Escape closes it.
 *
 * For a menu opened from a standard button use {@link MenuButton}; for a
 * select-style chip that shows the chosen value use {@link Picker}.
 */
export default function DropdownMenu({
  trigger,
  items,
  onSelect,
  ariaLabel,
  title,
  align = "left",
  widthClass = "w-60",
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          role="menu"
          aria-label={ariaLabel}
          className={`absolute top-full z-50 mt-1.5 ${widthClass} rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {title && <p className="px-2.5 pb-1.5 pt-1 text-xs text-gray-500">{title}</p>}
          <ul>
            {items.map((item) => {
              const Icon = item.icon;
              const danger = item.tone === "danger";
              return (
                <li key={item.id} className={item.divider ? "mt-1.5 border-t border-gray-100 pt-1.5" : undefined}>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      setOpen(false);
                      onSelect(item.id);
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                      danger ? "text-red-600 hover:bg-red-50" : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {item.checked !== undefined &&
                      (item.checked ? (
                        <CheckSquare2 size={15} className="mt-0.5 flex-shrink-0 text-blue-600" />
                      ) : (
                        <Square size={15} className="mt-0.5 flex-shrink-0 text-gray-300" />
                      ))}
                    {Icon && (
                      <Icon size={14} className={`mt-0.5 flex-shrink-0 ${danger ? "text-red-500" : "text-gray-400"}`} />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate">{item.label}</span>
                        {item.tag && (
                          <span className="flex-shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">
                            {item.tag}
                          </span>
                        )}
                      </span>
                      {item.description && (
                        <span className="block text-xs text-gray-500">{item.description}</span>
                      )}
                    </span>
                    {item.selected && <Check size={14} className="mt-0.5 flex-shrink-0 text-blue-600" />}
                    {item.shortcut && !item.selected && (
                      <span className="mt-0.5 flex-shrink-0 font-mono text-xs text-gray-400">{item.shortcut}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
