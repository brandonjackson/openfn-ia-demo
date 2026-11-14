import type { ReactNode } from "react";

interface Props {
  /** The canvas itself, which pans and zooms under everything else. */
  children: ReactNode;
  /** A bar pinned to the bottom of the canvas, e.g. a read-only notice. */
  bottom?: ReactNode;
  /** A card floating over the right of the canvas, e.g. an inspector; it sizes itself. */
  rightOverlay?: ReactNode;
}

/**
 * The canvas view's frame: the canvas fills the editor's main surface, with
 * a bar pinned to its bottom and a card floating over its right edge. The
 * card starts below the editor's toolbar when that floats over the canvas,
 * reading its height from `EditorShell`'s `--editor-toolbar-h`. There are no
 * trays here: anything about runs on the canvas floats over it. The
 * overlay's frame reaches the bottom so the card can grow to fit, but only
 * the card takes the pointer: the canvas under the empty space below it
 * still pans and drags.
 */
export default function CanvasLayout({ children, bottom, rightOverlay }: Props) {
  return (
    <div className="relative h-full">
      {children}
      {rightOverlay && (
        <div className="pointer-events-none absolute bottom-4 right-4 top-[calc(var(--editor-toolbar-h,0px)+0.75rem)] z-30 flex items-start justify-end [&>*]:pointer-events-auto">
          {rightOverlay}
        </div>
      )}
      {bottom && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-40 flex justify-center [&>*]:pointer-events-auto">
          {bottom}
        </div>
      )}
    </div>
  );
}
