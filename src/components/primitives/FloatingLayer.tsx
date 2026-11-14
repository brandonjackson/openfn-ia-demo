import { useLayoutEffect, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";

export type FloatingAlign = "left" | "right";
export type FloatingPlacement = "below" | "beside";

interface Props {
  /** The element it opens from: it lines up with this one's edges. */
  anchor: RefObject<HTMLElement | null>;
  /** The floating element itself, so it can be measured (and left out of outside clicks). */
  floating: RefObject<HTMLElement | null>;
  /** Which edge of the anchor it lines up with. */
  align?: FloatingAlign;
  /** Under the anchor (the default), or to its right, level with its top. */
  placement?: FloatingPlacement;
  /** Draws the floating element, given where it goes. Spread `style` on it and put the `floating` ref on it. */
  children: (style: CSSProperties) => ReactNode;
}

const GAP = 6;
const EDGE = 8;

/**
 * Where something that floats goes, drawn at the end of the page rather than
 * inside its trigger, so no table, card or scrolling panel can crop it. It
 * sits under its anchor (or beside it), flips above when there's no room
 * below, stays on screen, and follows the anchor as the page scrolls. Every
 * menu, picker and popover opens through it.
 */
export default function FloatingLayer({ anchor, floating, align = "left", placement = "below", children }: Props) {
  const [style, setStyle] = useState<CSSProperties>({ position: "fixed", top: 0, left: 0, opacity: 0 });

  useLayoutEffect(() => {
    const place = () => {
      const a = anchor.current?.getBoundingClientRect();
      if (!a) return;
      const box = floating.current?.getBoundingClientRect();
      const width = box?.width ?? 0;
      const height = box?.height ?? 0;
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = window.innerHeight;

      let top: number;
      let left: number;
      if (placement === "beside") {
        left = a.right + GAP;
        top = a.top;
        if (left + width > vw - EDGE) left = a.left - GAP - width;
        if (top + height > vh - EDGE) top = Math.max(EDGE, vh - EDGE - height);
      } else {
        left = align === "right" ? a.right - width : a.left;
        top = a.bottom + GAP;
        // No room below but room above: open upwards.
        if (top + height > vh - EDGE && a.top - GAP - height >= EDGE) top = a.top - GAP - height;
      }
      left = Math.min(Math.max(EDGE, left), Math.max(EDGE, vw - EDGE - width));
      setStyle({ position: "fixed", top, left, opacity: box ? 1 : 0 });
    };
    place();
    // Measure again once the floating element has drawn at its real size.
    const frame = requestAnimationFrame(place);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [anchor, floating, align, placement]);

  return createPortal(children(style), document.body);
}
