import { useRef } from "react";
import type { ReactNode } from "react";
import { BookOpen, Calendar, ExternalLink, FolderKanban, History, Layers, Radio, User, X } from "lucide-react";
import type { Dataclip, JobNode, RunDetails, TriggerNode, Workflow, WorkflowSettings } from "../../mock-data/workflow";
import type { DetailsViewId } from "../../editor-layout";
import { workflowToYaml } from "../../mock-data/workflow";
import { adaptorInfo } from "../../mock-data/adaptor-reference";
import type { ProjectComponent, ProjectService } from "../../mock-data/projects";
import { componentPreview, serviceListing, workflowDocs } from "../../mock-data/workflow-files";
import { componentTypeIcons } from "../../component-types";
import Button from "../Button";
import Badge from "../Badge";
import IconButton from "../IconButton";
import SegmentedControl from "../SegmentedControl";
import FileDetailsPanel from "./FileDetailsPanel";
import AdaptorPill from "./AdaptorPill";
import AdaptorReferencePanel from "./AdaptorReferencePanel";
import RunIOPanel from "./RunIOPanel";
import EditorExplorer from "./EditorExplorer";
import type { ExplorerFile } from "./EditorExplorer";
import CodePaneHeader from "./CodePaneHeader";
import ReadOnlyNotice from "./ReadOnlyNotice";
import CodeEditor from "./CodeEditor";
import type { CodeEditorHandle } from "./CodeEditor";
import EditorStatusBar from "./EditorStatusBar";
import StepConfigPanel from "./StepConfigPanel";
import type { StepChanges } from "./StepConfigPanel";
import TriggerConfigPanel from "./TriggerConfigPanel";
import WorkflowSettingsPanel from "./WorkflowSettingsPanel";
import Surface from "../Surface";

interface Props {
  workflow: Workflow;
  file: ExplorerFile;
  onOpen: (file: ExplorerFile) => void;
  /** The selected run; steps show how they went in the explorer, and a step's input and output show in I/O. */
  run?: RunDetails;
  dataclips?: Dataclip[];
  /** Opens the step's input or output from I/O in the panel under the code. */
  onExpandRunData?: (section: "input" | "output") => void;
  /** Project components the workflow uses, listed in the explorer. */
  components?: ProjectComponent[];
  /** Opens a component's page in the project. */
  onOpenComponent?: (componentId: string) => void;
  /** The published service the workflow backs, listed as service.md. */
  service?: ProjectService;
  /** Opens the service's listing page. */
  onOpenService?: () => void;
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
  /** A step's code was edited in the editor (or a snippet inserted). Without it, the code is read-only. */
  onCodeChange?: (stepId: string, code: string) => void;
  onDeleteStep?: (stepId: string) => void;
  onAddStep?: () => void;
  /** Docs added alongside context.md and spec.md, by file name. */
  docs?: string[];
  onAddDoc?: () => void;
  /** Opens the picker for a new project component. */
  onAddComponent?: () => void;
  /**
   * Shown in the main pane in place of the code editor, for an open item
   * that isn't text, such as the workflow's Health page. The path row,
   * panel, status bar and details column stay as they are.
   */
  pane?: ReactNode;
  /** The panel inline under the code. */
  bottomTray?: ReactNode;
  /** Hide the explorer column (toggled from the toolbar). */
  showExplorer?: boolean;
  /** The details column beside the code, and which of its views shows. I/O shows only while a run is loaded. */
  showDetails?: boolean;
  detailsView?: DetailsViewId;
  onDetailsViewChange?: (view: DetailsViewId) => void;
  /** The ⋯ layout menu, shown at the top-right corner of the code area. */
  layoutMenu?: ReactNode;
  /** Closes the code view (back to the canvas), from the X at the top-right corner, right of the ⋯. */
  onClose?: () => void;
  /** A note for the status bar, e.g. "Tested by the assistant". */
  statusNote?: string;
  /** Steps changed in this session and not yet promoted, by id. */
  dirtyStepIds?: string[];
}

/**
 * Code mode: the explorer on the left, the code in the middle under a path
 * row (no file tabs: the explorer is the list of what can be opened), and
 * the details column on the right with two views: the open item's config
 * and, for a step, its adaptor's snippets, which insert at the cursor, and
 * its input and output (I/O) while a run is loaded. A step shows its code and its settings; the
 * trigger and `workflow.yaml` show the YAML and their settings. An item that
 * isn't text, such as Health, passes its own `pane` to show in the code's
 * place. The panel sits inline under the code. The ⋯ layout menu and the close button take
 * the top-right corner of whichever column is rightmost.
 */
