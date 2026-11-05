import type { ReactNode } from "react";
import Link from "./Link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import IconTile from "./IconTile";

interface Props {
  icon: LucideIcon;
  /** Replaces the icon tile, e.g. with an AdaptorLogo. */
  logo?: ReactNode;
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
  /**
   * Buttons shown at the right edge, outside the row's link or click target,
   * so they can be pressed without also opening the row (e.g. Delete).
   */
  actions?: ReactNode;
  /** Highlights the row, e.g. the currently selected item. */
  selected?: boolean;
  /** Renders the title in a monospace font (names like branches or slugs). */
  monoTitle?: boolean;
  /** A dashed border, for something you could add rather than one that exists. */
  dashed?: boolean;
}

/**
 * Full-width row used by every list page (Systems, Projects, Sandboxes): an
 * icon tile, a title with badges, a description and an optional meta line.
 */
export default function ListRow({
  icon: Icon,
  logo,
  title,
  badges,
  description,
  meta,
  to,
  onClick,
  trailing,
  actions,
  selected = false,
  monoTitle = false,
  dashed = false,
}: Props) {
  const interactive = Boolean(to || onClick);
  const frame = `group flex w-full items-center rounded-lg border text-left transition-all ${
    dashed ? "border-dashed" : ""
  } ${selected ? "border-indigo-300 bg-indigo-50/40" : "border-gray-200 bg-white"} ${interactive ? "hover:border-indigo-300 hover:shadow-sm" : ""}`;
  // With actions, the frame wraps both the row and the action buttons, and
  // only the inner part is the link or button.
  const className = actions
    ? "flex flex-1 min-w-0 items-center gap-4 p-4 text-left"
    : `${frame} gap-4 p-4`;
  const hoverText = interactive ? "group-hover:text-indigo-600" : "";

  const content = (
    <>
      {logo ?? <IconTile icon={Icon} tone={selected ? "indigo" : "gray"} hoverTint={interactive} />}
      <div className="flex-1 min-w-0">
        {/* On small screens badges drop below a long title rather than squeezing it. */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-x-2 gap-y-1 min-w-0">
          <h3
            className={`max-w-full font-medium text-gray-900 text-sm truncate ${monoTitle ? "font-mono" : ""} ${hoverText}`}
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
      {/* With actions, the buttons hold the right edge, so the chevron steps aside. */}
      {trailing ??
        (interactive && !actions && (
          <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-400 flex-shrink-0" />
        ))}
    </>
  );

  const row = to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : onClick ? (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );

  if (!actions) return row;
  return (
    <div className={frame}>
      {row}
      <div className="flex flex-shrink-0 items-center gap-2 pr-4">{actions}</div>
    </div>
  );
}
