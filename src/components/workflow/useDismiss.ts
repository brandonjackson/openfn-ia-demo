import { useEffect, type RefObject } from "react";

/** Close a popover on outside click or Escape (what Headless UI's Menu does in Lightning). */
export function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, onDismiss: () => void) {
  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDismiss();
    document.addEventListener("mousedown", onMouse, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, onDismiss]);
}
