import { X } from "lucide-react";
import type { RunDetails } from "../../mock-data/workflow";
import StatusPill from "./StatusPill";

/**
 * A compact chip naming the selected run, with an X to stop following it.
 * Shown on the collapsed history panel and above the job editor's run tabs.
 *
 * The warning tone flags something to notice about the run, e.g. that the open
 * step wasn't part of it; `note` says what.
 */
export default function RunChip({
  run,
  onClear,
  tone = "default",
  note,
}: {
  run: RunDetails;
  onClear?: () => void;
  tone?: "default" | "warning";
  /** Short text after the run id, e.g. "Step not in this run". */
  note?: string;
}) {
  const colors =
    tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-blue-200 bg-blue-50 text-blue-700";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${colors}`}>
      <StatusPill status={run.status} variant="dot" />
      Run <code className="font-mono">{run.runId.slice(0, 6)}</code>
      {note && <span className="font-normal opacity-80">· {note}</span>}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Stop following this run"
          title="Stop following this run"
          className="-mr-0.5 rounded p-0.5 opacity-60 hover:opacity-100"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
