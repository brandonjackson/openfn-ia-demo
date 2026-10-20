import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  /** Badges or chips shown after the title. */
  badges?: ReactNode;
  description?: ReactNode;
  /** Small secondary line under the description (URL, counts, activity). */
  meta?: ReactNode;
  /** Where the row goes. Without `to` or `onClick` the row is static. */
  to?: string;
  onClick?: () => void;
  /** Replaces the chevron on the right, e.g. with a status or action. */
  trailing?: ReactNode;
  /** Highlights the row, e.g. the currently selected item. */
  selected?: boolean;
  /** Renders the title in a monospace font (names like branches or slugs). */
  monoTitle?: boolean;
}

/**
 * Full-width row used by every list page (Systems, Projects, Sandboxes): an
 * icon tile, a title with badges, a description and an optional meta line.
 */
export default function ListRow({
  icon: Icon,
  title,
  badges,
  description,
  meta,
  to,
  onClick,
  trailing,
  selected = false,
  monoTitle = false,
}: Props) {
  const interactive = Boolean(to || onClick);
  const className = `group flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all ${
    selected ? "border-blue-300 bg-blue-50/40" : "border-gray-200 bg-white"
  } ${interactive ? "hover:border-blue-300 hover:shadow-sm" : ""}`;
  const hoverText = interactive ? "group-hover:text-blue-600" : "";

  const content = (
    <>
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          selected ? "bg-blue-100" : "bg-gray-100"
        } ${interactive ? "group-hover:bg-blue-50" : ""}`}
      >
        <Icon
          size={20}
          className={`${selected ? "text-blue-500" : "text-gray-400"} ${
            interactive ? "group-hover:text-blue-500" : ""
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3
            className={`font-medium text-gray-900 text-sm truncate ${monoTitle ? "font-mono" : ""} ${hoverText}`}
            title={title}
          >
            {title}
          </h3>
          {badges && <div className="flex flex-shrink-0 items-center gap-1.5">{badges}</div>}
        </div>
        {description && <p className="mt-0.5 text-sm text-gray-500 truncate">{description}</p>}
        {meta && (
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
            {meta}
          </div>
        )}
      </div>
      {trailing ??
        (interactive && (
          <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
        ))}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }
  return <div className={className}>{content}</div>;
}
