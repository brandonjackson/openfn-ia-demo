import { Copy } from "lucide-react";
import type { TriggerNode } from "../../model/workflow";
import { triggerTypes } from "../../model/workflow";
import type { ProjectServiceItem } from "../../model/page-data";
import FormField from "../primitives/FormField";
import { Select, TextArea, TextInput } from "../primitives/FormControls";
import SectionHeading from "../primitives/SectionHeading";
import ToggleSwitch from "../primitives/ToggleSwitch";

/** A JSON schema for the request, from the service's documented fields. */
function requestSchema(service?: ProjectServiceItem): string {
  const fields = service?.api?.inputFields ?? [];
  if (fields.length === 0) return "";
  const properties = Object.fromEntries(
    fields.map((f) => [f.name, { type: f.type.endsWith("[]") ? "array" : f.type, description: f.description }])
  );
  return JSON.stringify(
    { type: "object", required: fields.filter((f) => f.required).map((f) => f.name), properties },
    null,
    2
  );
}


interface Props {
  trigger: TriggerNode;
  /** The URL that starts the workflow, for webhook triggers. */
  url?: string;
  readOnly?: boolean;
  live?: boolean;
  onToggleLive?: (live: boolean) => void;
  /** Hide the name row when a column header already names the trigger. */
  showHeader?: boolean;
  /** The service the workflow is published as, whose annotations live on its webhook trigger. */
  service?: ProjectServiceItem;
}

/**
 * The trigger's settings in code mode: its type, the webhook URL to copy,
 * and whether it's enabled. A webhook trigger also carries the annotations
 * that publish the workflow as a service (name, description, request and
 * response schema), which generate its OpenAPI 3 docs.
 */
export default function TriggerConfigPanel({
  trigger,
  url,
  readOnly = false,
  live = true,
  onToggleLive,
  showHeader = true,
  service,
}: Props) {
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
        {trigger.triggerType === "webhook" && (
          <div className="space-y-5 border-t border-gray-100 pt-5">
            <SectionHeading
              variant="label"
              compact
              title="Service annotations"
            />
            <p className="-mt-3 text-xs text-gray-500">
              {service
                ? "These generate the service's OpenAPI 3 docs, which callers (and X-Road) read."
                : "Annotate the webhook to publish this workflow as a service with OpenAPI 3 docs."}
            </p>
            <FormField label="Service name" htmlFor="service-name">
              <TextInput id="service-name" defaultValue={service?.name} placeholder="e.g. Register a suspected case" disabled={readOnly} />
            </FormField>
            <FormField label="Description" htmlFor="service-description">
              <TextArea id="service-description" rows={3} defaultValue={service?.description} disabled={readOnly} />
            </FormField>
            <FormField label="Request schema" htmlFor="service-request" hint="JSON Schema for the body callers send.">
              <TextArea id="service-request" rows={6} className="font-mono text-xs" defaultValue={requestSchema(service)} disabled={readOnly} />
            </FormField>
            <FormField label="Response" htmlFor="service-response" hint="An example of what the service returns.">
              <TextArea id="service-response" rows={5} className="font-mono text-xs" defaultValue={service?.api?.outputExample} disabled={readOnly} />
            </FormField>
            {service?.xroad?.published && (
              <p className="text-xs text-gray-500">
                Runs started over X-Road get the caller on <code className="font-mono text-gray-800">state.xroad</code>,
                read-only, for access checks and audit.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
