import { useEffect, type ReactNode } from "react";
import { cn } from "../utils/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Buttons, right-aligned (primary first: the row is reversed, as in Lightning). */
  footer?: ReactNode;
  /** Tailwind max-width class for the panel. */
  width?: string;
}

/**
 * Lightning's modal (live/components/modal.ex): blurred backdrop, white
 * rounded-xl panel, title + subtitle, a divider, body, and a footer row.
 * Escape and clicking outside close it.
 */
export default function Modal({ open, onClose, title, subtitle, children, footer, width = "max-w-xl" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto sm:py-2" role="dialog" aria-modal="true" onClick={onClose}>
        <div className="flex flex-col min-h-full items-center justify-center">
          <div className={cn("w-full", width)} onClick={(e) => e.stopPropagation()}>
            <div className="relative rounded-xl transition bg-white py-[24px] shadow-lg shadow-zinc-700/10 ring-1 ring-zinc-700/10">
              {title && (
                <>
                  <header className="px-[24px] flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-lg font-semibold leading-5 text-zinc-800">{title}</h1>
                      {subtitle && <p className="mt-2 text-sm leading-4.5 text-zinc-600">{subtitle}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close"
                      className="text-gray-400 hover:text-gray-500 cursor-pointer"
                    >
                      <span className="hero-x-mark h-5 w-5" />
                    </button>
                  </header>
                  <div className="flex-grow bg-gray-100 h-0.5 my-[16px]" />
                </>
              )}
              <section className="px-[24px]">{children}</section>
              {footer && (
                <>
                  <div className="mt-[16px]" />
                  <footer className="px-[24px] sm:flex sm:flex-row-reverse gap-3">{footer}</footer>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
