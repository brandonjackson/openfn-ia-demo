import { useEffect, useRef } from "react";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Read by screen readers; shown beside the box unless `hideLabel`. */
  label: string;
  /** Keeps the label for screen readers only, as in a table's select column. */
  hideLabel?: boolean;
  /** Some but not all of what it stands for are checked, as in "select all". */
  indeterminate?: boolean;
  disabled?: boolean;
  /** A line under the label explaining what checking it does. */
  hint?: string;
  /** The box's id, e.g. to move focus to it when a form names a problem with it. */
  id?: string;
}

/**
 * A checkbox with its label: picking rows in a table, or turning on one of
 * several options in a form.
 */
export default function Checkbox({ checked, onChange, label, hideLabel = false, indeterminate = false, disabled = false, hint, id }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className={`inline-flex items-start gap-2 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        aria-label={hideLabel ? label : undefined}
        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500"
      />
      {!hideLabel && (
        <span className="flex flex-col">
          <span className="text-sm text-gray-700">{label}</span>
          {hint && <span className="text-xs text-gray-500">{hint}</span>}
        </span>
      )}
    </label>
  );
}
