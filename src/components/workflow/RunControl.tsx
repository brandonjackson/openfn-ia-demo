import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileJson, Pause, Play, Power, PowerOff, RotateCcw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  id: "from-start" | "custom" | "toggle-live";
  label: string;
  description: string;
  icon: LucideIcon;
}

/**
 * One control for whether a workflow is live and for running it.
 *
 * The control reads as the workflow's state: "Live" with a green dot, or
 * "Disabled" with a pause icon. Inset on it is a run button that runs the
 * workflow straight away, in either state. Clicking anywhere else opens a
 * menu: run with custom input, and go live or disable depending on the
 * current state.
 *
 * When `retryStep` is set (a step from an earlier run is open), the inset
 * button becomes a retry icon that retries from that step, and the menu gains
 * "Run from start" so a fresh run is still one click away.
 */
export default function RunControl({
  live,
  retryStep,
  onRun,
  onRunFromStart,
  onRunWithCustomInput,
  onToggleLive,
  defaultOpen = false,
}: {
  live: boolean;
  /** Name of the step to retry from; switches the inset button to retry. */
  retryStep?: string;
  /** The inset button: run, or retry from `retryStep` when set. */
  onRun?: () => void;
  /** Menu item shown while retrying, for a fresh run of the whole workflow. */
  onRunFromStart?: () => void;
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
    ...(retryStep
      ? [
          {
            id: "from-start" as const,
            label: "Run from start",
            description: "Start a fresh run of the whole workflow.",
            icon: Play,
          },
        ]
      : []),
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
    if (id === "from-start") onRunFromStart?.();
    else if (id === "custom") onRunWithCustomInput?.();
    else onToggleLive?.(!live);
  };

  const runLabel = retryStep ? `Retry from ${retryStep}` : "Run";
  const RunIcon = retryStep ? RotateCcw : Play;

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
          {live ? (
            <span className="mx-0.5 h-2 w-2 rounded-full bg-green-500" aria-hidden />
          ) : (
            <Pause size={14} className="text-gray-500" aria-hidden />
          )}
          {live ? "Live" : "Disabled"}
        </button>
        <button
          type="button"
          title={runLabel}
          aria-label={runLabel}
          onClick={onRun}
          className="inline-flex h-6 w-6 items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900"
        >
          <RunIcon size={13} />
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
