import { useState } from "react";

interface Props {
  /** Whether it's on. The switch flips straight away when pressed, and follows this when it changes. */
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Optional label rendered to the right of the switch, and its accessible name. */
  label?: string;
  /** Keeps the label for screen readers only, as in a list row where the column says what it is. */
  hideLabel?: boolean;
  /** Tooltip on the switch, e.g. what it being on means. */
  title?: string;
  disabled?: boolean;
}

export default function ToggleSwitch({ checked = false, onChange, label, hideLabel = false, title, disabled = false }: Props) {
  const [on, setOn] = useState(checked);
  // Follow the prop when whoever owns the value changes it (e.g. the server said no).
  const [prevChecked, setPrevChecked] = useState(checked);
  if (checked !== prevChecked) {
    setPrevChecked(checked);
    setOn(checked);
  }
  const toggle = () => {
    setOn(!on);
    onChange?.(!on);
  };

  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={title}
      disabled={disabled}
      onClick={toggle}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50 ${
        on ? "bg-indigo-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          on ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );

  if (!label || hideLabel) return control;

  return (
    <div className="flex items-center gap-2">
      {control}
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}
