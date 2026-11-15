import { useState } from "react";
import { Pencil, Send } from "lucide-react";
import type { TriggerNode } from "../../model/workflow";
import { triggerTypes } from "../../model/workflow";
import type { TriggerEdit } from "../../model/workflow-edits";
import type { ProjectServiceItem } from "../../model/services";
import { defaultCron, triggerSubtitle } from "../../model/cron";
import Button from "../primitives/Button";
import Card from "../primitives/Card";
import CodeBlock from "../primitives/CodeBlock";
import CopyValue from "../primitives/CopyValue";
import FormField from "../primitives/FormField";
import IconTile from "../primitives/IconTile";
import Inline from "../primitives/Inline";
import SectionHeading from "../primitives/SectionHeading";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import ToggleSwitch from "../primitives/ToggleSwitch";
import CronScheduleField from "./CronScheduleField";
import ServiceListingFormModal, { type ServiceListingDraft } from "./ServiceListingFormModal";
import TriggerTypePicker from "./TriggerTypePicker";

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
  /** On main nothing can be changed, except whether the workflow is live: that's the trigger's switch, not an edit. */
  readOnly?: boolean;
  /** Whether the trigger is on, which is whether the workflow is live (off, it's paused). */
  live?: boolean;
  /** Turns the trigger on or off, the same as pausing or resuming the workflow. Left out, the switch only reads. */
  onToggleLive?: (live: boolean) => void;
  /** Changes the trigger's kind or a cron's schedule, saved with the workflow like any edit. Left out (main), Change and the schedule only read. */
  onChange?: (changes: TriggerEdit) => void;
  /** Hide the name row when a column header already names the trigger. */
  showHeader?: boolean;
  /** The service the workflow is published as, whose listing shows on its webhook trigger. */
  service?: ProjectServiceItem;
  /** Show a webhook's service listing. Off when workflows can't be published as services (no service catalog). */
  showServiceAnnotations?: boolean;
  /** Saves the service's listing (its name and description); rejects with why not. Left out for anyone who can't change it. */
  onEditListing?: (listing: ServiceListingDraft) => Promise<void>;
  /** Publishes the workflow as a service under a listing; rejects with why not. Left out for anyone who can't publish. */
  onPublish?: (listing: ServiceListingDraft) => Promise<void>;
  /** The workflow's name, which a new listing starts from. */
  workflowName?: string;
}

/**
 * The trigger's settings in code mode, laid out as the step's are: what
 * kind of trigger it is, on a card with Change (a webhook or a schedule,
 * picked from `TriggerTypePicker`), then what that kind needs: a webhook's
 * URL to copy, or a cron's schedule (`CronScheduleField`). Both are edits
 * like a step's, saved with the workflow in a sandbox and read-only on main.
 * Then whether it's enabled, which is whether the workflow is live: turning
 * it off pauses the workflow, and pausing the workflow turns it off, so the
 * switch works wherever pausing does, main included.
 *
 * A webhook trigger also shows the service the workflow is published as:
 * its listing, with Edit listing for owners and admins, and the request
 * schema and response its OpenAPI 3 docs are generated from. The listing is
 * the project's, so it's saved from here on main as in a sandbox; one not yet
 * published offers Publish as a service.
 */
