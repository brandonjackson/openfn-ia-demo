import type { RunDetails } from "../../mock-data/workflow";
import RunLabel from "./RunLabel";
import Surface from "../Surface";

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
    <Surface className="inline-flex h-10 items-center px-1.5 pl-3">
      <RunLabel run={run} detail={detail} onUnload={onUnload} />
    </Surface>
  );
}
