import { useState, type ReactNode } from "react";
import type { WorkflowGraph } from "../../mock-data/workflow";
import Button from "../Button";
import ConfirmModal from "../ConfirmModal";
import { TextInput } from "../Inputs";
import TextLink from "../TextLink";
import Toggle from "../Toggle";
import InspectorLayout from "./InspectorLayout";

interface Props {
  graph: WorkflowGraph;
  /** The project's concurrency; 1 means parallel runs are disabled. */
  projectConcurrency: number | null;
  projectId: string;
  onChange: (patch: Partial<Pick<WorkflowGraph, "name" | "concurrency" | "enableJobLogs">>) => void;
  onViewAsYAML: () => void;
  onReset: () => void;
  onClose: () => void;
}

function Section({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-gray-900">{title}</h3>
      {description && <p className="mb-3 text-sm text-gray-600">{description}</p>}
      {children}
    </div>
  );
}

/**
 * Workflow settings (`?panel=settings`, inspector/WorkflowSettings.tsx):
 * name, the YAML link, console.log toggle, max concurrency and Reset.
 */
export default function WorkflowSettings({ graph, projectConcurrency, projectId, onChange, onViewAsYAML, onReset, onClose }: Props) {
  const [confirmReset, setConfirmReset] = useState(false);
  const concurrencyDisabled = projectConcurrency === 1;
  return (
    <InspectorLayout title="Workflow settings" onClose={onClose}>
      <div className="space-y-6 p-6">
        <TextInput id="name" label="Workflow Name" value={graph.name} onChange={(e) => onChange({ name: e.target.value })} />
        <Section title="Workflow as YAML">
          <TextLink onClick={onViewAsYAML} className="text-sm">
            View your workflow as YAML code
          </TextLink>
        </Section>
        <Toggle
          label="Allow console.log() usage"
          description="Control what's printed in run logs"
          checked={graph.enableJobLogs}
          onChange={(enableJobLogs) => onChange({ enableJobLogs })}
        />
        <Section
          title="Concurrency"
          description={
            <>
              Control how many of this workflow's <em>Runs</em> are executed at the same time
            </>
          }
        >
          <TextInput
            id="concurrency"
            type="number"
            label="Max Concurrency"
            placeholder="Unlimited (up to max available)"
            min={1}
            disabled={concurrencyDisabled}
            value={graph.concurrency ?? ""}
            onChange={(e) => onChange({ concurrency: e.target.value === "" ? null : Number(e.target.value) })}
          />
          {concurrencyDisabled && (
            <p className="mt-2 text-xs italic text-gray-500">
              Parallel execution of runs is disabled for this project. This setting will have no effect. You can modify your Project
              Concurrency setting on the <TextLink to={`/projects/${projectId}/settings`}>project setup</TextLink> page.
            </p>
          )}
        </Section>
        <div className="border-t border-gray-200 pt-6">
          <Section
            title="Reset Workflow"
            description="Discard all uncommitted changes and restore the workflow to its latest saved snapshot. This action cannot be undone."
          >
            <Button theme="danger" onClick={() => setConfirmReset(true)}>
              Reset to Latest Snapshot
            </Button>
          </Section>
        </div>
      </div>
      <ConfirmModal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          onReset();
        }}
        title="Reset Workflow?"
        confirmLabel="Reset Workflow"
        tone="danger"
      >
        <p>This will undo all uncommitted changes and restore the workflow to its latest snapshot. This action cannot be undone.</p>
      </ConfirmModal>
    </InspectorLayout>
  );
}
