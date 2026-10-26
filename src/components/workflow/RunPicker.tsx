import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, History, X } from "lucide-react";
import type { RunDetails, WorkOrder } from "../../mock-data/workflow";
import RunHistoryList from "./RunHistoryList";
import StatusPill from "./StatusPill";

interface Props {
  workOrders: WorkOrder[];
  selectedRun?: RunDetails;
  latestVersion?: string;
  onSelectRun?: (run: RunDetails) => void;
  onDeselectRun?: () => void;
  /** Shown under the list, e.g. a version mismatch banner for the selected run. */
  footer?: ReactNode;
  defaultOpen?: boolean;
}

/**
 * The toolbar control for loading a run. With nothing loaded it reads
 * "History"; with a run loaded it names the run with its status and offers
 * an X to unload it. Opening it lists the run history to pick from. The run
 * loads into whichever mode is showing: on the canvas it's drawn over the
 * steps, in code mode each step shows how it went and the step tray fills
 * with its log, input and output.
 */
export default function RunPicker({
  workOrders,
  selectedRun,
  latestVersion,
  onSelectRun,
  onDeselectRun,
  footer,
  defaultOpen = false,
}: Props) {
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

  return (
    <div ref={ref} className="relative inline-block">
      <div
        className={`inline-flex h-8 items-center rounded-md border text-sm font-medium transition-colors ${
          selectedRun
            ? "border-blue-200 bg-blue-50 text-blue-800"
            : open
              ? "border-gray-300 bg-gray-50 text-gray-800"
              : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={selectedRun ? `Run ${selectedRun.runId} loaded. Choose another run` : "Load a run from history"}
          title={selectedRun ? `Run ${selectedRun.runId}, ${selectedRun.when}` : "Load a run from history"}
          className="inline-flex h-full items-center gap-1.5 pl-2.5 pr-2"
        >
          {selectedRun ? (
            <>
              <StatusPill status={selectedRun.status} variant="dot" />
              <span>
                Run <code className="font-mono text-xs">{selectedRun.runId.slice(0, 6)}</code>
              </span>
            </>
          ) : (
            <>
              <History size={13} className="text-gray-500" />
              History
            </>
          )}
          <ChevronDown size={14} className="opacity-60" />
        </button>
        {selectedRun && onDeselectRun && (
          <button
            type="button"
            onClick={onDeselectRun}
            aria-label="Unload run"
            title="Unload run"
            className="inline-flex h-full items-center border-l border-blue-200 px-1.5 text-blue-500 hover:bg-blue-100 hover:text-blue-800"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="Run history"
          className="absolute right-0 top-full z-50 mt-1.5 flex max-h-[28rem] w-[26rem] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          <div className="flex flex-none items-center justify-between border-b border-gray-100 px-3 py-2">
            <span className="text-sm font-semibold text-gray-900">Run history</span>
            <span className="text-xs text-gray-500">
              {workOrders.length} {workOrders.length === 1 ? "work order" : "work orders"}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <RunHistoryList
              workOrders={workOrders}
              selectedRunId={selectedRun?.runId}
              latestVersion={latestVersion}
              onSelectRun={(run) => {
                setOpen(false);
                onSelectRun?.(run);
              }}
              onDeselectRun={() => {
                setOpen(false);
                onDeselectRun?.();
              }}
              footer={footer}
            />
          </div>
        </div>
      )}
    </div>
  );
}
