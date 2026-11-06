import { cloneElement, isValidElement, useId, type ReactNode } from "react";

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

type Described = { "aria-describedby"?: string; "aria-invalid"?: boolean; "aria-required"?: boolean };

/**
 * Label + control + hint. Wrap any control from `FormControls` in this. A
 * single control is told, for screen readers, what its hint or error says,
 * whether it's invalid and whether it's required.
 */
export default function FormField({ label, htmlFor, hint, error, required = false, optional = false, children }: Props) {
  const noteId = useId();
  const note = error || hint ? noteId : undefined;
  const control = isValidElement<Described>(children)
    ? cloneElement(children, {
        "aria-describedby": [children.props["aria-describedby"], note].filter(Boolean).join(" ") || undefined,
        ...(error && { "aria-invalid": true }),
        ...(required && { "aria-required": true }),
      })
    : children;
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden>
            *
          </span>
        )}
        {optional && <span className="font-normal text-gray-500"> (optional)</span>}
      </label>
      {control}
      {error ? (
        <p id={noteId} role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={noteId} className="mt-1 text-xs text-gray-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
