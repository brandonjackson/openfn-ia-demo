import type { Dataclip, RunDetails } from "../../mock-data/workflow";
import DataSnippet from "./DataSnippet";
import type { RunDataSection } from "./panel-views";

interface Props {
  run: RunDetails;
  /** The step whose input and output to show; without one, the trigger's: the run's input. */
  jobId?: string;
  dataclips?: Dataclip[];
  /** Opens the input or output in the panel under the code. */
  onExpand?: (section: Exclude<RunDataSection, "log">) => void;
}

/**
 * The I/O view of the details column in code mode, while a run is loaded:
 * the step's input over its output, each taking half the column's height.
 * On the trigger it's the run's input alone, at full height. Expanding
 * either opens it in the panel under the code.
 */
export default function RunIOPanel({ run, jobId, dataclips = [], onExpand }: Props) {
  const step = jobId ? run.steps.find((s) => s.jobId === jobId) : undefined;
  const clip = (id?: string) => dataclips.find((d) => d.id === id);

  if (!jobId) {
    const input = clip(run.inputId);
    return (
      <div className="flex h-full flex-col px-3 py-3">
        <DataSnippet
          fill
          title="Input"
          lines={input?.body.split("\n") ?? []}
          meta={input?.name}
          empty="This run's input wasn't kept."
          onExpand={onExpand ? () => onExpand("input") : undefined}
          expandLabel="Open input in the panel"
        />
      </div>
    );
  }

  if (!step) {
    return <p className="px-4 py-3 text-xs text-gray-500">This step wasn't part of this run.</p>;
  }

  const input = clip(step.inputId);
  const output = clip(step.outputId);
  const unfinished = step.status === "running" || step.status === "pending";

  return (
    <div className="flex h-full flex-col gap-3 px-3 py-3">
      <DataSnippet
        fill
        title="Input"
        lines={input?.body.split("\n") ?? []}
        meta={input?.name}
        empty="This step's input wasn't kept."
        onExpand={onExpand ? () => onExpand("input") : undefined}
        expandLabel="Open input in the panel"
      />
      <DataSnippet
        fill
        title="Output"
        lines={output?.body.split("\n") ?? []}
        meta={output?.name}
        empty={unfinished ? "This step hasn't finished yet." : "This step's output wasn't kept."}
        onExpand={onExpand ? () => onExpand("output") : undefined}
        expandLabel="Open output in the panel"
      />
    </div>
  );
}
