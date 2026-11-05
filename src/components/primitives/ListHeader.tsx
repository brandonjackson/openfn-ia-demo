import type { ReactNode } from "react";

interface Props {
  /** Lines up with the rows' own leading slot, e.g. a "select all" checkbox. */
  leading?: ReactNode;
  /** What the list holds, e.g. "12 work orders, newest first". */
  children?: ReactNode;
  /** At the right edge, e.g. a sort control. */
  trailing?: ReactNode;
}

/**
 * The grey strip at the top of a list of rows in a `Card flush`: a "select
 * all" box lined up with the rows' checkboxes, a count, and room for a sort.
 */
export default function ListHeader({ leading, children, trailing }: Props) {
  return (
    <div className="flex min-w-0 items-center gap-3 bg-gray-50 px-4 py-2 text-xs text-gray-500">
      {leading}
      <div className="min-w-0 flex-1">{children}</div>
      {trailing}
    </div>
  );
}
