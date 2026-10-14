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
  className?: string;
  children: ReactNode;
}

/** An inline text link with Lightning's `link` utility (primary-400, underline on hover). */
export default function TextLink({ to, href, external = false, target, onClick, className, children }: Props) {
  const classes = cn("link", className);
  if (to && !external) {
    return (
      <Link to={to} className={classes} onClick={onClick} data-ui="link">
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
      className={classes}
      data-ui="link"
      onClick={(e) => {
        if (!url) e.preventDefault();
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
