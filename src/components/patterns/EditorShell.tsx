import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import IconButton from "../primitives/IconButton";

interface Props {
  /** The top bar, e.g. an `EditorTopBar`. */
  toolbar: ReactNode;
  /**
   * Floats the toolbar over the main surface instead of above it, so one
   * canvas runs under it. Its height is passed down as the
   * `--editor-toolbar-h` CSS variable for content that must start below it.
   */
  floatToolbar?: boolean;
  /** The main surface: a `CanvasLayout` or a `CodeLayout`. */
  children: ReactNode;
  /**
   * The side column, docked to the right, full height beside everything
   * else, the toolbar included. Keep passing it while closed so it can
   * slide out.
   */
  side?: ReactNode;
  /** The side column's name, in its header. */
  sideTitle?: string;
  sideIcon?: LucideIcon;
  /** Whether the side column is shown; it slides in and out as this changes. */
  sideOpen?: boolean;
  /** Closes the side column, from the X in its header. */
  onCloseSide?: () => void;
  sideWidthClass?: string;
  /** Draws an amber edge along the top, e.g. to mark that you're working in a sandbox. */
  accentEdge?: boolean;
  /** Anything that sits over everything, e.g. dialogs. */
  overlays?: ReactNode;
}

/**
 * The editor's frame: the top bar across the top and the main surface below
 * it on the dotted canvas background (or, with `floatToolbar`, under it, so
 * the canvas runs the full height). The main surface is a plain slot, filled
 * by the canvas or the code layout, which each bring their own bars, cards
 * and trays. The side column is the outermost column and runs the full
 * height, so it sits to the right of the toolbar too, at a level above
 * either view; it slides in and out rather than popping.
 */
export default function EditorShell({
  toolbar,
  floatToolbar = false,
  children,
  side,
  sideTitle,
  sideIcon: SideIcon,
  sideOpen = true,
  onCloseSide,
  sideWidthClass = "w-[400px]",
  accentEdge = false,
  overlays,
}: Props) {
  const open = side !== undefined && sideOpen;

  // A floating toolbar covers the top of the surface, so what's pinned there moves down by its height.
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarHeight, setToolbarHeight] = useState(0);
  useEffect(() => {
    const el = toolbarRef.current;
    if (!floatToolbar || !el) return;
    const observer = new ResizeObserver(() => setToolbarHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, [floatToolbar]);
  const surfaceStyle = { "--editor-toolbar-h": `${floatToolbar ? toolbarHeight : 0}px` } as CSSProperties;

  return (
    <div
      className={`relative flex h-full overflow-hidden bg-gray-50 bg-[radial-gradient(var(--color-gray-200)_1px,transparent_1px)] [background-size:22px_22px] ${
        accentEdge ? "border-t-4 border-amber-400" : ""
      }`}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        {!floatToolbar && <div className="flex-none px-4 pt-3">{toolbar}</div>}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col" style={surfaceStyle}>
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          {floatToolbar && (
            // Only the toolbar's controls catch the pointer; the gaps between them drag the canvas beneath.
            <div
              ref={toolbarRef}
              className="pointer-events-none absolute inset-x-0 top-0 z-50 px-4 pt-3 [&>*>*]:pointer-events-auto [&>*]:pointer-events-none"
            >
              {toolbar}
            </div>
          )}
        </div>
      </div>
      {side !== undefined && (
        // The outer column animates its width while the panel inside keeps its
        // own, pinned to the right edge, so it slides rather than squashes.
        <aside
          inert={!open}
          aria-hidden={!open}
          aria-label={sideTitle}
          className={`flex flex-none justify-end overflow-hidden transition-[width] duration-300 ease-out motion-reduce:transition-none ${
            open ? sideWidthClass : "w-0"
          }`}
        >
          <section className={`flex h-full flex-none flex-col border-l border-gray-200 bg-white ${sideWidthClass}`}>
            {(sideTitle || onCloseSide) && (
              <header className="flex h-12 flex-none items-center gap-2 border-b border-gray-100 px-4">
                {SideIcon && <SideIcon size={15} className="flex-shrink-0 text-gray-400" />}
                <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{sideTitle}</h2>
                {onCloseSide && <IconButton icon={X} label="Close" onClick={onCloseSide} />}
              </header>
            )}
            <div className="min-h-0 flex-1 overflow-auto">{side}</div>
          </section>
        </aside>
      )}
      {overlays}
    </div>
  );
}
