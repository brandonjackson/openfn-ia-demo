import { useState } from "react";
import { Link } from "react-router-dom";
import type { Dataclip, LogLine, Run, Step } from "../../mock-data/history";
import { cn } from "../../utils/cn";
import { formatElapsed, formatLocalDateTime, shortUuid } from "../../utils/format";
import CodeEditor from "./CodeEditor";
import StatePill from "../history/StatePill";
import { LogLevelFilter, type LogLevel } from "../history/LogViewer";
import { logsAtLevel } from "../../mock-data/history-extra";
import { DetailItem, DetailList } from "../DetailList";
import Heading from "../Heading";
import InfoTooltip from "../InfoTooltip";

export type RunViewerTab = "log" | "input" | "output";

const STEP_ICONS: Record<string, [string, string]> = {
  success: ["hero-check-circle-solid", "text-green-500"],
  fail: ["hero-x-circle-solid", "text-red-500"],
  crash: ["hero-x-circle-solid", "text-orange-800"],
};

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
  const [level, setLevel] = useState<LogLevel>("info");
  const step = steps.find((s) => s.id === selectedStepId) ?? null;
  const clip = (id: string | null | undefined) => dataclips.find((d) => d.id === id);
  const visibleLogs = logsAtLevel(logs, level);

  const empty = (text: string) => <p className="flex h-full items-center justify-center p-12 text-center text-gray-500">{text}</p>;
  const dataView = (id: string | null | undefined, emptyFinished: string) => {
    if (!step) return empty(`Select a step to view ${activeTab} data`);
    const d = clip(id);
    if (!id || !d) return empty(emptyFinished);
    if (d.wiped) return empty("This dataclip has been wiped by the project's data retention policy.");
    return <CodeEditor value={JSON.stringify(d.body, null, 2)} readOnly ariaLabel={`${activeTab} dataclip`} />;
  };

  return (
    <div className={cn("flex h-full flex-col", mismatch && "opacity-50")} data-annotation="workflow-editor-run-viewer">
      <div className="flex h-2/5 max-h-72 min-h-40 border-b-4 border-gray-200 *:w-1/2 *:overflow-auto *:p-4">
        <div className="border-r border-gray-200">
          <DetailList>
            <DetailItem label="Work Order">
              <Link to={`/projects/${projectId}/history?filters[workorder_id]=${run.workOrderId}`} className="link-uuid" title={`View work order ${run.workOrderId}`}>
                {shortUuid(run.workOrderId)}
              </Link>
            </DetailItem>
            <DetailItem label="Run">
              <Link to={`/projects/${projectId}/runs/${run.id}`} className="link-uuid" title={`View run ${run.id}`}>
                {shortUuid(run.id)}
              </Link>
            </DetailItem>
            <DetailItem label="Status">
              <StatePill state={run.state} />
            </DetailItem>
            <DetailItem label="Duration">{formatElapsed(run.startedAt, run.finishedAt)}</DetailItem>
            {run.startedAt && <DetailItem label="Started">{formatLocalDateTime(run.startedAt)}</DetailItem>}
            {(run.createdBy || run.startingTrigger) && (
              <DetailItem label="Started by">{run.createdBy ? "editor@openfn.org" : `${run.startingTrigger?.toLowerCase()} trigger`}</DetailItem>
            )}
          </DetailList>
        </div>
        <div>
          <Heading size="sm" as="p" className="mb-3 flex items-center gap-1">
            Run Steps
            <InfoTooltip title="This run may not have executed all steps in the workflow. Only the steps that were executed in this specific run are shown here." />
          </Heading>
          {steps.length === 0 ? (
            <p className="py-4 text-center text-gray-500">No steps yet</p>
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
                        "flex w-full items-center gap-3 rounded border-r-4 p-2 text-left text-sm",
                        selected ? "border-primary-500 bg-primary-50 font-semibold" : "border-transparent hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <span className={cn(icon, color, "h-5 w-5 shrink-0")} />
                      <span className="min-w-0 flex-1 truncate">{s.jobName}</span>
                      <span className="shrink-0 text-xs text-gray-500">{formatElapsed(s.startedAt, s.finishedAt)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1">
        {activeTab === "log" && (
          <div className="flex h-full flex-col bg-gray-700 font-mono text-gray-200">
            <div className="flex h-6 items-center justify-end border-b border-gray-500 px-2">
              <LogLevelFilter selected={level} onChange={setLevel} />
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-2 text-sm">
              {visibleLogs.length === 0 ? (
                <div className="p-2 text-gray-400">No logs were received for this run.</div>
              ) : (
                visibleLogs.map((l, i) => (
                  <div
                    key={i}
                    className={cn("whitespace-pre-wrap", step && l.stepId && l.stepId !== step.id && "opacity-40", l.level === "error" && "text-red-300")}
                  >
                    <span className="text-gray-400">{l.source.padEnd(4)}</span> {l.message}
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
