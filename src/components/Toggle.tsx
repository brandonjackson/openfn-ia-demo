import { cn } from "../utils/cn";

interface Props {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  /** Shown to the right of the switch. */
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  /** Hover text, e.g. why the switch is disabled. */
  tooltip?: string;
  /** id of an element that labels the switch, when there's no `label`. */
  labelledBy?: string;
}

/**
 * Lightning's toggle switch (new_inputs.ex `type="toggle"`): primary-600
 * when on, with a check / cross in the knob.
 */
export default function Toggle({ checked, onChange, label, description, disabled = false, id, tooltip, labelledBy }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={labelledBy ? undefined : label}
          aria-labelledby={labelledBy}
          disabled={disabled}
          title={tooltip}
          data-ui="toggle"
          onClick={() => onChange?.(!checked)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2",
            checked ? "bg-primary-600" : "bg-gray-200",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition duration-200 ease-in-out",
              checked ? "translate-x-5" : "translate-x-0"
            )}
          >
            <span className={cn("h-4 w-4", checked ? "hero-check-micro text-primary-600" : "hero-x-mark-micro text-gray-400")} />
          </span>
        </button>
        {label && <span className="text-sm font-medium text-gray-900">{label}</span>}
      </div>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
}
