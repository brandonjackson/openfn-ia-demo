import type { ReactNode } from "react";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SegmentedControl from "../primitives/SegmentedControl";
import type { SegmentedOption } from "../primitives/SegmentedControl";
import IconButton from "../primitives/IconButton";

/** Where a tray sits in the code layout. */
export type TrayPlacement = "right" | "bottom";

export interface TrayTabs {
  options: (string | SegmentedOption)[];
  value: string;
  onChange: (value: string) => void;
}

interface Props {
  /** Right: the details column beside the code. Bottom: the panel under it. */
  placement: TrayPlacement;
  /** A name ahead of the tabs, for a tray that has one. */
  title?: ReactNode;
  icon?: LucideIcon;
  /** A status badge after the title. */
  badge?: ReactNode;
  /** Pill tabs that switch what the body shows. */
  tabs?: TrayTabs;
  /** Right-aligned context about the open tab, e.g. the step and run. */
  meta?: ReactNode;
  /** Header controls at the right edge, before the close button. */
  actions?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  /** Hides the body, leaving the header. */
  collapsed?: boolean;
  /** Height of a bottom tray's body. A right tray fills the column. */
  heightClass?: string;
  children: ReactNode;
}

/**
 * The frame of a tray in the code layout: the details column on the right
 * and the panel under the code. A header with an optional name, pill tabs
 * for its views, context and controls at the right, then the body. Keeping
 * that chrome here means every tray switches views and closes the same way.
 * Trays belong to the code view; the canvas has none, and the assistant
 * sits a level up, in the editor's side column.
 */
export default function EditorTray({
  placement,
  title,
  icon: Icon,
  badge,
  tabs,
  meta,
  actions,
  onClose,
  closeLabel = "Close",
  collapsed = false,
  heightClass = "h-60",
  children,
}: Props) {
  const right = placement === "right";

  return (
    <section
      aria-label={typeof title === "string" ? title : right ? "Details" : "Panel"}
      className={
        right ? "flex h-full w-80 flex-none flex-col border-l border-gray-100" : "flex flex-col border-t border-gray-200 bg-white"
      }
    >
      <header
        className={`flex flex-none items-center border-b border-gray-100 ${right ? "h-10 gap-2 px-2" : "h-11 gap-3 px-3"}`}
      >
        {title && (
          <div className="flex min-w-0 items-center gap-2">
            {Icon && <Icon size={15} className="flex-shrink-0 text-gray-400" />}
            <h2 className="truncate text-sm font-semibold text-gray-900">{title}</h2>
            {badge}
          </div>
        )}
        {tabs && <SegmentedControl variant="pill" options={tabs.options} value={tabs.value} onChange={tabs.onChange} />}
        <div className="ml-auto flex min-w-0 flex-shrink items-center gap-1">
          {meta && <div className="mr-2 flex min-w-0 items-center gap-2 text-xs text-gray-500">{meta}</div>}
          {actions}
          {onClose && <IconButton icon={X} label={closeLabel} onClick={onClose} />}
        </div>
      </header>
      {!collapsed && <div className={`min-h-0 overflow-auto ${right ? "flex-1" : heightClass}`}>{children}</div>}
    </section>
  );
}
