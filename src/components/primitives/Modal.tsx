import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import IconButton from "./IconButton";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Actions pinned to the bottom of the panel, usually Cancel + a primary button. */
  footer?: ReactNode;
  /** Panel width, e.g. "max-w-lg". */
  widthClass?: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Centred dialog over a dimmed backdrop. Clicking the backdrop, the close
 * button or pressing Escape calls `onClose`. While it's open, focus stays
 * inside it: it moves in when the dialog opens (unless a field already took
 * it with `autoFocus`), Tab and Shift+Tab wrap around, and focus goes back to
 * whatever had it before once the dialog closes.
 */
export default function Modal({ open, title, onClose, children, footer, widthClass = "max-w-lg" }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  // Read through a ref, so a new onClose each render doesn't move focus again.
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const box = dialog.current!;
    const focusables = () => [...box.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (!box.contains(document.activeElement)) (focusables()[0] ?? box).focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
      if (e.key !== "Tab") return;
      const all = focusables();
      if (all.length === 0) return e.preventDefault();
      const first = all[0]!;
      const last = all[all.length - 1]!;
      if (e.shiftKey && (document.activeElement === first || !box.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !box.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (opener?.isConnected) opener.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[80vh] w-full ${widthClass} flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <IconButton size="md" icon={X} label="Close" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
