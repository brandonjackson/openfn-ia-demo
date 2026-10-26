import type { ReactNode } from "react";
import { Calendar, ExternalLink, FolderKanban, Play, RotateCcw, User } from "lucide-react";
import type { JobNode, RunDetails, TriggerNode, Workflow, WorkflowSettings } from "../../mock-data/workflow";
import { workflowToYaml } from "../../mock-data/workflow";
import { adaptorInfo } from "../../mock-data/adaptor-reference";
import type { Snippet } from "../../mock-data/adaptor-reference";
import type { ProjectComponent } from "../../mock-data/projects";
import { componentPreview, workflowDocs } from "../../mock-data/workflow-files";
import { componentTypeIcons } from "../../component-types";
import Button from "../Button";
import Badge from "../Badge";
import FileDetailsPanel from "./FileDetailsPanel";
import EditorExplorer from "./EditorExplorer";
import type { ExplorerFile } from "./EditorExplorer";
import CodePaneHeader from "./CodePaneHeader";
import CodeEditor from "./CodeEditor";
import EditorStatusBar from "./EditorStatusBar";
import StepConfigPanel from "./StepConfigPanel";
import type { StepChanges } from "./StepConfigPanel";
import TriggerConfigPanel from "./TriggerConfigPanel";
import WorkflowSettingsPanel from "./WorkflowSettingsPanel";

interface Props {
  workflow: Workflow;
  file: ExplorerFile;
  onOpen: (file: ExplorerFile) => void;
  /** The selected run; steps show how they went and can be retried from. */
  run?: RunDetails;
  /** Project components the workflow uses, listed in the explorer. */
  components?: ProjectComponent[];
  /** Opens a component's page in the project. */
  onOpenComponent?: (componentId: string) => void;
  /** On main nothing can be changed. */
  readOnly?: boolean;
  /** The URL that starts the workflow, shown on the trigger. */
  url?: string;
  live?: boolean;
  onToggleLive?: (live: boolean) => void;
  settings: WorkflowSettings;
  onSettingsChange?: (settings: WorkflowSettings) => void;
  /** Each step's credential, by step id. */
  credentials?: Record<string, string | undefined>;
  onStepChange?: (stepId: string, changes: StepChanges) => void;
  onInsertSnippet?: (stepId: string, snippet: Snippet) => void;
  onOpenReference?: () => void;
  onDeleteStep?: (stepId: string) => void;
  onAddStep?: () => void;
  /** Start a fresh run from this step. */
  onRunFromStep?: (stepId: string) => void;
  /** Retry the selected run from this step; offered when the run reached it. */
  onRetryFromStep?: (stepId: string) => void;
  /** The panel inline under the code. */
  bottomTray?: ReactNode;
  /** Hide the explorer column (toggled from the toolbar). */
  showExplorer?: boolean;
  /** A note for the status bar, e.g. "Tested by the assistant". */
  statusNote?: string;
}

/**
 * Code mode: the explorer on the left, the code in the middle under a path
 * row (no file tabs: the explorer is the list of what can be opened), and
 * the settings for what's open on the right. A step shows its code and its
 * settings; the trigger and `workflow.yaml` show the YAML and their
 * settings. A tray can sit inline under the code.
 */
