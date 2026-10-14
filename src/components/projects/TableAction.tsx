import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

const classes =
  "inline-flex items-center rounded bg-white mx-0.5 my-0.5 px-2 py-1 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50";

/**
 * Lightning's `table-action` link: a small white bordered button in a table
 * row (History, Health, Delete). Clicks don't reach the row's own handler.
 */
export default function TableAction({
  to,
  onClick,
  disabled = false,
  children,
}: {
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const cls = cn(classes, disabled && "cursor-not-allowed opacity-30 hover:bg-white");
  if (to && !disabled) {
    return (
      <Link to={to} className={cls} onClick={(e) => e.stopPropagation()}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      disabled={disabled}
      className={cls}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}
