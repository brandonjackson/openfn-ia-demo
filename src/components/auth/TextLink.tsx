import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

/** Lightning's `link` utility (assets/css/app.css), as a router link or a plain anchor. */
export const linkClasses =
  "cursor-pointer underline-offset-2 hover:underline hover:underline-offset-2 whitespace-nowrap inline-block text-primary-400 hover:text-primary-500";

export default function TextLink({
  to,
  href,
  onClick,
  target,
  className,
  children,
}: {
  to?: string;
  href?: string;
  onClick?: () => void;
  target?: string;
  className?: string;
  children: ReactNode;
}) {
  const classes = cn(linkClasses, "font-medium", className);
  if (to) {
    return (
      <Link to={to} className={classes} data-ui="link">
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href ?? "#"}
      target={target}
      className={classes}
      data-ui="link"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </a>
  );
}
