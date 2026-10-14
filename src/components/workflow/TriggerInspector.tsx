import { useState, type ReactNode } from "react";
import { webhookUrl, type EditorTrigger } from "../../mock-data/workflow";
import { cn } from "../../utils/cn";
import { linkClasses } from "./editorClasses";
import EditorButton from "./EditorButton";
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
      <span className={`${icon} h-4 w-4`} />
      {label}
    </span>
  );
}

function ReadOnlyField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-slate-900">{label}</span>
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-500">{children}</div>
    </div>
  );
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
        <span className="inline-block" title="Edit trigger">
          <EditorButton variant="secondary" onClick={onEdit} aria-label="Edit trigger">
            Edit
          </EditorButton>
        </span>
      }
    />
  );
}

function WizardBreadcrumb({ step, onChoose }: { step: "choose" | "configure"; onChoose?: () => void }) {
  return (
    <nav aria-label="Wizard steps" className="flex items-center gap-1.5 text-xs">
      {step === "configure" && onChoose ? (
        <button type="button" onClick={onChoose} className="text-slate-400 hover:text-slate-600 focus:outline-none">
          Choose
        </button>
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
    <EditorButton onClick={onPrimary} className={onCancel ? "" : "w-full"}>
      <span className="inline-flex items-center gap-1.5">
        {label}
        <span className="hero-arrow-right-micro h-4 w-4" />
      </span>
    </EditorButton>
  );
  return onCancel ? (
    <InspectorFooter
      leftButtons={
        <EditorButton variant="ghost" onClick={onCancel}>
          Cancel
        </EditorButton>
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
            <button
              type="button"
              onClick={() =>
                setDraft((d) =>
                  d.type === "webhook"
                    ? { ...d, type: "cron", cronExpression: d.cronExpression ?? "0 0 * * *", cronDescription: d.cronDescription ?? "At 12:00 AM" }
                    : { ...d, type: "webhook" }
                )
              }
              className={cn(linkClasses, "text-sm font-semibold no-underline")}
            >
              Change
            </button>
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
                  <label key={o.value} className="flex items-start gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="webhook-reply"
                      className="mt-0.5 h-4 w-4 text-primary-600 border-gray-300"
                      checked={draft.webhookReply === o.value}
                      onChange={() => setDraft((d) => ({ ...d, webhookReply: o.value }))}
                    />
                    <span>
                      <span className="block text-sm font-medium text-slate-800">{o.label}</span>
                      <span className="block text-xs text-slate-500">{o.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label htmlFor="cron-expression" className="block text-sm font-medium text-slate-900">
                Cron Expression
              </label>
              <input
                id="cron-expression"
                type="text"
                value={draft.cronExpression ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, cronExpression: e.target.value, cronDescription: e.target.value }))}
                className="block w-full rounded-lg border-slate-300 font-mono text-sm text-slate-900 focus:border-slate-400 focus:ring-0"
              />
              <p className="text-xs text-slate-500">Minute, hour, day of month, month, day of week (UTC).</p>
            </div>
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
          <ReadOnlyField label="Frequency">{trigger.cronDescription ?? trigger.cronExpression ?? "Invalid schedule"}</ReadOnlyField>
          <ReadOnlyField label="Cron Input Source">Final run state (default)</ReadOnlyField>
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
                <span className="shrink-0 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-medium leading-4 text-gray-600 ring-1 ring-inset ring-gray-200">
                  Default
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(url).catch(() => {});
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  title={copied ? "Copied!" : "Copy Default URL"}
                  aria-label={copied ? "Copied!" : "Copy Default URL"}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <span className={`block h-4 w-4 ${copied ? "hero-check-micro text-green-600" : "hero-square-2-stack-micro"}`} />
                </button>
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
              <button type="button" onClick={startEdit} className={cn(linkClasses, "text-xs font-medium no-underline")}>
                Add authentication
              </button>
            </p>
          )}
        </Collapsible>
        <Collapsible title="Response">
          <p className="text-xs leading-5 text-slate-500">
            {response.shortDescription}{" "}
            <a href="https://docs.openfn.org/documentation/build/triggers#webhook-responses" target="_blank" rel="noreferrer" className={cn(linkClasses, "text-xs")}>
              learn more
            </a>
          </p>
        </Collapsible>
      </div>
    </InspectorLayout>
  );
}
