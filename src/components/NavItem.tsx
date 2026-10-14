import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

interface Props {
  /** In-app route. */
  to?: string;
  /** External link (docs, community, mailto). Opens in a new tab unless `target` says otherwise. */
  href?: string;
  target?: string;
  /** Hero icon class, e.g. `hero-folder`. */
  icon: string;
  label: string;
  active?: boolean;
  title?: string;
}

/**
 * One link in the sidebar (Lightning's `Menu.menu_item`): h-10, rounded-lg,
 * text-sm font-medium, primary-300 text with primary-900 behind the active row.
 */
export default function NavItem({ to, href, target = "_blank", icon, label, active = false, title }: Props) {
  const className = cn(
    "menu-item h-10 rounded-lg text-sm font-medium flex items-center transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
    active ? "menu-item-active" : "menu-item-inactive"
  );
  const content: ReactNode = (
    <>
      <span className={cn(icon, "h-5 w-5 shrink-0")} />
      <span className="menu-item-text truncate" title={title}>
        {label}
      </span>
    </>
  );

  return (
    <div className="h-10 mx-3 mb-1" data-ui="nav-link">
      {href ? (
        <a href={href} target={target} rel="noreferrer" className={className}>
          {content}
        </a>
      ) : (
        <Link to={to ?? "#"} className={className} aria-current={active ? "page" : undefined}>
          {content}
        </Link>
      )}
    </div>
  );
}
