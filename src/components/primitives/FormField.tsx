import type { ReactNode } from "react";

interface Props {
  label: string;
  /** Id of the control this label is for. */
  htmlFor?: string;
  /** Helper text shown under the control. */
  hint?: ReactNode;
  /** What's wrong with the value, shown in red under the control in place of the hint. */
  error?: string;
  /** Marks the field as one that must be filled in. */
  required?: boolean;
  /** Marks the field "(optional)" after its label. */
  optional?: boolean;
  children: ReactNode;
}

/**
 * Label + control + hint. Wrap any control from `FormControls` in this.
 */
export default function FormField({ label, htmlFor, hint, error, required = false, optional = false, children }: Props) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden>
            *
          </span>
        )}
        {optional && <span className="font-normal text-gray-400"> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}
