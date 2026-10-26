import { useState } from "react";
import type { ReactNode } from "react";
import { Clock, Code2, Copy, Globe, History, PanelRight, Play, Radio, Trash2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Dataclip, RunDetails, TriggerNode, WorkflowNode } from "../../mock-data/workflow";
import { adaptorInfo, credentialsFor } from "../../mock-data/adaptor-reference";
import type { PanelViewId } from "../../editor-layout";
import FormField from "../FormField";
import { TextInput } from "../FormControls";
import Button from "../Button";
import Badge from "../Badge";
import ToggleSwitch from "../ToggleSwitch";
import AdaptorPill from "./AdaptorPill";
import StatusPill from "./StatusPill";
import DataSnippet from "./DataSnippet";
import type { StepChanges } from "./StepConfigPanel";

/** The run data sections the inspector shows, and which one can fill it. */
export type InspectorSection = "log" | "input" | "output";

const triggerType: Record<TriggerNode["triggerType"], { label: string; icon: LucideIcon }> = {
  webhook: { label: "Webhook", icon: Globe },
  cron: { label: "Schedule", icon: Clock },
  kafka: { label: "Kafka topic", icon: Radio },
};

interface Props {
  node: WorkflowNode;
  credentialId?: string;
  /** On main nothing can be changed. */
  readOnly?: boolean;
  /** The loaded run, to show the step's log, input and output. */
  run?: RunDetails;
  dataclips?: Dataclip[];
  /** The URL that starts the workflow, for webhook triggers. */
  url?: string;
  live?: boolean;
  onToggleLive?: (live: boolean) => void;
  onChange?: (changes: StepChanges) => void;
  /** Opens the step's code. */
  onOpenCode?: () => void;
  onRunFromHere?: () => void;
  onDelete?: () => void;
  /** Opens the full panel on a view, for the room a snippet can't give. */
  onOpenPanel?: (view: PanelViewId) => void;
  /** Opens the run history when no run is loaded. */
  onBrowseRuns?: () => void;
  onClose?: () => void;
  /** Extra header controls, e.g. the layout menu. */
  actions?: ReactNode;
  /** Start with a section at full width (useful for stories). */
  defaultExpanded?: InspectorSection;
}

/**
 * The inspector: a small card over the right of the canvas for the selected
 * node, the step's name, adaptor and credential or the trigger's type, URL
 * and switch, with the essentials of the loaded run under them. The run's
 * Log, Input and Output show as snippets, a few lines each, and any of them
 * can expand to fill the card at full width (80 columns) and collapse back.
 * The full panel, with every view and the run history, is one click away
 * from the header, as is the step's code.
 */
