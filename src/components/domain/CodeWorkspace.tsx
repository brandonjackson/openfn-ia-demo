import { useRef } from "react";
import { stepToolTypes } from "../../model/step-tools";
import type { ReactNode } from "react";
import { BookOpen, Calendar, Cloud, Database, ExternalLink, FlaskConical, FolderKanban, Globe, History, Layers, ListChecks, Plug, Radio, Sparkles, User, X } from "lucide-react";
import type { Dataclip, JobNode, RunDetails, TriggerNode, Workflow, WorkflowFileContents, WorkflowSettings } from "../../model/workflow";
import type { DetailsViewId } from "./editor-layout";
import { triggerTypes, workflowToYaml } from "../../model/workflow";
import { adaptorOperations, type AdaptorReference } from "../../model/adaptor-reference";
import type { ConnectedSystem } from "../../model/connected-systems";
import type { ProjectComponent, ProjectService } from "../../model/projects";
import { channelTypeConfig } from "./channel-types";
import { componentTypeIcons } from "../../model/component-types";
import { draftServiceManifest } from "../../model/services";
import Button from "../primitives/Button";
import Badge from "../primitives/Badge";
import IconTile from "../primitives/IconTile";
import IconButton from "../primitives/IconButton";
import FileDetailsPanel from "./FileDetailsPanel";
import EntityPill from "./EntityPill";
import AdaptorReferencePanel from "./AdaptorReferencePanel";
import RunIOPanel from "./RunIOPanel";
import EditorExplorer from "./EditorExplorer";
import type { ExplorerFile, WorkflowFileKind } from "./EditorExplorer";
import CodePaneHeader from "./CodePaneHeader";
import ReadOnlyNotice from "./ReadOnlyNotice";
import CodeEditor from "../primitives/CodeEditor";
import type { CodeEditorHandle } from "../primitives/CodeEditor";
import EditorStatusBar from "./EditorStatusBar";
import StepConfigPanel from "./StepConfigPanel";
import type { StepChanges } from "./StepConfigPanel";
import TriggerConfigPanel from "./TriggerConfigPanel";
import type { RunDataSection } from "./panel-views";
import WorkflowSettingsPanel from "./WorkflowSettingsPanel";

