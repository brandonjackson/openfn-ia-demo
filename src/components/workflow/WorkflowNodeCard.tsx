import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import type { RunStatus, RunStep, WorkflowNode } from "../../mock-data/workflow";
import { AdaptorIcon, TriggerIcon } from "./AdaptorIcon";

/** Width of the icon tile — exported so the canvas can compute edge anchors. */
export const NODE_ICON_SIZE = 56;

const statusText: Record<RunStatus, { label: string; color: string }> = {
  success: { label: "Success", color: "text-green-600" },
  failed: { label: "Failed", color: "text-red-600" },
  running: { label: "Running", color: "text-blue-600" },
  pending: { label: "Pending", color: "text-gray-400" },
};

/** The small status mark pinned to the corner of a node that ran. */
function StepMark({ status }: { status: RunStatus }) {
  const common = "rounded-full bg-white";
  switch (status) {
    case "success":
      return <CheckCircle2 size={18} className={`${common} text-green-500`} />;
    case "failed":
      return <XCircle size={18} className={`${common} text-red-500`} />;
    case "running":
      return <Loader2 size={18} className={`${common} animate-spin text-blue-500`} />;
    default:
      return <Circle size={18} className={`${common} text-gray-300`} />;
  }
}

/**
 * A single node on the workflow canvas: either a circular trigger or a square
 * job tile with its label to the right. Selecting toggles a blue ring.
 *
 * While a run is shown on the canvas, a job that ran carries the step's status
 * on its corner and its duration under the label; `note` adds a line under a
 * trigger, e.g. who started the run. Nodes the run never reached are dimmed.
 */
export default function WorkflowNodeCard({
  node,
  selected = false,
  onClick,
  step,
  dimmed = false,
  note,
}: {
  node: WorkflowNode;
  selected?: boolean;
  onClick?: (node: WorkflowNode) => void;
  /** This job's step in the run shown on the canvas. */
  step?: RunStep;
  /** The run shown on the canvas didn't reach this node. */
  dimmed?: boolean;
  /** Extra line under the label, e.g. "Started by webhook trigger". */
  note?: string;
}) {
  const ringClasses = selected
    ? "ring-2 ring-blue-500 ring-offset-2"
    : step?.status === "failed"
      ? "ring-2 ring-red-300"
      : "hover:ring-2 hover:ring-gray-200";

  return (
    <button
      type="button"
      onClick={() => onClick?.(node)}
      className={`flex items-center gap-3 text-left transition-opacity focus:outline-none ${
        dimmed ? "opacity-40 hover:opacity-70" : ""
      }`}
    >
      {node.type === "trigger" ? (
        <span className={`rounded-full transition-shadow ${ringClasses}`}>
          <TriggerIcon triggerType={node.triggerType} size="lg" />
        </span>
      ) : (
        <span
          className={`relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white border border-gray-200 shadow-sm transition-shadow ${ringClasses}`}
        >
          <AdaptorIcon adaptor={node.adaptor} size="md" />
          {step && (
            <span className="absolute -right-2 -top-2">
              <StepMark status={step.status} />
            </span>
          )}
        </span>
      )}

      <span className="max-w-[160px]">
        <span className="block text-sm font-medium text-gray-800 leading-tight">
          {node.label}
        </span>
        <span className="block text-xs text-gray-400 mt-0.5">
          {node.type === "trigger"
            ? node.subtitle
            : node.adaptor === "common"
              ? "common"
              : node.adaptor}
        </span>
        {step && (
          <span className={`block text-xs mt-0.5 ${statusText[step.status].color}`}>
            {statusText[step.status].label}
            {step.duration && <span className="text-gray-400"> · {step.duration}</span>}
          </span>
        )}
        {note && <span className="block text-xs mt-0.5 text-gray-500">{note}</span>}
      </span>
    </button>
  );
}
