import { useState } from "react";
import IconButton from "../IconButton";
import { Checkbox } from "../Inputs";
import Pill from "../Pill";
import { Td, Tr } from "../Table";
import type { HistoryWorkOrder } from "../../types/history";
import { activeStates } from "../../constants";
import { formatElapsed, uuidOf } from "../../utils/format";
import DateTime from "../DateTime";
import TextLink from "../TextLink";
import StatePill from "./StatePill";
import UuidChip from "../UuidChip";
import { RunCard } from "./RunDetails";
import { cn } from "../../utils/cn";
import { zeroPersistenceMessage as zeroPersistence } from "./runHelpers";

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
  workOrder: HistoryWorkOrder;
  projectId: string;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  canRunWorkflow?: boolean;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showPrevious, setShowPrevious] = useState(false);
  const runs = workOrder.runs;
  const lastRun = runs[0];
  const available = !workOrder.dataclipWiped;
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
          <UuidChip uuid={uuidOf(wo.id)} to={`/projects/${projectId}/history?filters[workorder_id]=${wo.id}`} />
        </Td>
        <Td>
          {lastRun ? (
            <TextLink
              to={`/projects/${projectId}/w/${wo.workflowId}?run=${lastRun.id}`}
              variant="plain"
              className="workflow-name block max-w-50 truncate text-gray-900 hover:text-primary-600"
              title={`${wo.workflowName}\nClick to view`}
            >
              {wo.workflowName}
            </TextLink>
          ) : (
            <span title={wo.workflowName} className="workflow-name block max-w-50 truncate text-gray-900">
              {wo.workflowName}
            </span>
          )}
        </Td>
        <Td>
          <UuidChip
            uuid={uuidOf(wo.dataclipId)}
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
        <Td align="right" className="w-28">{lastRun && formatElapsed(lastRun.startedAt, lastRun.finishedAt)}</Td>
        <Td align="right" className="w-32">
          <StatePill state={wo.state} />
        </Td>
        <Td actions className="w-20">
          {runs.length > 0 && (
            <>
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
            </>
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
