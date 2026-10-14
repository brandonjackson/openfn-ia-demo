import { useState } from "react";
import { Link } from "react-router-dom";
import type { Dataclip, LogLine, Run, Step } from "../../mock-data/history";
import { cn } from "../../utils/cn";
import CodeEditor from "./CodeEditor";
import { linkUuidClasses } from "./editorClasses";
import StatePill from "../history/StatePill";

export type RunViewerTab = "log" | "input" | "output";

const STEP_ICONS: Record<string, [string, string]> = {
  success: ["hero-check-circle-solid", "text-green-500"],
  fail: ["hero-x-circle-solid", "text-red-500"],
  crash: ["hero-x-circle-solid", "text-orange-800"],
};

function elapsed(from: string | null, to: string | null): string {
  if (!from) return "Not started";
  const ms = (to ? new Date(to).getTime() : Date.now()) - new Date(from).getTime();
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${Math.floor(ms / 1000)} s`;
  return `${Math.floor(ms / 60000)} m`;
}

const LEVELS = ["debug", "info", "warn", "error"] as const;

interface Props {
  projectId: string;
  run: Run;
  steps: Step[];
  logs: LogLine[];
  dataclips: Dataclip[];
  selectedStepId: string | null;
  onSelectStep: (step: Step) => void;
  activeTab: RunViewerTab;
  /** Fades the panel when the job in the IDE wasn't part of this run. */
  mismatch?: boolean;
}

/**
 * The run viewer in the IDE's right panel (run-viewer/RunViewerPanel.tsx):
 * run metadata and the steps it executed on top, then the Logs, Input or
 * Output of the selected step below.
 */
export default function RunViewerPanel({ projectId, run, steps, logs, dataclips, selectedStepId, onSelectStep, activeTab, mismatch = false }: Props) {
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("info");
  const [levelOpen, setLevelOpen] = useState(false);
  const step = steps.find((s) => s.id === selectedStepId) ?? null;
  const clip = (id: string | null | undefined) => dataclips.find((d) => d.id === id);
  const visibleLogs = logs.filter((l) => LEVELS.indexOf(l.level) >= LEVELS.indexOf(level));

  const dataView = (id: string | null | undefined, emptyFinished: string) => {
    if (!step) return <div className="flex items-center justify-center h-full text-gray-500">Select a step to view {activeTab} data</div>;
    const d = clip(id);
    if (!id || !d) return <div className="text-center p-12 text-gray-500">{emptyFinished}</div>;
    if (d.wiped) return <div className="text-center p-12 text-gray-500">This dataclip has been wiped by the project's data retention policy.</div>;
    return <CodeEditor value={JSON.stringify(d.body, null, 2)} readOnly ariaLabel={`${activeTab} dataclip`} />;
  };

  return (
    <div className={cn("flex flex-col h-full", mismatch && "opacity-50")} data-annotation="workflow-editor-run-viewer">
      <div className="flex h-[40%] min-h-[10rem] max-h-72 border-b-4 border-gray-200">
        <div className="w-1/2 h-full overflow-auto border-r border-gray-200 p-4">
          <dl className="space-y-3">
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="font-medium text-gray-600">Work Order</dt>
              <dd>
                <Link to={`/projects/${projectId}/history?filters[workorder_id]=${run.workOrderId}`} className={linkUuidClasses} title={`View work order ${run.workOrderId}`}>
                  {run.workOrderId.slice(0, 8)}
                </Link>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="font-medium text-gray-600">Run</dt>
              <dd>
                <Link to={`/projects/${projectId}/runs/${run.id}`} className={linkUuidClasses} title={`View run ${run.id}`}>
                  {run.id.slice(0, 8)}
                </Link>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="font-medium text-gray-600">Status</dt>
              <dd>
                <StatePill state={run.state} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="font-medium text-gray-600">Duration</dt>
              <dd className="text-gray-900">{elapsed(run.startedAt, run.finishedAt)}</dd>
            </div>
            {run.startedAt && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <dt className="font-medium text-gray-600">Started</dt>
                <dd className="text-gray-900">{new Date(run.startedAt).toLocaleString()}</dd>
              </div>
            )}
            {(run.createdBy || run.startingTrigger) && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <dt className="font-medium text-gray-600">Started by</dt>
                <dd className="text-right text-gray-900">{run.createdBy ? "editor@openfn.org" : `${run.startingTrigger?.toLowerCase()} trigger`}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="w-1/2 h-full overflow-auto p-4">
          <p className="mb-3 flex items-center gap-1 text-sm font-medium text-gray-600">
            Run Steps
            <span
              className="hero-information-circle h-4 w-4 text-gray-400"
              title="This run may not have executed all steps in the workflow. Only the steps that were executed in this specific run are shown here."
            />
          </p>
          {steps.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No steps yet</div>
          ) : (
            <ul aria-label="Execution steps" className="space-y-2">
              {steps.map((s) => {
                const [icon, color] = s.exitReason ? STEP_ICONS[s.exitReason] : ["hero-ellipsis-horizontal-circle-solid", "text-gray-400"];
                const selected = s.id === selectedStepId;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onSelectStep(s)}
                      className={cn(
                        "relative flex items-center space-x-3 p-2 rounded w-full text-left cursor-pointer border-r-4 transition-colors",
                        selected ? "border-primary-500 bg-primary-50 font-semibold" : "border-transparent hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <span className={`${icon} h-5 w-5 flex-shrink-0 ${color}`} />
                      <div className="flex-1 min-w-0 flex items-center space-x-2">
                        <span className="text-sm truncate">{s.jobName}</span>
                      </div>
                      <div className="flex-shrink-0 text-xs text-gray-500">{elapsed(s.startedAt, s.finishedAt)}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {activeTab === "log" && (
          <div className="grid h-full grid-rows-[auto_1fr] bg-slate-700 font-mono text-gray-200">
            <div className="border-b border-slate-500">
              <div className="mx-auto px-2">
                <div className="flex h-6 flex-row-reverse items-center">
                  <div className="relative z-50">
                    <button
                      type="button"
                      onClick={() => setLevelOpen((o) => !o)}
                      className="grid w-full cursor-pointer grid-cols-1 bg-inherit text-left text-xs text-inherit opacity-75 hover:opacity-100"
                    >
                      <span className="col-start-1 row-start-1 truncate pr-6 flex items-center gap-1">
                        <span className="hero-adjustments-vertical size-4" />
                        {level}
                      </span>
                      <span className="hero-chevron-down col-start-1 row-start-1 size-4 self-center justify-self-end" />
                    </button>
                    {levelOpen && (
                      <div className="absolute right-0 z-10 mt-1 max-h-60 min-w-full w-max overflow-auto rounded-md bg-slate-600 py-1 shadow-lg ring-1 ring-black/5 text-sm">
                        {LEVELS.map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => {
                              setLevel(l);
                              setLevelOpen(false);
                            }}
                            className="relative block w-full text-left cursor-default select-none py-2 pl-8 pr-4 hover:bg-slate-500"
                          >
                            <span className={l === level ? "font-semibold" : "font-normal"}>{l}</span>
                            {l === level && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-1.5">
                                <span className="hero-check size-5" />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="relative min-h-0 overflow-auto p-2 text-sm leading-[19px]">
              {visibleLogs.length === 0 ? (
                <div className="p-2 text-gray-400">No logs were received for this run.</div>
              ) : (
                visibleLogs.map((l, i) => (
                  <div
                    key={i}
                    className={cn("whitespace-pre-wrap", step && l.stepId && l.stepId !== step.id && "opacity-40", l.level === "error" && "text-red-300")}
                  >
                    <span className="text-slate-400">{l.source.padEnd(4)}</span> {l.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {activeTab === "input" && dataView(step?.inputDataclipId, "No input state could be saved for this run.")}
        {activeTab === "output" && dataView(step?.outputDataclipId, "No output state could be saved for this run.")}
      </div>
    </div>
  );
}
