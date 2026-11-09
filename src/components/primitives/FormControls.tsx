import type {
  InputHTMLAttributes,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const controlClasses =
  "w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** The height of a `sm` Button, for an input beside one, e.g. a search in a page header. */
  compact?: boolean;
  /** Monospaced, for keys, ids and code. */
  mono?: boolean;
  /** To focus it, e.g. on the field a form says is missing. */
  ref?: Ref<HTMLInputElement>;
}

export function TextInput({ className = "", compact = false, mono = false, ...rest }: TextInputProps) {
  return <input type="text" className={`${controlClasses} ${compact ? "py-1.5" : "py-2"} ${mono ? "font-mono" : ""} ${className}`} {...rest} />;
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Monospaced, for code or JSON. */
  mono?: boolean;
  /** To focus it, e.g. on the field a form says is missing. */
  ref?: Ref<HTMLTextAreaElement>;
}

export function TextArea({ className = "", mono = false, ...rest }: TextAreaProps) {
  return <textarea className={`${controlClasses} py-2 ${mono ? "font-mono text-xs" : ""} ${className}`} {...rest} />;
}

/** An option whose value differs from what's shown, e.g. `{ value: "viewer", label: "Viewer" }`. */
export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Plain strings are both the value and the label. */
  options: (string | SelectOption)[];
  /** A first, empty option such as "Select a branch", chosen while nothing else is. */
  placeholder?: string;
  /** Shorter, for a select inside a table row. */
  compact?: boolean;
  /** Fills its row, like a text input, rather than fitting its longest option. */
  fullWidth?: boolean;
  /** As wide as its longest option rather than its container, for a filter in a row of them. */
  fit?: boolean;
}

export function Select({ options, placeholder, compact = false, fullWidth = false, fit = false, className, ...rest }: SelectProps) {
  const width = className ?? (fullWidth ? "w-full" : "w-auto");
  const classes = fit ? controlClasses.replace("w-full ", "") : controlClasses;
  return (
    <select className={`${classes} ${compact ? "py-1" : "py-2"} ${width}`} {...rest}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
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
        <input type="radio" className="mt-1 text-indigo-600" {...rest} />
        <span>
          <span className="block text-sm text-gray-700">{label}</span>
          <span className="block text-xs text-gray-500">{hint}</span>
        </span>
      </label>
    );
  }
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" className="text-indigo-600" {...rest} />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
