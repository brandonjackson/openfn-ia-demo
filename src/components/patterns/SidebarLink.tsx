import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BaseProps {
  icon: LucideIcon;
  label: string;
}

interface InternalProps extends BaseProps {
  /** In-app route. */
  to: string;
  active?: boolean;
  href?: never;
}

interface ExternalProps extends BaseProps {
  /** Off-site URL. Opens in a new tab and shows an external-link marker. */
  href: string;
  to?: never;
  active?: never;
}

export type SidebarLinkProps = InternalProps | ExternalProps;

const base =
  "group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors";

/** One row in the sidebar menu: icon + label, linking in-app or off-site. */
export default function SidebarLink(props: SidebarLinkProps) {
  const { icon: Icon, label } = props;

  if (props.href !== undefined) {
    return (
      <a
        href={props.href}
        target="_blank"
        rel="noreferrer"
        data-ui="nav-link"
        className={`${base} text-gray-700 hover:bg-gray-100 hover:text-gray-900`}
      >
        <Icon size={16} className="flex-shrink-0 text-gray-500" />
        <span className="truncate" title={label}>{label}</span>
        <ExternalLink
          size={12}
          className="ml-auto flex-shrink-0 text-gray-400 opacity-0 group-hover:opacity-100"
        />
      </a>
    );
  }

  const active = props.active ?? false;
  return (
    <Link
      to={props.to}
      aria-current={active ? "page" : undefined}
      data-ui="nav-link"
      className={`${base} ${
        active
          ? "text-indigo-600 font-medium"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon
        size={16}
        className={`flex-shrink-0 ${active ? "text-indigo-600" : "text-gray-500"}`}
      />
      <span className="truncate" title={label}>{label}</span>
    </Link>
  );
}
