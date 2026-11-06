import type { ReactNode } from "react";
import Link from "./Link";

interface Props {
  /** Optional card heading. */
  title?: ReactNode;
  /** Optional helper text shown under the title. */
  description?: ReactNode;
  /** Controls on the right of the title, e.g. a Save button. Not for a card that's a link or a button. */
  actions?: ReactNode;
  /** Removes inner padding, e.g. when the card wraps a table. */
  flush?: boolean;
  /** `md` (the default) for settings sections; `sm` for cards in a grid or a feed. */
  padding?: "sm" | "md";
  /** Makes the whole card a link, with a hover lift. */
  to?: string;
  /** Makes the whole card a button, with a hover lift. */
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

/**
 * White bordered surface that groups related content: a settings section, a
 * feature, an idea to start from. With `to` or `onClick` the whole card is
 * the link or button, and lifts on hover.
 */
export default function Card({
  title,
  description,
  actions,
  flush = false,
  padding = "md",
  to,
  onClick,
  className = "",
  children,
}: Props) {
  const interactive = Boolean(to || onClick);
  const frame = `rounded-lg border border-gray-200 bg-white ${
    flush ? "overflow-hidden" : padding === "sm" ? "p-4" : "p-5"
  } ${interactive ? "group w-full text-left transition-all hover:border-indigo-300 hover:shadow-sm" : ""} ${className}`;
  const heading = (title || description) && (
    <>
      {title && (
        <h3 className={`text-sm font-semibold text-gray-900 mb-1 ${interactive ? "group-hover:text-indigo-600" : ""}`}>
          {title}
        </h3>
      )}
      {description && <div className="text-xs text-gray-500 mb-4 space-y-2">{description}</div>}
    </>
  );
  const content = (
    <>
      {actions && !interactive ? (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">{heading}</div>
          <div className="flex flex-none items-center gap-2">{actions}</div>
        </div>
      ) : (
        heading
      )}
      {children}
    </>
  );
  if (to)
    return (
      <Link to={to} className={`block ${frame}`}>
        {content}
      </Link>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={frame}>
        {content}
      </button>
    );
  return <div className={frame}>{content}</div>;
}
