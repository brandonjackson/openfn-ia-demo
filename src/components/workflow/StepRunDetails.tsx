import { History } from "lucide-react";
import type { Dataclip, RunDetails, RunStep } from "../../mock-data/workflow";
import CodeBlock from "../CodeBlock";
import EmptyState from "../EmptyState";
import LogConsole from "./LogConsole";
import RunPanel from "./RunPanel";

import type { StepRunTab } from "./step-run-tabs";

interface Props {
  run: RunDetails;
  /** The open step's step in the run; unset when the run never reached it. */
  step?: RunStep;
  /** No step is in focus: show the whole run's log, input and final output. */
  wholeRun?: boolean;
  dataclips?: Dataclip[];
  tab: StepRunTab;
  /** A step was picked in the Run tab; open it. */
  onSelectStep?: (step: RunStep) => void;
}

/**
 * What a step did in the selected run: the log lines it wrote, the data it
 * received and produced, and the whole run with this step highlighted. With
 * no step in focus (`wholeRun`) it shows the run's full log, its input and
 * its final output instead. The tabs live in the panel header; this is the
 * body for the chosen one.
 */
export default function StepRunDetails({ run, step, wholeRun = false, dataclips = [], tab, onSelectStep }: Props) {
  const clip = (id?: string) => dataclips.find((d) => d.id === id);

  if (tab === "run") return <RunPanel run={run} selectedStepId={step?.id} onSelectStep={onSelectStep} />;

  if (wholeRun && !step) {
    if (tab === "log") return <LogConsole lines={run.logs} />;
    const last = [...run.steps].reverse().find((s) => s.outputId);
    const data = clip(tab === "input" ? run.inputId : last?.outputId);
    return (
      <div className="p-4">
        {data ? (
          <CodeBlock label={tab === "input" ? "Run input" : `Final output · ${last?.label}`} code={data.body} />
        ) : (
          <EmptyState title={tab === "input" ? "This run's input wasn't kept." : "This run hasn't produced output yet."} />
        )}
      </div>
    );
  }

  if (!step) {
    return (
      <div className="p-4">
        <EmptyState
          icon={History}
          title={`This step wasn't part of run ${run.runId.slice(0, 6)}.`}
          description="Open a step from the Run tab to see what it did."
        />
      </div>
    );
  }

  if (tab === "log") return <LogConsole lines={run.logs.filter((l) => l.stepId === step.id)} />;

  const id = tab === "input" ? step.inputId : step.outputId;
  const data = clip(id);
  const missing =
    tab === "output" && (step.status === "running" || step.status === "pending")
      ? "This step hasn't finished yet."
      : `This step's ${tab} wasn't kept.`;
  return (
    <div className="p-4">
      {data ? (
        <CodeBlock label={data.name ? `${tab === "input" ? "Input" : "Output"} · ${data.name}` : undefined} code={data.body} />
      ) : (
        <EmptyState title={missing} />
      )}
    </div>
  );
}
