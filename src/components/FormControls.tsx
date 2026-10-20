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

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
}

export function Select({ options, className = "w-auto", ...rest }: SelectProps) {
  return (
    <select className={`${controlClasses} ${className}`} {...rest}>
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
}

export function RadioOption({ label, ...rest }: RadioOptionProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" className="text-blue-600" {...rest} />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
