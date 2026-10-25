import { Code2, FlaskConical, Lock, Play, RotateCcw, Trash2 } from "lucide-react";
import type {
  AdaptorKind,
  EdgeCondition,
  JobNode,
  TriggerNode,
  Workflow,
  WorkflowEdge,
} from "../../mock-data/workflow";
import { adaptorNames, credentialsByAdaptor, orderedJobs } from "../../mock-data/workflow";
import FormField from "../FormField";
import { Select, TextInput } from "../FormControls";
import Button from "../Button";
import Callout from "../Callout";

const conditionLabel: Record<EdgeCondition, string> = {
  on_success: "when it succeeds",
  on_failure: "when it fails",
  always: "always",
  js_expression: "when an expression is true",
};

const adaptorOptions = (Object.keys(adaptorNames) as AdaptorKind[]).map((a) => ({ value: a, label: adaptorNames[a] }));

/**
 * The Settings tray: the settings of whatever is open.
 *
 * - A step: its name, adaptor, credential and the step it runs after (and
 *   when), plus editing its code, running from it and deleting it.
 * - The trigger: its name, type and, for a webhook, the URL that starts it.
 * - Nothing (the workflow): its name and run settings.
 *
 * On main, or an earlier version, everything is shown but can't be changed;
 * `readOnlyAction` offers the way out, e.g. "Edit in sandbox".
 */
