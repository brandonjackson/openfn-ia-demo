import { BookOpen, Clock, FileText, Globe, Plus, Radio, Workflow as WorkflowIcon } from "lucide-react";
import type { JobNode, RunDetails, TriggerNode, Workflow } from "../../mock-data/workflow";
import type { ProjectComponent } from "../../mock-data/projects";
import { componentTypeIcons } from "../../component-types";
import ExplorerRow from "./ExplorerRow";
import { AdaptorIcon } from "./AdaptorIcon";

/**
 * What the code view can have open: one of the workflow's files (a doc added
 * this session goes by its file name), the trigger, a step, or a project
 * component the workflow uses.
 */
export type ExplorerFile =
  | "workflow"
  | "context"
  | "spec"
  | "service"
  | "trigger"
  | { docName: string }
  | { stepId: string }
  | { componentId: string };

function explorerFileId(file: ExplorerFile): string {
  if (typeof file === "string") return file;
  if ("docName" in file) return `doc:${file.docName}`;
  return "stepId" in file ? `step:${file.stepId}` : `component:${file.componentId}`;
}

const triggerIcon = { webhook: Globe, cron: Clock, kafka: Radio };

interface Props {
  workflow: Workflow;
  file: ExplorerFile;
  onOpen: (file: ExplorerFile) => void;
  /** The selected run; each step shows how it went. */
  run?: RunDetails;
  /** Project components the workflow uses: artifacts, forms, collections, channels. */
  components?: ProjectComponent[];
  /** Lists service.md, the listing of the published service the workflow backs. */
  hasService?: boolean;
  /** Docs added alongside context.md and spec.md, by file name. */
  docs?: string[];
  /** On main: each group's + shows but is disabled, pointing to a sandbox. */
  readOnly?: boolean;
  /** The + on each group. */
  onAddDoc?: () => void;
  onAddStep?: () => void;
  onAddComponent?: () => void;
}

/**
 * The left-hand explorer in code mode, in three groups: the workflow's own
 * files (its YAML, context, spec, service listing and any added docs), its trigger and steps in
 * the order they run, and the project components it uses. Each group adds
 * from the + beside its heading (disabled on main). You move between them here rather than
 * through tabs. With a run loaded, each step shows how it went.
 */
export default function EditorExplorer({
  workflow,
  file,
  onOpen,
  run,
  components = [],
  hasService = false,
  docs = [],
  readOnly = false,
  onAddDoc,
  onAddStep,
  onAddComponent,
}: Props) {
  const current = explorerFileId(file);
  const trigger = workflow.nodes.find((n): n is TriggerNode => n.type === "trigger");
  const steps = workflow.nodes.filter((n): n is JobNode => n.type === "job");
  const startedAtTrigger =
    run !== undefined && trigger !== undefined && workflow.edges.some((e) => e.source === trigger.id && e.target === run.steps[0]?.jobId);

  return (
    <nav aria-label="Explorer" className="flex h-full flex-col overflow-y-auto px-3 py-3">
      <div className="mb-2 px-2 font-mono text-[11px] uppercase tracking-widest text-gray-400">Explorer</div>

      <Section title="Workflow" addLabel="New doc" onAdd={onAddDoc} readOnly={readOnly}>
        <ExplorerRow label="workflow.yaml" icon={WorkflowIcon} selected={current === "workflow"} onClick={() => onOpen("workflow")} />
        <ExplorerRow label="context.md" icon={FileText} selected={current === "context"} onClick={() => onOpen("context")} />
        <ExplorerRow label="spec.md" icon={FileText} selected={current === "spec"} onClick={() => onOpen("spec")} />
        {hasService && (
          <ExplorerRow label="service.md" icon={BookOpen} selected={current === "service"} onClick={() => onOpen("service")} />
        )}
        {docs.map((name) => (
          <ExplorerRow
            key={name}
            label={name}
            icon={FileText}
            selected={current === `doc:${name}`}
            onClick={() => onOpen({ docName: name })}
          />
        ))}
      </Section>

      <Section title="Steps" addLabel="Add step" onAdd={onAddStep} readOnly={readOnly}>
        {trigger && (
          <ExplorerRow
            label={trigger.label}
            icon={triggerIcon[trigger.triggerType]}
            status={startedAtTrigger ? "success" : undefined}
            selected={current === "trigger"}
            onClick={() => onOpen("trigger")}
          />
        )}
        {steps.map((step) => (
          <ExplorerRow
            key={step.id}
            label={step.label}
            leading={<AdaptorIcon adaptor={step.adaptor} size="xs" />}
            status={run?.steps.find((s) => s.jobId === step.id)?.status}
            selected={current === `step:${step.id}`}
            onClick={() => onOpen({ stepId: step.id })}
          />
        ))}
      </Section>

      {(components.length > 0 || onAddComponent || readOnly) && (
        <Section title="Components" addLabel="Add project component" onAdd={onAddComponent} readOnly={readOnly}>
          {components.map((c) => (
            <ExplorerRow
              key={c.id}
              label={c.name}
              icon={componentTypeIcons[c.type]}
              trailing={<span className="text-xs text-gray-400">{c.type.toLowerCase()}</span>}
              selected={current === `component:${c.id}`}
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
