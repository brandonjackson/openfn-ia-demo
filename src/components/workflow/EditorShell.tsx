import type { ReactNode } from "react";

interface Props {
  toolbar: ReactNode;
  /** The main surface: canvas, code workspace or runs. */
  children: ReactNode;
  /** A bar centred over the top of the main surface, e.g. the canvas's runs bar. */
  top?: ReactNode;
  /** A bar pinned to the bottom of the main surface, e.g. main's read-only notice on the canvas. */
  bottom?: ReactNode;
  /**
   * A tray docked to the right, full height beside everything else, the
   * toolbar included. Keep passing it while closed so it can slide out.
   */
  rightTray?: ReactNode;
  /** Whether the right tray is shown; it slides in and out as this changes. */
  rightTrayOpen?: boolean;
  rightTrayWidthClass?: string;
  /** A card floating over the right of the main surface, e.g. the inspector; it sizes itself. */
  rightOverlay?: ReactNode;
  /** Draws the amber edge along the top that marks a sandbox. */
  sandboxed?: boolean;
  /** Anything that sits over everything, e.g. dialogs. */
  overlays?: ReactNode;
}

/**
 * The editor's frame: the toolbar across the top, the main surface below it
 * on the dotted canvas background, with a bar centred over its top, one
 * pinned to its bottom and a card floating over its right. The right tray is the outermost column and
 * runs the full height, so it sits to the right of the toolbar too; it
 * slides in and out rather than popping. The main surface and the tray are
 * plain slots, so canvas and code share one layout.
 */
export default function EditorShell({
  toolbar,
  children,
  top,
  bottom,
  rightTray,
  rightTrayOpen = true,
  rightTrayWidthClass = "w-[400px]",
  rightOverlay,
  sandboxed = false,
  overlays,
}: Props) {
  const trayOpen = rightTray !== undefined && rightTrayOpen;

  return (
    <div
      className={`relative flex h-full overflow-hidden bg-gray-50 bg-[radial-gradient(theme(colors.gray.200)_1px,transparent_1px)] [background-size:22px_22px] ${
        sandboxed ? "border-t-4 border-amber-400" : ""
      }`}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-none px-4 pt-3">{toolbar}</div>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          {rightOverlay && <div className="absolute bottom-4 right-4 top-3 z-30 flex items-start justify-end">{rightOverlay}</div>}
          {top && <div className="pointer-events-none absolute inset-x-4 top-3 z-40 flex justify-center [&>*]:pointer-events-auto">{top}</div>}
          {bottom && <div className="pointer-events-none absolute inset-x-4 bottom-4 z-40 flex justify-center [&>*]:pointer-events-auto">{bottom}</div>}
        </div>
      </div>
      {rightTray !== undefined && (
        // The outer column animates its width while the tray inside keeps its
        // own, pinned to the right edge, so the tray slides rather than squashes.
        <aside
          inert={!trayOpen}
          aria-hidden={!trayOpen}
          className={`flex flex-none justify-end overflow-hidden transition-[width] duration-300 ease-out motion-reduce:transition-none ${
            trayOpen ? rightTrayWidthClass : "w-0"
          }`}
        >
          <div className={`h-full flex-none ${rightTrayWidthClass}`}>{rightTray}</div>
        </aside>
      )}
      {overlays}
    </div>
  );
}
