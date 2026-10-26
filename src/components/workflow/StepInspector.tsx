import type { ReactNode } from "react";
import { Clock, Code2, Copy, Globe, Play, Radio, Sparkles, Trash2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Dataclip, JobNode, RunDetails, TriggerNode, WorkflowNode } from "../../mock-data/workflow";
import type { ActivityPeriod, FailureReason } from "../../mock-data/runs";
import { activityPeriodLabel } from "../../mock-data/runs";
import { adaptorInfo, credentialsFor } from "../../mock-data/adaptor-reference";
import { codeSummary } from "../../mock-data/code-summaries";
import FormField from "../FormField";
import { TextInput } from "../FormControls";
import Button from "../Button";
import Badge from "../Badge";
import StatTile from "../StatTile";
import TextLink from "../TextLink";
import ToggleSwitch from "../ToggleSwitch";
import AdaptorPill from "./AdaptorPill";
import StatusPill from "./StatusPill";
import DataSnippet from "./DataSnippet";
import FailureBreakdown from "./FailureBreakdown";
import type { StepChanges } from "./StepConfigPanel";

/** The run data sections the inspector shows, each of which opens in the code view's panel. */
export type InspectorSection = "log" | "input" | "output";

/** The node's run history over the canvas's period: the step's, or the whole workflow's for the trigger. */
export interface InspectorStats {
  period: ActivityPeriod;
  /** Runs that reached the node. */
  runs: number;
  /** Runs that failed there (or, for the trigger, anywhere). */
  failed: number;
  /** Why they failed, most common first. */
  reasons: FailureReason[];
}

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
  /** The URL that starts the workflow, for webhook triggers. */
  url?: string;
  live?: boolean;
  onToggleLive?: (live: boolean) => void;
  onChange?: (changes: StepChanges) => void;
  /** Opens the step's code. */
  onOpenCode?: () => void;
  onRunFromHere?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
  /** Run history over the canvas's period; shown instead of the config while no run is loaded. */
  stats?: InspectorStats;
  /** The loaded run; its log, input and output are shown instead of anything else. */
  run?: RunDetails;
  dataclips?: Dataclip[];
  onUnloadRun?: () => void;
  /** Opens a section of the run in the code view's panel, for the room a snippet can't give. */
  onExpand?: (section: InspectorSection) => void;
  /** Loads a run picked from the failure breakdown. */
  onSelectRun?: (run: RunDetails) => void;
  /** The workflow's latest version; runs on older ones get a yellow tag. */
  latestVersion?: string;
}

/**
 * The inspector: a small card over the right of the canvas for the selected
 * node. What it shows follows what the canvas shows:
 *
 * - **No runs** (the runs bar is Off): the node's config, its name, adaptor
 *   and credential or the trigger's type, URL and switch, with the
 *   assistant's summary of the step's code and a link to the full code.
 * - **Run history** (`stats`): how many runs reached the node in the
 *   canvas's period, how many failed and why. The period comes from the
 *   canvas; on the trigger the numbers are the whole workflow's.
 * - **A run loaded** (`run`): the node's log, input and output in that run,
 *   as snippets that open in full in the code view's panel, with a clear
 *   way to unload the run and go back to the history.
 */
