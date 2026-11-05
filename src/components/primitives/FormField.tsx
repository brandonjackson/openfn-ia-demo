import type { ReactNode } from "react";

interface Props {
  label: string;
  /** Id of the control this label is for. */
  htmlFor?: string;
  /** Helper text shown under the control. */
  hint?: ReactNode;
  /** Marks the field "(optional)" after its label. */
  optional?: boolean;
  children: ReactNode;
}

/**
 * Label + control + hint. Wrap any control from `FormControls` in this.
 */
export default function FormField({ label, htmlFor, hint, optional = false, children }: Props) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {optional && <span className="font-normal text-gray-400"> (optional)</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
