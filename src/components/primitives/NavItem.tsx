import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "./Link";

/**
 * Where the item sits, which sets how it looks and how "current" is marked:
 * - `sidebar`: the app's side menu; the current page is tinted text, no fill.
 * - `section`: a section menu beside a page's content (settings, pickers); the current section is filled.
 * - `tree`: a compact list of things to open, like a file tree or a list of choices; the open item is a quiet grey fill.
 * - `menu`: an item in an open menu or picker; the chosen option is bold.
 */
export type NavItemVariant = "sidebar" | "section" | "tree" | "menu";

export interface NavItemProps {
  label: string;
  icon?: LucideIcon;
  /** Shown in place of `icon` when a glyph isn't enough, e.g. a logo or a checkbox. */
  leading?: ReactNode;
  /** A second line under the label. */
  description?: ReactNode;
  /** What sits at the right edge, e.g. a count, a kind, a check mark or a status mark. */
  trailing?: ReactNode;
  /** The current page, section, open item or chosen option. */
  active?: boolean;
  /** An in-app route: the item is a link. */
  to?: string;
  /** An off-site URL: opens in a new tab, with an external-link marker on hover. */
  href?: string;
  /** Without `to` or `href`, the item is a button that calls this. Links call it too, e.g. to close a menu. */
  onClick?: () => void;
  variant?: NavItemVariant;
  /** In a `menu`: a `menuitem` (the default) or a listbox `option`. */
  role?: "menuitem" | "option";
  /** Red, for destructive menu items. */
  danger?: boolean;
  disabled?: boolean;
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
  menu: {
    row: "gap-2.5 px-2.5 py-1.5",
    on: "font-medium text-gray-900 hover:bg-gray-100",
    off: "text-gray-800 hover:bg-gray-100",
    icon: 14,
    iconOn: "text-gray-400",
    iconOff: "text-gray-400",
  },
};

/**
 * One row of a list of places or choices: an icon and a label, maybe a
 * second line, with something optional at the right edge. It's a route
 * link, an off-site link or a button. The sidebar, the settings menus, the
 * code explorer, the "Connect a system" list and every dropdown, picker and
 * menu list their items with it.
 */
export default function NavItem({
  label,
  icon: Icon,
  leading,
  description,
  trailing,
  active = false,
  to,
  href,
  onClick,
  variant = "sidebar",
  role,
  danger = false,
  disabled = false,
}: NavItemProps) {
  const look = looks[variant];
  const align = description ? "items-start" : "items-center";
  const tone = danger ? "text-red-600 hover:bg-red-50" : active ? look.on : look.off;
  const className = `group flex w-full min-w-0 ${align} rounded-md text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${look.row} ${tone}`;
  const iconTone = danger ? "text-red-500" : active ? look.iconOn : look.iconOff;
  // With a second line, the glyphs line up with the first.
  const nudge = description ? "mt-0.5" : "";

  // Menus and listboxes carry their own roles; a side menu marks the current
  // page, and a tree its open item. Themes restyle side menus by `nav-link`.
  const a11y =
    variant === "menu"
      ? role === "option"
        ? { role, "aria-selected": active }
        : { role: "menuitem" }
      : {
          "aria-current": active ? (variant === "tree" ? ("true" as const) : ("page" as const)) : undefined,
          "data-ui": variant === "tree" ? "tree-item" : "nav-link",
        };

  const content = (
    <>
      {leading ? (
        <span className={`inline-flex min-w-4 flex-shrink-0 justify-center ${nudge}`}>{leading}</span>
      ) : (
        Icon && <Icon size={look.icon} className={`flex-shrink-0 ${nudge} ${iconTone}`} />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate" title={label}>
          {label}
        </span>
        {description && <span className="block truncate text-xs font-normal text-gray-500">{description}</span>}
      </span>
      {trailing && <span className={`flex flex-shrink-0 items-center gap-2 ${nudge}`}>{trailing}</span>}
      {href !== undefined && (
        <ExternalLink size={12} className="flex-shrink-0 text-gray-400 opacity-0 group-hover:opacity-100" />
      )}
    </>
  );

  if (href !== undefined) {
    return (
      <a href={href} target="_blank" rel="noreferrer" onClick={onClick} className={className} {...a11y}>
        {content}
      </a>
    );
  }
  if (to !== undefined) {
    return (
      <Link to={to} onClick={onClick} className={className} {...a11y}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className} {...a11y}>
      {content}
    </button>
  );
}
