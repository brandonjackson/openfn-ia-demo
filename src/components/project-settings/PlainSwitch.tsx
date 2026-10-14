import { cn } from "../../utils/cn";

interface Props {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  /** Hover text, e.g. why the switch is disabled. */
  tooltip?: string;
  /** id of the element that labels the switch. */
  labelledBy?: string;
}

/**
 * The plain on/off switch Lightning uses for the concurrency override
 * (new_inputs.ex `type="integer-toggle"`) and "Require MFA?"
 * (settings.html.heex `#toggle-mfa-switch`): no icon in the knob, unlike
 * the shared Toggle.
 */
export default function PlainSwitch({ checked, onChange, disabled = false, id, tooltip, labelledBy }: Props) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      disabled={disabled}
      title={tooltip}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2",
        checked ? "bg-primary-600" : "bg-gray-200",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
