import type { ReactNode } from "react";
import Link from "./Link";
import type { LucideIcon } from "lucide-react";
import IconTile from "./IconTile";
import ActionMenu from "./ActionMenu";
import type { DropdownMenuItem } from "./DropdownMenu";

/** A labelled value at the right of a row, lined up with the same column in the rows above and below. */
export interface ListRowColumn {
  label: string;
  value: ReactNode;
  /** `sm` 64px for a count, `md` 96px for a status, `lg` 144px for names or a date. */
  width?: "sm" | "md" | "lg";
}

/**
 * The row's ⋮ menu. It always opens with Open (where the row goes), then
 * these items; give `items` and `onSelect` to add the row's own actions.
 */
export interface ListRowMenu {
  /** The row's actions after Open, e.g. Make a copy, Delete (`tone: "danger"`). */
  items?: DropdownMenuItem[];
  /** Called with the picked item's id; Open is handled by the row. */
  onSelect?: (id: string) => void;
}

const selectedFrames = { indigo: "border-indigo-300 bg-indigo-50/40", amber: "border-amber-300 bg-amber-50/60" };

const columnWidths = { sm: "w-16", md: "w-24", lg: "w-36" };

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
  /** The id of the row's link or button, so a form can move focus to it. */
  id?: string;
  /**
   * Labelled values at the right of the row (latest run, counts, last
   * updated), hidden on narrow screens where there's no room to line them up.
   */
  columns?: ListRowColumn[];
  /** Something at the right edge inside the row, e.g. a status or a "Join" cue. */
  trailing?: ReactNode;
  /**
   * A ⋮ menu at the right edge, outside the row's link, starting with Open.
   * Every row in a list page has one (pass `{}` while it has no actions of
   * its own); pickers and lists of things to add leave it out.
   */
  menu?: ListRowMenu;
  /**
   * Buttons shown at the right edge, outside the row's link or click target,
   * so they can be pressed without also opening the row (e.g. Delete).
   */
  actions?: ReactNode;
  /** Highlights the row, e.g. the currently selected item. Given with `onClick`, the row is a toggle button that says whether it's picked. */
  selected?: boolean;
  /** The tint of a selected row and its icon: `indigo` (the default), or `amber` for a sandbox you're in, as the editor marks one. */
  selectedTone?: "indigo" | "amber";
  /** Renders the title in a monospace font (names like branches or slugs). */
  monoTitle?: boolean;
  /** A dashed border, for something you could add rather than one that exists. */
  dashed?: boolean;
}

/**
 * Full-width row used by every list page (Systems, Projects, Sandboxes): an
 * icon tile, a title with badges, a description and an optional meta line.
 * The whole row opens it, so it shows a pointer and highlights on hover; its
 * actions live in the ⋮ `menu` on the right, never behind a chevron.
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
  id,
  columns,
  trailing,
  actions,
  menu,
  selected,
  selectedTone = "indigo",
  monoTitle = false,
  dashed = false,
}: Props) {
  // Open comes first, then the row's own actions past a divider.
  const openItem: DropdownMenuItem[] = to || onClick ? [{ id: "open", label: "Open", to }] : [];
  const ownItems = (menu?.items ?? []).map((item, i) => (i === 0 && openItem.length > 0 ? { ...item, divider: true } : item));
  const menuItems = menu ? [...openItem, ...ownItems] : [];
  const side =
    actions || menuItems.length > 0 ? (
      <>
        {actions}
        {menuItems.length > 0 && (
          <ActionMenu
            label={`Actions for ${title}`}
            items={menuItems}
            onSelect={(id) => (id === "open" ? (to ? undefined : onClick?.()) : menu?.onSelect?.(id))}
          />
        )}
      </>
    ) : null;
  const interactive = Boolean(to || onClick);
  const frame = `group flex w-full items-center rounded-lg border text-left transition-all ${
    dashed ? "border-dashed" : ""
  } ${selected ? selectedFrames[selectedTone] : "border-gray-200 bg-white"} ${interactive ? "hover:border-indigo-300 hover:shadow-sm" : ""}`;
  // With actions or a menu, the frame wraps both the row and them, and only
  // the inner part is the link or button.
  const pointer = interactive ? "cursor-pointer" : "";
  const className = side
    ? `flex flex-1 min-w-0 items-center gap-4 p-4 text-left ${pointer}`
    : `${frame} gap-4 p-4 ${pointer}`;
  const hoverText = interactive ? "group-hover:text-indigo-600" : "";

  const content = (
    <>
      {logo ?? <IconTile icon={Icon} tone={selected ? selectedTone : "gray"} hoverTint={interactive} />}
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
      {columns && columns.length > 0 && (
        <div className="hidden flex-shrink-0 items-start gap-6 md:flex">
          {columns.map((c) => (
            <div key={c.label} className={columnWidths[c.width ?? "md"]}>
              <div className="mb-1.5 text-xs font-medium text-gray-500">{c.label}</div>
              <div className="flex h-6 items-center whitespace-nowrap text-sm text-gray-600">{c.value}</div>
            </div>
          ))}
        </div>
      )}
      {trailing}
    </>
  );

  const row = to ? (
    <Link id={id} to={to} className={className}>
      {content}
    </Link>
  ) : onClick ? (
    <button id={id} type="button" onClick={onClick} aria-pressed={selected} className={className}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );

  if (!side) return row;
  return (
    <div className={frame}>
      {row}
      <div className="flex flex-shrink-0 items-center gap-2 pr-4">{side}</div>
    </div>
  );
}