interface Props {
  workflow: Workflow;
  /** What the editor knows about each adaptor (name, version, snippets), the adaptors a step can switch to, and the project's credentials. */
  adaptors: AdaptorReference;
  /** The project's connected systems, for a step's config. */
  systems?: ConnectedSystem[];
  /** What the docs, service listing and project components listed in the explorer hold. */
  contents?: WorkflowFileContents;
  file: ExplorerFile;
  onOpen: (file: ExplorerFile) => void;
  /** The selected run; steps show how they went in the explorer, and a step's input and output show in I/O. */
  run?: RunDetails;
  dataclips?: Dataclip[];
  /** Opens the step's input or output from I/O in the panel under the code. */
  onExpandRunData?: (section: Exclude<RunDataSection, "log">) => void;
  /** Project components the workflow uses, listed in the explorer. */
  components?: ProjectComponent[];
  /** Opens a component's page in the project. */
  onOpenComponent?: (componentId: string) => void;
  /** The published service the workflow backs, listed as service.yaml. */
  service?: ProjectService;
  /** Opens the service's listing page. */
  onOpenService?: () => void;
  /** On main nothing can be changed. */
  readOnly?: boolean;
  /** List the workflow's own files (workflow.yaml, docs, service.yaml, Health) in the explorer. */
  showWorkflowFiles?: boolean;
  /** List the project's environment variables under Workflow in the explorer. */
  showEnvVars?: boolean;
  /** List the project components the workflow uses in the explorer. */
  showComponents?: boolean;
  /** Whether a workflow can be published as a service, which its webhook trigger's annotations do. */
  publishesServices?: boolean;
  /** The URL that starts the workflow, shown on the trigger. */
  url?: string;
  /** Whether the trigger is on, which is whether the workflow is live (off, it's paused); workflow.yaml says so. */
  live?: boolean;
  /** Turns the trigger on or off, the same as pausing or resuming the workflow; it works on main too. */
  onToggleLive?: (live: boolean) => void;
  settings: WorkflowSettings;
  onSettingsChange?: (settings: WorkflowSettings) => void;
  /** Each step's credential, by step id. */
  credentials?: Record<string, string | undefined>;
  /** Where the workflow runs, which a step's credential must have values for: the sandbox's environment, or "production" on main. */
  environment?: string;
  /** Changes each time the step's Config should scroll to its credential, e.g. from the canvas's Connect. */
  focusCredential?: number;
  /** Opens the credential form for a step's system. Left out, there's no New credential. */
  onNewCredential?: (stepId: string) => void;
  onStepChange?: (stepId: string, changes: StepChanges) => void;
  /** A step's code was edited in the editor (or a snippet inserted). Without it, the code is read-only. */
  onCodeChange?: (stepId: string, code: string) => void;
  onDeleteStep?: (stepId: string) => void;
  /** Why a step can't be deleted, by its id, or nothing when it can; its Delete step says so. */
  deleteStepBlockedReason?: (stepId: string) => string | undefined;
  onAddStep?: () => void;
  /** Which of the workflow's optional files it has (context, spec, service manifest, saved dataclips); see `EditorExplorer`. */
  files?: WorkflowFileKind[];
  /** How many saved dataclips the project has, listed beside Saved dataclips. */
  savedDataclipCount?: number;
  /** The workflow's test cases, listed under Saved dataclips; left out, they aren't listed. See `EditorExplorer`. */
  testSummary?: { total: number; failed: number };
  /** Docs added alongside context.md and spec.md, by file name. */
  docs?: string[];
  /** How far along the workflow is, shown beside Overview in the explorer, e.g. "3 of 6". */
  stage?: string;
  /** Opens what can be added to the workflow's files, from the Workflow group's +. */
  onAddFile?: () => void;
  /** Opens the picker for a new project component. */
  onAddComponent?: () => void;
  /**
   * Shown in the main pane in place of the code editor, for an open item
   * that isn't text, such as the workflow's Health page. The path row,
   * panel, status bar and details column stay as they are.
   */
  pane?: ReactNode;
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
  /**
   * Lays the pieces out. The code view's frame is a pattern (`CodeLayout`,
   * with an `EditorTray` for the details), so the page draws it and fills
   * its slots with these.
   */
  children: (slots: CodeWorkspaceSlots) => ReactNode;
}

/** The code view's pieces, for the page to put in `CodeLayout`'s slots. */
export interface CodeWorkspaceSlots {
  /** The explorer, for the left column; absent while it's hidden. */
  nav?: ReactNode;
  /** The path row over the code, with the adaptor pill and corner controls. */
  header: ReactNode;
  /** The status bar under the code. */
  footer: ReactNode;
  /** The code editor, or the open item's own pane (e.g. Health). */
  main: ReactNode;
  /** The details column, for an `EditorTray` on the right; absent while it's hidden. */
  details?: {
    tabs: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };
    /** The ⋯ layout menu and close, for the tray's corner. */
    actions?: ReactNode;
    body: ReactNode;
  };
}

/**
 * Code mode's pieces, which the page lays out in the `CodeLayout` pattern
 * (domain draws with primitives only; patterns get it through slots): the
 * explorer on the left, the code in the middle under a path row (no file
 * tabs: the explorer is the list of what can be opened), and the details
 * column on the right (in an `EditorTray`) with its views: the open item's config
 * and, for a step, its adaptor's snippets, which insert at the cursor, and
 * its input and output (I/O) while a run is loaded. A step shows its code and its settings; the
 * trigger and `workflow.yaml` show the YAML and their settings. An item that
 * isn't text, such as Health, passes its own `pane` to show in the code's
 * place. The page puts the panel (the bottom tray) under the code. The ⋯ layout menu and the close button take
 * the top-right corner of whichever column is rightmost.
 */
