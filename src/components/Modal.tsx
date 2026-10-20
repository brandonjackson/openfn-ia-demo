import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

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

/**
 * Centred dialog over a dimmed backdrop. Clicking the backdrop, the close
 * button or pressing Escape calls `onClose`.
 */
export default function Modal({ open, title, onClose, children, footer, widthClass = "max-w-lg" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[80vh] w-full ${widthClass} flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
