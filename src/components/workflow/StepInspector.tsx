import type { ReactNode } from "react";
import { Code2, Copy, Play, Sparkles, Trash2, X } from "lucide-react";
import type { AdaptorKind, Dataclip, JobNode, RunDetails, TriggerNode, WorkflowNode } from "../../mock-data/workflow";
import { triggerTypes } from "../../mock-data/workflow";
import type { ActivityPeriod, FailureReason } from "../../mock-data/runs";
import { activityPeriodLabel } from "../../mock-data/runs";
import { adaptorInfo, credentialsFor } from "../../mock-data/adaptor-reference";
import { codeSummary } from "../../mock-data/code-summaries";
import Button from "../Button";
import EditableTitle from "../EditableTitle";
import Badge from "../Badge";
import PropertyList from "../PropertyList";
import SectionHeading from "../SectionHeading";
import StatTile from "../StatTile";
import TextLink from "../TextLink";
import ToggleSwitch from "../ToggleSwitch";
import EntityPill from "../EntityPill";
import StatusPill from "./StatusPill";
import RunLabel from "./RunLabel";
import DataSnippet from "./DataSnippet";
import FailureBreakdown from "./FailureBreakdown";
import type { StepChanges } from "./StepConfigPanel";
import type { RunDataSection } from "./panel-views";
import IconButton from "../IconButton";
import Surface from "../Surface";

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
  onExpand?: (section: RunDataSection) => void;
  /** Loads a run picked from the failure breakdown. */
  onSelectRun?: (run: RunDetails) => void;
  /** The workflow's latest version; runs on older ones get a yellow tag. */
  latestVersion?: string;
}

/**
 * The inspector: a small card over the right of the canvas for the selected
 * node. It is a flat stack of sections, each under one small heading, and
 * what it shows follows what the canvas shows:
 *
 * - **No run loaded**: the node's config first, its adaptor and credential
 *   (its name is renamed from the header), or the trigger's type, URL and switch. With run history on
 *   the canvas (`stats`), a strip of the node's runs, failures and success
 *   rate over the canvas's period, then why the runs failed; on the trigger
 *   the numbers are the whole workflow's. For a step, the assistant's
 *   summary of what its code does sits between the config and the runs,
 *   with a link to the full code.
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
  const period = stats && activityPeriodLabel(stats.period);

  return (
    <Surface
      as="section"
      variant="floating"
      aria-label="Inspector"
      className="flex max-h-full w-[380px] max-w-[calc(100vw-2rem)] flex-col"
    >
      <header className="flex h-12 flex-none items-center gap-2 border-b border-gray-200 pl-5 pr-2">
        <div className="flex min-w-0 flex-1 items-center">
          <EditableTitle
            value={node.label}
            label="Step name"
            readOnly={readOnly || !job}
            onChange={job && onChange ? (label) => onChange({ label }) : undefined}
            className="text-base tracking-tight"
          />
        </div>
        {step && <StatusPill status={step.status} />}
        <div className="flex flex-shrink-0 items-center gap-0.5">
          {job && onOpenCode && <IconButton label="Open code" icon={Code2} onClick={onOpenCode} />}
          {onClose && <IconButton label="Close inspector" icon={X} onClick={onClose} />}
        </div>
      </header>

      {run ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
          <RunData run={run} job={job} dataclips={dataclips} onUnload={onUnloadRun} onExpand={onExpand} />
        </div>
      ) : (
        <div className="min-h-0 flex-1 divide-y divide-gray-200 overflow-y-auto">
          <InspectorSection>
            {job && (
              <AdaptorRow
                adaptor={job.adaptor}
                credentialId={credentialId}
                readOnly={readOnly}
                onConnect={(id) => onChange?.({ credentialId: id })}
              />
            )}
            {trigger && <TriggerConfig trigger={trigger} url={url} live={live} readOnly={readOnly} onToggleLive={onToggleLive} />}
          </InspectorSection>

          {job && (
            <InspectorSection
              heading="What this step does"
              aside={
                <span className="inline-flex items-center gap-1">
                  <Sparkles size={11} />
                  AI summary
                </span>
              }
            >
              <CodeSummary job={job} onOpenCode={onOpenCode} />
            </InspectorSection>
          )}

          {stats && (
            <InspectorSection heading={job ? "Runs" : "Workflow runs"} aside={period}>
              <RunStrip stats={stats} job={job} />
            </InspectorSection>
          )}

          {stats && stats.runs > 0 && stats.failed > 0 && (
            <InspectorSection heading="Why runs failed" aside={`${stats.failed} of ${stats.runs}`}>
              <FailureBreakdown
                key={job?.id ?? "workflow"}
                compact
                reasons={stats.reasons}
                period={stats.period}
                stepLabel={job?.label}
                scope={job ? "step" : "workflow"}
                latestVersion={latestVersion}
                onSelectRun={onSelectRun}
              />
            </InspectorSection>
          )}

        </div>
      )}

      {!run && (onRunFromHere || (onDelete && !readOnly)) && (
        <footer className="flex flex-none items-center justify-between gap-2 border-t border-gray-200 px-5 py-3">
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
    </Surface>
  );
}

/** One section of the inspector: an optional small heading, with something to its right, over its content. */
function InspectorSection({ heading, aside, children }: { heading?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section aria-label={heading} className="flex flex-col gap-3 px-5 py-4">
      {heading && (
        <div className="-mb-3">
          <SectionHeading
            variant="label"
            compact
            title={heading}
            action={aside && <span className="text-[11px] tabular-nums text-gray-400">{aside}</span>}
          />
        </div>
      )}
      {children}
    </section>
  );
}

