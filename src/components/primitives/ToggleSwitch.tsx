import { useState } from "react";

interface Props {
  /**
   * Initial state. The switch manages its own state after mount, and follows
   * this prop again whenever it changes (e.g. after a save comes back).
   */
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Optional label rendered to the right of the switch. */
  label?: string;
  /** Quieter text after the label, e.g. "(currently optional for this project)". */
  detail?: string;
  /** Greys the switch out, e.g. when you don't have permission to change it. */
  disabled?: boolean;
  /** Tooltip, e.g. why it's disabled. */
  title?: string;
}

export default function ToggleSwitch({ checked = false, onChange, label, detail, disabled = false, title }: Props) {
  const [on, setOn] = useState(checked);
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
      disabled={disabled}
      title={title}
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

  if (!label) return control;

  return (
    <div className="flex items-center gap-2">
      {control}
      <span className="text-sm text-gray-700">
        {label}
        {detail && <span className="text-gray-500"> {detail}</span>}
      </span>
    </div>
  );
}
