import { ChevronDown } from "lucide-react";
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

/** A one-line text box. Put it in a `FormField` for its label, hint and error. */
export function TextInput({ className = "", compact = false, mono = false, ...rest }: TextInputProps) {
  return <input type="text" className={`${controlClasses} ${compact ? "py-1.5" : "py-2"} ${mono ? "font-mono" : ""} ${className}`} {...rest} />;
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Monospaced, for code or JSON. */
  mono?: boolean;
  /** To focus it, e.g. on the field a form says is missing. */
  ref?: Ref<HTMLTextAreaElement>;
}

/** A text box of several lines, e.g. a description. Put it in a `FormField`. */
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

/**
 * A native drop-down of `{ value, label }` options, with an optional placeholder.
 * It draws its own chevron rather than the browser's, so the text sits where a
 * text input's does and the arrow sits inside the border in every browser.
 */
export function Select({ options, placeholder, compact = false, fullWidth = false, fit = false, className, ...rest }: SelectProps) {
  const width = className ?? (fit && !fullWidth ? "w-fit" : "w-full");
  return (
    <span className={`relative inline-flex ${width}`}>
      <select
        className={`${controlClasses} appearance-none pr-9 ${compact ? "py-1" : "py-2"}`}
        {...rest}
      >
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
      <ChevronDown
        aria-hidden
        size={compact ? 14 : 16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
      />
    </span>
  );
}

interface RadioOptionProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  /** Helper text under the label. */
  hint?: string;
}

/** One choice of a set, with a label and an optional hint under it. */
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
