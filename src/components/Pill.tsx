import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import IconButton from "./IconButton";

export type PillColor = "gray" | "red" | "orange" | "yellow" | "green" | "blue" | "primary" | "purple" | "pink" | "dark";

const colorClasses: Record<PillColor, string> = {
  gray: "bg-gray-100 text-gray-700",
  red: "bg-red-100 text-red-700",
  orange: "bg-orange-100 text-orange-700",
  yellow: "bg-yellow-100 text-yellow-800",
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
  primary: "bg-primary-100 text-primary-700",
  purple: "bg-purple-100 text-purple-700",
  pink: "bg-pink-100 text-pink-700",
  dark: "bg-gray-800 text-white",
};

/**
 * A small tag (Lightning's components/pills.ex `pill`): states, types,
 * versions, selected items. `square` gives it rounded-md corners, `mono`
 * the code font, and `onRemove` an x button.
 */
export default function Pill({
  id,
  "aria-label": ariaLabel,
  color = "gray",
  square = false,
  mono = false,
  title,
  onRemove,
  removeLabel = "Remove",
  className,
  children,
}: {
  id?: string;
  "aria-label"?: string;
  color?: PillColor;
  square?: boolean;
  mono?: boolean;
  /** Hover text. */
  title?: string;
  /** Shows an x button that calls this. */
  onRemove?: () => void;
  /** Accessible name for the x button. */
  removeLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      id={id}
      aria-label={ariaLabel}
      data-ui="tag"
      title={title}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 text-xs font-medium",
        square ? "rounded-md" : "rounded-full",
        mono && "font-mono",
        colorClasses[color],
        onRemove && "pr-1",
        className
      )}
    >
      {children}
      {onRemove && (
        <IconButton
          icon="hero-x-mark-mini"
          label={removeLabel}
          size="sm"
          className="p-0 text-current opacity-60 hover:bg-black/10 hover:text-current hover:opacity-100"
          onClick={onRemove}
        />
      )}
    </span>
  );
}