export default function TriggerConfigPanel({
  trigger,
  url,
  readOnly = false,
  live = true,
  onToggleLive,
  onChange,
  showHeader = true,
  service,
  showServiceAnnotations = true,
  onEditListing,
  onPublish,
  workflowName,
}: Props) {
  const [picking, setPicking] = useState(false);
  const [listing, setListing] = useState(false);
  const kind = triggerTypes[trigger.triggerType];
  const canChange = !readOnly && !!onChange;
  const schema = requestSchema(service);
  const response = service?.api?.outputExample;

  return (
    <div className="flex h-full flex-col">
      {showHeader && (
        <div className="flex h-10 flex-none items-center gap-2 border-b border-gray-100 px-4">
          <span className="truncate text-sm font-semibold text-gray-900">{trigger.label}</span>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <Stack gap="lg">
          <FormField label="Type">
            <Card padding="sm">
              <Inline justify="between" gap="sm">
                <Inline gap="sm">
                  <IconTile icon={kind.icon} size="sm" tone="white" />
                  <Stack gap="none">
                    <Text size="sm" tone="strong">
                      {kind.shortLabel}
                    </Text>
                    <Text size="xs" tone="muted">
                      {triggerSubtitle(trigger.triggerType, trigger.cronExpression)}
                    </Text>
                  </Stack>
                </Inline>
                {canChange && (
                  <Button variant="secondary" size="xs" onClick={() => setPicking(true)} aria-label={`Change trigger type: ${kind.shortLabel}`}>
                    Change
                  </Button>
                )}
              </Inline>
            </Card>
          </FormField>

          {trigger.triggerType === "webhook" && (
            <FormField label="Webhook URL" hint="POST a JSON body to this URL to start a run.">
              {url ? <CopyValue value={url} label="Copy URL" /> : <Text size="sm" tone="muted">Available once the workflow is live</Text>}
            </FormField>
          )}

          {trigger.triggerType === "cron" && (
            <CronScheduleField
              // A schedule changed elsewhere (another copy, a reload) starts the field afresh.
              key={`${trigger.id}:${trigger.cronExpression}`}
              value={trigger.cronExpression ?? defaultCron}
              readOnly={!canChange}
              onChange={canChange ? (cronExpression) => onChange({ cronExpression }) : undefined}
            />
          )}

          <FormField label="Enabled" hint="Off pauses the workflow: the trigger won't start runs. You can still run it by hand.">
            <ToggleSwitch key={String(live)} checked={live} onChange={onToggleLive} disabled={!onToggleLive} label={live ? "Live" : "Paused"} />
          </FormField>

          {trigger.triggerType === "webhook" && showServiceAnnotations && (
            <Stack gap="md">
              <SectionHeading variant="label" compact title="Service" />
              {service ? (
                <>
                  <Card
                    padding="sm"
                    title={service.name}
                    description={service.description || "No description yet."}
                    actions={
                      onEditListing && (
                        <Button variant="secondary" size="xs" icon={Pencil} onClick={() => setListing(true)}>
                          Edit listing
                        </Button>
                      )
                    }
                  />
                  <Text size="xs" tone="muted">
                    The listing other teams find the service by. The request schema and response below generate its OpenAPI 3 docs; they come from the workflow, so they change as it does.
                  </Text>
                  {schema && <CodeBlock label="Request schema" code={schema} tone="light" />}
                  {response && <CodeBlock label="Response" code={response} tone="light" />}
                  {service.xroad?.published && (
                    <Text size="xs" tone="muted">
                      Runs started over X-Road get the caller on <Text mono size="xs" tone="strong">state.xroad</Text>, read-only, for access checks and audit.
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <Text size="xs" tone="muted">
                    Publish this workflow as a service to list it in the service catalog, where other teams find it, with OpenAPI 3 docs made from its webhook.
                  </Text>
                  {onPublish && (
                    <Inline>
                      <Button variant="secondary" size="xs" icon={Send} onClick={() => setListing(true)}>
                        Publish as a service
                      </Button>
                    </Inline>
                  )}
                </>
              )}
            </Stack>
          )}
        </Stack>
      </div>
      <TriggerTypePicker
        open={picking}
        current={trigger.triggerType}
        onPick={(triggerType) => onChange?.(triggerType === "cron" ? { triggerType, cronExpression: trigger.cronExpression ?? defaultCron } : { triggerType })}
        onClose={() => setPicking(false)}
      />
      <ServiceListingFormModal
        open={listing}
        onClose={() => setListing(false)}
        workflowName={service ? undefined : workflowName}
        initial={service ? { name: service.name, description: service.description ?? "" } : undefined}
        onSubmit={(draft) => (service ? onEditListing!(draft) : onPublish!(draft))}
      />
    </div>
  );
}
