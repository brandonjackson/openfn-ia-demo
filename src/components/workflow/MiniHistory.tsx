import { useState } from "react";
import type { Run, WorkOrder } from "../../types/history";
import { cn } from "../../utils/cn";
import Card from "../Card";
import DateTime from "../DateTime";
import Heading from "../Heading";
import IconButton from "../IconButton";
import UuidChip from "../UuidChip";
import StatePill from "../history/StatePill";
import RunBadge from "./RunBadge";
import { formatDuration, uuidOf } from "../../utils/format";

const Dot = () => <span className="text-gray-800">&bull;</span>;

/** The stack icon linking to the workflow's full history. */
function FullHistoryLink({ to, id }: { to: string; id?: string }) {
  return (
    <IconButton
      id={id}
      to={to}
      icon="hero-rectangle-stack"
      label="View full history for this workflow"
      size="sm"
      onClick={(e) => e.stopPropagation()}
    />
  );
}

export interface HistoryWorkOrder {
  workOrder: WorkOrder;
  runs: Run[];
}

interface Props {
  projectId: string;
  workflowId: string;
  collapsed: boolean;
  onToggle: () => void;
  history: HistoryWorkOrder[];
  selectedRunId: string | null;
  onSelectRun: (runId: string) => void;
  onDeselectRun: () => void;
  /** `floating` sits on the canvas; `panel` fills the IDE's right panel. */
  variant?: "floating" | "panel";
  onBack?: () => void;
}

/**
 * The run history card on the canvas (collaborative-editor/components/
 * diagram/MiniHistory.tsx, classic rows): "View History" when collapsed,
 * "Recent History" with work orders and their runs when open. Selecting a
 * run shows it on the canvas.
 */
export default function MiniHistory({
  projectId,
  workflowId,
  collapsed,
  onToggle,
  history,
  selectedRunId,
  onSelectRun,
  onDeselectRun,
  variant = "floating",
  onBack,
}: Props) {
  const [expanded, setExpanded] = useState("");
  const historyHref = `/projects/${projectId}/history?filters[workflow_id]=${workflowId}`;

  const list =
    history.length === 0 ? (
      <div className="flex flex-col items-center p-8 text-center text-gray-500">
        <span className="hero-rectangle-stack mb-2 h-8 w-8 opacity-50" />
        <p className="text-sm font-medium">No related history</p>
        <p className="mt-1 text-xs text-gray-400">Why not run it a few times to see some history?</p>
      </div>
    ) : (
      <div className="divide-y divide-gray-100 text-xs">
        {history.map(({ workOrder, runs }) => {
          const selected = runs.some((r) => r.id === selectedRunId);
          const isExpanded = expanded === workOrder.id;
          const expand = () => {
            if (!isExpanded && runs.length === 1) onSelectRun(runs[0].id);
            setExpanded((p) => (p === workOrder.id ? "" : workOrder.id));
          };
          return (
            <div key={workOrder.id}>
              <div
                className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50"
                data-testid={`work-order-${workOrder.id}`}
                onClick={expand}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <IconButton
                    icon={selected || isExpanded ? "hero-chevron-down" : "hero-chevron-right"}
                    label={`${isExpanded ? "Collapse" : "Expand"} work order details`}
                    size="sm"
                    className={cn(selected && "text-primary-600")}
                    onClick={(e) => {
                      e.stopPropagation();
                      expand();
                    }}
                  />
                  <UuidChip
                    uuid={uuidOf(workOrder.id)}
                    length={7}
                    to={`/projects/${projectId}/history?filters[workorder_id]=${workOrder.id}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Dot />
                  <DateTime value={workOrder.lastActivity} className="text-gray-500" />
                </div>
                <StatePill labelMode="raw" state={workOrder.state} />
              </div>
              {(isExpanded || selected) &&
                runs.map((run) => {
                  const runSelected = run.id === selectedRunId;
                  return (
                    <div
                      key={run.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-2 border-l-2 px-3 py-1.5 hover:bg-gray-50",
                        runSelected ? "border-l-primary-500 bg-primary-50" : "border-l-transparent"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (runSelected) onDeselectRun();
                        else onSelectRun(run.id);
                      }}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        {runSelected ? (
                          <IconButton
                            icon="hero-x-mark"
                            label="Deselect run"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeselectRun();
                            }}
                          />
                        ) : (
                          <span className="invisible h-5 w-5" />
                        )}
                        <UuidChip
                          uuid={uuidOf(run.id)}
                          length={7}
                          to={`/projects/${projectId}/runs/${run.id}`}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {(run.startedAt || run.finishedAt) && (
                          <>
                            <Dot />
                            <DateTime value={run.startedAt || run.finishedAt} />
                          </>
                        )}
                        {run.startedAt && run.finishedAt && (
                          <>
                            <Dot />
                            <span className="text-gray-400">{formatDuration(run.startedAt, run.finishedAt)}</span>
                          </>
                        )}
                      </div>
                      <StatePill labelMode="raw" state={run.state} />
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    );

  if (variant === "panel") {
    return (
      <div className="flex h-full flex-col bg-white" data-annotation="workflow-editor-versions-and-promote">
        <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-3 py-2">
          <Heading size="sm">Run History</Heading>
          <FullHistoryLink to={historyHref} />
          <IconButton icon="hero-x-mark" label="Back to landing" size="sm" className="ml-auto mr-2" onClick={onBack} />
        </div>
        <div className="flex-1 overflow-y-auto">{list}</div>
      </div>
    );
  }

  const selectedRun = history.flatMap((h) => h.runs).find((r) => r.id === selectedRunId);

  return (
    <Card
      padding="none"
      className="absolute left-4 top-6 z-40 overflow-hidden"
      data-annotation="workflow-editor-versions-and-promote"
      onPointerDown={(e) => e.stopPropagation()}
    >
        <div
          title="⌘ H"
          className={cn(
            "flex cursor-pointer items-center justify-between gap-3 border-gray-200 bg-gray-50 px-3 py-2 text-gray-400 hover:bg-gray-100",
            !collapsed && "border-b"
          )}
          onClick={onToggle}
        >
          <div className="flex items-center gap-2">
            <Heading size="sm">{collapsed ? "View History" : "Recent History"}</Heading>
            <FullHistoryLink id="view-history" to={historyHref} />
          </div>
          <span className={cn("h-4 w-4", collapsed ? "hero-chevron-right" : "hero-chevron-left")} />
        </div>
        {collapsed && selectedRun && (
          <div className="border-t border-gray-200 px-3 py-2">
            <RunBadge runId={selectedRun.id} onClose={onDeselectRun} />
          </div>
        )}
        {!collapsed && <div className="no-scrollbar max-h-82 overflow-y-auto">{list}</div>}
    </Card>
  );
}
