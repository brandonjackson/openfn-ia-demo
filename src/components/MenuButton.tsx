import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Button from "./Button";
import type { ButtonSize, ButtonVariant } from "./Button";

export interface MenuButtonItem {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface Props {
  label: string;
  /** Icon shown before the label. */
  icon?: LucideIcon;
  /**
   * `button` renders a {@link Button}; `link` renders a small blue text link,
   * for actions that sit inside a card.
   */
  appearance?: "button" | "link";
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Small grey heading at the top of the menu, e.g. "Start it in…". */
  menuTitle?: string;
  items: MenuButtonItem[];
  onSelect: (id: string) => void;
  /** Which edge of the trigger the menu lines up with. */
  align?: "left" | "right";
  /** Start with the menu open (useful for stories and screenshots). */
  defaultOpen?: boolean;
}

/**
 * A button or text link that opens a short menu of choices, e.g. which kind of
 * component to create or which project to start a workflow in.
 */
export default function MenuButton({
  label,
  icon,
  appearance = "button",
  variant = "primary",
  size = "sm",
  menuTitle,
  items,
  onSelect,
  align = "left",
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

  const toggle = () => setOpen((o) => !o);
  const LinkIcon = icon;

  return (
    <div ref={ref} className="relative inline-block">
      {appearance === "button" ? (
        <Button
          variant={variant}
          size={size}
          icon={icon}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={toggle}
        >
          {label}
          <ChevronDown size={14} className="-mr-0.5 opacity-70" />
        </Button>
      ) : (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={toggle}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          {LinkIcon && <LinkIcon size={12} />}
          {label}
          <ArrowRight size={12} />
        </button>
      )}

      {open && (
        <div
          role="menu"
          className={`absolute top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {menuTitle && <p className="px-2 pt-1 pb-1.5 text-xs text-gray-500">{menuTitle}</p>}
          <ul className="max-h-72 overflow-y-auto">
            {items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      onSelect(item.id);
                    }}
                    className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-gray-100"
                  >
                    {ItemIcon && <ItemIcon size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-gray-900" title={item.label}>
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="block text-xs text-gray-500">{item.description}</span>
                      )}
                    </span>
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
