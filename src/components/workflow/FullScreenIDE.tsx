import { useState, type ReactNode } from "react";
import type { EditorJob } from "../../types/workflow-graph";
import { cn } from "../../utils/cn";
import Button from "../Button";
import IconButton from "../IconButton";
import Tabs from "../Tabs";
import AdaptorDisplay from "./AdaptorDisplay";
import AdaptorDocs, { AdaptorMetadata } from "./AdaptorDocs";
import CodeEditor from "./CodeEditor";
import JobSelector from "./JobSelector";
import NewRunButton from "./NewRunButton";
import RunBadge from "./RunBadge";
import RunRetryButton from "./RunRetryButton";
import type { RunViewerTab } from "./RunViewerPanel";

export type IDEPanelState = "run-viewer" | "history" | "create-run" | undefined;

interface Props {
  jobs: EditorJob[];
  job: EditorJob | null;
  onSelectJob: (job: EditorJob) => void;
  onBodyChange: (body: string) => void;
  onClose: () => void;
  /** Opens the adaptor modals (owned by the page). */
  onEditAdaptor: () => void;
  onChangeAdaptor: () => void;
  /** The right panel: a run (from ?run=), history or the create-run input picker. */
  panelState: IDEPanelState;
  onShowHistory: () => void;
  onShowCreateRun: () => void;
  followRunId: string | null;
  isRetryable: boolean;
  onRun: () => void;
  onRetry: () => void;
  onClearRun: () => void;
  runTab: RunViewerTab;
  onRunTabChange: (tab: RunViewerTab) => void;
  /** Content of the right panel for the current panelState. */
  rightPanel?: ReactNode;
}

/**
 * The full-screen job editor (`?panel=editor&job=`, ide/FullScreenIDE.tsx):
 * a heading bar (job picker, adaptor, Docs/Metadata toggles, History, Run,
 * close) over the code editor, the Docs/Metadata panel to its right, and an
 * optional right-hand panel for runs, history or picking a run's input.
 * Panels are fixed splits instead of draggable resize handles.
 */
