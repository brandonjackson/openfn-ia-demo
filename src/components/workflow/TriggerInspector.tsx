import { useState, type ReactNode } from "react";
import { webhookUrl, type EditorTrigger } from "../../mock-data/workflow";
import { cn } from "../../utils/cn";
import Button from "../Button";
import Card from "../Card";
import Disclosure from "../Disclosure";
import { Field, Label, Radio, TextInput } from "../Inputs";
import Pill from "../Pill";
import TextLink from "../TextLink";
import InspectorLayout, { InspectorFooter } from "./InspectorLayout";
import CopyButton from "../CopyButton";

const TITLES = { webhook: "On webhook call", cron: "On a schedule" } as const;

const IMMEDIATELY = {
  value: "before_start",
  label: "Immediately",
  description: "Responds immediately with a confirmation and work order ID. (Best for long running or queued workflows)",
  shortDescription: "Responds immediately with a confirmation and work order ID.",
} as const;
const ON_COMPLETE = {
  value: "after_completion",
  label: "On Complete",
  description: "Responds when the workflow completes, then returns the result.",
  shortDescription: "Responds when the workflow completes, then returns the result.",
} as const;

/** Green trigger-type pill (trigger/TriggerTypeBadge.tsx). */
export function TriggerTypeBadge({ type = "webhook" }: { type?: "webhook" | "cron" }) {
  const [icon, label] = type === "cron" ? ["hero-clock-mini", "Schedule / Cron"] : ["hero-globe-alt-mini", "Webhook"];
  return (
    <Pill color="green">
      <span className={cn(icon, "h-4 w-4")} />
      {label}
    </Pill>
  );
}

function ReadOnlyField({ id, label, value }: { id: string; label: string; value: string }) {
  return <TextInput id={id} label={label} value={value} readOnly className="text-gray-500" />;
}

/** "Webhook URL" with its help text, over the URL box(es). */
function WebhookUrlField({ children }: { children: ReactNode }) {
  return (
    <Field label="Webhook URL" hint="Send a POST request to these URLs to start this event.">
      {children}
    </Field>
  );
}

function EditFooter({ onEdit }: { onEdit: () => void }) {
  return (
    <InspectorFooter
      leftButtons={
        <Button theme="secondary" onClick={onEdit} tooltip="Edit trigger">
          Edit
        </Button>
      }
    />
  );
}

function WizardBreadcrumb({ step, onChoose }: { step: "choose" | "configure"; onChoose?: () => void }) {
  return (
    <nav aria-label="Wizard steps" className="flex items-center gap-1.5 text-xs">
      {step === "configure" && onChoose ? (
        <TextLink onClick={onChoose} className="text-gray-400 hover:text-gray-600">
          Choose
        </TextLink>
      ) : (
        <span className={step === "choose" ? "font-semibold text-gray-900 underline" : "text-gray-400"}>Choose</span>
      )}
      <span aria-hidden="true" className="text-gray-300">
        ›
      </span>
      <span className={step === "configure" ? "font-semibold text-gray-900 underline" : "text-gray-400"}>Configure</span>
    </nav>
  );
}

function WizardFooter({ label, onPrimary, onCancel }: { label: string; onPrimary: () => void; onCancel?: () => void }) {
  const primary = (
    <Button onClick={onPrimary} className={onCancel ? undefined : "w-full"}>
      {label}
      <span className="hero-arrow-right-micro h-4 w-4" />
    </Button>
  );
  return onCancel ? (
    <InspectorFooter
      leftButtons={
        <Button theme="secondary" onClick={onCancel}>
          Cancel
        </Button>
      }
      rightButtons={primary}
    />
  ) : (
    primary
  );
}

interface Props {
  trigger: EditorTrigger;
  onChange: (patch: Partial<EditorTrigger>) => void;
  onClose: () => void;
}

/**
 * The trigger inspector (inspector/TriggerInspector.tsx): a read-only "show"
 * panel per type (webhook URL, Authentication, Response; or Frequency and
 * Cron Input Source), and Edit, which steps through Choose › Configure over
 * a draft. The wizard is simplified: Configure offers the response type for
 * webhooks and a raw cron expression for schedules.
 */
