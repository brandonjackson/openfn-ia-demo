import { cn } from "../utils/cn";

interface Props {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

/**
 * Lightning's toggle switch (new_inputs.ex `type="toggle"`): primary-600
 * when on, with a check / cross in the knob.
 */
export default function Toggle({ checked, onChange, label, description, disabled = false }: Props) {
  const flip = () => !disabled && onChange?.(!checked);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <div
          tabIndex={disabled ? -1 : 0}
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={flip}
          onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), flip())}
          className={cn(
            "relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 ease-in-out border-2 border-transparent",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
            checked ? "bg-primary-600" : "bg-gray-200",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          )}
        >
          <span
            className={cn(
              "pointer-events-none absolute h-5 w-5 inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              checked ? "translate-x-5" : "translate-x-0"
            )}
          >
            <span
              className={cn(
                "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in",
                checked ? "opacity-0" : "opacity-100"
              )}
              aria-hidden="true"
            >
              <span className="hero-x-mark-micro h-4 w-4 text-gray-400" />
            </span>
            <span
              className={cn(
                "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in",
                checked ? "opacity-100" : "opacity-0"
              )}
              aria-hidden="true"
            >
              <span className="hero-check-micro h-4 w-4 text-primary-600" />
            </span>
          </span>
        </div>
        {label && <span className="text-sm font-medium text-gray-900">{label}</span>}
      </div>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
}
