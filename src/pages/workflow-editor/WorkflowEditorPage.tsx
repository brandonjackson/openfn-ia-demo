import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import AdaptorSelectionModal from "../../components/workflow/AdaptorSelectionModal";
import AIAssistantPanel from "../../components/workflow/AIAssistantPanel";
import ConfigureAdaptorModal from "../../components/workflow/ConfigureAdaptorModal";
import EdgeInspector from "../../components/workflow/EdgeInspector";
import EditorHeader from "../../components/workflow/EditorHeader";
import FullScreenIDE, { type IDEPanelState } from "../../components/workflow/FullScreenIDE";
import JobInspector from "../../components/workflow/JobInspector";
import LandingScreen from "../../components/workflow/LandingScreen";
import ManualRunPanel from "../../components/workflow/ManualRunPanel";
import MiniHistory from "../../components/workflow/MiniHistory";
import RunViewerPanel, { type RunViewerTab } from "../../components/workflow/RunViewerPanel";
import TemplateBrowserModal from "../../components/workflow/TemplateBrowserModal";
import TriggerInspector from "../../components/workflow/TriggerInspector";
import WorkflowCodePanel from "../../components/workflow/WorkflowCodePanel";
import WorkflowDiagram, { type Selection } from "../../components/workflow/WorkflowDiagram";
import WorkflowSettings from "../../components/workflow/WorkflowSettings";
import YAMLImportModal from "../../components/workflow/YAMLImportModal";
import { aiSessionsFor } from "../../mock-data/ai-assistant";
import { adaptorShortName, resolveAdaptor } from "../../mock-data/adaptors";
import { findProject, type Project } from "../../mock-data/projects";
import {
  blankWorkflowGraph,
  findWorkflowGraph,
  newWorkflowGraph,
  snapshotsOf,
  templateGraph,
  type WorkflowGraph,
} from "../../mock-data/workflow";
import { useEditorRuns } from "./useEditorRuns";
import { useWorkflowEditorState } from "./useWorkflowEditorState";

/**
 * Inventory views `workflow-editor-*`: the collaborative workflow editor at
 * /projects/:projectId/w/:workflowId (and /w/new). Lightning's
 * CollaborativeEditor.tsx + WorkflowEditor.tsx, rebuilt on local React state
 * and static fixtures (no Yjs, no channels). Panels follow Lightning's URL
 * parameters: ?job= / ?trigger= / ?edge= select a node and open its
 * inspector, ?panel=settings|code|run|editor opens workflow settings, the
 * YAML view, the manual run panel or the full-screen IDE, ?run= shows a run,
 * ?chat=true opens the AI assistant.
 */
export default function WorkflowEditorPage() {
  const { projectId, workflowId } = useParams();
  const project = findProject(projectId);
  if (!project) return <Navigate to="/projects" replace />;
  const graph = workflowId ? findWorkflowGraph(workflowId) : newWorkflowGraph(project.id);
  if (!graph || graph.projectId !== project.id) return <Navigate to={`/projects/${project.id}/w`} replace />;
  return <WorkflowEditor key={graph.id} project={project} initial={graph} isNew={!workflowId} />;
}

type ParamPatch = Record<string, string | null>;

function useUrlParams() {
  const [search, setSearch] = useSearchParams();
  const params = useMemo(() => Object.fromEntries(search.entries()) as Record<string, string | undefined>, [search]);
  const update = useCallback(
    (patch: ParamPatch) =>
      setSearch((prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(patch)) {
          if (v === null) next.delete(k);
          else next.set(k, v);
        }
        return next;
      }),
    [setSearch]
  );
  return { params, update };
}