export default function CodeWorkspace({
  workflow,
  adaptors,
  systems = [],
  contents,
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
  showWorkflowFiles = true,
  showEnvVars = false,
  showComponents = true,
  publishesServices = true,
  url,
  live = true,
  onToggleLive,
  settings,
  onSettingsChange,
  credentials = {},
  environment,
  focusCredential,
  onNewCredential,
  onStepChange,
  onCodeChange,
  onDeleteStep,
  deleteStepBlockedReason,
  onAddStep,
  files,
  savedDataclipCount,
  testSummary,
  docs = [],
  stage,
  onAddFile,
  onAddComponent,
  showExplorer = true,
  showDetails = true,
  detailsView = "snippets",
  onDetailsViewChange,
  layoutMenu,
  onClose,
  statusNote,
  dirtyStepIds = [],
  pane,
  children,
}: Props) {
  const step =
    typeof file === "object" && "stepId" in file
      ? workflow.nodes.find((n): n is JobNode => n.type === "job" && n.id === file.stepId)
      : undefined;
  const component =
    typeof file === "object" && "componentId" in file ? components.find((c) => c.id === file.componentId) : undefined;
  const channel = component?.type === "Channel" ? contents?.channels[component.id] : undefined;
  const doc = file === "context" ? "context" : file === "spec" ? "spec" : undefined;
  const manifest = file === "service";
  const listing = manifest ? service : undefined;
  const addedDoc = typeof file === "object" && "docName" in file ? file.docName : undefined;
  const health = file === "health";
  const overview = file === "overview";
  const envVars = file === "envVars";
  const saved = file === "dataclips";
  const tests = file === "testCases";
  const fileName =
    addedDoc ??
    (doc
      ? `${doc}.md`
      : manifest
        ? "service.yaml"
        : health
          ? "Health"
          : overview
            ? "Overview"
            : saved
            ? "Saved dataclips"
            : tests
              ? "Test cases"
              : envVars
                ? "Environment variables"
                : "workflow.yaml");
  const trigger = workflow.nodes.find((n): n is TriggerNode => n.type === "trigger");
  const yaml = workflowToYaml(workflow, { enabled: live });
  const triggerYaml = yaml.slice(yaml.indexOf("triggers:"), yaml.indexOf("edges:")).trimEnd();
  const editor = useRef<CodeEditorHandle>(null);
  const editable = Boolean(step && !readOnly && onCodeChange);
  const stepAdaptor = step ? adaptors.info[step.adaptor] : undefined;
  // A step's type is its connected system, drawn with its adaptor's logo; a step on none shows its adaptor.
  const stepSystem = step?.system ? systems.find((s) => s.id === step.system) : undefined;

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
      ? ""
      : file === "trigger"
        ? triggerYaml
        : doc
          ? (contents?.docs[doc] ?? "")
          : manifest
            ? (contents?.serviceListing ?? draftServiceManifest(workflow.name))
            : addedDoc
            ? `# ${addedDoc.replace(/\.md$/, "")}\n`
            : yaml;

  // A tool step (Report outcome, Human in the loop) has settings instead of code: its pane is passed in, and it has no snippets.
  const tool = step?.tool;
  const toolType = tool && stepToolTypes[tool.kind];
  const adaptorPill = toolType ? (
    <EntityPill
      name={toolType.label}
      icon={<IconTile icon={toolType.icon} size="2xs" tone="white" round />}
      size="xs"
      title="Open the step's details"
      onClick={onDetailsViewChange ? () => onDetailsViewChange("config") : undefined}
    />
  ) : step && stepAdaptor && (
    <EntityPill
      name={stepSystem?.name ?? stepAdaptor.name}
      adaptor={step.adaptor}
      suffix={stepSystem ? undefined : stepAdaptor.version}
      size="xs"
      title="Open the step's config"
      onClick={onDetailsViewChange ? () => onDetailsViewChange("config") : undefined}
    />
  );

  // I/O needs a loaded run; without one a step falls back to its snippets, the trigger to its config.
  const hasIO = Boolean(run && (step || file === "trigger"));
  const view: DetailsViewId = tool
    ? detailsView === "io" && run ? "io" : "config"
    : step
    ? detailsView === "io" && !run ? "snippets" : detailsView
    : detailsView === "io" && hasIO ? "io" : "config";

  const detailsBody =
    view === "io" && run ? (
      <RunIOPanel run={run} jobId={step?.id} dataclips={dataclips} onExpand={onExpandRunData} />
    ) : view === "snippets" && step && stepAdaptor ? (
      <AdaptorReferencePanel
        adaptor={stepAdaptor}
        snippets={adaptors.snippets[step.adaptor] ?? []}
        onInsert={editable ? (s) => editor.current?.insert(s.code) : undefined}
        stepLabel={step.label}
      />
    ) : toolType && step ? (
      <FileDetailsPanel
        title={step.label}
        tag={<Badge label="Tool" shape="tag" />}
        description={toolType.description}
        properties={[
          { icon: toolType.icon, label: "Kind", value: toolType.label },
          { icon: FolderKanban, label: "Project", value: workflow.project },
        ]}
        showHeader={false}
      />
    ) : step && stepAdaptor ? (
      <StepConfigPanel
        key={step.id}
        step={step}
        adaptor={stepAdaptor}
        adaptorChoices={adaptors.choices.map((a) => adaptors.info[a])}
        credentials={adaptors.credentials}
        systems={systems}
        credentialId={credentials[step.id]}
        environment={environment}
        focusCredential={focusCredential}
        onNewCredential={onNewCredential ? () => onNewCredential(step.id) : undefined}
        readOnly={readOnly}
        onChange={onStepChange ? (changes) => onStepChange(step.id, changes) : undefined}
        onDelete={onDeleteStep ? () => onDeleteStep(step.id) : undefined}
        deleteBlockedReason={deleteStepBlockedReason?.(step.id)}
        showHeader={false}
      />
    ) : component ? (
      <FileDetailsPanel
        title={component.name}
        tag={<Badge label={component.type} />}
        description={component.description}
        properties={[
          { icon: componentTypeIcons[component.type], label: "Type", value: component.type },
          ...(channel
            ? [
                { icon: channelTypeConfig[channel.channelType].icon, label: "Kind", value: channelTypeConfig[channel.channelType].label },
                { icon: Plug, label: "System", value: channel.system.name },
                { icon: Globe, label: "Method", value: channel.method },
              ]
            : []),
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
        title="service.yaml"
        tag={<Badge label={listing.status} />}
        description="The listing other teams see: what the service catalog records about the service, how to call it and what it returns, and, once your organisation is on X-Road, how its Security Server registers it."
        properties={[
          { icon: BookOpen, label: "Service", value: listing.name },
          ...(listing.api ? [{ icon: Radio, label: "Trigger", value: triggerTypes[listing.api.trigger === "webhook" ? "webhook" : "cron"].shortLabel }] : []),
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
    ) : envVars ? (
      <FileDetailsPanel
        title="Environment variables"
        description="The project's variables, for every workflow in it. Each is set for one or more environments, so a key can hold a different value in production than in staging or mock."
        properties={[
          { icon: Cloud, label: "Environments", value: "Production, staging, mock" },
          { icon: FolderKanban, label: "Project", value: workflow.project },
        ]}
        showHeader={false}
      />
    ) : manifest ? (
      <FileDetailsPanel
        title="service.yaml"
        tag={<Badge label="Draft" />}
        description="The manifest other teams will see in the service catalog once the workflow is published as a service: how to call it and what it returns."
        properties={[
          { icon: User, label: "Created by", value: "You" },
          { icon: FolderKanban, label: "Project", value: workflow.project },
        ]}
        showHeader={false}
      />
    ) : saved ? (
      <FileDetailsPanel
        title="Saved dataclips"
        description="Inputs kept in the project to run the workflow with: written by hand, named from a run, or brought across when a sandbox was made."
        properties={[
          { icon: Database, label: "Saved", value: String(savedDataclipCount ?? 0) },
          { icon: FolderKanban, label: "Project", value: workflow.project },
        ]}
        showHeader={false}
      />
    ) : tests ? (
      <FileDetailsPanel
        title="Test cases"
        description="Scenarios in plain words that the assistant runs: it makes an input to match (or takes a saved dataclip), runs the workflow between the two steps, and judges the output or runs the deterministic tests. They're promoted with the workflow."
        properties={[
          { icon: FlaskConical, label: "Tests", value: String(testSummary?.total ?? 0) },
          { icon: Sparkles, label: "Synced with", value: "spec.md" },
          { icon: FolderKanban, label: "Project", value: workflow.project },
        ]}
        showHeader={false}
      />
    ) : overview ? (
      <FileDetailsPanel
        title="Overview"
        description="Where the workflow is in its life, from the problem it answers to sharing it with other teams, loosely following the OECD's public sector innovation lifecycle, with a link to where each stage is done."
        properties={[
          { icon: ListChecks, label: "Stage", value: stage ?? "–" },
          { icon: FolderKanban, label: "Project", value: workflow.project },
        ]}
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
      <TriggerConfigPanel trigger={trigger} url={url} readOnly={readOnly} live={live} onToggleLive={onToggleLive} showHeader={false} service={service} showServiceAnnotations={publishesServices} />
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

  const statusItems = toolType && step
    ? [toolType.label, step.label]
    : step
    ? [`${step.adaptor}@${stepAdaptor?.version}`, step.label]
    : component
      ? [component.type.toLowerCase(), component.name]
      : file === "trigger" && trigger
        ? [trigger.triggerType, trigger.label]
        : [fileName];
  // Components and the service listing belong to the project, so they're always read-only here.
  const lineCount = pane ? undefined : `${code.split("\n").length} lines`;
  const saveState = pane ? undefined : readOnly || component || listing ? "Read-only" : step && dirtyStepIds.includes(step.id) ? "Unsaved changes" : "Saved";
  const statusTrailing = [statusNote, lineCount, saveState].filter(Boolean) as string[];

  return children({
    nav: showExplorer ? (
      <EditorExplorer
        workflow={workflow}
        systems={systems}
        file={file}
        onOpen={onOpen}
        run={run}
        components={components}
        hasService={service !== undefined}
        files={files}
        savedDataclipCount={savedDataclipCount}
        testSummary={testSummary}
        docs={docs}
        stage={stage}
        readOnly={readOnly}
        showWorkflowFiles={showWorkflowFiles}
        showEnvVars={showEnvVars}
        showComponents={showComponents}
        onAddFile={readOnly ? undefined : onAddFile}
        onAddStep={readOnly ? undefined : onAddStep}
        onAddComponent={readOnly ? undefined : onAddComponent}
      />
    ) : undefined,
    header: (
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
    ),
    footer: <EditorStatusBar items={statusItems} trailing={statusTrailing} />,
    details: showDetails
      ? {
          tabs: {
            options: [
              { id: "config", label: component || doc || manifest || addedDoc || health || overview || saved || tests || envVars ? "Details" : "Config" },
              ...(step && !tool ? [{ id: "snippets", label: "Snippets" }] : []),
              ...(hasIO ? [{ id: "io", label: "I/O" }] : []),
            ],
            value: view,
            onChange: (v) => onDetailsViewChange?.(v as DetailsViewId),
          },
          actions: cornerControls || undefined,
          body: detailsBody,
        }
      : undefined,
    main: pane ?? (
      <CodeEditor
        ref={editor}
        key={step?.id ?? path.join("/")}
        code={code}
        calls={adaptorOperations}
        onChange={step && editable ? (next) => onCodeChange!(step.id, next) : undefined}
      />
    ),
  });
}
