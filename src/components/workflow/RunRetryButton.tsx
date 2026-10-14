import { useCallback, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { useDismiss } from "./useDismiss";

interface Props {
  /** A finished run can be retried: "Retry" with a "Run (New Work Order)" menu. */
  isRetryable: boolean;
  disabled?: boolean;
  onRun: () => void;
  onRetry: () => void;
  runLabel?: string;
  dropdownPosition?: "up" | "down";
}

const primary = "bg-primary-600 hover:bg-primary-500 text-white focus-visible:outline-primary-600 disabled:bg-primary-300";

/** Run / Retry button (RunRetryButton.tsx), primary variant. */
export default function RunRetryButton({ isRetryable, disabled = false, onRun, onRetry, runLabel = "Run", dropdownPosition = "down" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  if (!isRetryable) {
    return (
      <button
        type="button"
        title="⌘ Enter"
        onClick={onRun}
        disabled={disabled}
        className={cn("rounded-md text-sm font-semibold shadow-xs px-3 py-2 flex items-center gap-1 disabled:cursor-not-allowed", primary)}
      >
        <span className="hero-play-mini w-4 h-4" />
        {runLabel}
      </button>
    );
  }
  return (
    <div ref={ref} className="inline-flex rounded-md shadow-xs">
      <button
        type="button"
        title="⌘ Enter"
        onClick={onRetry}
        disabled={disabled}
        className={cn("rounded-l-md text-sm font-semibold shadow-xs px-3 py-2 flex items-center gap-1 disabled:cursor-not-allowed", primary)}
      >
        <span className="hero-play-mini w-4 h-4" />
        Retry
      </button>
      <div className="relative -ml-px">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={disabled}
          aria-expanded={open}
          className={cn("rounded-md text-sm font-semibold shadow-xs px-1 py-2 h-full rounded-l-none disabled:cursor-not-allowed", primary)}
        >
          <span className="sr-only">Open options</span>
          <span className="hero-chevron-down w-4 h-4 block" />
        </button>
        {open && (
          <div role="menu" className={cn("absolute right-0 z-10 w-max", dropdownPosition === "up" ? "bottom-full mb-2" : "top-full mt-2")}>
            <button
              type="button"
              title="⌘ ⇧ Enter"
              onClick={() => {
                onRun();
                close();
              }}
              className="rounded-md text-sm font-semibold shadow-lg px-3 py-2 bg-white hover:bg-gray-50 text-gray-900 ring-1 ring-gray-300 ring-inset flex items-center gap-1 whitespace-nowrap"
            >
              <span className="hero-play-solid w-4 h-4" />
              Run (New Work Order)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
