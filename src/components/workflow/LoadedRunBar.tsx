import { X } from "lucide-react";
import type { RunDetails } from "../../mock-data/workflow";
import Button from "../Button";
import StatusPill from "./StatusPill";

/**
 * A bar naming the loaded run (its status dot, short id and a detail such as
 * when it ran or the version it ran on) with a clear "Unload run". It is what
 * the canvas runs bar shows while a run is loaded, and stands next to the
 * Canvas/Code switcher in code mode.
 */
export default function LoadedRunBar({
  run,
  detail,
  onUnload,
}: {
  run: RunDetails;
  /** After the run id, e.g. `run.when` or `run.version`. */
  detail?: string;
  onUnload?: () => void;
}) {
  return (
    <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-1.5 text-xs shadow-sm">
      <span className="inline-flex items-center gap-2 pl-1.5 text-gray-600">
        <StatusPill status={run.status} variant="dot" />
        <span className="whitespace-nowrap">
          Run <code className="font-mono font-medium text-gray-900">{run.runId.slice(0, 6)}</code>
          {detail && <> · {detail}</>}
        </span>
      </span>
      {onUnload && (
        <Button variant="secondary" size="xs" icon={X} onClick={onUnload}>
          Unload run
        </Button>
      )}
    </div>
  );
}
