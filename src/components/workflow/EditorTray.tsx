import type { ReactNode } from "react";
import { PanelBottom, PanelRight, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SegmentedControl from "../SegmentedControl";
import type { SegmentedOption } from "../SegmentedControl";

/** Where a tray is docked. */
export type TrayPlacement = "right" | "bottom";

export interface TrayTabs {
  options: (string | SegmentedOption)[];
  value: string;
  onChange: (value: string) => void;
}

interface Props {
  title: ReactNode;
  icon?: LucideIcon;
  /** A status badge after the title, e.g. the step's run status. */
  badge?: ReactNode;
  /** Pill tabs in the header that switch what the body shows. */
  tabs?: TrayTabs;
  /** Right-aligned context, e.g. "Run #4824 · 2.5s". */
  meta?: ReactNode;
  /** Extra header controls, before the dock and close buttons. */
  actions?: ReactNode;
  placement: TrayPlacement;
  /** Offered in the header when the tray can be moved to the other dock. */
  onMove?: (placement: TrayPlacement) => void;
  onClose?: () => void;
  /** Bottom trays float over the canvas; inline ones sit in the layout. */
  floating?: boolean;
  /** Height of a bottom tray's body. */
  heightClass?: string;
  children: ReactNode;
}

/**
 * The panel every editor tray lives in: run history, the step's output, the
 * adaptor reference, the assistant. A tray docks to the right (full height,
 * pushing the canvas or code over) or along the bottom (a card over the
 * canvas, or inline under the code).
 *
 * The header carries the tray's name, an optional status badge and pill tabs,
 * context on the right, then a control to move the tray to the other dock
 * and a close button. Keeping that chrome here means every tray is opened,
 * moved and closed the same way.
 */
export default function EditorTray({
  title,
  icon: Icon,
  badge,
  tabs,
  meta,
  actions,
  placement,
  onMove,
  onClose,
  floating = false,
  heightClass = "h-72",
  children,
}: Props) {
  const other: TrayPlacement = placement === "right" ? "bottom" : "right";

  const frame =
    placement === "right"
      ? "flex h-full w-full flex-col border-l border-gray-200 bg-white"
      : floating
        ? "flex flex-col rounded-xl border border-gray-200 bg-white shadow-xl"
        : "flex flex-col border-t border-gray-200 bg-white";

  // A right-docked tray is narrow, so its tabs and context go on a second row.
  const stacked = placement === "right";
  const tabControl = tabs && (
    <SegmentedControl variant="pill" options={tabs.options} value={tabs.value} onChange={tabs.onChange} />
  );

  return (
    <section aria-label={typeof title === "string" ? title : undefined} className={frame}>
      <header className={`flex-none border-b border-gray-100 ${stacked ? "" : "flex h-12 items-center gap-3 px-4"}`}>
        <div className={`flex min-w-0 items-center gap-2 ${stacked ? "h-12 px-4" : ""}`}>
          {Icon && <Icon size={15} className="flex-shrink-0 text-gray-400" />}
          <h2 className="min-w-[5rem] truncate text-sm font-semibold text-gray-900">{title}</h2>
          {badge}
          {stacked && (
            <div className="ml-auto flex flex-shrink-0 items-center gap-1">
              {!tabs && meta && <span className="mr-2 text-xs text-gray-500">{meta}</span>}
              {actions}
              {onMove && <MoveButton other={other} onMove={onMove} />}
              {onClose && <CloseButton onClose={onClose} />}
            </div>
          )}
        </div>
        {stacked && tabs && (
          <div className="flex items-center justify-between gap-3 px-3 pb-2">
            {tabControl}
            {meta && <span className="truncate text-xs text-gray-500">{meta}</span>}
          </div>
        )}
        {!stacked && tabs && <div className="ml-1 flex-shrink-0">{tabControl}</div>}
        {!stacked && (
        <div className="ml-auto flex flex-shrink-0 items-center gap-1">
          {meta && <span className="mr-2 text-xs text-gray-500">{meta}</span>}
          {actions}
          {onMove && <MoveButton other={other} onMove={onMove} />}
          {onClose && <CloseButton onClose={onClose} />}
        </div>
        )}
      </header>
      <div className={`min-h-0 flex-1 overflow-auto ${placement === "bottom" ? heightClass : ""}`}>{children}</div>
    </section>
  );
}

const headerButton =
  "inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700";

function MoveButton({ other, onMove }: { other: TrayPlacement; onMove: (placement: TrayPlacement) => void }) {
  const MoveIcon = other === "right" ? PanelRight : PanelBottom;
  const label = other === "right" ? "Dock to the right" : "Dock to the bottom";
  return (
    <button type="button" onClick={() => onMove(other)} title={label} aria-label={label} className={headerButton}>
      <MoveIcon size={15} />
    </button>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" onClick={onClose} aria-label="Close" title="Close" className={headerButton}>
      <X size={16} />
    </button>
  );
}
