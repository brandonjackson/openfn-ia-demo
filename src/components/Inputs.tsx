import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../utils/cn";

/**
 * Lightning's form inputs (components/new_inputs.ex `input`, `label`,
 * `error`), styled by @tailwindcss/forms plus Lightning's classes.
 */

export function Label({ htmlFor, className, children }: { htmlFor?: string; className?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className={cn("text-sm/6 font-medium text-slate-800", className)}>
      {children}
    </label>
  );
}

export function FieldError({ children }: { children: ReactNode }) {
  return (
    <p data-tag="error_message" className="mt-1 inline-flex items-center gap-x-1.5 text-xs text-danger-600">
      <span className="hero-exclamation-circle h-4 w-4" />
      {children}
    </p>
  );
}

interface FieldProps {
  label?: ReactNode;
  required?: boolean;
  /** Helper text under the label. */
  sublabel?: ReactNode;
  errors?: string[];
}

function FieldLabel({ id, label, required, sublabel }: FieldProps & { id?: string }) {
  if (!label) return null;
  return (
    <>
      <Label htmlFor={id} className="mb-2">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      {sublabel && <small className="mb-2 block text-xs text-gray-600">{sublabel}</small>}
    </>
  );
}

export function TextInput({
  label,
  required,
  sublabel,
  errors = [],
  className,
  id,
  ...rest
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <FieldLabel id={id} label={label} required={required} sublabel={sublabel} />
      <div>
        <input
          id={id}
          type="text"
          autoComplete="off"
          required={required}
          className={cn(
            "focus:outline focus:outline-2 focus:outline-offset-1 block w-full rounded-lg text-slate-900 focus:ring-0 sm:text-sm sm:leading-6",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
            errors.length === 0
              ? "border-slate-300 focus:border-slate-400 focus:outline-primary-600"
              : "border-danger-400 focus:border-danger-400 focus:outline-danger-400",
            className
          )}
          {...rest}
        />
      </div>
      {errors.map((e) => (
        <FieldError key={e}>{e}</FieldError>
      ))}
    </div>
  );
}

export function TextArea({
  label,
  required,
  sublabel,
  errors = [],
  className,
  id,
  ...rest
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <FieldLabel id={id} label={label} required={required} sublabel={sublabel} />
      <textarea
        id={id}
        required={required}
        className={cn(
          "focus:outline focus:outline-2 focus:outline-offset-1 rounded-md shadow-xs text-sm block w-full focus:ring-0 sm:text-sm sm:leading-6 overflow-y-auto",
          errors.length === 0
            ? "border-slate-300 focus:border-slate-400 focus:outline-primary-600"
            : "border-danger-400 focus:border-danger-400 focus:outline-danger-400",
          className
        )}
        {...rest}
      />
      {errors.map((e) => (
        <FieldError key={e}>{e}</FieldError>
      ))}
    </div>
  );
}

export function Select({
  label,
  required,
  sublabel,
  errors = [],
  options,
  prompt,
  className,
  id,
  ...rest
}: FieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: (string | [label: string, value: string])[];
    prompt?: string;
  }) {
  return (
    <div>
      {label && (
        <Label htmlFor={id} className="mb-2">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </Label>
      )}
      {sublabel && <small className="mb-2 block text-xs text-gray-600">{sublabel}</small>}
      <select
        id={id}
        required={required}
        className={cn(
          "block w-full rounded-lg border border-secondary-300 bg-white sm:text-sm shadow-xs",
          "focus:border-primary-300 focus:ring focus:ring-primary-200/50 disabled:cursor-not-allowed",
          className
        )}
        {...rest}
      >
        {prompt && <option value="">{prompt}</option>}
        {options.map((o) => {
          const [l, v] = typeof o === "string" ? [o, o] : o;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
      {errors.map((e) => (
        <FieldError key={e}>{e}</FieldError>
      ))}
    </div>
  );
}

export function Checkbox({
  label,
  className,
  ...rest
}: { label: ReactNode } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <label className="flex items-center gap-2 text-sm leading-6 text-slate-600">
      <input
        type="checkbox"
        className={cn(
          "rounded border-gray-300 text-primary-600 focus:ring-primary-600 transition duration-200 cursor-pointer",
          className
        )}
        {...rest}
      />
      {label}
    </label>
  );
}
