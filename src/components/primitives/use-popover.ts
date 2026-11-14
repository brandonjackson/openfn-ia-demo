import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

/**
 * Closes something that floats while it's open: a click outside the element
 * the returned ref is on, or Escape, calls `onDismiss`. Put the ref on the
 * wrapper that holds both the trigger and what it opens, so clicking the
 * trigger toggles rather than closing and reopening. What floats is drawn
 * elsewhere in the page (`FloatingLayer`), so pass its ref as `inside` too.
 */
export function useDismiss<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
  onDismiss: () => void,
  inside?: RefObject<HTMLElement | null>,
) {
  const ref = useRef<T>(null);
  const dismiss = useRef(onDismiss);
  useEffect(() => {
    dismiss.current = onDismiss;
  });

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (inside?.current?.contains(target)) return;
      if (ref.current && !ref.current.contains(target)) dismiss.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Escape from inside what floats hands focus back to the trigger.
      const fromInside = inside?.current?.contains(document.activeElement);
      dismiss.current();
      if (fromInside) ref.current?.querySelector<HTMLElement>("button, a, [tabindex]")?.focus();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, inside]);

  return ref;
}

/**
 * Open state for a menu, picker or popover that closes on a click outside or
 * Escape. Spread nothing: put `ref` on the wrapper, toggle from the trigger,
 * and put `floatingRef` on what opens, drawn in a `FloatingLayer` anchored
 * to `ref`.
 */
export function usePopover<T extends HTMLElement = HTMLDivElement>(defaultOpen = false) {
  const [open, setOpen] = useState(defaultOpen);
  const floatingRef = useRef<HTMLDivElement>(null);
  const ref = useDismiss<T>(open, () => setOpen(false), floatingRef);
  return { open, setOpen, toggle: () => setOpen((o) => !o), close: () => setOpen(false), ref, floatingRef };
}
