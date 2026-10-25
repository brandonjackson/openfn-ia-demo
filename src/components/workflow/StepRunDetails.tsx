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
  dataclips?: Dataclip[];
  tab: StepRunTab;
  /** A step was picked in the Run tab; open it. */
  onSelectStep?: (step: RunStep) => void;
}

/**
 * What a step did in the selected run: the log lines it wrote, the data it
 * received and produced, and the whole run with this step highlighted. The
 * tabs live in the tray header; this is the body for the chosen one.
 */
export default function StepRunDetails({ run, step, dataclips = [], tab, onSelectStep }: Props) {
  const clip = (id?: string) => dataclips.find((d) => d.id === id);

  if (tab === "run") return <RunPanel run={run} selectedStepId={step?.id} onSelectStep={onSelectStep} />;

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
