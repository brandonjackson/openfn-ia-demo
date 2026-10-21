import { useState } from "react";
import type { ReactNode } from "react";
import { X, ChevronsUpDown, FileText, Tag, ChartColumn, Play, RotateCcw, History } from "lucide-react";
import type { Dataclip, JobNode, RunDetails, RunStep } from "../../mock-data/workflow";
import CodeEditor from "./CodeEditor";
import RunPanel from "./RunPanel";
import LogConsole from "./LogConsole";
import RunChip from "./RunChip";
import { AdaptorIcon } from "./AdaptorIcon";
import CodeBlock from "../CodeBlock";
import EmptyState from "../EmptyState";
import Button from "../Button";

type Tab = "run" | "logs" | "input" | "output";

const adaptorName: Record<JobNode["adaptor"], string> = {
  http: "Http",
  common: "Common",
  dhis2: "DHIS2",
  salesforce: "Salesforce",
  postgresql: "PostgreSQL",
};

/**
 * The expanded job editor body: a job sub-header, the code editor on the left,
 * and the selected run on the right.
 *
 * The right side follows the open job's step in the selected run: Logs shows
 * the lines that step wrote, Input and Output show the data it received and
 * produced, and Run shows the whole run with the step highlighted. Clicking
 * another step there opens that step's job. If the open job wasn't part of
 * the run, the run chip turns yellow and says so.
 *
 * `historyPanel` is shown under the History button, so a run can be picked
 * without leaving the editor.
 */
export default function JobEditorView({
  job,
  run,
  dataclips = [],
  historyPanel,
  onCloseRun,
  onSelectStep,
  onRun,
  onRetry,
  onClose,
}: {
  job: JobNode;
  /** The selected run, if any. */
  run?: RunDetails;
  /** Dataclips to look up the step's input and output in. */
  dataclips?: Dataclip[];
  /** Run history to pick from, shown under the History button. */
  historyPanel?: ReactNode;
  /** Stop following the run. */
  onCloseRun?: () => void;
  /** A step was picked in the run tab; open its job. */
  onSelectStep?: (step: RunStep) => void;
  /** A fresh run of the workflow. */
  onRun?: () => void;
  /** Retry the selected run from this step. */
  onRetry?: () => void;
  onClose?: () => void;
}) {
  const [tab, setTab] = useState<Tab>("logs");
  // The history popover closes itself once a different run is picked.
  const [historyOpenFor, setHistoryOpenFor] = useState<string | null>(null);
  const historyOpen = historyOpenFor !== null && historyOpenFor === (run?.runId ?? "");
  const toggleHistory = () => setHistoryOpenFor(historyOpen ? null : (run?.runId ?? ""));

  const step = run?.steps.find((s) => s.jobId === job.id);
  const dataclip = (id?: string) => dataclips.find((d) => d.id === id);
  const canRetry = Boolean(run && step && run.status !== "running");

  const notInRun = (
    <EmptyState
      icon={History}
      title={`This step wasn't part of run ${run?.runId.slice(0, 6)}.`}
      description="Open a step from the Run tab to see what it did."
    />
  );

  const dataclipTab = (label: string, id: string | undefined, missing: string) => {
    if (!step) return <div className="p-4">{notInRun}</div>;
    const clip = dataclip(id);
    return (
      <div className="p-4">
        {clip ? (
          <CodeBlock label={clip.name ? `${label} · ${clip.name}` : label} code={clip.body} />
        ) : (
          <EmptyState title={missing} />
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Job sub-header */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-3 min-w-0">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50">
            <span className="truncate max-w-[260px]">{job.label}</span>
            <ChevronsUpDown size={14} className="text-gray-400 flex-shrink-0" />
          </button>
          <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1">
            <AdaptorIcon adaptor={job.adaptor} size="sm" />
            <span className="text-sm text-gray-700">{adaptorName[job.adaptor]}</span>
            <span className="text-xs text-gray-400">latest</span>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
              Edit
            </button>
          </div>
          <button className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <FileText size={14} /> Docs
          </button>
          <button className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <Tag size={14} /> Metadata
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant={historyOpen ? "dark" : "secondary"}
              size="sm"
              icon={ChartColumn}
              onClick={toggleHistory}
              aria-expanded={historyOpen}
            >
              History
            </Button>
            {historyOpen && historyPanel && <div className="absolute right-0 top-full z-50 mt-1">{historyPanel}</div>}
          </div>
          {canRetry ? (
            <Button size="sm" icon={RotateCcw} onClick={onRetry} title="Run this step's input again, on the latest version">
              Retry from here
            </Button>
          ) : (
            <Button size="sm" icon={Play} onClick={onRun}>
              Run
            </Button>
          )}
          <button
            onClick={onClose}
            title="Collapse editor"
            className="text-gray-300 hover:text-gray-500"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Split body */}
      <div className="grid flex-1 grid-cols-2 overflow-hidden divide-x divide-gray-200">
        {/* Code editor */}
        <div className="overflow-hidden">
          <CodeEditor code={job.body} />
        </div>

        {/* The selected run, following this step */}
        {run ? (
          <div className="flex min-h-0 flex-col overflow-hidden">
            <div className="flex items-center gap-1 border-b border-gray-200 px-3">
              <span className="mr-2 py-1.5">
                <RunChip
                  run={run}
                  onClear={onCloseRun}
                  tone={step ? "default" : "warning"}
                  note={step ? undefined : "Step not in this run"}
                />
              </span>
              {(["run", "logs", "input", "output"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-2 text-sm capitalize ${
                    tab === t
                      ? "border-b-2 border-blue-500 font-medium text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              {tab === "run" && <RunPanel run={run} selectedStepId={step?.id} onSelectStep={onSelectStep} />}
              {tab === "logs" && (
                <LogConsole lines={step ? run.logs.filter((l) => l.stepId === step.id) : run.logs} />
              )}
              {tab === "input" && dataclipTab("Input", step?.inputId, "This step's input wasn't kept.")}
              {tab === "output" &&
                dataclipTab(
                  "Output",
                  step?.outputId,
                  step?.status === "running" || step?.status === "pending"
                    ? "This step hasn't finished yet."
                    : "This step's output wasn't kept."
                )}
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-center p-8">
            <div className="w-full max-w-md">
              <EmptyState
                icon={ChartColumn}
                title="No run selected"
                description="Pick a run from History to see this step's logs, input and output."
                action={
                  historyPanel && (
                    <Button variant="secondary" size="sm" icon={ChartColumn} onClick={toggleHistory}>
                      Open history
                    </Button>
                  )
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
