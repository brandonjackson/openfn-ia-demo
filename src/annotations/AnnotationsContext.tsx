import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AnnotationsContext, type AnnotationsState } from "./annotations-context";
import { viewIdForLocation } from "./viewIds";

const OPEN_KEY = "openfn-annotations-open";

function readOpen() {
  try {
    return window.localStorage.getItem(OPEN_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Tracks whether the annotations panel is open and which annotation it
 * should show: the nearest element under the mouse with a
 * `data-annotation="<id>"`, otherwise the current page's view. Pinning
 * freezes the selection so you can read without the mouse moving it.
 */
export function AnnotationsProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [open, setOpenState] = useState(readOpen);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  const setOpen = useCallback((value: boolean) => {
    setOpenState(value);
    try {
      window.localStorage.setItem(OPEN_KEY, String(value));
    } catch {
      /* per-viewer convenience only */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    let active: Element | null = null;
    const mark = (el: Element | null) => {
      active?.removeAttribute("data-annotation-active");
      active = el;
      active?.setAttribute("data-annotation-active", "");
    };
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      // Moving onto the panel or the settings button keeps the last selection.
      if (!target || target.closest("[data-devtools]")) return;
      const el = target.closest("[data-annotation]");
      mark(el);
      setHoveredId(el?.getAttribute("data-annotation") ?? null);
    };
    document.addEventListener("mouseover", onOver);
    return () => {
      document.removeEventListener("mouseover", onOver);
      mark(null);
    };
  }, [open]);

  const pageId = viewIdForLocation(location.pathname, location.search, location.hash);

  const value = useMemo<AnnotationsState>(
    () => ({
      open,
      setOpen,
      pageId,
      currentId: pinnedId ?? hoveredId ?? pageId,
      pinnedId,
      pin: setPinnedId,
    }),
    [open, setOpen, pageId, pinnedId, hoveredId]
  );

  return <AnnotationsContext.Provider value={value}>{children}</AnnotationsContext.Provider>;
}
