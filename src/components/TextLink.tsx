import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  /** Where the link goes in the app. */
  to?: string;
  /** Without `to`, an action that looks like a link, e.g. "See full code". */
  onClick?: () => void;
  children: ReactNode;
  /**
   * "default" for names in tables; "action" for "View all"-style links;
   * "inline" for links inside running prose.
   */
  variant?: "default" | "action" | "inline";
}

const variantClasses = {
  default: "font-medium text-gray-900 hover:text-indigo-600 hover:underline",
  action: "text-sm font-medium text-indigo-600 hover:text-indigo-800",
  inline: "text-indigo-600 hover:text-indigo-800 hover:underline",
};

/**
 * An in-app link: record names in tables, a "view more" action, or a link in
 * prose. With `onClick` instead of `to` it's a button styled the same way.
 */
export default function TextLink({ to, onClick, children, variant = "default" }: Props) {
  if (to === undefined)
    return (
      <button type="button" onClick={onClick} data-ui="link" data-variant={variant} className={variantClasses[variant]}>
        {children}
      </button>
    );
  return (
    <Link to={to} data-ui="link" data-variant={variant} className={variantClasses[variant]}>
      {children}
    </Link>
  );
}
