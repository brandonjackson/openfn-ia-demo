import type { WorkflowNode } from "../../mock-data/workflow";
import { AdaptorIcon, TriggerIcon } from "./AdaptorIcon";

/** Width of the icon tile — exported so the canvas can compute edge anchors. */
export const NODE_ICON_SIZE = 56;

/**
 * A single node on the workflow canvas: either a circular trigger or a square
 * job tile with its label to the right. Selecting toggles a blue ring.
 */
export default function WorkflowNodeCard({
  node,
  selected = false,
  onClick,
}: {
  node: WorkflowNode;
  selected?: boolean;
  onClick?: (node: WorkflowNode) => void;
}) {
  const ringClasses = selected
    ? "ring-2 ring-blue-500 ring-offset-2"
    : "hover:ring-2 hover:ring-gray-200";

  return (
    <button
      type="button"
      onClick={() => onClick?.(node)}
      className="flex items-center gap-3 text-left focus:outline-none"
    >
      {node.type === "trigger" ? (
        <span className={`rounded-full transition-shadow ${ringClasses}`}>
          <TriggerIcon triggerType={node.triggerType} size="lg" />
        </span>
      ) : (
        <span
          className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white border border-gray-200 shadow-sm transition-shadow ${ringClasses}`}
        >
          <AdaptorIcon adaptor={node.adaptor} size="md" />
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
      </span>
    </button>
  );
}
