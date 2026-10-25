import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const controlClasses =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500";

export function TextInput({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" className={`${controlClasses} ${className}`} {...rest} />;
}

export function TextArea({ className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${controlClasses} ${className}`} {...rest} />;
}

/** A plain string is both the value and the label. */
export type SelectOption = string | { value: string; label: string };

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
}

export function Select({ options, className = "w-auto", ...rest }: SelectProps) {
  return (
    <select className={`${controlClasses} ${className}`} {...rest}>
      {options.map((opt) => {
        const { value, label } = typeof opt === "string" ? { value: opt, label: opt } : opt;
        return (
          <option key={value} value={value}>
            {label}
          </option>
        );
      })}
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
