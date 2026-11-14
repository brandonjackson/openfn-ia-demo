import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import IconButton from "./IconButton";

export type ToastTone = "success" | "error" | "info";

const looks: Record<ToastTone, { icon: LucideIcon; tint: string; edge: string }> = {
  success: { icon: CheckCircle2, tint: "text-green-500", edge: "border-l-green-500" },
  error: { icon: AlertTriangle, tint: "text-red-500", edge: "border-l-red-500" },
  info: { icon: Info, tint: "text-indigo-500", edge: "border-l-indigo-500" },
};

export interface ToastProps {
  tone?: ToastTone;
  /** What happened, as a sentence: "Created a sandbox from main." */
  message: string;
  /** More about it, e.g. why something was refused. */
  detail?: string;
  /** Closes it, from its X or once its time is up. */
  onDismiss: () => void;
  /** Closes it by itself after this long, paused while the pointer or focus is on it. Errors leave it out, so they stay until closed. */
  autoDismissMs?: number;
}

/**
 * One message about what an action just did: a success, a refusal, or a
 * note. It sits in a {@link ToastStack} at the corner of the screen, has an
 * X to close it, and (unless it's an error) goes by itself after a while.
 */
export function Toast({ tone = "info", message, detail, onDismiss, autoDismissMs }: ToastProps) {
  const look = looks[tone];
  const Icon = look.icon;
  const [paused, setPaused] = useState(false);
  const left = useRef(autoDismissMs ?? 0);
  const dismiss = useRef(onDismiss);
  useEffect(() => {
    dismiss.current = onDismiss;
  });

  useEffect(() => {
    if (!autoDismissMs || paused) return;
    const started = Date.now();
    const timer = setTimeout(() => dismiss.current(), left.current);
    return () => {
      clearTimeout(timer);
      left.current = Math.max(0, left.current - (Date.now() - started));
    };
  }, [autoDismissMs, paused]);

  return (
    <div
      data-ui="toast"
      data-tone={tone}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-l-4 border-gray-200 bg-white py-3 pl-3 pr-2 shadow-lg ${look.edge}`}
    >
      <Icon size={18} aria-hidden className={`mt-0.5 flex-shrink-0 ${look.tint}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">{message}</p>
        {detail && <p className="mt-0.5 text-sm text-gray-600">{detail}</p>}
      </div>
      <IconButton icon={X} size="xs" label="Dismiss" onClick={onDismiss} />
    </div>
  );
}

export interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
  detail?: string;
}

interface StackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  /** How long a success or note stays. Errors stay until they're closed. */
  autoDismissMs?: number;
}

/**
 * Where toasts stack, in the bottom-right corner, newest at the bottom. It
 * always holds two live regions, a polite one for successes and notes and an
 * assertive one for errors, so screen readers read each toast as it arrives.
 */
export function ToastStack({ toasts, onDismiss, autoDismissMs = 6000 }: StackProps) {
  const region = (tones: ToastTone[]) =>
    toasts
      .filter((t) => tones.includes(t.tone))
      .map((t) => (
        <Toast
          key={t.id}
          tone={t.tone}
          message={t.message}
          detail={t.detail}
          onDismiss={() => onDismiss(t.id)}
          autoDismissMs={t.tone === "error" ? undefined : autoDismissMs}
        />
      ));
  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-50 flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2">
      <div role="alert" aria-live="assertive" className="flex flex-col gap-2">
        {region(["error"])}
      </div>
      <div role="status" aria-live="polite" className="flex flex-col gap-2">
        {region(["success", "info"])}
      </div>
    </div>
  );
}

export default Toast;
