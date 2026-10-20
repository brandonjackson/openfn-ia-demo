import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PickerOption {
  id: string;
  label: string;
}

interface Props {
  /** Icon shown before the selected label, e.g. a folder for projects. */
  icon?: LucideIcon;
  options: PickerOption[];
  /** ID of the selected option. */
  value: string;
  onChange?: (id: string) => void;
  /** Accessible name for the trigger and menu, e.g. "Switch project". */
  ariaLabel: string;
  /** Optional link-style action pinned below the options, e.g. "View all". */
  footerAction?: { label: string; icon?: LucideIcon; onClick: () => void };
  /** Caps the trigger width so long labels truncate. */
  maxWidthClass?: string;
  /** Start with the menu open (useful for stories and screenshots). */
  defaultOpen?: boolean;
}

/**
 * Select-style chip that opens a dropdown on click. Used for the project and
 * sandbox switchers in the project top bar and the workflow editor.
 */
export default function Picker({
  icon: Icon,
  options,
  value,
  onChange,
  ariaLabel,
  footerAction,
  maxWidthClass = "max-w-xs",
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value);

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

  const FooterIcon = footerAction?.icon;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        title={selected?.label}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm text-gray-700 transition-colors ${maxWidthClass} ${
          open ? "border-gray-300 bg-gray-50" : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
      >
        {Icon && <Icon size={14} className="flex-shrink-0 text-gray-500" />}
        <span className="truncate font-medium">{selected?.label ?? value}</span>
        <ChevronDown size={14} className="flex-shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg">
          <ul role="listbox" aria-label={ariaLabel} className="max-h-72 overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.id === value;
              return (
                <li key={option.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onChange?.(option.id);
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100 ${
                      isSelected ? "font-medium text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {Icon && <Icon size={14} className="flex-shrink-0 text-gray-400" />}
                    <span className="min-w-0 flex-1 truncate" title={option.label}>
                      {option.label}
                    </span>
                    {isSelected && <Check size={14} className="flex-shrink-0 text-blue-600" />}
                  </button>
                </li>
              );
            })}
          </ul>
          {footerAction && (
            <>
              <div className="my-1.5 border-t border-gray-200" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  footerAction.onClick();
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                {FooterIcon && <FooterIcon size={14} className="flex-shrink-0 text-gray-400" />}
                {footerAction.label}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
