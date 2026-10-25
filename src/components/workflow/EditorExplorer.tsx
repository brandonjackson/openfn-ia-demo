import { Clock, Globe, Plus, Radio, Workflow as WorkflowIcon } from "lucide-react";
import type { JobNode, RunDetails, TriggerNode, Workflow } from "../../mock-data/workflow";
import ExplorerRow from "./ExplorerRow";
import AdaptorPill from "./AdaptorPill";

/** What the code view can have open: the workflow file, the trigger or a step. */
export type ExplorerFile = "workflow" | "trigger" | { stepId: string };

function explorerFileId(file: ExplorerFile): string {
  return typeof file === "string" ? file : `step:${file.stepId}`;
}

const triggerIcon = { webhook: Globe, cron: Clock, kafka: Radio };

interface Props {
  workflow: Workflow;
  file: ExplorerFile;
  onOpen: (file: ExplorerFile) => void;
  /** The selected run; each step shows how it went. */
  run?: RunDetails;
  /** Hidden on main, where steps can't be added. */
  onAddStep?: () => void;
}

/**
 * The left-hand explorer in code mode: the workflow's file, its trigger and
 * its steps as a list, so you move between them here rather than through
 * tabs. With a run selected, each step shows how it went.
 */
export default function EditorExplorer({ workflow, file, onOpen, run, onAddStep }: Props) {
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
      </Section>

      {trigger && (
        <Section title="Trigger">
          <ExplorerRow
            label={trigger.label}
            icon={triggerIcon[trigger.triggerType]}
            trailing={<span className="text-xs text-gray-400">{trigger.triggerType}</span>}
            status={startedAtTrigger ? "success" : undefined}
            selected={current === "trigger"}
            onClick={() => onOpen("trigger")}
          />
        </Section>
      )}

      <Section title="Steps">
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
