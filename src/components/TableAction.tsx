import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";


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
  const cls = cn(disabled ? "table-action-disabled" : "table-action");
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