export default function FullScreenIDE({
  jobs,
  job,
  onSelectJob,
  onBodyChange,
  onClose,
  onEditAdaptor,
  onChangeAdaptor,
  panelState,
  onShowHistory,
  onShowCreateRun,
  followRunId,
  isRetryable,
  onRun,
  onRetry,
  onClearRun,
  runTab,
  onRunTabChange,
  rightPanel,
}: Props) {
  const [docsTab, setDocsTab] = useState<"docs" | "metadata">("docs");
  const [docsCollapsed, setDocsCollapsed] = useState(false);
  const [vertical, setVertical] = useState(false);
  const [runCollapsed, setRunCollapsed] = useState(false);

  const showDocs = (tab: "docs" | "metadata") => {
    if (docsTab === tab && !docsCollapsed) setDocsCollapsed(true);
    else {
      setDocsTab(tab);
      setDocsCollapsed(false);
    }
  };
  const adaptor = job?.adaptor ?? "@openfn/language-common@latest";

  return (
    <div className="absolute inset-0 z-49 flex flex-col bg-white" data-annotation="workflow-editor-ide">
      <div className="flex flex-none items-center justify-between gap-2 border-b border-gray-200 px-4 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-3 *:shrink-0">
          <JobSelector currentJob={job} jobs={jobs} onChange={onSelectJob} />
          {job && (
            <div>
              <AdaptorDisplay adaptor={job.adaptor} credentialName={job.credentialName} onEdit={onEditAdaptor} onChangeAdaptor={onChangeAdaptor} />
            </div>
          )}
          <IconButton
            icon="hero-document-text"
            label="Docs"
            title="Show adaptor documentation"
            size="sm"
            active={docsTab === "docs" && !docsCollapsed}
            onClick={() => showDocs("docs")}
          />
          <IconButton
            icon="hero-sparkles"
            label="Metadata"
            title="Show metadata explorer"
            size="sm"
            active={docsTab === "metadata" && !docsCollapsed}
            onClick={() => showDocs("metadata")}
          />
        </div>
        <Button tooltip="⌘ H" onClick={onShowHistory}>
          <span className={cn("h-4 w-4", panelState === "history" ? "hero-clock-solid" : "hero-clock")} />
          History
        </Button>
        {(panelState === undefined || panelState === "history") && <NewRunButton onClick={onShowCreateRun} />}
        {(panelState === "run-viewer" || panelState === "create-run") && (
          <RunRetryButton isRetryable={panelState === "run-viewer" && isRetryable} onRun={onRun} onRetry={onRetry} />
        )}
        <IconButton icon="hero-x-mark" label="Close IDE" title="Close IDE (Esc)" onClick={onClose} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={cn("flex h-full min-w-0 bg-gray-100", vertical && "flex-col", panelState ? "w-7/10" : "w-full")}>
          <div className={cn("overflow-hidden", docsCollapsed ? "flex-1" : vertical ? "h-3/5" : "w-3/5")}>
            {job ? (
              <CodeEditor key={job.id} value={job.body} onChange={onBodyChange} />
            ) : (
              <div className="mx-auto max-w-md p-8 text-center text-sm text-gray-600">
                <p>The job you're trying to view didn't exist in this version of the workflow.</p>
                <p className="mt-2 text-gray-500">You can change versions or select another job.</p>
              </div>
            )}
          </div>
          {!docsCollapsed && (
            <>
              <div className={cn("shrink-0 bg-gray-200", vertical ? "h-1" : "w-1")} />
              <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
                <Tabs
                  variant="pill"
                  fill
                  className="shrink-0 px-3 pt-2 pb-1"
                  active={docsTab}
                  onChange={setDocsTab}
                  tabs={[
                    { id: "docs", label: "Docs", icon: "hero-document-text" },
                    { id: "metadata", label: "Metadata", icon: "hero-sparkles" },
                  ]}
                  after={
                    <>
                      <IconButton
                        icon="hero-view-columns"
                        label="Toggle panel orientation"
                        size="sm"
                        className={cn(vertical && "rotate-90")}
                        onClick={() => setVertical((v) => !v)}
                      />
                      <IconButton icon="hero-x-mark" label="Close docs panel" size="sm" onClick={() => setDocsCollapsed(true)} />
                    </>
                  }
                />
                <div className="flex-1 overflow-auto p-2">
                  {docsTab === "docs" ? <AdaptorDocs adaptor={adaptor} /> : <AdaptorMetadata adaptor={adaptor} />}
                </div>
              </div>
            </>
          )}
        </div>

        {panelState && (
          <>
            <div className="w-1 shrink-0 bg-gray-200" />
            <div className={cn("h-full min-w-0 border-l border-gray-200 bg-gray-50", runCollapsed && panelState === "run-viewer" ? "w-10" : "flex-1")}>
              {panelState === "run-viewer" && runCollapsed && followRunId ? (
                <div className="flex h-full flex-col items-center gap-3 overflow-hidden pt-3">
                  <button
                    type="button"
                    style={{ writingMode: "vertical-rl" }}
                    onClick={() => setRunCollapsed(false)}
                    title="Expand run panel"
                    aria-label="Expand run panel"
                  >
                    <RunBadge runId={followRunId} />
                  </button>
                  <div className="flex flex-col items-center gap-1">
                    {(["log", "input", "output"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        style={{ writingMode: "vertical-rl" }}
                        onClick={() => {
                          onRunTabChange(t);
                          setRunCollapsed(false);
                        }}
                        className={cn(
                          "whitespace-nowrap rounded p-1 text-xs hover:bg-gray-200",
                          runTab === t ? "text-primary-600 font-medium" : "text-gray-500"
                        )}
                      >
                        {t === "log" ? "Logs" : t === "input" ? "Input" : "Output"}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col">
                  {panelState === "run-viewer" && followRunId && (
                    <div className="flex shrink-0 items-center gap-3 px-3 py-1">
                      <RunBadge runId={followRunId} onClose={onClearRun} />
                      <Tabs
                        label="Run output"
                        className="flex-1 border-b-0"
                        active={runTab}
                        onChange={onRunTabChange}
                        tabs={[
                          { id: "log", label: "Logs" },
                          { id: "input", label: "Input" },
                          { id: "output", label: "Output" },
                        ]}
                      />
                      <IconButton icon="hero-chevron-right" label="Collapse panel" size="sm" onClick={() => setRunCollapsed(true)} />
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden bg-white">{rightPanel}</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
