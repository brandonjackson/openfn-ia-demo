import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "./Link";

/**
 * Where the item sits, which sets how it looks and how "current" is marked:
 * - `sidebar`: the app's side menu; the current page is tinted text, no fill.
 * - `section`: a section menu beside a page's content (settings, pickers); the current section is filled.
 * - `tree`: a compact list of things to open, like a file tree; the open item is a quiet grey fill.
 */
export type NavItemVariant = "sidebar" | "section" | "tree";

interface Props {
  label: string;
  icon?: LucideIcon;
  /** Shown in place of `icon` when a glyph isn't enough, e.g. a logo. */
  leading?: ReactNode;
  /** What sits at the right edge, e.g. a count, a kind or a status mark. */
  trailing?: ReactNode;
  /** The current page, section or open item. */
  active?: boolean;
  /** An in-app route: the item is a link. */
  to?: string;
  /** An off-site URL: opens in a new tab, with an external-link marker on hover. */
  href?: string;
  /** Without `to` or `href`, the item is a button that calls this. */
  onClick?: () => void;
  variant?: NavItemVariant;
}

const looks: Record<NavItemVariant, { row: string; on: string; off: string; icon: number; iconOn: string; iconOff: string }> = {
  sidebar: {
    row: "gap-2.5 px-2 py-1.5",
    on: "font-medium text-indigo-600",
    off: "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
    icon: 16,
    iconOn: "text-indigo-600",
    iconOff: "text-gray-500",
  },
  section: {
    row: "gap-2 px-3 py-2 font-medium",
    on: "bg-indigo-50 text-indigo-700",
    off: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    icon: 14,
    iconOn: "text-indigo-500",
    iconOff: "text-gray-400",
  },
  tree: {
    row: "gap-2 px-2 py-1.5",
    on: "bg-gray-100 font-medium text-gray-900",
    off: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
    icon: 14,
    iconOn: "text-gray-400",
    iconOff: "text-gray-400",
  },
};

/**
 * One row of a navigation list: an icon and a label, with something
 * optional at the right edge. It's a route link, an off-site link or a
 * button, and marks itself current with `aria-current`. The sidebar, the
 * settings menus and the code explorer all list their items with it.
 */
export default function NavItem({
  label,
  icon: Icon,
  leading,
  trailing,
  active = false,
  to,
  href,
  onClick,
  variant = "sidebar",
}: Props) {
  const look = looks[variant];
  const className = `group flex w-full items-center rounded-md text-left text-sm transition-colors ${look.row} ${
    active ? look.on : look.off
  }`;
  // Pages in a menu are "page"; an open file in a tree is just "true".
  const current = active ? (variant === "tree" ? "true" : "page") : undefined;
  // Themes restyle side menus by `nav-link`; a file tree keeps its own look.
  const ui = variant === "tree" ? "tree-item" : "nav-link";

  const content = (
    <>
      {leading ? (
        <span className="inline-flex w-4 flex-shrink-0 justify-center">{leading}</span>
      ) : (
        Icon && <Icon size={look.icon} className={`flex-shrink-0 ${active ? look.iconOn : look.iconOff}`} />
      )}
      <span className="min-w-0 flex-1 truncate" title={label}>
        {label}
      </span>
      {trailing && <span className="flex flex-shrink-0 items-center">{trailing}</span>}
      {href !== undefined && (
        <ExternalLink size={12} className="flex-shrink-0 text-gray-400 opacity-0 group-hover:opacity-100" />
      )}
    </>
  );

  if (href !== undefined) {
    return (
      <a href={href} target="_blank" rel="noreferrer" data-ui={ui} className={className}>
        {content}
      </a>
    );
  }
  if (to !== undefined) {
    return (
      <Link to={to} aria-current={current} data-ui={ui} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-current={current} data-ui={ui} className={className}>
      {content}
    </button>
  );
}
