import type { ReactNode } from "react";
import { Check, CheckSquare2, Square } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Surface from "./Surface";
import { usePopover } from "./use-popover";
import NavItem from "./NavItem";
import Badge from "./Badge";

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
  /** Under the trigger (the default), or to its right, level with its top, as from a card's ⋮. */
  placement?: "below" | "beside";
  widthClass?: string;
  /** Start with the menu open (useful for stories and screenshots). */
  defaultOpen?: boolean;
  /** Lets the trigger shrink in a tight row, e.g. a chip whose label truncates. */
  shrink?: boolean;
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
  placement = "below",
  widthClass = "w-60",
  defaultOpen = false,
  shrink = false,
}: Props) {
  const { open, setOpen, ref } = usePopover(defaultOpen);


  return (
    <div ref={ref} className={`relative inline-block ${shrink ? "min-w-0 max-w-full" : ""}`}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <Surface
          variant="popover"
          role="menu"
          aria-label={ariaLabel}
          className={`absolute z-50 ${widthClass} p-1.5 ${
            placement === "beside" ? "left-full top-0 ml-2" : align === "right" ? "right-0 top-full mt-1.5" : "left-0 top-full mt-1.5"
          }`}
        >
          {title && <p className="px-2.5 pb-1.5 pt-1 text-xs text-gray-500">{title}</p>}
          <ul>
            {items.map((item) => {
              return (
                <li key={item.id} className={item.divider ? "mt-1.5 border-t border-gray-100 pt-1.5" : undefined}>
                  <NavItem
                    variant="menu"
                    label={item.label}
                    icon={item.icon}
                    leading={
                      item.checked === undefined ? undefined : item.checked ? (
                        <CheckSquare2 size={15} className="text-indigo-600" />
                      ) : (
                        <Square size={15} className="text-gray-300" />
                      )
                    }
                    description={item.description}
                    danger={item.tone === "danger"}
                    disabled={item.disabled}
                    onClick={() => {
                      setOpen(false);
                      onSelect(item.id);
                    }}
                    trailing={
                      (item.tag || item.selected || item.shortcut) && (
                        <>
                          {item.tag && <Badge label={item.tag} shape="tag" />}
                          {item.selected ? (
                            <Check size={14} className="text-indigo-600" />
                          ) : (
                            item.shortcut && <span className="font-mono text-xs text-gray-400">{item.shortcut}</span>
                          )}
                        </>
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>
        </Surface>
      )}
    </div>
  );
}
