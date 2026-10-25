import type { ReactNode } from "react";
import { FileCode2, Plus } from "lucide-react";
import type { RunDetails, Workflow } from "../../mock-data/workflow";
import { orderedJobs } from "../../mock-data/workflow";
import { TriggerIcon } from "./AdaptorIcon";
import AdaptorChip from "./AdaptorChip";
import StatusPill from "./StatusPill";

/**
 * The Steps tray: the workflow itself, its trigger and its steps in the order
 * a run reaches them, each with its adaptor. Picking a row opens it (its
 * code, and its settings in the Settings tray); the workflow row opens the
 * workflow's YAML and settings.
 *
 * With a run selected, each step that ran shows its status.
 * "Add step" is only offered when the workflow can be edited.
 */
export default function StepExplorer({
  workflow,
  selectedId,
  run,
  onSelect,
  onAddStep,
}: {
  workflow: Workflow;
  /** The open step or trigger; undefined means the workflow itself. */
  selectedId?: string;
  run?: RunDetails;
  onSelect?: (id: string | undefined) => void;
  /** Adds an empty step after the last one; omit when read-only. */
  onAddStep?: () => void;
}) {
  const triggers = workflow.nodes.filter((n) => n.type === "trigger");
  const jobs = orderedJobs(workflow);
  const stepFor = (jobId: string) => run?.steps.find((s) => s.jobId === jobId);

  return (
    <nav aria-label="Steps" className="space-y-4 px-2 py-3">
      <Group title="Workflow">
        <Row selected={selectedId === undefined} onClick={() => onSelect?.(undefined)}>
          <FileCode2 size={15} className="flex-shrink-0 text-gray-500" />
          <span className="min-w-0 flex-1 truncate">workflow.yaml</span>
          <span className="font-mono text-[10px] text-gray-400">settings</span>
        </Row>
      </Group>

      <Group title={triggers.length > 1 ? "Triggers" : "Trigger"}>
        {triggers.map((t) => (
          <Row key={t.id} selected={selectedId === t.id} onClick={() => onSelect?.(t.id)}>
            <TriggerIcon triggerType={t.triggerType} size="sm" />
            <span className="min-w-0 flex-1 truncate">{t.label}</span>
            <span className="font-mono text-[10px] text-gray-400">{t.triggerType}</span>
          </Row>
        ))}
      </Group>

      <Group title="Steps">
        {jobs.map((j) => {
          const step = stepFor(j.id);
          return (
            <Row key={j.id} selected={selectedId === j.id} onClick={() => onSelect?.(j.id)} title={j.label}>
              <AdaptorChip adaptor={j.adaptor} iconOnly />
              <span className="min-w-0 flex-1 truncate">{j.label}</span>
              {run && (
                <span className="flex w-2 justify-center">{step && <StatusPill status={step.status} variant="dot" />}</span>
              )}
            </Row>
          );
        })}
        {onAddStep && (
          <button
            type="button"
            onClick={onAddStep}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          >
            <Plus size={15} /> Add step
          </button>
        )}
      </Group>
    </nav>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="px-2.5 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-gray-400">{title}</p>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

function Row({
  selected,
  onClick,
  title,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        title={title}
        aria-current={selected ? "true" : undefined}
        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
          selected ? "bg-gray-100 font-medium text-gray-900" : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        {children}
      </button>
    </li>
  );
}
