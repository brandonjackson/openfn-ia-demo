import { useState } from "react";
import { Link } from "react-router-dom";
import type { WorkflowGraph } from "../../mock-data/workflow";
import AlertDialog from "./AlertDialog";
import TextField from "./FormField";
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

/** The toggle row in the editor's forms (form/toggle-field.tsx). */
function ToggleField({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <label htmlFor="enable_job_logs" className="text-sm font-medium text-gray-900 block mb-1">
            {label}
          </label>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
        </div>
        <div className="relative">
          <input id="enable_job_logs" type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
          <div
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${checked ? "bg-indigo-600" : "bg-gray-200"}`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform flex items-center justify-center ${checked ? "translate-x-6" : "translate-x-1"}`}
            >
              {checked && <div className="hero-check w-3 h-3 text-indigo-600" />}
            </div>
          </div>
        </div>
      </div>
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
      <div className="px-6 py-6 space-y-4">
        <TextField name="name" label="Workflow Name" value={graph.name} onChange={(e) => onChange({ name: e.target.value })} />
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Workflow as YAML</h3>
          <button type="button" onClick={onViewAsYAML} className="text-sm text-indigo-600 hover:text-indigo-500" id="view-workflow-as-yaml-link">
            View your workflow as YAML code
          </button>
        </div>
        <ToggleField
          label="Allow console.log() usage"
          description="Control what's printed in run logs"
          checked={graph.enableJobLogs}
          onChange={(enableJobLogs) => onChange({ enableJobLogs })}
        />
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Concurrency</h3>
          <p className="text-sm text-gray-600 mb-3">
            Control how many of this workflow's <em>Runs</em> are executed at the same time
          </p>
          <TextField
            name="concurrency"
            type="number"
            label="Max Concurrency"
            placeholder="Unlimited (up to max available)"
            min={1}
            disabled={concurrencyDisabled}
            value={graph.concurrency ?? ""}
            onChange={(e) => onChange({ concurrency: e.target.value === "" ? null : Number(e.target.value) })}
            helpText={graph.concurrency === null ? "Unlimited (up to max available)" : undefined}
          />
          {concurrencyDisabled && (
            <div className="text-xs mt-2">
              <div className="italic text-gray-500">
                Parallel execution of runs is disabled for this project. This setting will have no effect. You can modify your
                Project Concurrency setting on the{" "}
                <Link to={`/projects/${projectId}/settings`} className="text-indigo-600 hover:text-indigo-500 underline">
                  project setup
                </Link>{" "}
                page.
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Reset Workflow</h3>
          <p className="text-sm text-gray-600 mb-4">
            Discard all uncommitted changes and restore the workflow to its latest saved snapshot. This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Reset to Latest Snapshot
          </button>
        </div>
        <AlertDialog
          isOpen={confirmReset}
          onClose={() => setConfirmReset(false)}
          onConfirm={onReset}
          title="Reset Workflow?"
          description="This will undo all uncommitted changes and restore the workflow to its latest snapshot. This action cannot be undone."
          confirmLabel="Reset Workflow"
          variant="danger"
        />
      </div>
    </InspectorLayout>
  );
}
