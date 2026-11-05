import type { ReactNode } from "react";

interface Props {
  /** Optional card heading. */
  title?: ReactNode;
  /** Optional helper text shown under the title. */
  description?: ReactNode;
  /** Removes inner padding, e.g. when the card wraps a table. */
  flush?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * White bordered surface used to group related settings or content.
 */
export default function Card({ title, description, flush = false, className = "", children }: Props) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white ${flush ? "overflow-hidden" : "p-5"} ${className}`}
    >
      {title && <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>}
      {description && <div className="text-xs text-gray-500 mb-4 space-y-2">{description}</div>}
      {children}
    </div>
  );
}
