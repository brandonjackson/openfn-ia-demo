import type { ReactNode } from "react";

interface Props {
  toolbar: ReactNode;
  /** The main surface: canvas, code workspace or runs. */
  children: ReactNode;
  /** A panel docked to the right of the main surface, inside the right tray. */
  rightPanel?: ReactNode;
  rightPanelWidthClass?: string;
  /**
   * A tray docked to the right, full height beside everything else, the
   * toolbar included. Keep passing it while closed so it can slide out.
   */
  rightTray?: ReactNode;
  /** Whether the right tray is shown; it slides in and out as this changes. */
  rightTrayOpen?: boolean;
  rightTrayWidthClass?: string;
  /** A tray floating over the bottom of the main surface. */
  bottomTray?: ReactNode;
  /** A card floating over the right of the main surface, e.g. the inspector; it sizes itself. */
  rightOverlay?: ReactNode;
  /** A small control pinned to the main surface's top-right corner, e.g. the layout menu. */
  corner?: ReactNode;
  /** Draws the amber edge along the top that marks a sandbox. */
  sandboxed?: boolean;
  /** Anything that sits over everything, e.g. dialogs. */
  overlays?: ReactNode;
}

/**
 * The editor's frame: the toolbar across the top, the main surface below it
 * on the dotted canvas background, a right-docked panel that pushes the main
 * surface over, and a bottom tray or a right-hand card floating over it. The right tray is the
 * outermost column and runs the full height, so it sits to the right of the
 * toolbar too; it slides in and out rather than popping. The main surface and
 * both trays are plain slots, so canvas, code and runs views share one layout
 * and one way of docking trays.
 */
export default function EditorShell({
  toolbar,
  children,
  rightPanel,
  rightPanelWidthClass = "w-[420px]",
  rightTray,
  rightTrayOpen = true,
  rightTrayWidthClass = "w-[400px]",
  bottomTray,
  rightOverlay,
  corner,
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
        <div className="flex min-h-0 flex-1">
          <div className="relative flex min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
            {corner && (
              <div className="absolute right-4 top-3 z-30 rounded-lg border border-gray-200 bg-white shadow-sm">{corner}</div>
            )}
            {bottomTray && <div className="absolute inset-x-4 bottom-4 z-30">{bottomTray}</div>}
            {rightOverlay && <div className="absolute bottom-4 right-4 top-3 z-30 flex items-start justify-end">{rightOverlay}</div>}
          </div>
          {rightPanel && <aside className={`flex-none ${rightPanelWidthClass} min-h-0 pt-3`}>{rightPanel}</aside>}
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
