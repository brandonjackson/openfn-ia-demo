import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

interface Props {
  /** Where the link goes in the app. */
  to?: string;
  /** An external URL, opened in a new tab with an external-link icon. */
  href?: string;
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
  default: "font-medium text-gray-900 hover:text-blue-600 hover:underline",
  action: "text-sm font-medium text-blue-600 hover:text-blue-700",
  inline: "text-blue-600 hover:text-blue-700 hover:underline",
};

/**
 * An in-app link: record names in tables, a "view more" action, or a link in
 * prose. With `onClick` instead of `to` it's a button styled the same way;
 * with `href` it's an external link.
 */
export default function TextLink({ to, href, onClick, children, variant = "default" }: Props) {
  if (href !== undefined)
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-ui="link"
        data-variant={variant}
        className={`inline-flex min-w-0 items-center gap-1 ${variantClasses[variant]}`}
      >
        <span className="truncate">{children}</span>
        <ExternalLink size={12} className="flex-shrink-0" />
      </a>
    );
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
