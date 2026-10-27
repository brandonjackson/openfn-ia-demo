import type { ReactNode } from "react";

interface Props {
  label: string;
  /** Id of the control this label is for. */
  htmlFor?: string;
  /** Helper text shown under the control. */
  hint?: ReactNode;
  /** The small uppercase label of a narrow card such as the inspector, matching `SectionHeading`'s compact label. */
  compact?: boolean;
  children: ReactNode;
}

/**
 * Label + control + hint. Wrap any control from `FormControls` in this.
 */
export default function FormField({ label, htmlFor, hint, compact = false, children }: Props) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className={
          compact ? "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400" : "block text-sm font-medium text-gray-700 mb-1"
        }
      >
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
