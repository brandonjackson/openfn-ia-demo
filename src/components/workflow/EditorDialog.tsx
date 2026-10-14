import { useEffect, type ReactNode } from "react";
import { cn } from "../../utils/cn";

/**
 * The Headless UI dialog shell the editor's modals share: grey backdrop and
 * a white rounded-lg panel, closed by Escape or a backdrop click.
 */
export default function EditorDialog({
  open,
  onClose,
  children,
  className = "sm:max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Width (and padding) classes for the panel. */
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="relative z-50" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500/75" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto" onClick={onClose}>
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            className={cn("relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full", className)}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
