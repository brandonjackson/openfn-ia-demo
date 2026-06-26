import { CheckCircle2, XCircle, Loader2, Circle, Info } from "lucide-react";
import type { RunDetails, RunStatus, RunStep } from "../../mock-data/workflow";
import StatusPill from "./StatusPill";

function StepIcon({ status }: { status: RunStatus }) {
  switch (status) {
    case "success":
      return <CheckCircle2 size={16} className="text-green-500" />;
    case "failed":
      return <XCircle size={16} className="text-red-500" />;
    case "running":
      return <Loader2 size={16} className="animate-spin text-blue-500" />;
    default:
      return <Circle size={16} className="text-gray-300" />;
  }
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{children}</span>
    </div>
  );
}

/**
 * The run inspector: work-order / run metadata on the left and the ordered
 * list of run steps on the right, mirroring the Lightning run view.
 */
export default function RunPanel({
  run,
  selectedStepId,
  onSelectStep,
}: {
  run: RunDetails;
  selectedStepId?: string;
  onSelectStep?: (step: RunStep) => void;
}) {
  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      {/* Metadata */}
      <div className="px-4 py-2">
        <div className="divide-y divide-gray-50">
          <MetaRow label="Work Order">
            <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
              {run.workOrderId}
            </code>
          </MetaRow>
          <MetaRow label="Run">
            <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
              {run.runId}
            </code>
          </MetaRow>
          <MetaRow label="Status">
            <StatusPill status={run.status} />
          </MetaRow>
          <MetaRow label="Duration">{run.duration}</MetaRow>
          <MetaRow label="Started">{run.started}</MetaRow>
          <MetaRow label="Started by">{run.startedBy}</MetaRow>
        </div>
      </div>

      {/* Steps */}
      <div className="px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-900">Run Steps</span>
          <Info size={12} className="text-gray-300" />
        </div>
        <ul className="space-y-0.5">
          {run.steps.map((step) => (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelectStep?.(step)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-gray-50 ${
                  step.id === selectedStepId ? "bg-blue-50" : ""
                }`}
              >
                <StepIcon status={step.status} />
                <span className="flex-1 truncate text-sm text-gray-700">
                  {step.label}
                </span>
                <span className="text-xs text-gray-400">{step.duration}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
