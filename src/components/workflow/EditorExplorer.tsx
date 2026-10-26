import { Clock, FileText, Globe, Plus, Radio, Workflow as WorkflowIcon } from "lucide-react";
import type { JobNode, RunDetails, TriggerNode, Workflow } from "../../mock-data/workflow";
import type { ProjectComponent } from "../../mock-data/projects";
import { componentTypeIcons } from "../../component-types";
import ExplorerRow from "./ExplorerRow";
import AdaptorPill from "./AdaptorPill";

/**
 * What the code view can have open: one of the workflow's files, the
 * trigger, a step, or a project component the workflow uses.
 */
export type ExplorerFile = "workflow" | "plan" | "spec" | "trigger" | { stepId: string } | { componentId: string };

function explorerFileId(file: ExplorerFile): string {
  if (typeof file === "string") return file;
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
  /** Hidden on main, where steps can't be added. */
  onAddStep?: () => void;
}

/**
 * The left-hand explorer in code mode, in three groups: the workflow's own
 * files (its YAML, plan and spec), its trigger and steps in the order they
 * run, and the project components it uses. You move between them here
 * rather than through tabs. With a run loaded, each step shows how it went.
 */
export default function EditorExplorer({ workflow, file, onOpen, run, components = [], onAddStep }: Props) {
  const current = explorerFileId(file);
  const trigger = workflow.nodes.find((n): n is TriggerNode => n.type === "trigger");
  const steps = workflow.nodes.filter((n): n is JobNode => n.type === "job");
  const startedAtTrigger =
    run !== undefined && trigger !== undefined && workflow.edges.some((e) => e.source === trigger.id && e.target === run.steps[0]?.jobId);

  return (
    <nav aria-label="Explorer" className="flex h-full flex-col overflow-y-auto px-3 py-3">
      <div className="mb-2 flex items-center justify-between px-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-gray-400">Explorer</span>
        {onAddStep && (
          <button
            type="button"
            onClick={onAddStep}
            title="Add step"
            aria-label="Add step"
            className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      <Section title="Workflow">
        <ExplorerRow
          label="workflow.yaml"
          icon={WorkflowIcon}
          trailing={<span className="text-xs text-gray-400">settings</span>}
          selected={current === "workflow"}
          onClick={() => onOpen("workflow")}
        />
        <ExplorerRow label="plan.md" icon={FileText} selected={current === "plan"} onClick={() => onOpen("plan")} />
        <ExplorerRow label="spec.md" icon={FileText} selected={current === "spec"} onClick={() => onOpen("spec")} />
      </Section>

      <Section title="Steps">
        {trigger && (
          <ExplorerRow
            label={trigger.label}
            icon={triggerIcon[trigger.triggerType]}
            trailing={<span className="text-xs text-gray-400">{trigger.triggerType}</span>}
            status={startedAtTrigger ? "success" : undefined}
            selected={current === "trigger"}
            onClick={() => onOpen("trigger")}
          />
        )}
        {steps.map((step) => (
          <ExplorerRow
            key={step.id}
            label={step.label}
            trailing={<AdaptorPill adaptor={step.adaptor} compact />}
            status={run?.steps.find((s) => s.jobId === step.id)?.status}
            selected={current === `step:${step.id}`}
            onClick={() => onOpen({ stepId: step.id })}
          />
        ))}
        {onAddStep && (
          <button
            type="button"
            onClick={onAddStep}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          >
            <Plus size={14} className="text-gray-400" /> Add step
          </button>
        )}
      </Section>

      {components.length > 0 && (
        <Section title="Components">
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-1 px-2 font-mono text-[10px] uppercase tracking-widest text-gray-400">{title}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
