import { BookOpen, Database, FileText, FlaskConical, HeartPulse, ListChecks, Plus, Variable, Workflow as WorkflowIcon } from "lucide-react";
import IconTile from "../primitives/IconTile";
import { stepToolTypes } from "../../model/step-tools";
import type { JobNode, RunDetails, TriggerNode, Workflow } from "../../model/workflow";
import { triggerTypes } from "../../model/workflow";
import type { ProjectComponent } from "../../model/projects";
import type { ConnectedSystem } from "../../model/connected-systems";
import { componentTypeIcons } from "../../model/component-types";
import NavItem from "../primitives/NavItem";
import AdaptorLogo from "./AdaptorLogo";
import StatusPill from "./StatusPill";
import Text from "../primitives/Text";

/**
 * The workflow's files besides workflow.yaml that it may or may not have,
 * which the Workflow group's + adds: its context, its spec, its service
 * manifest (service.md) and the project's saved dataclips to run it with.
 */
export type WorkflowFileKind = "context" | "spec" | "service" | "dataclips";

/**
 * What the code view can have open: the workflow's Overview (where it is in
 * its life), one of its files (a doc added this session goes by its file
 * name), its health or its saved dataclips (pages, not files), the trigger,
 * a step, or a project component the workflow uses. Its test cases are a
 * page too.
 */
export type ExplorerFile =
  | "overview"
  | "workflow"
  | "context"
  | "spec"
  | "service"
  | "health"
  | "dataclips"
  | "testCases"
  | "envVars"
  | "trigger"
  | { docName: string }
  | { stepId: string }
  | { componentId: string };

function explorerFileId(file: ExplorerFile): string {
  if (typeof file === "string") return file;
  if ("docName" in file) return `doc:${file.docName}`;
  return "stepId" in file ? `step:${file.stepId}` : `component:${file.componentId}`;
}


interface Props {
  workflow: Workflow;
  /** The project's connected systems: a step on one is named by it under its own name. */
  systems?: ConnectedSystem[];
  file: ExplorerFile;
  onOpen: (file: ExplorerFile) => void;
  /** The selected run; each step shows how it went. */
  run?: RunDetails;
  /** Project components the workflow uses: artifacts, forms, collections, channels. */
  components?: ProjectComponent[];
  /** Lists service.yaml, the listing of the published service the workflow backs. */
  hasService?: boolean;
  /**
   * Which of the workflow's optional files it has, and so are listed:
   * context.md, spec.md, service.yaml and Saved dataclips. Defaults to the
   * context and spec, with service.md when `hasService`.
   */
  files?: WorkflowFileKind[];
  /** How many saved dataclips the project has, beside Saved dataclips. */
  savedDataclipCount?: number;
  /**
   * The workflow's test cases, listed under Saved dataclips: how many it has
   * and how many failed last time they ran. Left out, they aren't listed
   * (off with the demo's Test cases flag).
   */
  testSummary?: { total: number; failed: number };
  /** Docs added alongside context.md and spec.md, by file name. */
  docs?: string[];
  /** On main: each group's + shows but is disabled, pointing to a sandbox. */
  readOnly?: boolean;
  /** How far along the workflow is, shown beside Overview, e.g. "3 of 6". */
  stage?: string;
  /** List the Workflow group (Overview, workflow.yaml, its docs, service.yaml and Health). Off with the demo's Workflow docs flag. */
  showWorkflowFiles?: boolean;
  /** List the project's environment variables under Workflow. Off with the demo's Environment variables flag. */
  showEnvVars?: boolean;
  /** List the Components group. Off with the demo's Components flag. */
  showComponents?: boolean;
  /** The + on each group; the Workflow group's opens what can be added to it. */
  onAddFile?: () => void;
  onAddStep?: () => void;
  onAddComponent?: () => void;
}

/**
 * The left-hand explorer in code mode, in three groups: the workflow's own
 * files (its Overview, which says where it is in its life, its YAML, whichever of its context, spec, service manifest and the
 * project's saved dataclips it has, its test cases, its Health page and any added docs), its trigger and steps in
 * the order they run, and the project components it uses. Each group adds
 * from the + beside its heading (disabled on main). You move between them here rather than
 * through tabs. With a run loaded, each step shows how it went.
 */
