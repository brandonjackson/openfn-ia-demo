import type { MouseEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

interface Props {
  /** In-app route, or an external URL when `external` is set. */
  to?: string;
  /** Plain href (mailto:, docs links). */
  href?: string;
  /** Open `to` in a new tab as an external link. */
  external?: boolean;
  target?: string;
  /** With neither `to` nor `href`, the link only runs this (default navigation is prevented). */
  onClick?: (e: MouseEvent) => void;
  /**
   * `danger` for destructive actions (Disconnect, Revoke). `plain` takes the
   * surrounding text's colour with no hover styling of its own (auth card
   * footers, disclaimers): add any underline or hover colour with `className`.
   */
  variant?: "default" | "danger" | "plain";
  /** Hover text. */
  title?: string;
  id?: string;
  "aria-label"?: string;
  className?: string;
  children: ReactNode;
}

/**
 * An inline text link with Lightning's `link` utility (primary-400, underline
 * on hover), red with `variant="danger"`, or unstyled with `variant="plain"`.
 * Carries `data-ui="link"` and `data-variant` for themes.
 */
export default function TextLink({ to, href, external = false, target, onClick, variant = "default", title, id, "aria-label": ariaLabel, className, children }: Props) {
  const classes = cn(variant !== "plain" && "link", variant === "danger" && "link-danger", className);
  if (to && !external) {
    return (
      <Link to={to} id={id} aria-label={ariaLabel} className={classes} title={title} onClick={onClick} data-ui="link" data-variant={variant}>
        {children}
      </Link>
    );
  }
  const url = to ?? href;
  return (
    <a
      href={url ?? "#"}
      target={external ? "_blank" : target}
      rel={external ? "noreferrer" : undefined}
      id={id}
      aria-label={ariaLabel}
      className={classes}
      title={title}
      data-ui="link"
      data-variant={variant}
      onClick={(e) => {
        if (!url) e.preventDefault();
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
