import { X } from "lucide-react";
import type { RunDetails } from "../../mock-data/workflow";
import StatusPill from "./StatusPill";

/**
 * A compact chip naming the selected run, with an X to stop following it.
 * Shown in the editor toolbar's version slot while a run is loaded; `md`
 * matches the height of the version picker it stands in for.
 *
 * The warning tone flags something to notice about the run, e.g. that the open
 * step wasn't part of it; `note` says what.
 */
export default function RunChip({
  run,
  onClear,
  tone = "default",
  note,
  size = "sm",
}: {
  run: RunDetails;
  onClear?: () => void;
  tone?: "default" | "warning";
  /** Short text after the run id, e.g. "Step not in this run". */
  note?: string;
  size?: "sm" | "md";
}) {
  const colors =
    tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-blue-200 bg-blue-50 text-blue-700";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-medium ${size === "md" ? "text-sm" : "text-xs"} ${colors}`}
    >
      <StatusPill status={run.status} variant="dot" />
      Run <code className="font-mono">{run.runId.slice(0, 6)}</code>
      {note && <span className="font-normal opacity-80">· {note}</span>}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Close run"
          title="Close run"
          className="-mr-0.5 rounded p-0.5 opacity-60 hover:opacity-100"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
