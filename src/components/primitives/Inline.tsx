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

const aligns = { start: "items-start", center: "items-center", baseline: "items-baseline", end: "items-end" };
/** The same, from `sm` up, for a row that stacks on a phone. Written out so Tailwind sees each class. */
const smAligns = { start: "sm:items-start", center: "sm:items-center", baseline: "sm:items-baseline", end: "sm:items-end" };
const justifies = { start: "justify-start", between: "justify-between", end: "justify-end" };

interface Props {
  /** Space between the children: xs 4px, sm 8px, md 16px, lg 24px, xl 32px. */
  gap?: StackGap;
  align?: keyof typeof aligns;
  /** `between` pushes the first and last children to either edge. */
  justify?: keyof typeof justifies;
  /** Lets the children wrap onto more lines on a narrow screen. */
  wrap?: boolean;
  /** Takes the free width of a row it sits in, so its own contents can truncate. */
  grow?: boolean;
  /** Puts the children one above the other on a phone, side by side from `sm` up. */
  stackOnMobile?: boolean;
  children?: ReactNode;
}

/**
 * Children side by side, centred on one line by default. The horizontal half
 * of the layout kit (with `Stack`): filter bars, action groups, a label and
 * its value.
 */
export default function Inline({ gap = "sm", align = "center", justify = "start", wrap = false, grow = false, stackOnMobile = false, children }: Props) {
  const direction = stackOnMobile ? `flex-col items-stretch sm:flex-row ${smAligns[align]}` : aligns[align];
  return (
    <div
      className={`flex min-w-0 ${direction} ${justifies[justify]} ${gaps[gap]} ${wrap ? "flex-wrap" : ""} ${
        grow ? "flex-1" : ""
      }`}
    >
      {children}
    </div>
  );
}
