import { useState } from "react";

interface Props {
  /** Initial state. The switch manages its own state after mount. */
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Optional label rendered to the right of the switch. */
  label?: string;
}

export default function ToggleSwitch({ checked = false, onChange, label }: Props) {
  const [on, setOn] = useState(checked);
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
      onClick={toggle}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
        on ? "bg-blue-600" : "bg-gray-200"
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
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}
