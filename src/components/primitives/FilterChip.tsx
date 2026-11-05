import { useId, type ReactNode } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import Surface from "./Surface";
import { usePopover } from "./use-popover";
import IconButton from "./IconButton";
import NavItem from "./NavItem";
import Checkbox from "./Checkbox";
import FormField from "./FormField";
import { TextInput } from "./FormControls";

interface FilterChipProps {
  /** The filter's name, for its clear button and panel: "Workflow". */
  name: string;
  /** What the filter is set to, in words: "Workflow is any", "Status is Failed or Cancelled". */
  label: string;
  /** Tinted while the filter narrows the list. */
  active?: boolean;
  /** Clears the filter, from an × on the chip while it's active. */
  onClear?: () => void;
  /**
   * What opens under the chip, given a way to close it. Left out, the chip
   * only says what's filtered, e.g. a work order a link opened History on.
   */
  children?: (close: () => void) => ReactNode;
  /** Width of the open panel. */
  panelWidthClass?: string;
  /** Start open (useful for stories and screenshots). */
  defaultOpen?: boolean;
}

/**
 * One filter over a list, as a rounded chip that says what it's set to
 * ("Workflow is any") and opens its choices underneath. A row of them sits
 * above a list such as History's work orders: each reads as a sentence, so
 * what the list shows is clear at a glance, and an active one carries an ×
 * to clear it. Fill the panel with {@link FilterOptions},
 * {@link FilterChecklist} or {@link FilterDateRange}.
 */
export default function FilterChip({
  name,
  label,
  active = false,
  onClear,
  children,
  panelWidthClass = "w-64",
  defaultOpen = false,
}: FilterChipProps) {
  const { open, setOpen, close, ref } = usePopover(defaultOpen);
  const clearable = active && onClear;
  const pad = clearable ? "pl-3 pr-1" : "px-3";

  return (
    <div ref={ref} className="relative inline-flex">
      <span
        className={`inline-flex items-center rounded-full border text-sm transition-colors ${
          active ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-700"
        }`}
      >
        {children ? (
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className={`inline-flex items-center gap-1 rounded-full py-1 ${pad} ${active ? "hover:text-indigo-900" : "hover:text-gray-900"}`}
          >
            {label}
            <ChevronDown size={13} className={active ? "text-indigo-400" : "text-gray-400"} />
          </button>
        ) : (
          <span className={`py-1 ${pad}`}>{label}</span>
        )}
        {clearable && (
          <span className="pr-1.5">
            <IconButton icon={X} size="2xs" label={`Clear ${name.toLowerCase()} filter`} onClick={onClear} />
          </span>
        )}
      </span>
      {open && children && (
        <Surface
          variant="popover"
          role="dialog"
          aria-label={name}
          className={`absolute left-0 top-full z-50 mt-1.5 p-1.5 ${panelWidthClass}`}
        >
          {children(close)}
        </Surface>
      )}
    </div>
  );
}

export interface FilterOption {
  id: string;
  label: string;
  /** A second line, e.g. the project a workflow belongs to. */
  description?: string;
  /** How many the list would show with this picked. */
  count?: number;
}

/** A filter's choices, of which one is picked: a workflow, a project, "Any". */
export function FilterOptions({
  label,
  options,
  value,
  onChange,
}: {
  /** The list's accessible name: "Workflow". */
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <ul role="listbox" aria-label={label} className="max-h-72 overflow-y-auto">
      {options.map((o) => (
        <li key={o.id}>
          <NavItem
            variant="menu"
            role="option"
            active={o.id === value}
            label={o.label}
            description={o.description}
            onClick={() => onChange(o.id)}
            trailing={
              <>
                {o.count !== undefined && <span className="text-xs tabular-nums text-gray-400">{o.count}</span>}
                {o.id === value && <Check size={14} className="text-indigo-600" />}
              </>
            }
          />
        </li>
      ))}
    </ul>
  );
}

/** A filter's choices, any number of which can be ticked: statuses, where to search. Ticking keeps it open. */
export function FilterChecklist({
  options,
  checked,
  onChange,
  keepOne = false,
}: {
  options: FilterOption[];
  checked: string[];
  onChange: (checked: string[]) => void;
  /** Stops the last ticked option being unticked, for a filter that can't be empty. */
  keepOne?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-0.5 p-1">
      {options.map((o) => {
        const on = checked.includes(o.id);
        return (
          <li key={o.id} className="flex items-start justify-between gap-3 rounded-md px-1.5 py-1 hover:bg-gray-50">
            <Checkbox
              label={o.label}
              hint={o.description}
              checked={on}
              disabled={keepOne && on && checked.length === 1}
              onChange={(next) => onChange(next ? [...checked, o.id] : checked.filter((id) => id !== o.id))}
            />
            {o.count !== undefined && <span className="mt-0.5 text-xs tabular-nums text-gray-400">{o.count}</span>}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * A date filter: quick periods to pick from, then a range of your own. Values
 * are datetime-local strings ("2026-10-13T09:00"); empty is open-ended.
 */
export function FilterDateRange({
  presets = [],
  after,
  before,
  onChange,
  afterLabel = "From",
  beforeLabel = "To",
}: {
  /** Quick periods, each by where it starts: "Last 7 days". */
  presets?: { label: string; after: string }[];
  after: string;
  before: string;
  onChange: (after: string, before: string) => void;
  afterLabel?: string;
  beforeLabel?: string;
}) {
  const id = useId();
  return (
    <div>
      {presets.length > 0 && (
        <ul className="border-b border-gray-100 pb-1.5">
          {presets.map((p) => {
            const on = !before && after === p.after;
            return (
              <li key={p.label}>
                <NavItem
                  variant="menu"
                  label={p.label}
                  active={on}
                  onClick={() => onChange(p.after, "")}
                  trailing={on && <Check size={14} className="text-indigo-600" />}
                />
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex flex-col gap-2 px-2.5 pb-1.5 pt-2.5">
        <FormField label={afterLabel} htmlFor={`${id}-after`}>
          <TextInput
            id={`${id}-after`}
            type="datetime-local"
            compact
            value={after}
            max={before || undefined}
            onChange={(e) => onChange(e.target.value, before)}
          />
        </FormField>
        <FormField label={beforeLabel} htmlFor={`${id}-before`}>
          <TextInput
            id={`${id}-before`}
            type="datetime-local"
            compact
            value={before}
            min={after || undefined}
            onChange={(e) => onChange(after, e.target.value)}
          />
        </FormField>
      </div>
    </div>
  );
}