export default function StepInspector({
  workflow,
  node,
  readOnly = false,
  readOnlyReason = "main is read-only",
  readOnlyAction,
  url,
  onRenameWorkflow,
  onChangeJob,
  onChangeTrigger,
  onChangeEdge,
  onEditCode,
  runFrom,
  onRunFrom,
  onDelete,
}: {
  workflow: Workflow;
  /** The open step or trigger; undefined for the workflow itself. */
  node?: JobNode | TriggerNode;
  readOnly?: boolean;
  readOnlyReason?: string;
  readOnlyAction?: { label: string; onClick: () => void };
  /** The webhook URL that starts the workflow. */
  url?: string;
  onRenameWorkflow?: (name: string) => void;
  onChangeJob?: (id: string, patch: Partial<JobNode>) => void;
  onChangeTrigger?: (id: string, patch: Partial<TriggerNode>) => void;
  onChangeEdge?: (id: string, patch: Partial<WorkflowEdge>) => void;
  /** Opens the step in the code view; omit when it's already open there. */
  onEditCode?: () => void;
  runFrom?: "run" | "retry";
  onRunFrom?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="space-y-5 p-4">
      {readOnly && (
        <Callout compact variant="info" icon={Lock} title={`Read-only: ${readOnlyReason}`}>
          {readOnlyAction && (
            <Button variant="secondary" size="xs" icon={FlaskConical} onClick={readOnlyAction.onClick}>
              {readOnlyAction.label}
            </Button>
          )}
        </Callout>
      )}
      {node?.type === "job" ? (
        <JobSettings
          workflow={workflow}
          job={node}
          readOnly={readOnly}
          onChange={(patch) => onChangeJob?.(node.id, patch)}
          onChangeEdge={onChangeEdge}
        />
      ) : node?.type === "trigger" ? (
        <TriggerSettings trigger={node} readOnly={readOnly} url={url} onChange={(p) => onChangeTrigger?.(node.id, p)} />
      ) : (
        <WorkflowSettings workflow={workflow} readOnly={readOnly} onRename={onRenameWorkflow} />
      )}

      {node?.type === "job" && (
        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
          {onEditCode && (
            <Button variant="secondary" size="xs" icon={Code2} onClick={onEditCode}>
              Edit code
            </Button>
          )}
          {runFrom && (
            <Button variant="secondary" size="xs" icon={runFrom === "retry" ? RotateCcw : Play} onClick={onRunFrom}>
              {runFrom === "retry" ? "Retry from here" : "Run from here"}
            </Button>
          )}
          {onDelete && !readOnly && (
            <span className="ml-auto">
              <Button variant="ghost" size="xs" icon={Trash2} onClick={onDelete}>
                Delete step
              </Button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function JobSettings({
  workflow,
  job,
  readOnly,
  onChange,
  onChangeEdge,
}: {
  workflow: Workflow;
  job: JobNode;
  readOnly: boolean;
  onChange: (patch: Partial<JobNode>) => void;
  onChangeEdge?: (id: string, patch: Partial<WorkflowEdge>) => void;
}) {
  const credentials = credentialsByAdaptor[job.adaptor];
  const incoming = workflow.edges.find((e) => e.target === job.id);
  const sources = [
    ...workflow.nodes.filter((n) => n.type === "trigger"),
    ...orderedJobs(workflow).filter((j) => j.id !== job.id),
  ];
  return (
    <>
      <FormField label="Name" htmlFor="step-name">
        <TextInput
          id="step-name"
          value={job.label}
          disabled={readOnly}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </FormField>
      <FormField label="Adaptor" htmlFor="step-adaptor" hint={job.adaptorPackage}>
        <Select
          id="step-adaptor"
          className="w-full"
          options={adaptorOptions}
          value={job.adaptor}
          disabled={readOnly}
          onChange={(e) => {
            const adaptor = e.target.value as AdaptorKind;
            onChange({ adaptor, adaptorPackage: `@openfn/language-${adaptor}`, credential: undefined });
          }}
        />
      </FormField>
      <FormField
        label="Credential"
        htmlFor="step-credential"
        hint={credentials.length === 0 ? "This adaptor doesn't need one." : undefined}
      >
        <Select
          id="step-credential"
          className="w-full"
          options={[{ value: "", label: "No credential" }, ...credentials]}
          value={job.credential ?? ""}
          disabled={readOnly || credentials.length === 0}
          onChange={(e) => onChange({ credential: e.target.value || undefined })}
        />
      </FormField>
      {incoming && (
        <FormField label="Runs after" htmlFor="step-after">
          <div className="space-y-2">
            <Select
              id="step-after"
              className="w-full"
              options={sources.map((n) => ({ value: n.id, label: n.label }))}
              value={incoming.source}
              disabled={readOnly}
              onChange={(e) => onChangeEdge?.(incoming.id, { source: e.target.value })}
            />
            <Select
              aria-label="When"
              className="w-full"
              options={(Object.keys(conditionLabel) as EdgeCondition[]).map((c) => ({ value: c, label: conditionLabel[c] }))}
              value={incoming.condition}
              disabled={readOnly}
              onChange={(e) => onChangeEdge?.(incoming.id, { condition: e.target.value as EdgeCondition })}
            />
            {incoming.condition === "js_expression" && (
              <TextInput
                aria-label="Expression"
                className="font-mono text-xs"
                value={incoming.expression ?? ""}
                disabled={readOnly}
                onChange={(e) => onChangeEdge?.(incoming.id, { expression: e.target.value })}
              />
            )}
          </div>
        </FormField>
      )}
    </>
  );
}

function TriggerSettings({
  trigger,
  readOnly,
  url,
  onChange,
}: {
  trigger: TriggerNode;
  readOnly: boolean;
  url?: string;
  onChange: (patch: Partial<TriggerNode>) => void;
}) {
  return (
    <>
      <FormField label="Name" htmlFor="trigger-name">
        <TextInput
          id="trigger-name"
          value={trigger.label}
          disabled={readOnly}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </FormField>
      <FormField label="Type" htmlFor="trigger-type">
        <Select
          id="trigger-type"
          className="w-full"
          options={[
            { value: "webhook", label: "Webhook" },
            { value: "cron", label: "Schedule (cron)" },
            { value: "kafka", label: "Kafka" },
          ]}
          value={trigger.triggerType}
          disabled={readOnly}
          onChange={(e) => onChange({ triggerType: e.target.value as TriggerNode["triggerType"] })}
        />
      </FormField>
      {trigger.triggerType === "webhook" && (
        <FormField label="Webhook URL" htmlFor="trigger-url" hint="Requests to this URL start a run.">
          <TextInput id="trigger-url" className="font-mono text-xs" value={url ?? "Created when you go live"} readOnly />
        </FormField>
      )}
      {trigger.triggerType === "cron" && (
        <FormField label="Schedule" htmlFor="trigger-cron" hint="Every 15 minutes.">
          <TextInput id="trigger-cron" className="font-mono text-xs" defaultValue="*/15 * * * *" disabled={readOnly} />
        </FormField>
      )}
    </>
  );
}

function WorkflowSettings({
  workflow,
  readOnly,
  onRename,
}: {
  workflow: Workflow;
  readOnly: boolean;
  onRename?: (name: string) => void;
}) {
  return (
    <>
      <FormField label="Name" htmlFor="workflow-name">
        <TextInput
          id="workflow-name"
          value={workflow.name}
          disabled={readOnly}
          onChange={(e) => onRename?.(e.target.value)}
        />
      </FormField>
      <FormField label="Project" htmlFor="workflow-project">
        <TextInput id="workflow-project" value={workflow.project} disabled />
      </FormField>
      <FormField label="Concurrency" htmlFor="workflow-concurrency" hint="How many runs of this workflow can happen at once.">
        <Select
          id="workflow-concurrency"
          className="w-full"
          options={["Unlimited", "1 at a time", "5 at a time"]}
          defaultValue="Unlimited"
          disabled={readOnly}
        />
      </FormField>
      <FormField label="Run data" htmlFor="workflow-data" hint="Inputs and outputs of each step, for retries and debugging.">
        <Select
          id="workflow-data"
          className="w-full"
          options={["Keep for 30 days", "Keep for 7 days", "Don't keep"]}
          defaultValue="Keep for 30 days"
          disabled={readOnly}
        />
      </FormField>
    </>
  );
}
