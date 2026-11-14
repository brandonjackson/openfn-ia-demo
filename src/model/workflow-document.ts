/*
 * A workflow as Lightning stores and sends it (api/workflows.md): jobs,
 * triggers and edges, with the canvas positions beside them. The canvas
 * draws a `Workflow` (nodes and edges); these turn one into the other, so a
 * graph saved from the editor comes back the same.
 *
 * The demo's canvas carries a little more than Lightning stores: a node's
 * one-line summary, a trigger's label, and the connected system a step talks
 * to. Those ride along on each job and trigger as `summary`, `label`,
 * `subtitle` and `system_id`, which a real Lightning would drop.
 *
 * A tool step (Report outcome, Human in the loop) is a job with a `kind`
 * and its settings in `config`, as planned in docs/api-plans/step-tools.md;
 * its `body` is the code a Lightning without tools runs it as.
 */
import { isEdgeEnabled, type EdgeCondition, type JobNode, type TriggerNode, type TriggerType, type Workflow, type WorkflowEdge } from "./workflow";
import type { ApprovalTool, OutcomeTool, StepTool } from "./step-tools";

/** What a job is: code (Lightning's only kind today), or one of the planned tools. */
export type JobKind = "code" | "report_outcome" | "approval";

export type ConditionType = "always" | "on_job_success" | "on_job_failure" | "js_expression";

export interface WorkflowJob {
  id: string;
  name: string;
  body: string;
  /** The adaptor and its version, e.g. "@openfn/language-http@latest". */
  adaptor: string;
  project_credential_id: string | null;
  keychain_credential_id: string | null;
  summary?: string;
  system_id?: string | null;
  /** Planned: what kind of job it is; code when left out. */
  kind?: JobKind;
  /** Planned: a tool's settings (docs/api-plans/step-tools.md). */
  config?: Omit<OutcomeTool, "kind"> | Omit<ApprovalTool, "kind">;
}

/** A tool as a job's `kind` and `config`. */
function toolFields(tool: StepTool | undefined): Pick<WorkflowJob, "kind" | "config"> {
  if (!tool) return {};
  const { kind, ...config } = tool;
  return { kind: kind === "outcome" ? "report_outcome" : "approval", config };
}

/** A job's `kind` and `config` as a tool, if it is one. */
function toolOf(job: WorkflowJob): StepTool | undefined {
  if (!job.config) return undefined;
  if (job.kind === "report_outcome") return { kind: "outcome", ...(job.config as Omit<OutcomeTool, "kind">) };
  if (job.kind === "approval") return { kind: "approval", ...(job.config as Omit<ApprovalTool, "kind">) };
  return undefined;
}

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  enabled: boolean;
  cron_expression: string | null;
  custom_path: string | null;
  comment: string | null;
  webhook_reply: "before_start" | "after_completion" | "custom" | null;
  /** Planned: the project's webhook auth methods that guard it. */
  webhook_auth_method_ids?: string[];
  label?: string;
  subtitle?: string;
  summary?: string;
}

export interface WorkflowDocEdge {
  id: string;
  source_trigger_id: string | null;
  source_job_id: string | null;
  target_job_id: string;
  condition_type: ConditionType;
  condition_expression: string | null;
  condition_label: string | null;
  enabled: boolean;
}

/** What a create or update sends: the workflow's name and its graph. */
export interface WorkflowDocumentBody {
  name: string;
  jobs: WorkflowJob[];
  triggers: WorkflowTrigger[];
  edges: WorkflowDocEdge[];
  positions: Record<string, { x: number; y: number }> | null;
  concurrency?: number | null;
  enable_job_logs?: boolean;
}

/** A workflow as the API sends it. */
export interface WorkflowDocument extends WorkflowDocumentBody {
  id: string;
  project_id: string;
  concurrency: number | null;
  enable_job_logs: boolean;
  inserted_at: string;
  updated_at: string;
  /** Planned: the latest snapshot's version. */
  lock_version: number;
}

const toCondition: Record<EdgeCondition, ConditionType> = {
  always: "always",
  on_success: "on_job_success",
  on_failure: "on_job_failure",
  js_expression: "js_expression",
};
const fromCondition: Record<ConditionType, EdgeCondition> = {
  always: "always",
  on_job_success: "on_success",
  on_job_failure: "on_failure",
  js_expression: "js_expression",
};

/** "@openfn/language-http@1.2.0" → "http": the short name the canvas and the adaptor catalog use. */
export const adaptorKindOf = (adaptor: string) => adaptor.replace(/^@openfn\/language-/, "").replace(/@[^@]*$/, "");

/** "@openfn/language-http@latest" → "@openfn/language-http". */
export const adaptorPackageOf = (adaptor: string) => adaptor.replace(/(.)@[^@]*$/, "$1");

