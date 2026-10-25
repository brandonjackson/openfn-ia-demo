import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { MoreHorizontal, PanelBottom, PanelLeft, PanelRight, X } from "lucide-react";
import DropdownMenu from "../DropdownMenu";
import type { Dock, TrayId } from "./trays";
import { DOCKS, dockSizeLimits, trayDefinition } from "./trays";

const dockIcon = { left: PanelLeft, right: PanelRight, bottom: PanelBottom };

/**
 * The shell every editor tray sits in: a slim header, a scrolling body and a
 * drag handle on the edge facing the main surface to resize it.
 *
 * When the dock holds more than one tray, the header lists them as a
 * switcher (e.g. STEPS · HISTORY); otherwise it shows the tray's name, or
 * `title` when given. `headerExtra` sits after it, e.g. a run's status and
 * Log / Input / Output views. The ⋯ menu moves the tray to another dock.
 *
 * `floating` draws the tray as its own card, for docks that float over the
 * canvas; otherwise it's a flat pane divided from its neighbours by a rule.
 */
export default function Tray({
  dock,
  trays,
  active,
  onActivate,
  title,
  headerExtra,
  actions,
  onMove,
  onClose,
  size,
  onResize,
  floating = false,
  children,
}: {
  dock: Dock;
  /** The trays in this dock, in order. */
  trays: TrayId[];
  /** The tray being shown. */
  active: TrayId;
  onActivate?: (id: TrayId) => void;
  /** Replaces the tray's name when the dock holds only this tray. */
  title?: ReactNode;
  headerExtra?: ReactNode;
  /** Small buttons at the right of the header, before ⋯ and ✕. */
  actions?: ReactNode;
  /** Moves the active tray to another dock. */
  onMove?: (to: Dock) => void;
  onClose?: () => void;
  /** Width for side docks, height for the bottom dock, in px. */
  size: number;
  onResize?: (size: number) => void;
  floating?: boolean;
  children: ReactNode;
}) {
  const drag = useRef<{ start: number; size: number } | null>(null);
  const vertical = dock === "bottom";
  const [min, max] = dockSizeLimits[dock];

  const startResize = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { start: vertical ? e.clientY : e.clientX, size };
  };
  const resize = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const pos = vertical ? e.clientY : e.clientX;
    // Dragging towards the main surface grows the tray.
    const delta = dock === "left" ? pos - drag.current.start : drag.current.start - pos;
    onResize?.(Math.min(max, Math.max(min, drag.current.size + delta)));
  };
  const endResize = () => {
    drag.current = null;
  };

  const handleSide = { left: "-right-1 top-0 h-full w-2", right: "-left-1 top-0 h-full w-2", bottom: "-top-1 left-0 h-2 w-full" }[
    dock
  ];

  const frame = floating
    ? "rounded-xl border border-gray-200 bg-white shadow-sm"
    : `bg-white ${{ left: "border-r", right: "border-l", bottom: "border-t" }[dock]} border-gray-200`;

  return (
    <section
      aria-label={trayDefinition(active).label}
      className={`relative flex min-h-0 min-w-0 flex-col ${frame}`}
      style={vertical ? { height: size } : { width: size }}
    >
      {onResize && (
        <div
          role="separator"
          aria-orientation={vertical ? "horizontal" : "vertical"}
          aria-label="Resize panel"
          onPointerDown={startResize}
          onPointerMove={resize}
          onPointerUp={endResize}
          className={`absolute z-10 ${handleSide} ${vertical ? "cursor-row-resize" : "cursor-col-resize"} hover:bg-blue-400/30`}
        />
      )}

      <header className="flex h-10 flex-none items-center gap-3 border-b border-gray-100 pl-4 pr-2">
        {trays.length > 1 ? (
          <div role="tablist" aria-label="Panels in this dock" className="flex items-center gap-3">
            {trays.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={id === active}
                onClick={() => onActivate?.(id)}
                className={`font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  id === active ? "text-gray-900" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {trayDefinition(id).label}
              </button>
            ))}
          </div>
        ) : (
          (title ?? (
            <span className="font-mono text-[11px] uppercase tracking-wider text-gray-500">
              {trayDefinition(active).label}
            </span>
          ))
        )}
        {headerExtra}
        <div className="ml-auto flex items-center gap-0.5">
          {actions}
          {onMove && (
            <DropdownMenu
              ariaLabel="Panel options"
              align="right"
              widthClass="w-52"
              sections={[
                {
                  title: "Move to",
                  items: DOCKS.filter((d) => d.id !== dock).map((d) => ({
                    id: d.id,
                    label: d.label,
                    icon: dockIcon[d.id],
                  })),
                },
              ]}
              onSelect={(id) => onMove(id as Dock)}
              renderTrigger={({ open, toggle }) => (
                <TrayIconButton label="Panel options" onClick={toggle} pressed={open}>
                  <MoreHorizontal size={15} />
                </TrayIconButton>
              )}
            />
          )}
          {onClose && (
            <TrayIconButton label="Close panel" onClick={onClose}>
              <X size={15} />
            </TrayIconButton>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </section>
  );
}

/** A small square icon button for tray headers. */
export function TrayIconButton({
  label,
  onClick,
  pressed,
  disabled,
  children,
}: {
  label: string;
  onClick?: () => void;
  pressed?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 ${
        pressed ? "bg-gray-100 text-gray-700" : ""
      }`}
    >
      {children}
    </button>
  );
}
