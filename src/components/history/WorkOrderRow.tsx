import { useState } from "react";
import { Link } from "react-router-dom";
import IconButton from "../IconButton";
import { Checkbox } from "../Inputs";
import Pill from "../Pill";
import { Td, Tr } from "../Table";
import type { WorkOrder } from "../../mock-data/history";
import {
  activeStates,
  lastRunOf,
  runsOfWorkOrder,
  workOrderDataclipAvailable,
} from "../../mock-data/history-extra";
import DateTime from "../DateTime";
import StatePill from "./StatePill";
import UuidChip from "./UuidChip";
import { RunCard } from "./RunDetails";
import { cn } from "../../utils/cn";
import { formatElapsed } from "../../utils/format";

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
          <span title={available ? undefined : zeroPersistence}>
            <Checkbox
              label={<span className="sr-only">Select work order</span>}
              className="disabled:bg-gray-100"
              checked={selected}
              disabled={!available}
              onChange={(e) => onSelect?.(e.target.checked)}
            />
          </span>
        </Td>
        <Td>
          <UuidChip id={wo.id} to={`/projects/${projectId}/history?filters[workorder_id]=${wo.id}`} />
        </Td>
        <Td>
          {lastRun ? (
            <Link
              to={`/projects/${projectId}/w/${wo.workflowId}?run=${lastRun.id}`}
              className="workflow-name block max-w-50 truncate text-gray-900 hover:text-primary-600"
              title={`${wo.workflowName}\nClick to view`}
            >
              {wo.workflowName}
            </Link>
          ) : (
            <span title={wo.workflowName} className="workflow-name block max-w-50 truncate text-gray-900">
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
        <Td className="w-32 text-right">
          <StatePill state={wo.state} />
        </Td>
        <Td className="text-right w-20">
          {runs.length > 0 && (
            <div className="flex items-center justify-end gap-2 pr-2 -mr-3">
              {wo.state === "pending" && canRunWorkflow && (
                <IconButton
                  icon="hero-x-mark-mini"
                  label="Cancel pending run"
                  size="sm"
                  className="hover:text-red-500"
                />
              )}
              {!activeStates.includes(wo.state) &&
                (available && canRunWorkflow ? (
                  <IconButton
                    icon="hero-arrow-path-mini"
                    label="Retry (run from the start)"
                    size="sm"
                    className="hover:text-primary-400"
                  />
                ) : (
                  <IconButton
                    icon="hero-arrow-path-mini"
                    label={canRunWorkflow ? zeroPersistence : "You are not authorized to start runs for this project."}
                    size="sm"
                    disabled
                  />
                ))}
              <Pill>{runs.length}</Pill>
              <span className={cn(expanded ? "hero-chevron-up" : "hero-chevron-down", "size-4 text-gray-400")} />
            </div>
          )}
        </Td>
      </Tr>
      {expanded && (
        <Tr>
          <Td colSpan={9} className="!p-0">
            <div className="flex flex-col gap-3 bg-gray-100 p-3">
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