const triggerSubtitle = (t: Pick<WorkflowTrigger, "type" | "cron_expression">) =>
  t.type === "cron" ? `On a schedule (${t.cron_expression ?? "0 0 * * *"})` : t.type === "kafka" ? "On each message" : "On each request received";

/**
 * A canvas graph as the document Lightning stores. `enabled` sets the
 * trigger's switch (a workflow is live when its trigger is on);
 * `cron` overrides a trigger's schedule.
 */
export function toDocument(graph: Workflow, { enabled = true, triggers = [] as WorkflowTrigger[] } = {}): WorkflowDocumentBody {
  const nodes = graph.nodes;
  const isTrigger = (id: string) => nodes.some((n) => n.id === id && n.type === "trigger");
  return {
    name: graph.name,
    jobs: nodes
      .filter((n): n is JobNode => n.type === "job")
      .map((n) => ({
        id: n.id,
        name: n.label,
        body: n.body,
        adaptor: /@[^/]*$/.test(n.adaptorPackage.slice(1)) ? n.adaptorPackage : `${n.adaptorPackage}@latest`,
        project_credential_id: n.credentialId ?? null,
        keychain_credential_id: null,
        ...(n.summary !== undefined && { summary: n.summary }),
        system_id: n.system ?? null,
        ...toolFields(n.tool),
      })),
    triggers: nodes
      .filter((n): n is TriggerNode => n.type === "trigger")
      .map((n) => {
        const stored = triggers.find((t) => t.id === n.id);
        return {
          id: n.id,
          type: n.triggerType,
          enabled: stored?.enabled ?? enabled,
          cron_expression: n.triggerType === "cron" ? (stored?.cron_expression ?? "0 0 * * *") : null,
          custom_path: stored?.custom_path ?? null,
          comment: stored?.comment ?? null,
          webhook_reply: n.triggerType === "webhook" ? (stored?.webhook_reply ?? "before_start") : null,
          webhook_auth_method_ids: stored?.webhook_auth_method_ids ?? [],
          label: n.label,
          subtitle: n.subtitle,
          ...(n.summary !== undefined && { summary: n.summary }),
        };
      }),
    edges: graph.edges.map((e) => ({
      id: e.id,
      source_trigger_id: isTrigger(e.source) ? e.source : null,
      source_job_id: isTrigger(e.source) ? null : e.source,
      target_job_id: e.target,
      condition_type: toCondition[e.condition],
      condition_expression: e.condition === "js_expression" ? (e.expression ?? null) : null,
      condition_label: e.label?.trim() || null,
      enabled: isEdgeEnabled(e),
    })),
    positions: Object.fromEntries(nodes.map((n) => [n.id, { x: n.x, y: n.y }])),
  };
}

/** A stored document as the canvas draws it, in a project, at a version ("latest", "v3"). */
export function fromDocument(doc: Pick<WorkflowDocument, "id" | "name" | "jobs" | "triggers" | "edges" | "positions">, project: string, version = "latest"): Workflow {
  const at = (id: string, i: number) => doc.positions?.[id] ?? { x: 490, y: 70 + i * 160 };
  return {
    id: doc.id,
    name: doc.name,
    project,
    version,
    nodes: [
      ...doc.triggers.map(
        (t, i): TriggerNode => ({
          id: t.id,
          type: "trigger",
          triggerType: t.type,
          label: t.label ?? (t.type === "cron" ? "Cron trigger" : t.type === "kafka" ? "Kafka trigger" : "Webhook trigger"),
          subtitle: t.subtitle ?? triggerSubtitle(t),
          ...(t.summary !== undefined && { summary: t.summary }),
          ...at(t.id, i),
        }),
      ),
      ...doc.jobs.map(
        (j, i): JobNode => ({
          id: j.id,
          type: "job",
          label: j.name,
          ...(j.summary !== undefined && { summary: j.summary }),
          adaptor: adaptorKindOf(j.adaptor),
          adaptorPackage: adaptorPackageOf(j.adaptor),
          body: j.body,
          ...(j.system_id && { system: j.system_id }),
          ...(j.project_credential_id && { credentialId: j.project_credential_id }),
          ...(toolOf(j) && { tool: toolOf(j) }),
          ...at(j.id, i + doc.triggers.length),
        }),
      ),
    ],
    // Every path, on or off: one that's off is drawn dashed and never runs.
    edges: doc.edges.map(
      (e): WorkflowEdge => ({
        id: e.id,
        source: (e.source_trigger_id ?? e.source_job_id)!,
        target: e.target_job_id,
        condition: fromCondition[e.condition_type],
        ...(e.condition_expression && { expression: e.condition_expression }),
        ...(e.condition_label && { label: e.condition_label }),
        ...(!e.enabled && { enabled: false }),
      }),
    ),
  };
}

/** Whether a workflow is live: its trigger is on. */
export const isLive = (doc: Pick<WorkflowDocument, "triggers">) => doc.triggers.some((t) => t.enabled);