/** Text with `backticks` drawn as code. */
function withCode(text: string): ReactNode {
  return text.split("`").map((part, i) =>
    i % 2 ? (
      <code key={i} className="rounded bg-gray-100 px-1 font-mono text-[11px] text-gray-800">
        {part}
      </code>
    ) : (
      part
    )
  );
}

/** The assistant's summary of what the step's code does: numbered points on the text axis, then the way to the full code. */
function CodeSummary({ job, onOpenCode }: { job: JobNode; onOpenCode?: () => void }) {
  const points = codeSummary(job);
  return (
    <div>
      <ol className="grid grid-cols-[16px_minmax(0,1fr)] gap-x-1 gap-y-1.5 text-xs leading-5 text-gray-800">
        {points.map((point, i) => (
          <li key={point} className="contents">
            <span className="tabular-nums text-gray-400">{i + 1}</span>
            <span>{withCode(point)}</span>
          </li>
        ))}
      </ol>
      {onOpenCode && (
        <div className="mt-2.5">
          <TextLink variant="action" onClick={onOpenCode}>
            <span className="text-xs">See full code →</span>
          </TextLink>
        </div>
      )}
    </div>
  );
}

/** The node's runs, failures and success rate over the period, as one row of numbers, or a line saying there were none. */
function RunStrip({ stats, job }: { stats: InspectorStats; job?: JobNode }) {
  const { runs, failed } = stats;
  if (runs === 0)
    return (
      <p className="text-xs text-gray-500">
        No runs {job ? "reached this step" : "started"} in the {activityPeriodLabel(stats.period).toLowerCase()}.
      </p>
    );
  const rate = `${Math.round(((runs - failed) / runs) * 100)}%`;
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatTile bare label={job ? "Reached" : "Runs"} value={runs} />
      <StatTile bare label="Failed" value={failed} danger={failed > 0} />
      <StatTile bare label="Succeeded" value={rate} />
    </div>
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
  onExpand?: (section: RunDataSection) => void;
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

  const section = (id: RunDataSection, title: string, lines: string[], extra: Partial<Parameters<typeof DataSnippet>[0]>) => (
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
      <div className="rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-3 pr-1.5">
        <RunLabel run={run} detail={step?.duration || run.when} onUnload={onUnload} />
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

/** The adaptor and its credential as label/value rows, with Connect when the step needs one. */
function AdaptorRow({
  adaptor,
  credentialId,
  readOnly,
  onConnect,
}: {
  adaptor: AdaptorKind;
  credentialId?: string;
  readOnly: boolean;
  onConnect: (credentialId?: string) => void;
}) {
  const info = adaptorInfo[adaptor];
  const credentials = credentialsFor(adaptor);
  const credential = credentials.find((c) => c.id === credentialId);
  return (
    <PropertyList
      variant="plain"
      properties={[
        { label: "Adaptor", value: <EntityPill name={info.name} adaptor={adaptor} suffix={info.version} size="sm" /> },
        {
          label: "Credential",
          value: credential ? (
            <span className="truncate">{credential.name}</span>
          ) : !info.needsCredential ? (
            <span className="text-gray-500">Not needed</span>
          ) : readOnly ? (
            <span className="text-gray-500">None</span>
          ) : (
            <>
              <span className="text-gray-500">None yet</span>
              <TextLink variant="action" onClick={() => onConnect(credentials[0]?.id)}>
                <span className="text-xs">Connect →</span>
              </TextLink>
            </>
          ),
        },
      ]}
    />
  );
}

/** The trigger's type, its URL for a webhook, and its switch, as label/value rows. */
function TriggerConfig({
  trigger,
  url,
  live,
  readOnly,
  onToggleLive,
}: {
  trigger: TriggerNode;
  url?: string;
  live: boolean;
  readOnly: boolean;
  onToggleLive?: (live: boolean) => void;
}) {
  const { shortLabel, icon } = triggerTypes[trigger.triggerType];
  const properties = [
    {
      label: "Type",
      value: (
        <>
          <Badge label={shortLabel} tone="green" icon={icon} />
          <span className="truncate text-gray-500">{trigger.subtitle}</span>
        </>
      ),
    },
    ...(trigger.triggerType === "webhook"
      ? [
          {
            label: "URL",
            value: url ? (
              <>
                <code className="min-w-0 flex-1 truncate font-mono text-xs text-gray-900" title={`POST ${url}`}>
                  {url}
                </code>
                <IconButton size="xs" icon={Copy} label="Copy URL" onClick={() => void navigator.clipboard?.writeText(url)} />
              </>
            ) : (
              <span className="text-gray-500">Available once the workflow is live</span>
            ),
          },
        ]
      : []),
    {
      label: "Enabled",
      value: <ToggleSwitch key={String(live)} checked={live} onChange={readOnly ? undefined : onToggleLive} label={live ? "Live" : "Paused"} />,
    },
  ];
  return <PropertyList variant="plain" properties={properties} />;
}

