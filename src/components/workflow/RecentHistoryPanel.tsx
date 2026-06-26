import { ChevronRight, ChevronLeft, History } from "lucide-react";
import type { RunHistoryEntry } from "../../mock-data/workflow";
import StatusPill from "./StatusPill";

/**
 * The collapsible "Recent History" panel pinned to the top-left of the canvas,
 * listing recent runs with their id, timestamp and status.
 */
export default function RecentHistoryPanel({
  entries,
  selectedId,
  onSelect,
}: {
  entries: RunHistoryEntry[];
  selectedId?: string;
  onSelect?: (entry: RunHistoryEntry) => void;
}) {
  return (
    <div className="w-80 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Recent History</span>
          <History size={14} className="text-gray-300" />
        </div>
        <button className="text-gray-300 hover:text-gray-500" title="Collapse">
          <ChevronLeft size={16} />
        </button>
      </div>
      <ul className="divide-y divide-gray-50">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => onSelect?.(entry)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 ${
                entry.id === selectedId ? "bg-blue-50" : ""
              }`}
            >
              <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-700">
                {entry.id}
              </code>
              <span className="text-gray-300">•</span>
              <span className="flex-1 truncate text-xs text-gray-500">{entry.when}</span>
              <StatusPill status={entry.status} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