export default function StepInspector({
  node,
  credentialId,
  readOnly = false,
  url,
  live = true,
  onToggleLive,
  onChange,
  onOpenCode,
  onRunFromHere,
  onDelete,
  onClose,
  stats,
  run,
  dataclips = [],
  onUnloadRun,
  onExpand,
  onSelectRun,
  latestVersion,
}: Props) {
  const job = node.type === "job" ? node : undefined;
  const trigger = node.type === "trigger" ? node : undefined;
  const step = job ? run?.steps.find((s) => s.jobId === job.id) : undefined;
  const state = run ? "run" : stats ? "stats" : "config";

  return (
    <section
      aria-label="Inspector"
      className="flex max-h-full w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-xl border border-gray-200 bg-white shadow-xl"
    >
      <header className="flex h-12 flex-none items-center gap-2 border-b border-gray-100 pl-4 pr-2">
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{node.label}</h2>
        {step && <StatusPill status={step.status} />}
        <div className="flex flex-shrink-0 items-center gap-0.5">
          {job && onOpenCode && <HeaderButton label="Open code" icon={Code2} onClick={onOpenCode} />}
          {onClose && <HeaderButton label="Close inspector" icon={X} onClick={onClose} />}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {state === "config" && job && (
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
            <CodeSummary job={job} onOpenCode={onOpenCode} />
          </>
        )}

        {state === "config" && trigger && (
          <>
            <TriggerTypeRow trigger={trigger} />
            {trigger.triggerType === "webhook" && <WebhookUrl url={url} />}
            <FormField label="Enabled" hint="When off, the trigger won't start runs. You can still run manually.">
              <ToggleSwitch key={String(live)} checked={live} onChange={readOnly ? undefined : onToggleLive} label={live ? "Live" : "Paused"} />
            </FormField>
          </>
        )}

        {state === "stats" && stats && (
          <RunStats
            stats={stats}
            job={job}
            selectedRunId={run?.runId}
            latestVersion={latestVersion}
            onSelectRun={onSelectRun}
          />
        )}

        {state === "run" && run && <RunData run={run} job={job} dataclips={dataclips} onUnload={onUnloadRun} onExpand={onExpand} />}
      </div>

      {state === "config" && (onRunFromHere || (onDelete && !readOnly)) && (
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

/** Text with `backticks` drawn as code. */
function withCode(text: string): ReactNode {
  return text.split("`").map((part, i) =>
    i % 2 ? (
      <code key={i} className="rounded bg-white px-1 font-mono text-[11px] text-gray-800">
        {part}
      </code>
    ) : (
      part
    )
  );
}

/** The assistant's summary of what the step's code does, with the way to the full code. */
function CodeSummary({ job, onOpenCode }: { job: JobNode; onOpenCode?: () => void }) {
  return (
    <section aria-label="Code summary" className="rounded-lg border border-violet-100 bg-violet-50/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-violet-700">
        <Sparkles size={13} />
        What the code does
      </div>
      <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-5 text-gray-700 marker:text-violet-300">
        {codeSummary(job).map((point) => (
          <li key={point}>{withCode(point)}</li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] text-gray-400">Summarised by AI</span>
        {onOpenCode && (
          <TextLink variant="action" onClick={onOpenCode}>
            <span className="text-xs">See full code →</span>
          </TextLink>
        )}
      </div>
    </section>
  );
}

/** The node's runs, failures and success rate over the period, then why the runs failed. */
function RunStats({
  stats,
  job,
  selectedRunId,
  latestVersion,
  onSelectRun,
}: {
  stats: InspectorStats;
  job?: JobNode;
  selectedRunId?: string;
  latestVersion?: string;
  onSelectRun?: (run: RunDetails) => void;
}) {
  const { runs, failed } = stats;
  const rate = runs > 0 ? `${Math.round(((runs - failed) / runs) * 100)}%` : "–";
  return (
    <>
      <p className="text-xs text-gray-500">
        {job ? "This step" : "Whole workflow"} · {activityPeriodLabel(stats.period)}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <StatTile compact label={job ? "Reached" : "Runs"} value={runs} />
        <StatTile compact label="Failed" value={failed} danger={failed > 0} />
        <StatTile compact label="Succeeded" value={rate} />
      </div>
      {runs === 0 ? (
        <p className="text-xs text-gray-500">
          No runs {job ? "reached this step" : "started"} in the {activityPeriodLabel(stats.period).toLowerCase()}.
        </p>
      ) : (
        <div className="-mx-4 border-t border-gray-100 pt-1">
          <h3 className="px-4 pb-0 pt-2 text-sm font-medium text-gray-800">Why runs failed</h3>
          <FailureBreakdown
            key={job?.id ?? "workflow"}
            reasons={stats.reasons}
            period={stats.period}
            stepLabel={job?.label}
            scope={job ? "step" : "workflow"}
            selectedRunId={selectedRunId}
            latestVersion={latestVersion}
            onSelectRun={onSelectRun}
          />
        </div>
      )}
    </>
  );
}

/** The node's log, input and output in the loaded run, under a line naming the run with the way to unload it. */
function RunData({
  run,
  job,
  dataclips,
  onUnload,
  onExpand,
}: {
  run: RunDetails;
  job?: JobNode;
  dataclips: Dataclip[];
  onUnload?: () => void;
  onExpand?: (section: InspectorSection) => void;
}) {
  const step = job ? run.steps.find((s) => s.jobId === job.id) : undefined;
  const clip = (id?: string) => dataclips.find((d) => d.id === id);

  // The step's slice of the run, or the whole run for the trigger.
  const data = job
    ? step && {
        logs: run.logs.filter((l) => l.stepId === step.id),
        input: clip(step.inputId),
        output: clip(step.outputId),
        outputMissing: step.status === "running" || step.status === "pending" ? "This step hasn't finished yet." : "This step's output wasn't kept.",
      }
    : { logs: run.logs.filter((l) => !l.stepId), input: clip(run.inputId), output: undefined, outputMissing: "" };

  const section = (id: InspectorSection, title: string, lines: string[], extra: Partial<Parameters<typeof DataSnippet>[0]>) => (
    <DataSnippet
      key={id}
      title={title}
      lines={lines}
      onExpand={onExpand ? () => onExpand(id) : undefined}
      expandLabel={`Open ${title.toLowerCase()} in the code view`}
      {...extra}
    />
  );

  return (
    <>
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-3 pr-1.5">
        <StatusPill status={run.status} variant="dot" />
        <span className="min-w-0 flex-1 truncate text-xs text-gray-600">
          Run <code className="font-mono font-medium text-gray-900">{run.runId.slice(0, 6)}</code>
          {step?.duration ? ` · ${step.duration}` : ` · ${run.when}`}
        </span>
        {onUnload && (
          <Button variant="secondary" size="xs" icon={X} onClick={onUnload}>
            Unload run
          </Button>
        )}
      </div>

      {data ? (
        <>
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
        </>
      ) : (
        <p className="text-xs text-gray-500">This step wasn't part of this run.</p>
      )}
    </>
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