export default function TriggerInspector({ trigger, onChange, onClose }: Props) {
  const [view, setView] = useState<"show" | "choose" | "configure">("show");
  const [draft, setDraft] = useState(trigger);

  const startEdit = () => {
    setDraft(trigger);
    setView("choose");
  };

  if (view === "choose") {
    const isCron = draft.type === "cron";
    return (
      <InspectorLayout
        title={TITLES[draft.type]}
        onClose={onClose}
        showBackButton={isCron}
        onBack={() => setView("show")}
        footer={<WizardFooter label="Next" onPrimary={() => setView("configure")} onCancel={isCron ? undefined : () => setView("show")} />}
      >
        <WizardBreadcrumb step="choose" />
        <Card padding="sm" className="flex items-center justify-between">
          <TriggerTypeBadge type={draft.type} />
          <TextLink
            className="text-sm font-semibold"
            onClick={() =>
              setDraft((d) =>
                d.type === "webhook"
                  ? { ...d, type: "cron", cronExpression: d.cronExpression ?? "0 0 * * *", cronDescription: d.cronDescription ?? "At 12:00 AM" }
                  : { ...d, type: "webhook" }
              )
            }
          >
            Change
          </TextLink>
        </Card>
      </InspectorLayout>
    );
  }

  if (view === "configure") {
    return (
      <InspectorLayout
        title={TITLES[draft.type]}
        onClose={onClose}
        showBackButton
        onBack={() => setView("choose")}
        footer={
          <WizardFooter
            label="Finish"
            onPrimary={() => {
              onChange(draft);
              setView("show");
            }}
          />
        }
      >
        <WizardBreadcrumb step="configure" onChoose={() => setView("choose")} />
        {draft.type === "webhook" ? (
          <>
            <WebhookUrlField>
              <Card padding="sm" className="break-all font-mono text-xs text-gray-600">
                {webhookUrl(draft.id)}
              </Card>
            </WebhookUrlField>
            <div className="space-y-2">
              <Label className="block">Response</Label>
              {[IMMEDIATELY, ON_COMPLETE].map((o) => (
                <Card key={o.value} padding="sm" className="hover:bg-gray-50">
                  <Radio
                    name="webhook-reply"
                    label={o.label}
                    hint={o.description}
                    checked={draft.webhookReply === o.value}
                    onChange={() => setDraft((d) => ({ ...d, webhookReply: o.value }))}
                  />
                </Card>
              ))}
            </div>
          </>
        ) : (
          <TextInput
            id="cron-expression"
            label="Cron Expression"
            hint="Minute, hour, day of month, month, day of week (UTC)."
            value={draft.cronExpression ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, cronExpression: e.target.value, cronDescription: e.target.value }))}
            className="font-mono"
          />
        )}
      </InspectorLayout>
    );
  }

  if (trigger.type === "cron") {
    return (
      <InspectorLayout title={TITLES.cron} onClose={onClose} footer={<EditFooter onEdit={startEdit} />}>
        <Card padding="sm">
          <TriggerTypeBadge type="cron" />
        </Card>
        <ReadOnlyField id="frequency" label="Frequency" value={trigger.cronDescription ?? trigger.cronExpression ?? "Invalid schedule"} />
        <ReadOnlyField id="cron-input-source" label="Cron Input Source" value="Final run state (default)" />
      </InspectorLayout>
    );
  }

  const url = webhookUrl(trigger.id);
  const response = trigger.webhookReply === "after_completion" ? ON_COMPLETE : IMMEDIATELY;
  return (
    <InspectorLayout title={TITLES.webhook} onClose={onClose} footer={<EditFooter onEdit={startEdit} />}>
      <TriggerTypeBadge />
      <WebhookUrlField>
        <Card padding="sm">
          <div className="flex items-center justify-between gap-2">
            <Pill>Default</Pill>
            <CopyButton value={url} label="Copy Default URL" size="sm" />
          </div>
          <div className="mt-1 break-all font-mono text-xs text-gray-600">{url}</div>
        </Card>
      </WebhookUrlField>
      <Disclosure variant="inline" defaultOpen={false} title="Authentication" note={trigger.hasAuthMethod ? "1 configured" : "none configured"}>
        {trigger.hasAuthMethod ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="hero-shield-check-micro h-4 w-4 text-green-600" />
            <span className="font-medium text-gray-700">CommCare webhook key</span>
            <span className="text-gray-400">(API Key)</span>
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            No authentication configured.{" "}
            <TextLink onClick={startEdit} className="font-medium">
              Add authentication
            </TextLink>
          </p>
        )}
      </Disclosure>
      <Disclosure variant="inline" defaultOpen={false} title="Response">
        <p className="text-xs text-gray-500">
          {response.shortDescription}{" "}
          <TextLink to="https://docs.openfn.org/documentation/build/triggers#webhook-responses" external>
            learn more
          </TextLink>
        </p>
      </Disclosure>
    </InspectorLayout>
  );
}
