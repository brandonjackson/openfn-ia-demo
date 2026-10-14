import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";

/**
 * A filter chip that shows a filter's state and opens its dropdown
 * (components/pills.ex `filter_chip`). Gray when inactive, indigo when the
 * filter is set; an active chip with `onClear` gets a small x button.
 */
export default function FilterChip({
  id,
  active = false,
  onClear,
  dropdown,
  dropdownClassName = "w-60",
  children,
}: {
  id?: string;
  active?: boolean;
  onClear?: () => void;
  /** Menu shown under the chip when it's clicked. Receives a close callback. */
  dropdown?: (close: () => void) => ReactNode;
  /** Width class for the dropdown panel. */
  dropdownClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div
        id={id}
        className={cn(
          "inline-flex items-center gap-x-1 rounded-full pl-3 text-sm font-medium transition-colors",
          active
            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
            : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200",
          active && onClear ? "pr-1.5" : "pr-3",
          "py-1.5"
        )}
      >
        <button type="button" className="cursor-pointer" onClick={() => dropdown && setOpen((o) => !o)}>
          {children}
        </button>
        {active && onClear && (
          <button
            type="button"
            className="group flex items-center justify-center h-5 w-5 rounded-full hover:bg-indigo-200"
            aria-label="Clear filter"
            onClick={onClear}
          >
            <span className="hero-x-mark-solid h-3 w-3 text-indigo-400 group-hover:text-indigo-600" />
          </button>
        )}
      </div>
      {open && dropdown && (
        <div
          className={cn(
            "absolute left-0 z-10 mt-2 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none",
            dropdownClassName
          )}
          role="menu"
        >
          {dropdown(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

/** A plain menu of options for a filter chip's dropdown (workflow / channel). */
export function FilterMenu<T extends string | null>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="py-1" role="none">
      {options.map((o) => (
        <a
          key={o.value ?? "any"}
          href="#"
          role="menuitem"
          onClick={(e) => {
            e.preventDefault();
            onSelect(o.value);
          }}
          className={cn(
            "block px-4 py-2 text-sm hover:bg-gray-100",
            o.value === selected ? "bg-gray-100 text-gray-900" : "text-gray-700"
          )}
        >
          {o.label}
        </a>
      ))}
    </div>
  );
}

/** Checkbox list for the status chip's dropdown. */
export function FilterCheckboxes({
  options,
  checked,
  onToggle,
}: {
  options: { id: string; label: string }[];
  checked: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="pt-2 pb-1" role="none">
      {options.map((o) => (
        <div key={o.id} className="px-4 py-1 text-gray-700 text-sm">
          <label className="flex items-center gap-2 text-sm leading-6 text-slate-800">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 h-4 w-4"
              checked={checked.includes(o.id)}
              onChange={() => onToggle(o.id)}
            />
            {o.label}
          </label>
        </div>
      ))}
    </div>
  );
}

/** The "Filter by …" panel with two datetime-local inputs (date chips). */
export function FilterDateRange({
  title,
  afterLabel,
  beforeLabel,
  after,
  before,
  onChange,
}: {
  title: string;
  afterLabel: string;
  beforeLabel: string;
  after: string;
  before: string;
  onChange: (after: string, before: string) => void;
}) {
  const input =
    "mt-2 block w-full rounded-lg border border-secondary-300 text-slate-900 focus:ring-0 sm:text-sm sm:leading-6 focus:border-primary-400";
  return (
    <div className="py-3" role="none">
      <div className="px-4 py-1 text-gray-500 text-sm">{title}</div>
      <div className="px-4 py-1 text-gray-700 text-sm">
        <label>{afterLabel}</label>
        <input type="datetime-local" className={input} value={after} onChange={(e) => onChange(e.target.value, before)} />
      </div>
      <div className="px-4 py-1 text-gray-700 text-sm">
        <label>{beforeLabel}</label>
        <input type="datetime-local" className={input} value={before} onChange={(e) => onChange(after, e.target.value)} />
      </div>
    </div>
  );
}
