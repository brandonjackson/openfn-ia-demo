import { useCallback, useRef, useState } from "react";
import EditorButton from "./EditorButton";
import { useDismiss } from "./useDismiss";

interface Props {
  onClick: () => void;
  /** When given, renders a split button whose menu offers "Run with custom input". */
  onRunWithCustomInputClick?: () => void;
  disabled?: boolean;
  isRunning?: boolean;
  text?: string;
  variant?: "primary" | "secondary";
  /** Hover text (Lightning shows the shortcut, or why it's disabled). */
  tooltip?: string;
}

/**
 * The Run button (collaborative-editor/components/NewRunButton.tsx): play
 * icon + label, optionally split with a chevron menu.
 */
export default function NewRunButton({
  onClick,
  onRunWithCustomInputClick,
  disabled = false,
  isRunning = false,
  text = "Run",
  variant = "primary",
  tooltip = "⌘ Enter",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const isDisabled = disabled || isRunning;
  const label = isRunning ? "Processing" : text;
  const icon = isRunning ? (
    <span className="hero-arrow-path h-4 w-4 animate-spin" />
  ) : (
    <span className="hero-play-solid h-4 w-4" />
  );

  if (!onRunWithCustomInputClick) {
    return (
      <span className="inline-block" title={tooltip}>
        <EditorButton variant={variant} onClick={onClick} disabled={isDisabled}>
          <span className="flex items-center gap-1">
            {icon}
            {label}
          </span>
        </EditorButton>
      </span>
    );
  }

  const split =
    variant === "secondary"
      ? "bg-white text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:inset-ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
      : "bg-primary-600 hover:bg-primary-500 disabled:bg-primary-300 disabled:hover:bg-primary-300 text-white focus-visible:outline-primary-600";

  return (
    <div className="inline-flex rounded-md shadow-xs">
      <button
        type="button"
        title={tooltip}
        className={`rounded-l-md text-sm font-semibold shadow-xs cursor-pointer disabled:cursor-not-allowed px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-transparent ${split}`}
        onClick={onClick}
        disabled={isDisabled}
      >
        <span className="flex items-center gap-1">
          {icon}
          {label}
        </span>
      </button>
      <div ref={ref} className="relative -ml-px block">
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`h-full rounded-r-md pr-2 pl-2 text-sm font-semibold shadow-xs cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus:ring-transparent ${split}`}
        >
          <span className="sr-only">Open run options</span>
          <span className="hero-chevron-down w-4 h-4" />
        </button>
        {open && (
          <div className="absolute right-0 z-[100] mt-2 w-max origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5">
            <button
              type="button"
              title="⌘ ⇧ Enter"
              onClick={() => {
                onRunWithCustomInputClick();
                close();
              }}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span className="hero-play h-4 w-4" />
              Run with custom input
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
