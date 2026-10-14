import { useEffect, type ReactNode } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  children?: ReactNode;
}

/**
 * The editor's confirm dialog (collaborative-editor/components/
 * AlertDialog.tsx): centred title and description, Cancel and the confirm
 * button side by side.
 */
export default function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  children,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const confirmClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-500 focus-visible:outline-red-600"
      : "bg-primary-600 hover:bg-primary-500 focus-visible:outline-primary-600";

  return (
    <div className="relative z-[60]" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500/75 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto pointer-events-none">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="pointer-events-auto relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            {children != null && <div className="mt-4 text-left">{children}</div>}
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 sm:col-start-2 ${confirmClass}`}
              >
                {confirmLabel}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:inset-ring-gray-400 sm:col-start-1 sm:mt-0"
              >
                {cancelLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
