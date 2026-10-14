import { useState } from "react";
import { Link } from "react-router-dom";
import type { Run, WorkOrder } from "../../mock-data/history";
import { cn } from "../../utils/cn";
import RunBadge from "./RunBadge";
import { linkUuidClasses, shortId } from "./editorClasses";
import { duration, formatRelative } from "./formatTime";

const CHIP_STYLES: Record<string, string> = {
  rejected: "bg-red-300 text-gray-800",
  pending: "bg-gray-200 text-gray-800",
  running: "bg-blue-200 text-blue-800",
  available: "bg-gray-200 text-gray-800",
  claimed: "bg-blue-200 text-blue-800",
  started: "bg-blue-200 text-blue-800",
  success: "bg-green-200 text-green-800",
  failed: "bg-red-200 text-red-800",
  crashed: "bg-orange-200 text-orange-800",
  cancelled: "bg-gray-500 text-gray-800",
  killed: "bg-yellow-200 text-yellow-800",
  exception: "bg-gray-800 text-white",
  lost: "bg-gray-800 text-white",
};

function MiniStatePill({ state }: { state: string }) {
  return (
    <span
      className={cn(
        "my-auto whitespace-nowrap rounded-full text-center align-baseline font-medium leading-none py-1 px-2 text-[10px]",
        CHIP_STYLES[state] ?? CHIP_STYLES.pending
      )}
    >
      {state.charAt(0).toUpperCase() + state.slice(1)}
    </span>
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
  const now = new Date();
  const historyHref = `/projects/${projectId}/history?filters[workflow_id]=${workflowId}`;

  const list =
    history.length === 0 ? (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <span className="hero-rectangle-stack w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">No related history</p>
        <p className="text-xs text-gray-400 mt-1">Why not run it a few times to see some history?</p>
      </div>
    ) : (
      <div className="divide-y divide-gray-100">
        {history.map(({ workOrder, runs }) => {
          const selected = runs.some((r) => r.id === selectedRunId);
          const isExpanded = expanded === workOrder.id;
          const expand = () => {
            if (!isExpanded && runs.length === 1) onSelectRun(runs[0].id);
            setExpanded((p) => (p === workOrder.id ? "" : workOrder.id));
          };
          return (
            <div key={workOrder.id}>
              <div className="px-3 py-2 hover:bg-gray-50 transition-colors">
                <div
                  className="flex items-center justify-between cursor-pointer w-full text-left"
                  data-testid={`work-order-${workOrder.id}`}
                  onClick={expand}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        expand();
                      }}
                      className="flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} work order details`}
                    >
                      <span
                        className={cn(
                          "w-4 h-4",
                          selected
                            ? "hero-chevron-down font-bold text-indigo-600"
                            : isExpanded
                              ? "hero-chevron-down"
                              : "hero-chevron-right"
                        )}
                      />
                    </button>
                    <Link
                      to={`/projects/${projectId}/history?filters[workorder_id]=${workOrder.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className={linkUuidClasses}
                      title={workOrder.id}
                    >
                      {shortId(workOrder.id)}
                    </Link>
                    <span className="text-xs text-gray-800">&bull;</span>
                    <span className="text-xs text-gray-500">{formatRelative(workOrder.lastActivity, now)}</span>
                  </div>
                  <MiniStatePill state={workOrder.state} />
                </div>
              </div>
              {(isExpanded || selected) &&
                runs.map((run) => {
                  const runSelected = run.id === selectedRunId;
                  return (
                    <div
                      key={run.id}
                      className={cn(
                        "px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors cursor-pointer border-l-2 w-full text-left",
                        runSelected ? "bg-indigo-50 border-l-indigo-500" : "border-l-transparent"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (runSelected) onDeselectRun();
                        else onSelectRun(run.id);
                      }}
                    >
                      <div className="flex items-center justify-between w-full mr-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {runSelected ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeselectRun();
                              }}
                              className="flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                              aria-label="Deselect run"
                            >
                              <span className="hero-x-mark w-4 h-4" />
                            </button>
                          ) : (
                            <span className="w-4 h-4 invisible" />
                          )}
                          <Link
                            to={`/projects/${projectId}/runs/${run.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className={linkUuidClasses}
                            title={run.id}
                          >
                            {shortId(run.id)}
                          </Link>
                          {(run.startedAt || run.finishedAt) && (
                            <>
                              <span className="text-xs text-gray-800">&bull;</span>
                              {formatRelative((run.startedAt || run.finishedAt) as string, now)}
                            </>
                          )}
                          {run.startedAt && run.finishedAt && (
                            <>
                              <span className="text-xs text-gray-800">&bull;</span>
                              <span className="text-gray-400 text-xs">{duration(run.startedAt, run.finishedAt)}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <MiniStatePill state={run.state} />
                        </div>
                      </div>
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
      <div className="flex flex-col h-full bg-white" data-annotation="workflow-editor-versions-and-promote">
        <div className="flex items-center px-3 py-2 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mr-1">Run History</h3>
          <Link to={historyHref} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="View full history for this workflow">
            <span className="hero-rectangle-stack w-4 h-4" />
          </Link>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onBack}
            className="p-1 mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            aria-label="Back to landing"
          >
            <span className="hero-x-mark w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{list}</div>
      </div>
    );
  }

  const selectedRun = history.flatMap((h) => h.runs).find((r) => r.id === selectedRunId);

  return (
    <div
      className="absolute left-4 top-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden z-40 transition-all duration-300 ease-in-out"
      data-annotation="workflow-editor-versions-and-promote"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        title="⌘ H"
        className={cn(
          "flex items-center cursor-pointer justify-between px-3 py-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors w-full text-left",
          collapsed ? "border-b-0" : "border-b"
        )}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700">{collapsed ? "View History" : "Recent History"}</h3>
          <Link
            id="view-history"
            to={historyHref}
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-gray-600 transition-colors flex items-center"
            aria-label="View full history for this workflow"
          >
            <span className="hero-rectangle-stack w-4 h-4" />
          </Link>
        </div>
        <div className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer ml-3">
          <span className={cn("w-4 h-4", collapsed ? "hero-chevron-right" : "hero-chevron-left")} />
        </div>
      </div>
      {collapsed && selectedRun && (
        <div className="px-3 py-2 border-t border-gray-200">
          <RunBadge runId={selectedRun.id} onClose={onDeselectRun} />
        </div>
      )}
      {!collapsed && <div className="overflow-y-auto no-scrollbar max-h-82">{list}</div>}
    </div>
  );
}

