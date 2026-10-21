import type { Dataclip, DataclipType } from "../../mock-data/workflow";
import Badge from "../Badge";

const typeLabel: Record<DataclipType, string> = {
  http_request: "Request",
  step_result: "Step result",
  saved_input: "Saved input",
};

/**
 * A list of dataclips to pick one from, as radio rows: the dataclip's name
 * (or id when it has none), what kind it is and when it was made.
 */
export default function DataclipList({
  dataclips,
  selectedId,
  onSelect,
  groupName = "dataclip",
  emptyMessage = "No inputs to pick from.",
}: {
  dataclips: Dataclip[];
  selectedId?: string;
  onSelect?: (dataclip: Dataclip) => void;
  /** Radio group name; give each list on a page its own. */
  groupName?: string;
  emptyMessage?: string;
}) {
  if (dataclips.length === 0) {
    return <p className="py-2 text-xs text-gray-500">{emptyMessage}</p>;
  }
  return (
    <ul className="max-h-56 divide-y divide-gray-100 overflow-y-auto rounded-md border border-gray-200">
      {dataclips.map((dataclip) => (
        <li key={dataclip.id}>
          <label
            className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-gray-50 ${
              dataclip.id === selectedId ? "bg-blue-50/60" : ""
            }`}
          >
            <input
              type="radio"
              name={groupName}
              checked={dataclip.id === selectedId}
              onChange={() => onSelect?.(dataclip)}
              className="text-blue-600"
            />
            <span className="min-w-0 flex-1">
              {dataclip.name ? (
                <span className="block truncate text-sm text-gray-900">{dataclip.name}</span>
              ) : (
                <code className="block truncate font-mono text-sm text-gray-700">{dataclip.id}</code>
              )}
              <span className="block text-xs text-gray-500">{dataclip.created}</span>
            </span>
            <Badge label={typeLabel[dataclip.type]} />
          </label>
        </li>
      ))}
    </ul>
  );
}
