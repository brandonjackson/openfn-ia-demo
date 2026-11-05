import type { ReactNode } from "react";

interface Props {
  label: string;
  /** Id of the control this label is for. */
  htmlFor?: string;
  /** Helper text shown under the control. */
  hint?: ReactNode;
  /** What's wrong with the value, shown in red under the control in place of the hint. */
  error?: string;
  children: ReactNode;
}

/**
 * Label + control + hint. Wrap any control from `FormControls` in this.
 */
export default function FormField({ label, htmlFor, hint, error, children }: Props) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
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