export default function EditorExplorer({
  workflow,
  systems = [],
  file,
  onOpen,
  run,
  components = [],
  hasService = false,
  files,
  savedDataclipCount,
  testSummary,
  docs = [],
  stage,
  readOnly = false,
  showWorkflowFiles = true,
  showEnvVars = false,
  showComponents = true,
  onAddFile,
  onAddStep,
  onAddComponent,
}: Props) {
  const current = explorerFileId(file);
  const listed = new Set<WorkflowFileKind>(files ?? ["context", "spec", ...(hasService ? (["service"] as const) : [])]);
  const trigger = workflow.nodes.find((n): n is TriggerNode => n.type === "trigger");
  const steps = workflow.nodes.filter((n): n is JobNode => n.type === "job");
  const systemOf = (step: JobNode) => (step.system ? systems.find((s) => s.id === step.system) : undefined);
  const startedAtTrigger =
    run !== undefined && trigger !== undefined && workflow.edges.some((e) => e.source === trigger.id && e.target === run.steps[0]?.jobId);

  return (
    <nav aria-label="Explorer" className="flex h-full flex-col overflow-y-auto px-3 py-3">
      <div className="mb-2 px-2 font-mono text-[11px] uppercase tracking-widest text-gray-400">Explorer</div>

      {showWorkflowFiles && (
        <Section title="Workflow" addLabel="Add to workflow" onAdd={onAddFile} readOnly={readOnly}>
          <NavItem
            variant="tree"
            label="Overview"
            icon={ListChecks}
            trailing={stage && <Text tone="subtle" size="xs">{stage}</Text>}
            active={current === "overview"}
            onClick={() => onOpen("overview")}
          />
          <NavItem variant="tree" label="workflow.yaml" icon={WorkflowIcon} active={current === "workflow"} onClick={() => onOpen("workflow")} />
          {listed.has("context") && (
            <NavItem variant="tree" label="context.md" icon={FileText} active={current === "context"} onClick={() => onOpen("context")} />
          )}
          {listed.has("spec") && (
            <NavItem variant="tree" label="spec.md" icon={FileText} active={current === "spec"} onClick={() => onOpen("spec")} />
          )}
          {listed.has("service") && (
            <NavItem variant="tree" label="service.yaml" icon={BookOpen} active={current === "service"} onClick={() => onOpen("service")} />
          )}
          {listed.has("dataclips") && (
            <NavItem
              variant="tree"
              label="Saved dataclips"
              icon={Database}
              trailing={savedDataclipCount !== undefined && <Text tone="subtle" size="xs">{savedDataclipCount}</Text>}
              active={current === "dataclips"}
              onClick={() => onOpen("dataclips")}
            />
          )}
          {testSummary && (
            <NavItem
              variant="tree"
              label="Test cases"
              icon={FlaskConical}
              trailing={
                testSummary.failed > 0 ? (
                  <Text tone="danger" size="xs">
                    {testSummary.failed} failed
                  </Text>
                ) : (
                  <Text tone="subtle" size="xs">
                    {testSummary.total}
                  </Text>
                )
              }
              active={current === "testCases"}
              onClick={() => onOpen("testCases")}
            />
          )}
          <NavItem variant="tree" label="Health" icon={HeartPulse} active={current === "health"} onClick={() => onOpen("health")} />
          {showEnvVars && (
            <NavItem variant="tree" label="Environment variables" icon={Variable} active={current === "envVars"} onClick={() => onOpen("envVars")} />
          )}
          {docs.map((name) => (
            <NavItem
              variant="tree"
              key={name}
              label={name}
              icon={FileText}
              active={current === `doc:${name}`}
              onClick={() => onOpen({ docName: name })}
            />
          ))}
        </Section>
      )}

      <Section title="Steps" addLabel="Add step" onAdd={onAddStep} readOnly={readOnly}>
        {trigger && (
          <NavItem
            variant="tree"
            label={trigger.label}
            icon={triggerTypes[trigger.triggerType].icon}
            trailing={startedAtTrigger && <StatusPill status="success" variant="mark" />}
            active={current === "trigger"}
            onClick={() => onOpen("trigger")}
          />
        )}
        {steps.map((step) => {
          const status = run?.steps.find((s) => s.jobId === step.id)?.status;
          return (
            <NavItem
              variant="tree"
              key={step.id}
              label={step.label}
              description={systemOf(step)?.name}
              leading={step.tool ? <IconTile icon={stepToolTypes[step.tool.kind].icon} size="2xs" tone="indigo" /> : <AdaptorLogo adaptor={step.adaptor} size="2xs" />}
              trailing={status && <StatusPill status={status} variant="mark" />}
              active={current === `step:${step.id}`}
              onClick={() => onOpen({ stepId: step.id })}
            />
          );
        })}
      </Section>

      {showComponents && (components.length > 0 || onAddComponent || readOnly) && (
        <Section title="Components" addLabel="Add project component" onAdd={onAddComponent} readOnly={readOnly}>
          {components.map((c) => (
            <NavItem
              variant="tree"
              key={c.id}
              label={c.name}
              icon={componentTypeIcons[c.type]}
              trailing={<span className="text-xs text-gray-400">{c.type.toLowerCase()}</span>}
              active={current === `component:${c.id}`}
              onClick={() => onOpen({ componentId: c.id })}
            />
          ))}
        </Section>
      )}
    </nav>
  );
}

function Section({
  title,
  addLabel,
  onAdd,
  readOnly,
  children,
}: {
  title: string;
  addLabel: string;
  onAdd?: () => void;
  readOnly: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex h-5 items-center justify-between px-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400">{title}</span>
        {(onAdd || readOnly) && (
          <button
            type="button"
            onClick={readOnly ? undefined : onAdd}
            disabled={readOnly}
            title={readOnly ? `${addLabel}: edit in a sandbox first` : addLabel}
            aria-label={addLabel}
            className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-300"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
