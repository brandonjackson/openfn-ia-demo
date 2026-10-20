import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PickerOption {
  id: string;
  label: string;
  /** Shown on the trigger instead of `label` when this option is selected. */
  shortLabel?: string;
  /** Secondary line under the label, e.g. "Brandon Jackson · 20 Oct 2026". */
  description?: string;
  /** Small tag before the label, e.g. a version number. */
  badge?: { label: string; tone?: "green" | "gray" };
  /** Overrides the picker's icon for this option, e.g. a lock for main. */
  icon?: LucideIcon;
  /** Short tag after the label, shown on the trigger too, e.g. "Read only". */
  tag?: string;
  /** Options sharing a group are listed under a heading with this name. */
  group?: string;
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
  /** Width of the open menu. */
  menuWidthClass?: string;
  /** Start with the menu open (useful for stories and screenshots). */
  defaultOpen?: boolean;
}

/**
 * Select-style chip that opens a dropdown on click. Used for the project,
 * sandbox and version switchers in the project top bar and the workflow
 * editor. Options can carry a badge and a description, and be grouped under
 * headings (e.g. "Version history").
 */
export default function Picker({
  icon: Icon,
  options,
  value,
  onChange,
  ariaLabel,
  footerAction,
  maxWidthClass = "max-w-xs",
  menuWidthClass = "w-72",
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
  const TriggerIcon = selected?.icon ?? Icon;

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
        {TriggerIcon && <TriggerIcon size={14} className="flex-shrink-0 text-gray-500" />}
        <span className="truncate font-medium">{selected?.shortLabel ?? selected?.label ?? value}</span>
        {selected?.tag && <OptionTag label={selected.tag} />}
        <ChevronDown size={14} className="flex-shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className={`absolute left-0 top-full z-50 mt-1 ${menuWidthClass} rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg`}>
          <ul role="listbox" aria-label={ariaLabel} className="max-h-72 overflow-y-auto">
            {options.map((option, i) => {
              const isSelected = option.id === value;
              const startsGroup = option.group && option.group !== options[i - 1]?.group;
              return (
                <li key={option.id} role="option" aria-selected={isSelected}>
                  {startsGroup && (
                    <div className="px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                      {option.group}
                    </div>
                  )}
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
                    {option.badge ? (
                      <span
                        className={`flex-shrink-0 rounded border px-1.5 py-0.5 text-xs font-medium ${
                          option.badge.tone === "green"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-50 text-gray-600"
                        }`}
                      >
                        {option.badge.label}
                      </span>
                    ) : (
                      (() => {
                        const OptionIcon = option.icon ?? Icon;
                        return OptionIcon && <OptionIcon size={14} className="flex-shrink-0 text-gray-400" />;
                      })()
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate" title={option.label}>
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="block truncate text-xs font-normal text-gray-500">
                          {option.description}
                        </span>
                      )}
                    </span>
                    {option.tag && <OptionTag label={option.tag} />}
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

/** Small gray tag after an option's label, e.g. "Read only". */
function OptionTag({ label }: { label: string }) {
  return (
    <span className="flex-shrink-0 whitespace-nowrap rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
      {label}
    </span>
  );
}
