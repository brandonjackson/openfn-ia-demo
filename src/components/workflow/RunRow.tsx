import { X } from "lucide-react";
import type { RunDetails } from "../../mock-data/workflow";
import Badge from "../Badge";
import StatusPill from "./StatusPill";

/**
 * One run inside a work order in the history panel: its status, when it
 * started and how long it took, and the version of the workflow it ran on.
 *
 * Clicking the row selects the run. A selected run is indented with a violet
 * edge and gets an X to deselect it.
 */
export default function RunRow({
  run,
  selected = false,
  latestVersion,
  onSelect,
  onDeselect,
  compact = false,
}: {
  run: RunDetails;
  selected?: boolean;
  /** The workflow's latest version; a run on an older one gets a yellow tag. */
  latestVersion?: string;
  onSelect?: (run: RunDetails) => void;
  onDeselect?: () => void;
  /** On the inspector's text axis, for its failure list. */
  compact?: boolean;
}) {
  const older = latestVersion !== undefined && run.version !== latestVersion;
  return (
    <div
      className={`group flex items-center gap-2 py-1.5 text-xs ${compact ? "pl-5 pr-5" : "pl-8 pr-3"} ${
        selected ? `border-l-2 border-violet-500 bg-violet-50 ${compact ? "pl-[18px]" : "pl-[30px]"}` : "hover:bg-gray-50"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect?.(run)}
        aria-pressed={selected}
        aria-label={`Run ${run.runId}, ${run.status}, ${run.when}`}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <StatusPill status={run.status} variant="dot" />
        <span className={`truncate ${selected ? "font-medium text-gray-900" : "text-gray-600"}`}>{run.when}</span>
        {run.duration && <span className="flex-shrink-0 text-gray-400">{run.duration}</span>}
        <span className="ml-auto flex flex-shrink-0 items-center gap-1.5">
          <Badge label={run.version} tone={older ? "yellow" : "gray"} />
          <code className="font-mono text-[11px] text-gray-400">{run.runId.slice(0, 6)}</code>
        </span>
      </button>
      {selected && onDeselect && (
        <button
          type="button"
          onClick={onDeselect}
          aria-label="Deselect run"
          title="Deselect run"
          className="flex-shrink-0 rounded p-0.5 text-gray-400 hover:bg-violet-100 hover:text-gray-700"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
