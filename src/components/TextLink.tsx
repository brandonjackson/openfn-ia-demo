import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  /** An in-app path. */
  to?: string;
  /** An external URL, opened in a new tab. Use instead of `to`. */
  href?: string;
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
 * A link: record names in tables, a "view more" action, or a link in prose.
 * In-app with `to`, or out to another site with `href`.
 */
export default function TextLink({ to, href, children, variant = "default" }: Props) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-ui="link"
        data-variant={variant}
        className={variantClasses[variant]}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={to ?? "/"} data-ui="link" data-variant={variant} className={variantClasses[variant]}>
      {children}
    </Link>
  );
}