export default function CodeWorkspace({
  workflow,
  file,
  onOpen,
  run,
  components = [],
  onOpenComponent,
  readOnly = false,
  url,
  live = true,
  onToggleLive,
  settings,
  onSettingsChange,
  credentials = {},
  onStepChange,
  onInsertSnippet,
  onOpenReference,
  onDeleteStep,
  onAddStep,
  onRunFromStep,
  onRetryFromStep,
  bottomTray,
  showExplorer = true,
  statusNote,
}: Props) {
  const step =
    typeof file === "object" && "stepId" in file
      ? workflow.nodes.find((n): n is JobNode => n.type === "job" && n.id === file.stepId)
      : undefined;
  const component =
    typeof file === "object" && "componentId" in file ? components.find((c) => c.id === file.componentId) : undefined;
  const doc = file === "plan" ? "plan" : file === "spec" ? "spec" : undefined;
  const trigger = workflow.nodes.find((n): n is TriggerNode => n.type === "trigger");
  const yaml = workflowToYaml(workflow);
  const triggerYaml = yaml.slice(yaml.indexOf("triggers:"), yaml.indexOf("edges:")).trimEnd();
  const stepInRun = step ? run?.steps.find((s) => s.jobId === step.id) : undefined;
  const canRetry = Boolean(step && stepInRun && run && run.status !== "running");

  const path =
    step !== undefined
      ? [workflow.name, "Steps", step.label]
      : component !== undefined
        ? [workflow.name, "Components", component.name]
        : file === "trigger" && trigger
          ? [workflow.name, "Steps", trigger.label]
          : [workflow.name, doc ? `${doc}.md` : "workflow.yaml"];

  const code = step
    ? step.body
    : component
      ? componentPreview(component)
      : file === "trigger"
        ? triggerYaml
        : doc
          ? workflowDocs[doc]
          : yaml;

  const actions = step && (
    <>
      {canRetry && onRetryFromStep ? (
        <Button variant="secondary" size="xs" icon={RotateCcw} onClick={() => onRetryFromStep(step.id)} title="Run this step's input again, on the latest version">
          Retry from here
        </Button>
      ) : (
        onRunFromStep && (
          <Button variant="secondary" size="xs" icon={Play} onClick={() => onRunFromStep(step.id)}>
            Run from here
          </Button>
        )
      )}
    </>
  );

  const statusItems = step
    ? [`${step.adaptor}@${adaptorInfo[step.adaptor].version}`, step.label]
    : component
      ? [component.type.toLowerCase(), component.name]
      : file === "trigger" && trigger
        ? [trigger.triggerType, trigger.label]
        : [doc ? `${doc}.md` : "workflow.yaml"];
  // Components belong to the project, so they're always read-only here.
  const statusTrailing = [statusNote, readOnly || component ? "Read-only" : "Saved"].filter(Boolean) as string[];

  return (
    <div className="flex h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {showExplorer && (
      <div className="w-64 flex-none border-r border-gray-100">
        <EditorExplorer
          workflow={workflow}
          file={file}
          onOpen={onOpen}
          run={run}
          components={components}
          onAddStep={readOnly ? undefined : onAddStep}
        />
      </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <CodePaneHeader path={path} actions={actions} />
        <div className="min-h-0 flex-1 overflow-hidden">
          <CodeEditor code={code} />
        </div>
        {bottomTray}
        <EditorStatusBar items={statusItems} trailing={statusTrailing} />
      </div>

      <div className="w-80 flex-none border-l border-gray-100">
        {step ? (
          <StepConfigPanel
            key={step.id}
            step={step}
            workflow={workflow}
            credentialId={credentials[step.id]}
            readOnly={readOnly}
            onChange={onStepChange ? (changes) => onStepChange(step.id, changes) : undefined}
            onInsertSnippet={onInsertSnippet ? (s) => onInsertSnippet(step.id, s) : undefined}
            onOpenReference={onOpenReference}
            onDelete={onDeleteStep ? () => onDeleteStep(step.id) : undefined}
          />
        ) : component ? (
          <FileDetailsPanel
            title={component.name}
            tag={<Badge label={component.type} />}
            description={component.description}
            properties={[
              { icon: componentTypeIcons[component.type], label: "Type", value: component.type },
              { icon: FolderKanban, label: "Project", value: workflow.project },
            ]}
            action={
              onOpenComponent && (
                <Button variant="secondary" size="sm" icon={ExternalLink} onClick={() => onOpenComponent(component.id)}>
                  Open in project
                </Button>
              )
            }
          />
        ) : doc ? (
          <FileDetailsPanel
            title={`${doc}.md`}
            description={
              doc === "plan"
                ? "Why the workflow exists and how it's meant to work. The assistant reads it before proposing changes."
                : "What goes in, what each step writes, and when a run counts as done."
            }
            properties={[
              { icon: User, label: "Edited by", value: "Brandon Jackson" },
              { icon: Calendar, label: "Updated", value: doc === "plan" ? "14 Oct 2026" : "2 Sep 2026" },
            ]}
          />
        ) : file === "trigger" && trigger ? (
          <TriggerConfigPanel trigger={trigger} url={url} readOnly={readOnly} live={live} onToggleLive={onToggleLive} />
        ) : (
          <WorkflowSettingsPanel workflow={workflow} settings={settings} readOnly={readOnly} onChange={onSettingsChange} />
        )}
      </div>
    </div>
  );
}
