import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

/** Lightning's `link` utility class: primary-400 text, underline on hover. */
export const linkClasses =
  "cursor-pointer underline-offset-2 hover:underline hover:underline-offset-2 whitespace-nowrap inline-block text-primary-400 hover:text-primary-500";

/**
 * A text link styled with Lightning's `.link` class. Internal paths use the
 * router; `external` opens in a new tab.
 */
export default function TextLink({
  to,
  external = false,
  className,
  onClick,
  children,
}: {
  to: string;
  external?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  children: ReactNode;
}) {
  if (external) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className={cn(linkClasses, className)} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={cn(linkClasses, className)} onClick={onClick}>
      {children}
    </Link>
  );
}