export default function CodeWorkspace({
  workflow,
  file,
  onOpen,
  run,
  dataclips = [],
  onExpandRunData,
  components = [],
  onOpenComponent,
  service,
  onOpenService,
  readOnly = false,
  url,
  live = true,
  onToggleLive,
  settings,
  onSettingsChange,
  credentials = {},
  onStepChange,
  onCodeChange,
  onDeleteStep,
  onAddStep,
  docs = [],
  onAddDoc,
  onAddComponent,
  bottomTray,
  showExplorer = true,
  showDetails = true,
  detailsView = "snippets",
  onDetailsViewChange,
  layoutMenu,
  onClose,
  statusNote,
  dirtyStepIds = [],
  pane,
}: Props) {
  const step =
    typeof file === "object" && "stepId" in file
      ? workflow.nodes.find((n): n is JobNode => n.type === "job" && n.id === file.stepId)
      : undefined;
  const component =
    typeof file === "object" && "componentId" in file ? components.find((c) => c.id === file.componentId) : undefined;
  const doc = file === "context" ? "context" : file === "spec" ? "spec" : undefined;
  const listing = file === "service" ? service : undefined;
  const addedDoc = typeof file === "object" && "docName" in file ? file.docName : undefined;
  const health = file === "health";
  const fileName = addedDoc ?? (doc ? `${doc}.md` : listing ? "service.md" : health ? "Health" : "workflow.yaml");
  const trigger = workflow.nodes.find((n): n is TriggerNode => n.type === "trigger");
  const yaml = workflowToYaml(workflow);
  const triggerYaml = yaml.slice(yaml.indexOf("triggers:"), yaml.indexOf("edges:")).trimEnd();
  const editor = useRef<CodeEditorHandle>(null);
  const editable = Boolean(step && !readOnly && onCodeChange);

  const path =
    step !== undefined
      ? [step.label]
      : component !== undefined
        ? [workflow.name, "Components", component.name]
        : file === "trigger" && trigger
          ? [trigger.label]
          : [workflow.name, fileName];

  const code = step
    ? step.body
    : component
      ? componentPreview(component)
      : file === "trigger"
        ? triggerYaml
        : doc
          ? workflowDocs[doc]
          : listing
            ? serviceListing(listing)
            : addedDoc
            ? `# ${addedDoc.replace(/\.md$/, "")}\n`
            : yaml;

  const adaptorPill = step && (
    <AdaptorPill
      adaptor={step.adaptor}
      showVersion
      compact
      title="Open the step's config"
      onClick={onDetailsViewChange ? () => onDetailsViewChange("config") : undefined}
    />
  );

  // I/O needs a loaded run; without one a step falls back to its snippets, the trigger to its config.
  const hasIO = Boolean(run && (step || file === "trigger"));
  const view: DetailsViewId = step
    ? detailsView === "io" && !run ? "snippets" : detailsView
    : detailsView === "io" && hasIO ? "io" : "config";

  const detailsBody =
    view === "io" && run ? (
      <RunIOPanel run={run} jobId={step?.id} dataclips={dataclips} onExpand={onExpandRunData} />
    ) : view === "snippets" && step ? (
      <AdaptorReferencePanel
        adaptor={step.adaptor}
        onInsert={editable ? (s) => editor.current?.insert(s.code) : undefined}
        stepLabel={step.label}
      />
    ) : step ? (
      <StepConfigPanel
        key={step.id}
        step={step}
        credentialId={credentials[step.id]}
        readOnly={readOnly}
        onChange={onStepChange ? (changes) => onStepChange(step.id, changes) : undefined}
        onDelete={onDeleteStep ? () => onDeleteStep(step.id) : undefined}
        showHeader={false}
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
        showHeader={false}
      />
    ) : doc ? (
      <FileDetailsPanel
        title={`${doc}.md`}
        description={
          doc === "context"
            ? "The legislation behind the workflow and the groups of citizens it affects. The assistant reads it before proposing changes."
            : "What goes in, what each step writes, and when a run counts as done."
        }
        properties={[
          { icon: User, label: "Edited by", value: "Brandon Jackson" },
          { icon: Calendar, label: "Updated", value: doc === "context" ? "14 Oct 2026" : "2 Sep 2026" },
        ]}
        showHeader={false}
      />
    ) : listing ? (
      <FileDetailsPanel
        title="service.md"
        tag={<Badge label={listing.status} />}
        description="The listing other teams see in the service catalog: how to call the service and what it returns."
        properties={[
          { icon: BookOpen, label: "Service", value: listing.name },
          ...(listing.api ? [{ icon: Radio, label: "Trigger", value: listing.api.trigger === "webhook" ? "Webhook" : "Schedule" }] : []),
          { icon: FolderKanban, label: "Project", value: workflow.project },
        ]}
        action={
          onOpenService && (
            <Button variant="secondary" size="sm" icon={ExternalLink} onClick={onOpenService}>
              Open listing
            </Button>
          )
        }
        showHeader={false}
      />
    ) : health ? (
      <FileDetailsPanel
        title="Health"
        description="How the workflow has been doing: every run of it in the period, on any version and however it started. Pick a run from Triage to load it."
        properties={[
          { icon: Layers, label: "Versions", value: "All" },
          { icon: History, label: "Source", value: "Run history" },
          { icon: FolderKanban, label: "Project", value: workflow.project },
        ]}
        showHeader={false}
      />
    ) : addedDoc ? (
      <FileDetailsPanel
        title={addedDoc}
        description="A new doc kept alongside the workflow. The assistant reads it with the context and spec."
        properties={[
          { icon: User, label: "Created by", value: "You" },
          { icon: Calendar, label: "Updated", value: "Just now" },
        ]}
        showHeader={false}
      />
    ) : file === "trigger" && trigger ? (
      <TriggerConfigPanel trigger={trigger} url={url} readOnly={readOnly} live={live} onToggleLive={onToggleLive} showHeader={false} />
    ) : (
      <WorkflowSettingsPanel workflow={workflow} settings={settings} readOnly={readOnly} onChange={onSettingsChange} showHeader={false} />
    );

  // The top-right corner: the ⋯ layout menu, then the close button.
  const cornerControls = (layoutMenu || onClose) && (
    <div className="flex flex-none items-center gap-1">
      {layoutMenu}
      {onClose && <IconButton icon={X} label="Close code view" onClick={onClose} />}
    </div>
  );

  const statusItems = step
    ? [`${step.adaptor}@${adaptorInfo[step.adaptor].version}`, step.label]
    : component
      ? [component.type.toLowerCase(), component.name]
      : file === "trigger" && trigger
        ? [trigger.triggerType, trigger.label]
        : [fileName];
  // Components and the service listing belong to the project, so they're always read-only here.
  const lineCount = pane ? undefined : `${code.split("\n").length} lines`;
  const saveState = pane ? undefined : readOnly || component || listing ? "Read-only" : step && dirtyStepIds.includes(step.id) ? "Unsaved changes" : "Saved";
  const statusTrailing = [statusNote, lineCount, saveState].filter(Boolean) as string[];

  return (
    <Surface className="flex h-full overflow-hidden">
      {showExplorer && (
      <div className="w-64 flex-none border-r border-gray-100">
        <EditorExplorer
          workflow={workflow}
          file={file}
          onOpen={onOpen}
          run={run}
          components={components}
          hasService={service !== undefined}
          docs={docs}
          readOnly={readOnly}
          onAddDoc={readOnly ? undefined : onAddDoc}
          onAddStep={readOnly ? undefined : onAddStep}
          onAddComponent={readOnly ? undefined : onAddComponent}
        />
      </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <CodePaneHeader
          path={path}
          leading={adaptorPill}
          actions={
            readOnly || !showDetails ? (
              <>
                {readOnly && !pane && <ReadOnlyNotice variant="tag" />}
                {!showDetails && cornerControls}
              </>
            ) : undefined
          }
        />
        <div className="min-h-0 flex-1 overflow-hidden">
          {pane ?? (
            <CodeEditor
              ref={editor}
              key={step?.id ?? path.join("/")}
              code={code}
              onChange={step && editable ? (next) => onCodeChange!(step.id, next) : undefined}
            />
          )}
        </div>
        {bottomTray}
        <EditorStatusBar items={statusItems} trailing={statusTrailing} />
      </div>

      {showDetails && (
        <div className="flex w-80 flex-none flex-col border-l border-gray-100">
          <div className="flex h-10 flex-none items-center justify-between gap-2 border-b border-gray-100 px-2">
            <SegmentedControl
              variant="pill"
              options={[
                { id: "config", label: component || doc || listing || addedDoc || health ? "Details" : "Config" },
                ...(step ? [{ id: "snippets", label: "Snippets" }] : []),
                ...(hasIO ? [{ id: "io", label: "I/O" }] : []),
              ]}
              value={view}
              onChange={(v) => onDetailsViewChange?.(v as DetailsViewId)}
            />
            {cornerControls}
          </div>
          <div className="min-h-0 flex-1">{detailsBody}</div>
        </div>
      )}
    </Surface>
  );
}
