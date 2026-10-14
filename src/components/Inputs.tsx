import type { InputHTMLAttributes, ReactNode, Ref, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../utils/cn";
import { controlClasses } from "./controlClasses";

/**
 * Form controls. Every control shares one look (`controlClasses`) and sits
 * in a `Field`, which handles the label, hint and errors. Wrap a custom
 * control in `Field` to give it the same frame.
 */

export function Label({ htmlFor, className, children }: { htmlFor?: string; className?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className={cn("text-sm/6 font-medium text-gray-800", className)}>
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
  /** Help text between the label and the control. */
  hint?: ReactNode;
  errors?: string[];
}

/** A label, optional hint, a control and its errors. */
export function Field({ id, label, required, hint, errors = [], className, children }: FieldProps & { id?: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} className="mb-2 block">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </Label>
      )}
      {hint && <small className="mb-2 block text-xs text-gray-600">{hint}</small>}
      {children}
      {errors.map((e) => (
        <FieldError key={e}>{e}</FieldError>
      ))}
    </div>
  );
}

export function TextInput({ label, required, hint, errors = [], className, id, ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field id={id} label={label} required={required} hint={hint} errors={errors}>
      <input id={id} type="text" autoComplete="off" required={required} className={controlClasses(errors.length > 0, className)} {...rest} />
    </Field>
  );
}

export function TextArea({ label, required, hint, errors = [], className, id, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field id={id} label={label} required={required} hint={hint} errors={errors}>
      <textarea id={id} required={required} className={controlClasses(errors.length > 0, cn("overflow-y-auto", className))} {...rest} />
    </Field>
  );
}

/** An option as a plain string, a `[label, value]` pair or an object. */
export type SelectOption = string | [label: string, value: string] | { label: string; value: string };

function optionParts(o: SelectOption): [string, string] {
  if (typeof o === "string") return [o, o];
  if (Array.isArray(o)) return o;
  return [o.label, o.value];
}

export function Select({
  label,
  required,
  hint,
  errors = [],
  options,
  prompt,
  className,
  id,
  ...rest
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement> & { options: SelectOption[]; prompt?: string }) {
  return (
    <Field id={id} label={label} required={required} hint={hint} errors={errors}>
      <select id={id} required={required} className={controlClasses(errors.length > 0, className)} {...rest}>
        {prompt && <option value="">{prompt}</option>}
        {options.map((o) => {
          const [l, v] = optionParts(o);
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </Field>
  );
}

type ChoiceProps = { label: ReactNode; hint?: ReactNode; ref?: Ref<HTMLInputElement> } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const choiceClasses = "h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600 transition duration-200 cursor-pointer disabled:cursor-not-allowed";

/** A checkbox with its label to the right. `indeterminate` shows a dash, e.g. a partly-selected "select all". */
export function Checkbox({ label, hint, className, indeterminate = false, ref, ...rest }: ChoiceProps & { indeterminate?: boolean }) {
  const setRef = (el: HTMLInputElement | null) => {
    if (el) el.indeterminate = indeterminate;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };
  return <Choice type="checkbox" label={label} hint={hint} className={cn("rounded", className)} ref={setRef} {...rest} />;
}

/** A radio button with its label to the right. Group them with the same `name`. */
export function Radio({ label, hint, className, ...rest }: ChoiceProps) {
  return <Choice type="radio" label={label} hint={hint} className={className} {...rest} />;
}

function Choice({ label, hint, className, ...rest }: ChoiceProps & { type: "checkbox" | "radio" }) {
  return (
    <label className={cn("flex gap-2 text-sm leading-6 text-gray-700", hint ? "items-start" : "items-center")}>
      <input className={cn(choiceClasses, hint && "mt-1", className)} {...rest} />
      <span>
        {label}
        {hint && <span className="block text-xs text-gray-500">{hint}</span>}
      </span>
    </label>
  );
}
