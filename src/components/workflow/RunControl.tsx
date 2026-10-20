import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileJson, Play, Power, PowerOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  id: "custom" | "toggle-live";
  label: string;
  description: string;
  icon: LucideIcon;
}

/**
 * One control for whether a workflow is live and for running it.
 *
 * The control reads as the workflow's state ("Live" or "Disabled"). Inset on
 * it is a play button that runs the workflow straight away, in either state.
 * Clicking anywhere else opens a menu: run with custom input, and go live or
 * disable depending on the current state.
 */
export default function RunControl({
  live,
  runLabel = "Run",
  onRun,
  onRunWithCustomInput,
  onToggleLive,
  defaultOpen = false,
}: {
  live: boolean;
  /** Tooltip and accessible name of the play button, e.g. "Run (Retry)". */
  runLabel?: string;
  onRun?: () => void;
  onRunWithCustomInput?: () => void;
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
      id: "custom",
      label: "Run with custom input",
      description: "Choose or write the input for this run.",
      icon: FileJson,
    },
    live
      ? {
          id: "toggle-live",
          label: "Disable",
          description: "Stop triggers from starting new runs.",
          icon: PowerOff,
        }
      : {
          id: "toggle-live",
          label: "Go live",
          description: "Let triggers start runs automatically.",
          icon: Power,
        },
  ];

  const select = (id: MenuItem["id"]) => {
    setOpen(false);
    if (id === "custom") onRunWithCustomInput?.();
    else onToggleLive?.(!live);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <div
        className={`flex h-8 items-center rounded-md border text-sm font-medium transition-colors ${
          live
            ? "border-green-200 bg-green-50 text-green-800 hover:bg-green-100"
            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
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
            className={`h-2 w-2 rounded-full ${live ? "bg-green-500" : "bg-gray-300"}`}
            aria-hidden
          />
          {live ? "Live" : "Disabled"}
        </button>
        <button
          type="button"
          title={runLabel}
          aria-label={runLabel}
          onClick={onRun}
          className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white shadow-sm hover:bg-blue-700"
        >
          <Play size={12} fill="currentColor" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-full items-center pl-1.5 pr-2 opacity-70"
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
                <li key={item.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => select(item.id)}
                    className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-gray-100"
                  >
                    <ItemIcon size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-gray-900">{item.label}</span>
                      <span className="block text-xs text-gray-500">{item.description}</span>
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
