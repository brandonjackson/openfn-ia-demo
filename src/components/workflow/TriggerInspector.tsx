import { useState, type ReactNode } from "react";
import { webhookUrl, type EditorTrigger } from "../../mock-data/workflow";
import { cn } from "../../utils/cn";
import Button from "../Button";
import IconButton from "../IconButton";
import { Radio, TextInput } from "../Inputs";
import Pill from "../Pill";
import TextLink from "../TextLink";
import InspectorLayout, { InspectorFooter } from "./InspectorLayout";

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
    <Pill color="green" className="gap-1.5 px-2.5 py-1">
      <span className={cn(icon, "h-4 w-4")} />
      {label}
    </Pill>
  );
}

function ReadOnlyField({ id, label, value }: { id: string; label: string; value: string }) {
  return <TextInput id={id} label={label} value={value} readOnly className="text-slate-500" />;
}

function Collapsible({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 text-sm font-medium text-slate-800 focus:outline-none"
      >
        <span className={cn("h-3.5 w-3.5 transition-transform", open ? "hero-chevron-down-mini" : "hero-chevron-right-mini")} />
        {title}
        {note && <span className="text-xs font-normal text-slate-400">({note})</span>}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
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
        <TextLink onClick={onChoose} className="text-slate-400 hover:text-slate-600">
          Choose
        </TextLink>
      ) : (
        <span className={step === "choose" ? "font-semibold text-slate-900 underline" : "text-slate-400"}>Choose</span>
      )}
      <span aria-hidden="true" className="text-slate-300">
        ›
      </span>
      <span className={step === "configure" ? "font-semibold text-slate-900 underline" : "text-slate-400"}>Configure</span>
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
  const [copied, setCopied] = useState(false);

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
        <div className="space-y-6 p-6">
          <WizardBreadcrumb step="choose" />
          <div className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
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
          </div>
        </div>
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
        <div className="space-y-6 p-6">
          <WizardBreadcrumb step="configure" onChoose={() => setView("choose")} />
          {draft.type === "webhook" ? (
            <>
              <div>
                <div className="block text-sm font-medium leading-6 text-slate-800">Webhook URL</div>
                <p className="block text-xs text-slate-500">Send a POST request to these URLs to start this event.</p>
                <div className="mt-2 rounded-lg border border-gray-200 px-2 py-2 break-all font-mono text-xs leading-5 text-slate-600">
                  {webhookUrl(draft.id)}
                </div>
              </div>
              <div className="space-y-2">
                <span className="block text-sm font-medium text-slate-800">Response</span>
                {[IMMEDIATELY, ON_COMPLETE].map((o) => (
                  <div key={o.value} className="rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50">
                    <Radio
                      name="webhook-reply"
                      label={o.label}
                      hint={o.description}
                      checked={draft.webhookReply === o.value}
                      onChange={() => setDraft((d) => ({ ...d, webhookReply: o.value }))}
                    />
                  </div>
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
        </div>
      </InspectorLayout>
    );
  }

  if (trigger.type === "cron") {
    return (
      <InspectorLayout title={TITLES.cron} onClose={onClose} footer={<EditFooter onEdit={startEdit} />}>
        <div className="p-6 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
            <TriggerTypeBadge type="cron" />
          </div>
          <ReadOnlyField id="frequency" label="Frequency" value={trigger.cronDescription ?? trigger.cronExpression ?? "Invalid schedule"} />
          <ReadOnlyField id="cron-input-source" label="Cron Input Source" value="Final run state (default)" />
        </div>
      </InspectorLayout>
    );
  }

  const url = webhookUrl(trigger.id);
  const response = trigger.webhookReply === "after_completion" ? ON_COMPLETE : IMMEDIATELY;
  return (
    <InspectorLayout title={TITLES.webhook} onClose={onClose} footer={<EditFooter onEdit={startEdit} />}>
      <div className="p-6 space-y-6">
        <div>
          <TriggerTypeBadge />
        </div>
        <div>
          <div className="block text-sm font-medium leading-6 text-slate-800">Webhook URL</div>
          <p className="block text-xs text-slate-500">Send a POST request to these URLs to start this event.</p>
          <ul className="mt-2 divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200">
            <li className="px-2 py-2">
              <div className="flex items-center justify-between gap-2">
                <Pill>Default</Pill>
                <IconButton
                  icon={copied ? "hero-check-micro" : "hero-square-2-stack-micro"}
                  label={copied ? "Copied!" : "Copy Default URL"}
                  size="sm"
                  className={cn(copied && "text-green-600 hover:text-green-600")}
                  onClick={() => {
                    void navigator.clipboard?.writeText(url).catch(() => {});
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                />
              </div>
              <div className="mt-0.5 break-all font-mono text-xs leading-5 text-slate-600">{url}</div>
            </li>
          </ul>
        </div>
        <Collapsible title="Authentication" note={trigger.hasAuthMethod ? "1 configured" : "none configured"}>
          {trigger.hasAuthMethod ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="hero-shield-check-micro h-4 w-4 text-green-600" />
              <span className="font-medium text-slate-700">CommCare webhook key</span>
              <span className="text-slate-400">(API Key)</span>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No authentication configured.{" "}
              <TextLink onClick={startEdit} className="text-xs font-medium">
                Add authentication
              </TextLink>
            </p>
          )}
        </Collapsible>
        <Collapsible title="Response">
          <p className="text-xs leading-5 text-slate-500">
            {response.shortDescription}{" "}
            <TextLink to="https://docs.openfn.org/documentation/build/triggers#webhook-responses" external className="text-xs">
              learn more
            </TextLink>
          </p>
        </Collapsible>
      </div>
    </InspectorLayout>
  );
}
