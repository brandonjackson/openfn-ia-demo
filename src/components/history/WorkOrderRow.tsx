import { useState } from "react";
import { Link } from "react-router-dom";
import { Td, Tr } from "../Table";
import type { WorkOrder } from "../../mock-data/history";
import {
  activeStates,
  lastRunOf,
  runsOfWorkOrder,
  workOrderDataclipAvailable,
} from "../../mock-data/history-extra";
import DateTime from "./DateTime";
import StatePill from "./StatePill";
import UuidChip from "./UuidChip";
import { RunCard } from "./RunDetails";
import { formatElapsed } from "./format";

const zeroPersistence =
  "This work order cannot be rerun since no input data has been stored due to the data retention policy set in the project.";

/**
 * A work order row in History plus, when expanded, its runs and steps
 * (run_live/workorder_component.ex). Clicking the row toggles the details.
 */
export default function WorkOrderRow({
  workOrder,
  projectId,
  selected = false,
  onSelect,
  canRunWorkflow = true,
  defaultExpanded = false,
}: {
  workOrder: WorkOrder;
  projectId: string;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  canRunWorkflow?: boolean;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showPrevious, setShowPrevious] = useState(false);
  const runs = runsOfWorkOrder(workOrder);
  const lastRun = lastRunOf(workOrder);
  const available = workOrderDataclipAvailable(workOrder);
  const wo = workOrder;

  return (
    <>
      <Tr
        id={`toggle_details_for_${wo.id}`}
        className={selected ? "bg-gray-50" : "bg-white"}
        onClick={runs.length ? () => setExpanded((e) => !e) : undefined}
      >
        <Td className="!pr-1">
          <span onClick={(e) => e.stopPropagation()} title={available ? undefined : zeroPersistence}>
            <input
              type="checkbox"
              className={
                available
                  ? "left-4 top-1/2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  : "left-4 top-1/2 h-4 w-4 rounded border-gray-300 bg-gray-100 text-indigo-600 focus:ring-indigo-600"
              }
              checked={selected}
              disabled={!available}
              onChange={(e) => onSelect?.(e.target.checked)}
            />
          </span>
        </Td>
        <Td>
          <span className="mt-2 text-gray-700">
            <UuidChip id={wo.id} to={`/projects/${projectId}/history?filters[workorder_id]=${wo.id}`} />
          </span>
        </Td>
        <Td>
          {lastRun ? (
            <Link
              to={`/projects/${projectId}/w/${wo.workflowId}?run=${lastRun.id}`}
              className="inline-block"
              onClick={(e) => e.stopPropagation()}
              title={`${wo.workflowName}\nClick to view`}
            >
              <span
                className="truncate text-gray-900 workflow-name hover:text-primary-600 cursor-pointer block max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {wo.workflowName}
              </span>
            </Link>
          ) : (
            <span
              title={wo.workflowName}
              className="truncate text-gray-900 workflow-name block max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {wo.workflowName}
            </span>
          )}
        </Td>
        <Td>
          <UuidChip
            id={wo.dataclipId}
            to={`/projects/${projectId}/dataclips/${wo.dataclipId}/show`}
            disabled={!available}
            tooltip={available ? undefined : "The input dataclip is unavailable due to this project's data retention policy."}
          />
        </Td>
        <Td>
          <DateTime value={wo.insertedAt} />
        </Td>
        <Td>
          <DateTime value={wo.lastActivity} />
        </Td>
        <Td className="text-right w-28">{lastRun && formatElapsed(lastRun.startedAt, lastRun.finishedAt)}</Td>
        <Td className="text-right w-32">
          <div className="flex items-center justify-end gap-2">
            <StatePill state={wo.state} />
          </div>
        </Td>
        <Td className="text-right w-20">
          {runs.length > 0 && (
            <div className="flex items-center justify-end gap-2 pr-2 -mr-3">
              {wo.state === "pending" && canRunWorkflow && (
                <button
                  type="button"
                  title="Cancel pending run"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center p-1 text-xs font-medium text-gray-600 hover:text-red-500 cursor-pointer rounded"
                >
                  <span className="hero-x-mark-mini h-4 w-4" />
                </button>
              )}
              {!activeStates.includes(wo.state) &&
                (available && canRunWorkflow ? (
                  <button
                    type="button"
                    title="Retry (run from the start)"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center p-1 text-xs font-medium text-gray-600 hover:text-primary-400 cursor-pointer rounded"
                  >
                    <span className="hero-arrow-path-mini h-4 w-4" />
                  </button>
                ) : (
                  <span
                    title={canRunWorkflow ? zeroPersistence : "You are not authorized to start runs for this project."}
                    className="inline-flex items-center p-1 text-xs font-medium text-gray-400 cursor-not-allowed rounded"
                  >
                    <span className="hero-arrow-path-mini h-4 w-4" />
                  </span>
                ))}
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {runs.length}
              </span>
              <span className={`${expanded ? "hero-chevron-up" : "hero-chevron-down"} size-4 text-gray-400`} />
            </div>
          )}
        </Td>
      </Tr>
      {expanded && (
        <Tr>
          <Td colSpan={9} className="!p-0">
            <div className="bg-gray-100 p-3 flex flex-col gap-3">
              {runs.map((run, i) => {
                const index = runs.length - i;
                if (index !== runs.length && !showPrevious) return null;
                return (
                  <RunCard
                    key={run.id}
                    run={run}
                    index={index}
                    total={runs.length}
                    showPrevious={showPrevious}
                    onTogglePrevious={() => setShowPrevious((s) => !s)}
                    projectId={projectId}
                    workflowId={wo.workflowId}
                    canRunWorkflow={canRunWorkflow}
                  />
                );
              })}
            </div>
          </Td>
        </Tr>
      )}
    </>
  );
}
