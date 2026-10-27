import { Maximize2, MoreVertical, Play, Plus, Sparkles, Trash2 } from "lucide-react";
import type { RunStep, WorkflowNode } from "../../mock-data/workflow";
import { triggerTypes } from "../../mock-data/workflow";
import type { NodeActivity } from "../../mock-data/runs";
import DropdownMenu from "../DropdownMenu";
import type { DropdownMenuItem } from "../DropdownMenu";
import SystemPill from "../SystemPill";
import { adaptorInfo } from "../../mock-data/adaptor-reference";
import { TriggerIcon } from "./AdaptorIcon";
import StatusPill from "./StatusPill";
import RunCountBadge from "./RunCountBadge";
import IconButton from "../IconButton";
import Surface from "../Surface";

/** The card's size, exported so the canvas can place it and anchor edges to it. */
export const NODE_WIDTH = 280;
export const NODE_HEIGHT = 94;

/** What the card's ⋮ menu can do. */
export type NodeAction = "run" | "edit" | "improve" | "delete";

/**
 * A node on the workflow canvas: a card with the step's adaptor (or the
 * trigger's kind) as a pill in its head, the step's name in bold, and a ⋮ menu of actions: run from here, edit
 * (which opens the inspector), improve (which opens the assistant about this
 * step) and delete. Clicking the card selects it; selecting toggles a indigo
 * ring.
 *
 * The slot before the menu shows the run history (`activity`: how many runs
 * reached the node and how many failed there) or, while a run is loaded, the
 * step's status and duration. Nodes the loaded run never reached are dimmed.
 *
 * With `onAddAfter`, hovering the card (or tabbing to it) shows a + on its
 * bottom edge that adds a step after it.
 */
export default function WorkflowNodeCard({
  node,
  selected = false,
  onClick,
  onAction,
  readOnly = false,
  menuPlacement = "beside",
  step,
  dimmed = false,
  activity,
  onShowFailures,
  note,
  onAddAfter,
}: {
  node: WorkflowNode;
  selected?: boolean;
  onClick?: (node: WorkflowNode) => void;
  /** An item picked from the ⋮ menu. Without it the card has no menu. */
  onAction?: (node: WorkflowNode, action: NodeAction) => void;
  /** On main nothing can be deleted. */
  readOnly?: boolean;
  /** Where the ⋮ menu opens: beside the card (the default) or under the button when there's no room to the right. */
  menuPlacement?: "beside" | "below";
  /** This job's step in the run shown on the canvas. */
  step?: RunStep;
  /** The run shown on the canvas didn't reach this node. */
  dimmed?: boolean;
  /** The node's share of the run history, shown while no run is loaded. */
  activity?: NodeActivity;
  /** Opens the runs that failed at this node. */
  onShowFailures?: () => void;
  /** Extra line under the name, e.g. "Started by webhook trigger". */
  note?: string;
  /** Adds a step after this node, from the + on its bottom edge. Without it there's no +. */
  onAddAfter?: (node: WorkflowNode) => void;
}) {
  const job = node.type === "job" ? node : undefined;

  const ringClasses = selected
    ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-50"
    : step?.status === "failed"
      ? "ring-2 ring-red-300"
      : step?.status === "running"
        ? "ring-2 ring-indigo-300"
        : "hover:ring-2 hover:ring-gray-200";

  const items: DropdownMenuItem[] = [
    { id: "run", label: job ? "Run from here" : "Run workflow", icon: Play },
    { id: "edit", label: "Edit", icon: Maximize2 },
    ...(job ? [{ id: "improve", label: "Improve", icon: Sparkles }] : []),
    ...(job ? [{ id: "delete", label: "Delete", icon: Trash2, tone: "danger" as const, disabled: readOnly }] : []),
  ];

  return (
    <Surface
      className={`group relative transition-[opacity,box-shadow] ${ringClasses} ${
        dimmed ? "opacity-40 hover:opacity-70" : ""
      }`}
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
    >
      {/* The click target sits under the content so the menu can be a button of its own. */}
      <button
        type="button"
        onClick={() => onClick?.(node)}
        aria-label={`${selected ? "Deselect" : "Select"} ${node.label}`}
        aria-pressed={selected}
        className="absolute inset-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      />

      <div className="pointer-events-none relative flex h-full flex-col p-3">
        <div className="flex h-7 items-center gap-2">
          {node.type === "job" ? (
            <SystemPill name={adaptorInfo[node.adaptor].name} adaptor={node.adaptor} size="sm" />
          ) : (
            <SystemPill
              name={triggerTypes[node.triggerType].label}
              size="sm"
              icon={<TriggerIcon triggerType={node.triggerType} size="xs" />}
            />
          )}
          <span className="pointer-events-auto ml-auto flex items-center gap-1">
            {step ? (
              <StatusPill status={step.status} variant="icon" detail={step.duration || undefined} />
            ) : activity ? (
              <RunCountBadge activity={activity} onShowFailures={onShowFailures} />
            ) : null}
            {onAction && (
              <DropdownMenu
                ariaLabel={`Actions for ${node.label}`}
                placement={menuPlacement}
                align="right"
                widthClass="w-48"
                items={items}
                onSelect={(id) => onAction(node, id as NodeAction)}
                trigger={({ open, toggle }) => (
                  <IconButton
                    icon={MoreVertical}
                    label="More actions"
                    onClick={toggle}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    active={open}
                  />
                )}
              />
            )}
          </span>
        </div>

        <p
          className={`mt-1.5 text-sm leading-[18px] font-semibold text-gray-900 ${note ? "truncate" : "line-clamp-2"}`}
          title={node.label}
        >
          {node.label}
        </p>
        {note && <span className="mt-1 block truncate text-[11px] text-gray-400">{note}</span>}
      </div>

      {onAddAfter && (
        <button
          type="button"
          onClick={() => onAddAfter(node)}
          aria-label={`Add a step after ${node.label}`}
          title="Add a step"
          className="absolute -bottom-3 left-1/2 inline-flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-md bg-indigo-600 text-white opacity-0 shadow-sm transition-opacity hover:bg-indigo-700 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 group-hover:opacity-100"
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      )}
    </Surface>
  );
}
