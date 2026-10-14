import type { DataclipType } from "../../mock-data/history";
import { cn } from "../../utils/cn";

const TYPE_CLASSES: Record<DataclipType, string> = {
  step_result: "bg-purple-500 text-purple-900",
  http_request: "bg-green-500 text-green-900",
  global: "bg-blue-500 text-blue-900",
  saved_input: "bg-yellow-500 text-yellow-900",
  kafka: "bg-green-500 text-green-900",
};

/**
 * A dataclip's type as a coloured mono pill (Common.dataclip_type_pill, and
 * manual-run-panel/DataclipTypePill.tsx with its small size).
 */
export default function DataclipTypePill({ type, size = "default" }: { type: DataclipType; size?: "default" | "small" }) {
  return (
    <div
      className={cn(
        size === "small"
          ? "px-1.5 py-0.5 rounded-full inline-block text-xs font-mono"
          : "px-2 py-1 rounded-full inline-block text-sm font-mono",
        TYPE_CLASSES[type] ?? ""
      )}
    >
      {type}
    </div>
  );
}
