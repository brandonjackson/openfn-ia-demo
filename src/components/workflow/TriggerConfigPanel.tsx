import { Copy } from "lucide-react";
import type { TriggerNode } from "../../mock-data/workflow";
import { triggerTypes } from "../../mock-data/workflow";
import FormField from "../FormField";
import { Select, TextInput } from "../FormControls";
import ToggleSwitch from "../ToggleSwitch";


interface Props {
  trigger: TriggerNode;
  /** The URL that starts the workflow, for webhook triggers. */
  url?: string;
  readOnly?: boolean;
  live?: boolean;
  onToggleLive?: (live: boolean) => void;
  /** Hide the name row when a column header already names the trigger. */
  showHeader?: boolean;
}

/**
 * The trigger's settings in code mode: its type, the webhook URL to copy,
 * and whether it's enabled.
 */
export default function TriggerConfigPanel({ trigger, url, readOnly = false, live = true, onToggleLive, showHeader = true }: Props) {
  return (
    <div className="flex h-full flex-col">
      {showHeader && (
        <div className="flex h-10 flex-none items-center gap-2 border-b border-gray-100 px-4">
          <span className="truncate text-sm font-semibold text-gray-900">{trigger.label}</span>
        </div>
      )}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <FormField label="Type">
          <Select
            className="w-full"
            options={Object.values(triggerTypes).map((t) => t.shortLabel)}
            value={triggerTypes[trigger.triggerType].shortLabel}
            disabled={readOnly}
            onChange={() => {}}
          />
        </FormField>
        {trigger.triggerType === "webhook" && (
          <FormField label="Webhook URL" hint="POST a JSON body to this URL to start a run.">
            <div className="flex items-center gap-1.5">
              <TextInput readOnly value={url ?? "Available once the workflow is live"} className="font-mono text-xs" />
              {url && (
                <button
                  type="button"
                  onClick={() => void navigator.clipboard?.writeText(url)}
                  title="Copy URL"
                  aria-label="Copy URL"
                  className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
          </FormField>
        )}
        <FormField label="Enabled" hint="When off, the trigger won't start runs. You can still run manually.">
          <ToggleSwitch key={String(live)} checked={live} onChange={readOnly ? undefined : onToggleLive} label={live ? "Live" : "Paused"} />
        </FormField>
      </div>
    </div>
  );
}
