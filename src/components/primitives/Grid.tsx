import type { ReactNode } from "react";
import type { StackGap } from "./Stack";

const gaps: Record<StackGap, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

// One column on a phone, then the asked-for number from the `sm` breakpoint.
const columnClasses = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-5",
};

interface Props {
  /** How many columns side by side on a wide screen. Narrow screens get one (two for `5`). */
  columns: keyof typeof columnClasses;
  /** Space between cells: xs 4px, sm 8px, md 16px, lg 24px, xl 32px. */
  gap?: StackGap;
  children?: ReactNode;
}

/**
 * Children in even columns that fold up on a narrow screen: two form fields
 * side by side, a set of choices, a sheet of codes. The two-dimensional
 * member of the layout kit (with `Stack` and `Inline`).
 */
export default function Grid({ columns, gap = "md", children }: Props) {
  return <div className={`grid min-w-0 ${columnClasses[columns]} ${gaps[gap]}`}>{children}</div>;
}
