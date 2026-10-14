import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export type PillColor = "gray" | "red" | "yellow" | "green" | "blue" | "indigo" | "purple" | "pink";

const colorClasses: Record<PillColor, string> = {
  gray: "bg-gray-100 text-gray-600",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-800",
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
  indigo: "bg-indigo-100 text-indigo-700",
  purple: "bg-purple-100 text-purple-700",
  pink: "bg-pink-100 text-pink-700",
};

/** A small rounded-full tag (Lightning's components/pills.ex `pill`). */
export default function Pill({
  color = "gray",
  className,
  children,
}: {
  color?: PillColor;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      data-ui="tag"
      className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", colorClasses[color], className)}
    >
      {children}
    </span>
  );
}
