import type { InputHTMLAttributes, ReactNode } from "react";

/** collaborative-editor/components/form/form-field.tsx INPUT_CLASSES. */
export const INPUT_CLASSES =
  "focus:outline focus:outline-2 focus:outline-offset-1 block w-full rounded-lg text-slate-900 focus:ring-0 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 border-slate-300 focus:border-slate-400 focus:outline-indigo-600";

/** A labelled field as the editor's TanStack forms render it (form-field.tsx). */
export function FormField({ name, label, helpText, children }: { name: string; label: string; helpText?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm/6 font-medium text-slate-800 mb-2 flex items-center gap-2">
        {label}
      </label>
      {children}
      {helpText && <p className="text-xs text-gray-500 mt-1 italic">{helpText}</p>}
    </div>
  );
}

/** form/text-field.tsx (and number-field.tsx with `type="number"`). */
export default function TextField({
  name,
  label,
  helpText,
  ...rest
}: { name: string; label: string; helpText?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "name">) {
  return (
    <FormField name={name} label={label} helpText={helpText}>
      <input type="text" id={name} autoComplete="off" className={INPUT_CLASSES} {...rest} />
    </FormField>
  );
}

/** form/select-field.tsx. */
export function SelectField({
  name,
  label,
  value,
  onChange,
  options,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <FormField name={name} label={label}>
      <select
        id={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border-secondary-300 shadow-xs sm:text-sm focus:border-primary-300 focus:ring focus:ring-primary-200/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
