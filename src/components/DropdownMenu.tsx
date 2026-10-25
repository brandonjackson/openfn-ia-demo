import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Keyboard shortcut shown at the right, e.g. "R" or "⌘B". */
  shortcut?: string;
  /** Shows a tick at the right, for things that are on (e.g. a visible panel). */
  checked?: boolean;
  /** Red, for destructive actions such as delete. */
  tone?: "default" | "danger";
  disabled?: boolean;
  /** Tooltip, e.g. why an item is disabled. */
  hint?: string;
}

export interface DropdownMenuSection {
  /** Small grey heading above the section, e.g. "View". */
  title?: string;
  items: DropdownMenuItem[];
}

/**
 * A menu of actions in sections, opened from any trigger: a file-style menu
 * with icons, shortcuts and ticks. Sections are divided by a rule.
 *
 * The trigger is rendered by the caller, so it can look like anything (e.g.
 * the editor's "Fn" button); it receives whether the menu is open and a
 * toggle. Clicking outside or pressing Escape closes the menu.
 */
export default function DropdownMenu({
  sections,
  onSelect,
  renderTrigger,
  align = "left",
  widthClass = "w-60",
  ariaLabel,
  defaultOpen = false,
}: {
  sections: DropdownMenuSection[];
  onSelect: (id: string) => void;
  renderTrigger: (trigger: { open: boolean; toggle: () => void }) => ReactNode;
  /** Which edge of the trigger the menu lines up with. */
  align?: "left" | "right";
  widthClass?: string;
  ariaLabel: string;
  /** Start with the menu open (useful for stories and screenshots). */
  defaultOpen?: boolean;
}) {
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

  const visible = sections.filter((s) => s.items.length > 0);

  return (
    <div ref={ref} className="relative inline-flex">
      {renderTrigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          role="menu"
          aria-label={ariaLabel}
          className={`absolute top-full z-50 mt-2 ${widthClass} rounded-xl border border-gray-200 bg-white p-1 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {visible.map((section, i) => (
            <div key={i} className={i > 0 ? "mt-1 border-t border-gray-100 pt-1" : undefined}>
              {section.title && (
                <p className="px-2.5 pb-1 pt-1.5 font-mono text-[10px] uppercase tracking-wider text-gray-400">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const danger = item.tone === "danger";
                return (
                  <button
                    key={item.id}
                    type="button"
                    role={item.checked === undefined ? "menuitem" : "menuitemcheckbox"}
                    aria-checked={item.checked}
                    disabled={item.disabled}
                    title={item.hint}
                    onClick={() => {
                      setOpen(false);
                      onSelect(item.id);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                      danger ? "text-red-600 hover:bg-red-50" : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {Icon ? (
                      <Icon size={14} className={`flex-shrink-0 ${danger ? "text-red-500" : "text-gray-500"}`} />
                    ) : (
                      <span className="w-3.5 flex-shrink-0" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.checked && <Check size={14} className="flex-shrink-0 text-gray-700" />}
                    {item.shortcut && (
                      <kbd className="flex-shrink-0 font-mono text-[11px] text-gray-400">{item.shortcut}</kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
