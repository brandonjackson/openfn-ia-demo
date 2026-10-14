import { useId, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import IconButton from "../IconButton";
import { Checkbox, Field } from "../Inputs";
import { controlClasses } from "../controlClasses";
import Popover from "../Popover";

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
  /** Panel shown under the chip when it's clicked. Receives a close callback. */
  dropdown?: (close: () => void) => ReactNode;
  /** Width (and padding) classes for the dropdown panel. */
  dropdownClassName?: string;
  children: ReactNode;
}) {
  const clearable = active && onClear;
  const label = (
    <button type="button" className={cn("cursor-pointer py-1.5 pl-3", clearable ? "pr-0" : "pr-3")}>
      {children}
    </button>
  );

  return (
    <div
      id={id}
      className={cn(
        "inline-flex items-center gap-x-1 rounded-full border text-sm font-medium transition-colors",
        active ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200",
        clearable && "pr-1.5"
      )}
    >
      {dropdown ? (
        <Popover trigger={label} className={dropdownClassName}>
          {(close) => dropdown(close)}
        </Popover>
      ) : (
        label
      )}
      {clearable && (
        <IconButton
          icon="hero-x-mark-solid"
          label="Clear filter"
          size="sm"
          className="h-5 w-5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-600 [&>span]:h-3 [&>span]:w-3"
          onClick={onClear}
        />
      )}
    </div>
  );
}

/** A plain list of options for a filter chip's dropdown (workflow / channel). */
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
    <div className="py-1">
      {options.map((o) => (
        <button
          key={o.value ?? "any"}
          type="button"
          onClick={() => onSelect(o.value)}
          className={cn(
            "block w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-100",
            o.value === selected ? "bg-gray-100 text-gray-900" : "text-gray-700"
          )}
        >
          {o.label}
        </button>
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
    <div className="space-y-1 px-4 pb-2 pt-3">
      {options.map((o) => (
        <Checkbox key={o.id} label={o.label} checked={checked.includes(o.id)} onChange={() => onToggle(o.id)} />
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
  const id = useId();
  return (
    <div className="space-y-3 px-4 py-3">
      <div className="text-sm text-gray-500">{title}</div>
      <Field id={`${id}-after`} label={afterLabel}>
        <input
          id={`${id}-after`}
          type="datetime-local"
          className={controlClasses()}
          value={after}
          onChange={(e) => onChange(e.target.value, before)}
        />
      </Field>
      <Field id={`${id}-before`} label={beforeLabel}>
        <input
          id={`${id}-before`}
          type="datetime-local"
          className={controlClasses()}
          value={before}
          onChange={(e) => onChange(after, e.target.value)}
        />
      </Field>
    </div>
  );
}
