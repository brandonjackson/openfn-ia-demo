import type { ReactNode } from "react";

interface Props {
  toolbar: ReactNode;
  /** The main surface: canvas, code workspace or runs. */
  children: ReactNode;
  /** A panel docked to the right of the main surface, inside the right tray. */
  rightPanel?: ReactNode;
  rightPanelWidthClass?: string;
  /** A tray docked to the right, full height beside the main surface. */
  rightTray?: ReactNode;
  rightTrayWidthClass?: string;
  /** A tray floating over the bottom of the main surface. */
  bottomTray?: ReactNode;
  /** A small control pinned to the main surface's top-right corner, e.g. the layout menu. */
  corner?: ReactNode;
  /** Draws the amber edge along the top that marks a sandbox. */
  sandboxed?: boolean;
  /** Anything that sits over everything, e.g. dialogs. */
  overlays?: ReactNode;
}

/**
 * The editor's frame: the toolbar across the top, the main surface below it
 * on the dotted canvas background, a right-docked panel and tray (in that
 * order, the tray outermost) that push the main surface over, and a bottom
 * tray floating over it. The main surface and both
 * trays are plain slots, so canvas, code and runs views share one layout and
 * one way of docking trays.
 */
export default function EditorShell({
  toolbar,
  children,
  rightPanel,
  rightPanelWidthClass = "w-[420px]",
  rightTray,
  rightTrayWidthClass = "w-[400px]",
  bottomTray,
  corner,
  sandboxed = false,
  overlays,
}: Props) {
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden bg-gray-50 bg-[radial-gradient(theme(colors.gray.200)_1px,transparent_1px)] [background-size:22px_22px] ${
        sandboxed ? "border-t-4 border-amber-400" : ""
      }`}
    >
      <div className="flex-none px-4 pt-3">{toolbar}</div>
      <div className="flex min-h-0 flex-1">
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          {corner && (
            <div className="absolute right-4 top-3 z-30 rounded-lg border border-gray-200 bg-white shadow-sm">{corner}</div>
          )}
          {bottomTray && <div className="absolute inset-x-4 bottom-4 z-30">{bottomTray}</div>}
        </div>
        {rightPanel && <aside className={`flex-none ${rightPanelWidthClass} min-h-0 pt-3`}>{rightPanel}</aside>}
        {rightTray && <aside className={`flex-none ${rightTrayWidthClass} min-h-0 pt-3`}>{rightTray}</aside>}
      </div>
      {overlays}
    </div>
  );
}
