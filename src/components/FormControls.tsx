import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const controlClasses =
  "w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** The height of a `sm` Button, for an input beside one, e.g. a search in a page header. */
  compact?: boolean;
}

export function TextInput({ className = "", compact = false, ...rest }: TextInputProps) {
  return <input type="text" className={`${controlClasses} ${compact ? "py-1.5" : "py-2"} ${className}`} {...rest} />;
}

export function TextArea({ className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${controlClasses} py-2 ${className}`} {...rest} />;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
}

export function Select({ options, className = "w-auto", ...rest }: SelectProps) {
  return (
    <select className={`${controlClasses} py-2 ${className}`} {...rest}>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

interface RadioOptionProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  /** Helper text under the label. */
  hint?: string;
}

export function RadioOption({ label, hint, ...rest }: RadioOptionProps) {
  if (hint) {
    return (
      <label className="flex items-start gap-2 cursor-pointer">
        <input type="radio" className="mt-1 text-blue-600" {...rest} />
        <span>
          <span className="block text-sm text-gray-700">{label}</span>
          <span className="block text-xs text-gray-500">{hint}</span>
        </span>
      </label>
    );
  }
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" className="text-blue-600" {...rest} />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
