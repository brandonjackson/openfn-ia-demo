import { X } from "lucide-react";
import type { RunDetails } from "../../mock-data/workflow";
import Button from "../Button";
import StatusPill from "./StatusPill";

/**
 * The line that names a loaded run: its status dot, short id and a detail
 * such as when it ran, the version it ran on or the step in focus, with an
 * "Unload run" button when it can be unloaded. `LoadedRunBar`, the
 * inspector and the code view's panel all name the run this way.
 */
export default function RunLabel({
  run,
  detail,
  onUnload,
}: {
  run: Pick<RunDetails, "runId" | "status">;
  /** After the run id, e.g. `run.when`, `run.version` or a step's duration. */
  detail?: string;
  onUnload?: () => void;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2 text-xs text-gray-600">
      <StatusPill status={run.status} variant="dot" />
      <span className="min-w-0 flex-1 truncate whitespace-nowrap">
        Run <code className="font-mono font-medium text-gray-900">{run.runId.slice(0, 6)}</code>
        {detail && <> · {detail}</>}
      </span>
      {onUnload && (
        <Button variant="secondary" size="xs" icon={X} onClick={onUnload}>
          Unload run
        </Button>
      )}
    </span>
  );
}
