import type { ReactNode } from "react";

export type StackGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";

const gaps: Record<StackGap, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

interface Props {
  /** Space between the children: xs 4px, sm 8px, md 16px, lg 24px, xl 32px. */
  gap?: StackGap;
  /** Draws a hairline between the children, as in a list inside a card. */
  divided?: boolean;
  /** Labels the stack as a region for screen readers. */
  label?: string;
  children?: ReactNode;
}

/**
 * Children one above the other with even space between them. The vertical
 * half of the layout kit (with `Inline`), so pages and components lay
 * themselves out without styling of their own.
 */
export default function Stack({ gap = "md", divided = false, label, children }: Props) {
  return (
    <div
      aria-label={label}
      role={label ? "region" : undefined}
      className={`flex min-w-0 flex-col ${divided ? "divide-y divide-gray-100" : gaps[gap]}`}
    >
      {children}
    </div>
  );
}
