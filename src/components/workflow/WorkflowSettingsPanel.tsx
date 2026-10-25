import type { Workflow, WorkflowSettings } from "../../mock-data/workflow";
import FormField from "../FormField";
import { Select, TextArea, TextInput } from "../FormControls";
import ToggleSwitch from "../ToggleSwitch";

interface Props {
  workflow: Workflow;
  settings: WorkflowSettings;
  readOnly?: boolean;
  onChange?: (settings: WorkflowSettings) => void;
}

/**
 * The workflow's settings, shown beside `workflow.yaml` in code mode and
 * opened by "Settings" in the file menu: name, description, concurrency,
 * how long run data is kept, and whether step output is logged.
 */
export default function WorkflowSettingsPanel({ workflow, settings, readOnly = false, onChange }: Props) {
  const set = (patch: Partial<WorkflowSettings>) => onChange?.({ ...settings, ...patch });
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 flex-none items-center gap-2 border-b border-gray-100 px-4">
        <span className="text-sm font-semibold text-gray-900">Workflow settings</span>
        <span className="text-xs text-gray-400">{workflow.project}</span>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <FormField label="Name" htmlFor="wf-name">
          <TextInput id="wf-name" value={settings.name} disabled={readOnly} onChange={(e) => set({ name: e.target.value })} />
        </FormField>
        <FormField label="Description" htmlFor="wf-description" hint="Shown in the service catalog and to the assistant.">
          <TextArea
            id="wf-description"
            rows={3}
            value={settings.description}
            disabled={readOnly}
            placeholder="What this workflow does and who relies on it"
            onChange={(e) => set({ description: e.target.value })}
          />
        </FormField>
        <FormField label="Concurrency" hint="How many runs may happen at once.">
          <Select
            className="w-full"
            options={["Unlimited", "1 at a time", "5 at a time", "10 at a time"]}
            value={settings.concurrency}
            disabled={readOnly}
            onChange={(e) => set({ concurrency: e.target.value })}
          />
        </FormField>
        <FormField label="Data retention">
          <Select
            className="w-full"
            options={["Project default (90 days)", "7 days", "30 days", "Keep forever"]}
            value={settings.retention}
            disabled={readOnly}
            onChange={(e) => set({ retention: e.target.value })}
          />
        </FormField>
        <FormField label="Log step output" hint="Turn off for steps that handle personal data.">
          <ToggleSwitch
            key={String(settings.logOutput)}
            checked={settings.logOutput}
            onChange={readOnly ? undefined : (v) => set({ logOutput: v })}
            label={settings.logOutput ? "On" : "Off"}
          />
        </FormField>
      </div>
    </div>
  );
}