export default function StepInspector({
  node,
  credentialId,
  readOnly = false,
  run,
  dataclips = [],
  url,
  live = true,
  onToggleLive,
  onChange,
  onOpenCode,
  onRunFromHere,
  onDelete,
  onOpenPanel,
  onBrowseRuns,
  onClose,
  actions,
  defaultExpanded,
}: Props) {
  const [expanded, setExpanded] = useState<InspectorSection | undefined>(defaultExpanded);
  const job = node.type === "job" ? node : undefined;
  const trigger = node.type === "trigger" ? node : undefined;
  const step = job ? run?.steps.find((s) => s.jobId === job.id) : undefined;
  const clip = (id?: string) => dataclips.find((d) => d.id === id);

  // What the run sections show: the step's slice, or the whole run for the trigger.
  const data = run
    ? job
      ? step
        ? {
            logs: run.logs.filter((l) => l.stepId === step.id),
            input: clip(step.inputId),
            output: clip(step.outputId),
            outputMissing: step.status === "running" || step.status === "pending" ? "This step hasn't finished yet." : "This step's output wasn't kept.",
          }
        : undefined
      : {
          logs: run.logs.filter((l) => !l.stepId),
          input: clip(run.inputId),
          output: undefined,
          outputMissing: "",
        }
    : undefined;

  const section = (id: InspectorSection, title: string, lines: string[], extra: Partial<Parameters<typeof DataSnippet>[0]>) => (
    <DataSnippet
      key={id}
      title={title}
      lines={lines}
      expanded={expanded === id}
      folded={expanded !== undefined && expanded !== id}
      onExpand={() => setExpanded(id)}
      onCollapse={() => setExpanded(undefined)}
      {...extra}
    />
  );

  return (
    <section
      aria-label="Inspector"
      className={`flex max-h-full flex-col rounded-xl border border-gray-200 bg-white shadow-xl transition-[width] duration-200 ease-out motion-reduce:transition-none ${
        expanded ? "h-full w-[720px] max-w-[calc(100vw-2rem)]" : "w-[380px]"
      }`}
    >
      <header className="flex h-12 flex-none items-center gap-2 border-b border-gray-100 pl-4 pr-2">
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{node.label}</h2>
        {step && <StatusPill status={step.status} />}
        <div className="flex flex-shrink-0 items-center gap-0.5">
          {actions}
          {job && onOpenCode && <HeaderButton label="Open code" icon={Code2} onClick={onOpenCode} />}
          {onOpenPanel && (
            <HeaderButton label="Open in panel" icon={PanelRight} onClick={() => onOpenPanel(expanded ?? (run && step ? "log" : "step"))} />
          )}
          {onClose && <HeaderButton label="Close inspector" icon={X} onClick={onClose} />}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {job && (
          <>
            <FormField label="Name" htmlFor="inspector-name">
              <TextInput
                id="inspector-name"
                value={job.label}
                disabled={readOnly}
                onChange={(e) => onChange?.({ label: e.target.value })}
              />
            </FormField>
            <AdaptorRow
              adaptor={job.adaptor}
              credentialId={credentialId}
              readOnly={readOnly}
              onConnect={(id) => onChange?.({ credentialId: id })}
            />
          </>
        )}

        {trigger && (
          <>
            <TriggerTypeRow trigger={trigger} />
            {trigger.triggerType === "webhook" && <WebhookUrl url={url} />}
            <FormField label="Enabled" hint="When off, the trigger won't start runs. You can still run manually.">
              <ToggleSwitch key={String(live)} checked={live} onChange={readOnly ? undefined : onToggleLive} label={live ? "Live" : "Paused"} />
            </FormField>
          </>
        )}

        {run && data && (
          <div className="flex min-h-0 flex-1 flex-col gap-3 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <StatusPill status={run.status} variant="dot" />
              <span className="truncate">
                Run <code className="font-mono">{run.runId.slice(0, 6)}</code>
                {step ? ` · ${step.duration}` : job ? "" : ` · ${run.when}`}
              </span>
            </div>
            {section("log", "Log", data.logs.map((l) => l.message), {
              tags: data.logs.map((l) => l.source),
              tone: "dark",
              meta: `${data.logs.length} ${data.logs.length === 1 ? "line" : "lines"}`,
              empty: "This step wrote nothing to the log.",
            })}
            {section("input", "Input", data.input?.body.split("\n") ?? [], {
              meta: data.input?.name,
              empty: job ? "This step's input wasn't kept." : "This run's input wasn't kept.",
            })}
            {job &&
              section("output", "Output", data.output?.body.split("\n") ?? [], {
                meta: data.output?.name,
                empty: data.outputMissing,
              })}
          </div>
        )}

        {run && !data && (
          <p className="border-t border-gray-100 pt-3 text-xs text-gray-500">
            This step wasn't part of run <code className="font-mono">{run.runId.slice(0, 6)}</code>.
          </p>
        )}

        {!run && (
          <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500">Load a run to see {job ? "this step's log, input and output" : "its input and log"}.</p>
            {onBrowseRuns && (
              <Button variant="ghost" size="xs" icon={History} onClick={onBrowseRuns} className="flex-shrink-0">
                Runs
              </Button>
            )}
          </div>
        )}
      </div>

      {(onRunFromHere || (onDelete && !readOnly)) && (
        <footer className="flex flex-none items-center justify-between gap-2 border-t border-gray-100 px-4 py-3">
          <div>
            {onDelete && !readOnly && (
              <Button variant="outline-danger" size="xs" icon={Trash2} onClick={onDelete} aria-label="Delete step">
                Delete
              </Button>
            )}
          </div>
          {onRunFromHere && (
            <Button variant="secondary" size="sm" icon={Play} onClick={onRunFromHere}>
              Run from here
            </Button>
          )}
        </footer>
      )}
    </section>
  );
}

/** The adaptor and its credential on one row, with Connect when the step needs one. */
function AdaptorRow({
  adaptor,
  credentialId,
  readOnly,
  onConnect,
}: {
  adaptor: Parameters<typeof AdaptorPill>[0]["adaptor"];
  credentialId?: string;
  readOnly: boolean;
  onConnect: (credentialId?: string) => void;
}) {
  const info = adaptorInfo[adaptor];
  const credentials = credentialsFor(adaptor);
  const credential = credentials.find((c) => c.id === credentialId);
  const needs = info.needsCredential && !credential;
  return (
    <FormField label="Adaptor">
      <div
        className={`flex items-center gap-2 rounded-md border px-2 py-1.5 ${
          needs && !readOnly ? "border-blue-200 bg-blue-50/40" : "border-gray-200"
        }`}
      >
        <AdaptorPill adaptor={adaptor} showVersion />
        <span className="ml-auto min-w-0 truncate text-xs text-gray-500">
          {credential ? credential.name : info.needsCredential ? (readOnly ? "No credential" : "") : "No credential needed"}
        </span>
        {needs && !readOnly && (
          <Button size="xs" onClick={() => onConnect(credentials[0]?.id)} className="flex-shrink-0">
            Connect
          </Button>
        )}
      </div>
    </FormField>
  );
}

function TriggerTypeRow({ trigger }: { trigger: TriggerNode }) {
  const { label, icon } = triggerType[trigger.triggerType];
  return (
    <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1.5">
      <Badge label={label} tone="green" icon={icon} />
      <span className="ml-auto truncate text-xs text-gray-500">{trigger.subtitle}</span>
    </div>
  );
}

/** The webhook's URL with its method and a copy control. */
function WebhookUrl({ url }: { url?: string }) {
  return (
    <FormField label="Webhook URL" hint={url ? "POST a JSON body to this URL to start a run." : undefined}>
      <div className="flex items-start gap-2 rounded-md border border-gray-200 px-2 py-2">
        <Badge label="POST" tone="green" />
        <code className="min-w-0 flex-1 break-all font-mono text-xs leading-5 text-gray-700">
          {url ?? "Available once the workflow is live"}
        </code>
        {url && (
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(url)}
            title="Copy URL"
            aria-label="Copy URL"
            className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <Copy size={13} />
          </button>
        )}
      </div>
    </FormField>
  );
}

function HeaderButton({ label, icon: Icon, onClick }: { label: string; icon: LucideIcon; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
    >
      <Icon size={15} />
    </button>
  );
}
