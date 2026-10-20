import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronDown, FileJson, Link2, Play, Power, PowerOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  id: "run" | "custom" | "copy-url" | "details" | "toggle-live";
  label: string;
  description: string;
  /** Show the description in a monospace font, e.g. for a URL. */
  mono?: boolean;
  /** Draw a divider above this item. */
  divider?: boolean;
  icon: LucideIcon;
}

/**
 * One control for whether a workflow is live and for running it.
 *
 * The control reads as the workflow's state: "Live" with a green dot, or
 * "Disabled" with a grey one. Inset on it is a run button that runs the
 * workflow straight away, in either state. Clicking anywhere else opens a
 * menu: run, run with custom input, copy the workflow's URL and see its
 * service listing (when it has one), then go live or disable depending on the
 * current state.
 *
 * When `retry` is set (an earlier run is selected), the inset button reads
 * "Retry" and runs that run's input again: from the open step when there is
 * one, otherwise from the start. Its tooltip carries `retry.hint`, e.g. that
 * the retry runs on a newer version than the original. "Run" in the menu
 * still starts a fresh run of the whole workflow.
 */
export default function RunControl({
  live,
  retry,
  onRun,
  onRetry,
  onRunWithCustomInput,
  url,
  onSeeDetails,
  onToggleLive,
  defaultOpen = false,
}: {
  live: boolean;
  /**
   * Switches the inset button to retry a selected run: `step` names the step
   * to retry from, `hint` adds a note to the tooltip.
   */
  retry?: { step?: string; hint?: string };
  /** A fresh run of the whole workflow: the inset button, and "Run" in the menu. */
  onRun?: () => void;
  /** Retries the selected run: the inset button while `retry` is set. */
  onRetry?: () => void;
  onRunWithCustomInput?: () => void;
  /** The URL that starts the workflow; adds "Copy URL" to the menu. */
  url?: string;
  /** Opens the service listing where the workflow is documented; adds "See details". */
  onSeeDetails?: () => void;
  /** Called with the new state when "Go live" or "Disable" is chosen. */
  onToggleLive?: (live: boolean) => void;
  /** Start with the menu open (useful for stories and screenshots). */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items: MenuItem[] = [
    {
      id: "run",
      label: "Run",
      description: "Start a fresh run of the whole workflow.",
      icon: Play,
    },
    {
      id: "custom",
      label: "Run with custom input",
      description: "Choose or write the input for this run.",
      icon: FileJson,
    },
    ...(url
      ? [{ id: "copy-url" as const, label: "Copy URL", description: url, mono: true, icon: Link2 }]
      : []),
    ...(onSeeDetails
      ? [
          {
            id: "details" as const,
            label: "See details",
            description: "Open the service listing and its docs.",
            icon: BookOpen,
          },
        ]
      : []),
    live
      ? {
          divider: true,
          id: "toggle-live",
          label: "Disable",
          description: "Stop triggers from starting new runs.",
          icon: PowerOff,
        }
      : {
          divider: true,
          id: "toggle-live",
          label: "Go live",
          description: "Let triggers start runs automatically.",
          icon: Power,
        },
  ];

  const select = (id: MenuItem["id"]) => {
    setOpen(false);
    if (id === "run") onRun?.();
    else if (id === "custom") onRunWithCustomInput?.();
    else if (id === "copy-url") void navigator.clipboard?.writeText(url ?? "");
    else if (id === "details") onSeeDetails?.();
    else onToggleLive?.(!live);
  };

  const runLabel = retry
    ? [retry.step ? `Retry from ${retry.step}` : "Retry this run's input", retry.hint].filter(Boolean).join(". ")
    : "Run";

  return (
    <div ref={ref} className="relative inline-block">
      <div
        className={`flex h-8 items-center rounded-md border text-sm font-medium text-gray-700 transition-colors ${
          open ? "border-gray-300 bg-gray-50" : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Workflow is ${live ? "live" : "disabled"}. Open run options`}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-full items-center gap-1.5 pl-2.5 pr-2"
        >
          <span
            className={`mx-0.5 h-2 w-2 rounded-full ${live ? "bg-green-500" : "bg-gray-300"}`}
            aria-hidden
          />
          {live ? "Live" : "Disabled"}
        </button>
        <button
          type="button"
          title={runLabel}
          aria-label={runLabel}
          onClick={retry ? onRetry : onRun}
          className={`inline-flex h-6 items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900 ${
            retry ? "px-2 text-xs font-medium" : "w-6"
          }`}
        >
          {retry ? "Retry" : <Play size={13} />}
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-full items-center pl-1.5 pr-2 text-gray-400"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg"
        >
          <ul>
            {items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <li
                  key={item.id}
                  className={item.divider ? "mt-1.5 border-t border-gray-100 pt-1.5" : undefined}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => select(item.id)}
                    className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-gray-100"
                  >
                    <ItemIcon size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-gray-900">{item.label}</span>
                      <span
                        className={`block text-xs text-gray-500 ${item.mono ? "truncate font-mono" : ""}`}
                        title={item.description}
                      >
                        {item.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
