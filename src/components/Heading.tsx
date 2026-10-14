import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export type HeadingSize = "xl" | "lg" | "md" | "sm" | "eyebrow";

const sizes: Record<HeadingSize, string> = {
  xl: "text-3xl font-bold text-gray-900",
  lg: "text-lg font-semibold text-gray-900",
  md: "text-base font-semibold text-gray-900",
  sm: "text-sm font-semibold text-gray-900",
  eyebrow: "text-xs font-medium uppercase tracking-wide text-gray-500",
};

/**
 * Every heading below the page title. Pick a `size` for the look and `as`
 * for the outline level; they're independent.
 */
export default function Heading({
  size = "md",
  as: Tag = "h3",
  id,
  className,
  children,
}: {
  size?: HeadingSize;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span";
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag id={id} className={cn(sizes[size], className)}>
      {children}
    </Tag>
  );
}
