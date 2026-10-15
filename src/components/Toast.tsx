import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import IconButton from "./IconButton";

export type ToastTone = "info" | "error";

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: ReactNode;
}

type ShowToast = (message: ReactNode, tone?: ToastTone) => void;

const ToastContext = createContext<ShowToast>(() => {});

/** How long a toast stays up. Lightning's flash and the editor's info toasts both go after a few seconds. */
const DURATION_MS = 4000;

const tones: Record<ToastTone, { box: string; icon: string }> = {
  info: { box: "bg-blue-50 text-blue-800 ring-blue-200", icon: "hero-check-circle-solid text-blue-500" },
  error: { box: "bg-red-50 text-red-800 ring-red-200", icon: "hero-exclamation-circle-solid text-red-500" },
};

/**
 * The confirmation Lightning shows after an action: LiveView's `put_flash`
 * ("Token created successfully") and the editor's Sonner toasts ("Workflow
 * saved") are one bottom-centred toast here. Mount once near the root, then
 * call `useToast()` from anything that saves, deletes or starts something.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);

  const show = useCallback<ShowToast>(
    (message, tone = "info") => {
      const id = nextId.current++;
      setToasts((ts) => [...ts, { id, tone, message }]);
      window.setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss]
  );

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <Toast key={t.id} tone={t.tone} onClose={() => dismiss(t.id)}>
            {t.message}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Returns `toast(message, tone?)`. Outside a provider it does nothing, so stories don't need one. */
// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ShowToast {
  return useContext(ToastContext);
}

interface ToastProps {
  tone?: ToastTone;
  children: ReactNode;
  onClose?: () => void;
}

/** One toast. Rendered by `ToastProvider`; exported for stories. */
export function Toast({ tone = "info", children, onClose }: ToastProps) {
  const c = tones[tone];
  return (
    <div
      className={cn("pointer-events-auto flex items-center gap-3 rounded-md px-4 py-3 text-sm shadow-lg ring-1", c.box)}
      data-ui="toast"
      data-variant={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      <span className={cn(c.icon, "h-5 w-5 shrink-0")} />
      <span>{children}</span>
      {onClose && <IconButton icon="hero-x-mark" label="Close" size="sm" onClick={onClose} />}
    </div>
  );
}