function WorkflowEditor({ project, initial, isNew }: { project: Project; initial: WorkflowGraph; isNew: boolean }) {
  const editor = useWorkflowEditorState(initial);
  const { graph } = editor;
  const { params, update } = useUrlParams();
  const [pinnedVersion, setPinnedVersion] = useState<number | null>(null);
  const [historyCollapsed, setHistoryCollapsed] = useState(true);
  const [created, setCreated] = useState(!isNew);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [yamlOpen, setYamlOpen] = useState(false);
  const [ideSub, setIdeSub] = useState<"history" | "create-run" | undefined>(undefined);
  const [runTab, setRunTab] = useState<RunViewerTab>("log");
  const [ideConfigureOpen, setIdeConfigureOpen] = useState(false);
  const [idePickerOpen, setIdePickerOpen] = useState(false);

  const runs = useEditorRuns(graph, params.run ?? null);

  // Selection (Lightning's useNodeSelection): one of ?job, ?trigger, ?edge.
  const selection: Selection = useMemo(
    () =>
      params.job
        ? { kind: "job", id: params.job }
        : params.trigger
          ? { kind: "trigger", id: params.trigger }
          : params.edge
            ? { kind: "edge", id: params.edge }
            : null,
    [params.job, params.trigger, params.edge]
  );
  const job = params.job ? (graph.jobs.find((j) => j.id === params.job) ?? null) : null;
  const trigger = params.trigger ? (graph.triggers.find((t) => t.id === params.trigger) ?? null) : null;
  const edge = params.edge ? (graph.edges.find((e) => e.id === params.edge) ?? null) : null;

  const panel = params.panel ?? null;
  const select = useCallback(
    (sel: Selection) =>
      update({
        job: sel?.kind === "job" ? sel.id : null,
        trigger: sel?.kind === "trigger" ? sel.id : null,
        edge: sel?.kind === "edge" ? sel.id : null,
        // The run panel follows the selection; other panels give way to it.
        ...(panel === "run" ? {} : { panel: null }),
      }),
    [update, panel]
  );

  const isIDEOpen = panel === "editor" && !!params.job && created;
  const isRunPanelOpen = panel === "run";
  const aiOpen = params.chat === "true";
  const showLanding = isNew && !created;

  const closeAll = useCallback(
    () => update({ panel: null, job: null, trigger: null, edge: null, run: null, step: null, runMode: null }),
    [update]
  );

  // Escape closes the open panel or the inspector (Lightning's keyboard provider).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector('[role="dialog"]')) return;
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      if (panel === "code") update({ panel: "settings" });
      else if (panel) update({ panel: null, runMode: null });
      else if (selection) select(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, selection, select, update]);

  const adaptorsInUse = useMemo(() => [...new Set(graph.jobs.map((j) => adaptorShortName(j.adaptor)))], [graph.jobs]);
  const firstTrigger = graph.triggers[0];

  // Running: the demo "starts" a run by following the workflow's newest
  // finished fixture run.
  const followNewRun = () => {
    if (runs.demoRunId) update({ run: runs.demoRunId, panel: null, step: null, runMode: null });
    else update({ panel: null, runMode: null });
  };
  const runPanelTitle =
    params.runMode === "custom"
      ? "Pick a custom input"
      : job
        ? `Run from ${job.name}`
        : trigger
          ? `Run from Trigger (${trigger.type})`
          : "Run Workflow";

  let inspector: ReactNode = null;
  if (!showLanding && !isRunPanelOpen && !isIDEOpen) {
    if (panel === "settings") {
      inspector = (
        <WorkflowSettings
          graph={graph}
          projectConcurrency={project.concurrency}
          projectId={project.id}
          onChange={editor.updateWorkflow}
          onViewAsYAML={() => update({ panel: "code" })}
          onReset={editor.resetToSaved}
          onClose={() => update({ panel: null })}
        />
      );
    } else if (panel === "code") {
      inspector = <WorkflowCodePanel graph={graph} onClose={() => update({ panel: "settings" })} />;
    } else if (job) {
      inspector = (
        <JobInspector
          key={job.id}
          job={job}
          projectId={project.id}
          adaptorsInUse={adaptorsInUse}
          onChange={(patch) => editor.updateJob(job.id, patch)}
          onClose={() => select(null)}
          onOpenEditor={() => update({ panel: "editor" })}
          onDelete={() => {
            editor.removeJob(job.id);
            select(null);
          }}
          onRunFromHere={() => update({ panel: "run", runMode: null })}
          canDelete={!graph.edges.some((e) => e.sourceJobId === job.id)}
        />
      );
    } else if (trigger) {
      inspector = (
        <TriggerInspector
          key={trigger.id}
          trigger={trigger}
          onChange={(patch) => editor.updateTrigger(trigger.id, patch)}
          onClose={() => select(null)}
        />
      );
    } else if (edge) {
      inspector = (
        <EdgeInspector
          key={edge.id}
          edge={edge}
          onChange={(patch) => editor.updateEdge(edge.id, patch)}
          onDelete={() => {
            editor.removeEdge(edge.id);
            select(null);
          }}
          onClose={() => select(null)}
        />
      );
    }
  }

  // The IDE's right-hand panel: the run (from ?run=), history, or picking an input.
  const idePanelState: IDEPanelState = params.run ? "run-viewer" : ideSub;
  const ideJob = isIDEOpen ? job : null;
  let ideRightPanel: ReactNode = null;
  if (isIDEOpen && idePanelState === "run-viewer" && runs.selectedRun) {
    const steps = runs.selectedSteps;
    const stepId = params.step ?? steps.find((s) => s.jobId === ideJob?.id)?.id ?? steps[0]?.id ?? null;
    ideRightPanel = (
      <RunViewerPanel
        projectId={project.id}
        run={runs.selectedRun}
        steps={steps}
        logs={runs.selectedLogs}
        dataclips={runs.dataclips}
        selectedStepId={stepId}
        onSelectStep={(s) => update({ job: s.jobId, step: s.id })}
        activeTab={runTab}
        mismatch={!!ideJob && steps.length > 0 && !steps.some((s) => s.jobId === ideJob.id)}
      />
    );
  } else if (isIDEOpen && idePanelState === "history") {
    ideRightPanel = (
      <MiniHistory
        variant="panel"
        projectId={project.id}
        workflowId={graph.id}
        collapsed={false}
        onToggle={() => {}}
        history={runs.history}
        selectedRunId={params.run ?? null}
        onSelectRun={(id) => update({ run: id, step: null })}
        onDeselectRun={() => update({ run: null, step: null })}
        onBack={() => setIdeSub(undefined)}
      />
    );
  } else if (isIDEOpen && idePanelState === "create-run") {
    ideRightPanel = (
      <ManualRunPanel
        mode="embedded"
        title=""
        dataclips={runs.dataclips}
        onClose={() => setIdeSub(undefined)}
        onClosePanel={() => setIdeSub(undefined)}
        onRun={() => runs.demoRunId && update({ run: runs.demoRunId, step: null })}
      />
    );
  }
  const runIde = () => runs.demoRunId && update({ run: runs.demoRunId, step: null });

  return (
    <div className="collaborative-editor h-full flex relative" data-testid="collaborative-editor" data-annotation="workflow-editor-canvas">
      <div className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col relative">
        {!showLanding && (
          <EditorHeader
            project={project}
            workflowName={graph.name}
            snapshots={snapshotsOf(graph)}
            pinnedVersion={pinnedVersion}
            onVersionSelect={(v) => setPinnedVersion(v === "latest" || v === graph.lockVersion ? null : v)}
            onTitleClick={closeAll}
            enabled={graph.triggers.some((t) => t.enabled)}
            onEnabledChange={editor.setEnabled}
            settingsOpen={panel === "settings"}
            onSettingsClick={() => update({ panel: panel === "settings" ? null : "settings" })}
            canRun={!!firstTrigger}
            runDisabled={isRunPanelOpen || isIDEOpen}
            onRun={() =>
              runs.demoRunId ? followNewRun() : update({ panel: "run", trigger: firstTrigger.id, job: null, edge: null })
            }
            onRunWithCustomInput={() =>
              update({ panel: "run", trigger: firstTrigger.id, job: null, edge: null, runMode: "custom" })
            }
            hasChanges={editor.hasChanges || !created}
            onSave={() => {
              editor.save();
              setCreated(true);
            }}
            saveLabel={isNew && !created ? "Create" : "Save"}
            aiOpen={aiOpen}
            onAIClick={() => update({ chat: aiOpen ? null : "true" })}
          >
            {pinnedVersion !== null && (
              <span
                className="ml-3 inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
                data-annotation="workflow-editor-versions-and-promote"
              >
                Read-only
              </span>
            )}
          </EditorHeader>
        )}

        <div className="flex-1 min-h-0 overflow-hidden relative">
          <div className="flex h-full w-full">
            <div className="flex-1 relative">
              <WorkflowDiagram
                graph={graph}
                selection={selection}
                onSelect={select}
                onAddPath={(jobId) => {
                  const id = editor.addJobAfter(jobId);
                  select({ kind: "job", id });
                }}
                run={runs.overlay}
                canUndo={editor.canUndo}
                canRedo={editor.canRedo}
                onUndo={editor.undo}
                onRedo={editor.redo}
              >
                {!isNew && (
                  <MiniHistory
                    projectId={project.id}
                    workflowId={graph.id}
                    collapsed={historyCollapsed}
                    onToggle={() => setHistoryCollapsed((c) => !c)}
                    history={runs.history}
                    selectedRunId={params.run ?? null}
                    onSelectRun={(id) => update({ run: id, step: null })}
                    onDeselectRun={() => update({ run: null, step: null })}
                  />
                )}
              </WorkflowDiagram>

              {inspector && (
                <div className="absolute top-0 right-0 z-[45]" id="inspector">
                  {inspector}
                </div>
              )}

              {isRunPanelOpen && (
                <div className="absolute inset-y-0 right-0 z-[46] flex pointer-events-none">
                  <ManualRunPanel
                    key={`${params.job ?? params.trigger ?? params.edge}-${params.runMode ?? ""}`}
                    title={runPanelTitle}
                    dataclips={runs.dataclips}
                    fromEdge={!!edge}
                    initialTab={params.runMode === "custom" ? "custom" : "empty"}
                    onClose={() => update({ panel: null, runMode: null })}
                    onRun={followNewRun}
                  />
                </div>
              )}
            </div>

            {isIDEOpen && (
              <FullScreenIDE
                jobs={graph.jobs}
                job={ideJob}
                onSelectJob={(j) => update({ job: j.id })}
                onBodyChange={(body) => ideJob && editor.updateJob(ideJob.id, { body })}
                onClose={() => update({ panel: null })}
                onEditAdaptor={() => setIdeConfigureOpen(true)}
                onChangeAdaptor={() => setIdePickerOpen(true)}
                panelState={idePanelState}
                onShowHistory={() => {
                  update({ run: null, step: null });
                  setIdeSub("history");
                }}
                onShowCreateRun={() => setIdeSub("create-run")}
                followRunId={params.run ?? null}
                isRetryable={!!runs.selectedRun && !["available", "claimed", "started"].includes(runs.selectedRun.state)}
                onRun={runIde}
                onRetry={runIde}
                onClearRun={() => {
                  update({ run: null, step: null });
                  setIdeSub(undefined);
                }}
                runTab={runTab}
                onRunTabChange={setRunTab}
                rightPanel={ideRightPanel}
              />
            )}
          </div>
        </div>

        {showLanding && (
          <LandingScreen
            onBuildWithAI={() => {
              editor.replace(blankWorkflowGraph(project.id));
              setCreated(true);
              update({ chat: "true" });
            }}
            onBuildFromScratch={() => {
              editor.replace(blankWorkflowGraph(project.id));
              setCreated(true);
            }}
            onBrowseTemplates={() => setTemplatesOpen(true)}
            onImportYAML={() => setYamlOpen(true)}
          />
        )}
      </div>

      {aiOpen && <AIAssistantPanel sessions={aiSessionsFor(graph.id)} onClose={() => update({ chat: null })} />}

      <TemplateBrowserModal
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        projectId={project.id}
        onCreate={(t) => {
          editor.replace(templateGraph(t, project.id));
          setCreated(true);
          setTemplatesOpen(false);
        }}
      />
      <YAMLImportModal
        isOpen={yamlOpen}
        onClose={() => setYamlOpen(false)}
        onCreate={(yaml) => {
          const name = yaml.match(/^name:\s*(.+)$/m)?.[1]?.trim();
          editor.replace({ ...blankWorkflowGraph(project.id), name: name || "Imported workflow" });
          setCreated(true);
          setYamlOpen(false);
        }}
      />
      {ideJob && (
        <>
          <ConfigureAdaptorModal
            isOpen={ideConfigureOpen}
            onClose={() => setIdeConfigureOpen(false)}
            projectId={project.id}
            adaptor={ideJob.adaptor}
            credentialName={ideJob.credentialName}
            onChangeAdaptor={() => {
              setIdeConfigureOpen(false);
              setIdePickerOpen(true);
            }}
            onVersionChange={(v) => editor.updateJob(ideJob.id, { adaptor: `${resolveAdaptor(ideJob.adaptor).package}@${v}` })}
            onCredentialChange={(name) => editor.updateJob(ideJob.id, { credentialName: name })}
          />
          <AdaptorSelectionModal
            isOpen={idePickerOpen}
            onClose={() => setIdePickerOpen(false)}
            adaptorsInUse={adaptorsInUse}
            onSelect={(pkg) => editor.updateJob(ideJob.id, { adaptor: `${pkg}@latest`, credentialName: null })}
          />
        </>
      )}
    </div>
  );
}
