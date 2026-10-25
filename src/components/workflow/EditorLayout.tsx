import type { ReactNode } from "react";

/**
 * Arranges the editor's main surface and its three docks: left, right, and
 * bottom (under the main surface, between the side docks).
 *
 * `floating` is for the canvas: the docks float as separate cards with gaps
 * between them, over a transparent background so the canvas shows through.
 * Otherwise (code) everything sits flush in one card, divided by rules.
 */
export default function EditorLayout({
  left,
  right,
  bottom,
  floating = false,
  children,
}: {
  left?: ReactNode;
  right?: ReactNode;
  bottom?: ReactNode;
  floating?: boolean;
  /** The main surface: the canvas or the code. */
  children: ReactNode;
}) {
  return (
    <div
      className={`flex min-h-0 flex-1 ${
        floating
          ? "gap-3 px-4 pb-4"
          : "mx-4 mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      }`}
    >
      {left}
      <div className={`flex min-w-0 flex-1 flex-col ${floating ? "gap-3" : ""}`}>
        <div className="relative min-h-0 flex-1">{children}</div>
        {bottom}
      </div>
      {right}
    </div>
  );
}
