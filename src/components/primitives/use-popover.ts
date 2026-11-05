import { useEffect, useRef, useState } from "react";

/**
 * Closes something that floats while it's open: a click outside the element
 * the returned ref is on, or Escape, calls `onDismiss`. Put the ref on the
 * wrapper that holds both the trigger and what it opens, so clicking the
 * trigger toggles rather than closing and reopening.
 */
export function useDismiss<T extends HTMLElement = HTMLDivElement>(open: boolean, onDismiss: () => void) {
  const ref = useRef<T>(null);
  const dismiss = useRef(onDismiss);
  useEffect(() => {
    dismiss.current = onDismiss;
  });

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) dismiss.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss.current();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return ref;
}

/**
 * Open state for a menu, picker or popover that closes on a click outside or
 * Escape. Spread nothing: put `ref` on the wrapper, toggle from the trigger.
 */
export function usePopover<T extends HTMLElement = HTMLDivElement>(defaultOpen = false) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useDismiss<T>(open, () => setOpen(false));
  return { open, setOpen, toggle: () => setOpen((o) => !o), close: () => setOpen(false), ref };
}
