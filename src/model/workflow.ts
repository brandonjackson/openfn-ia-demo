/**
 * The adaptor a job uses, by package id (e.g. "http" or "dhis2"): any adaptor
 * in `adaptorCatalog`. Drives the icon shown on the node.
 */
import type { CollectionContents, ComponentContent } from "./project-components";
import { Clock, Globe, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { XRoadCall } from "./xroad";
import type { ChannelDetails } from "./channels";
import type { ApprovalAnswer, ApprovalRequest, RunOutcome, StepTool } from "./step-tools";
export type AdaptorKind = string;

/** What starts a workflow. */
export type TriggerType = "webhook" | "cron" | "kafka";

/**
 * How each kind of trigger is named and drawn, everywhere: `label` on its
 * card and pill, `shortLabel` where the word "trigger" is already implied
 * (a Type field, a property row) and `icon` for its glyph.
 */
export const triggerTypes: Record<TriggerType, { label: string; shortLabel: string; icon: LucideIcon }> = {
  webhook: { label: "Webhook trigger", shortLabel: "Webhook", icon: Globe },
  cron: { label: "Cron trigger", shortLabel: "Cron", icon: Clock },
  kafka: { label: "Kafka trigger", shortLabel: "Kafka", icon: Radio },
};

/** What makes an edge fire. Drives the little badge drawn on the connector. */
export type EdgeCondition =
  | "always"
  | "on_success"
  | "on_failure"
  | "js_expression";

/**
 * Where a run, step or work order stands. A cancelled one was stopped before
 * it started; a waiting one is paused on a Human in the loop step until
 * someone answers.
 */
export type RunStatus = "success" | "failed" | "running" | "pending" | "cancelled" | "waiting";

export interface TriggerNode {
  id: string;
  type: "trigger";
  /** Webhook / cron / kafka — only webhook is modelled visually for now. */
  triggerType: TriggerType;
  label: string;
  subtitle: string;
  /**
   * One line saying what the node does, shown on its canvas card. Text in
   * `**double asterisks**` is the bold lead, e.g. "**Starts a run** for each
   * request received."; without one the label is used.
   */
  summary?: string;
  x: number;
  y: number;
}

export interface JobNode {
  id: string;
  type: "job";
  label: string;
  /** See {@link TriggerNode.summary}. */
  summary?: string;
  adaptor: AdaptorKind;
  /** Adaptor version string shown under the icon, e.g. "@openfn/language-http". */
  adaptorPackage: string;
  /** Source body shown in the code editor when this job is selected. */
  body: string;
  /**
   * The connected system the step talks to, by id. The step only ever
   * names the system; whether it's reached directly or over X-Road is the
   * system's business, shown as a small badge.
   */
  system?: string;
  /** The project credential it runs with (the project's link to a credential), if one is chosen. */
  credentialId?: string;
  /**
   * A tool step (Report outcome, Human in the loop) has settings instead of
   * code: its panel edits them, and `body` is the code it would run as on a
   * Lightning that doesn't know tools.
   */
  tool?: StepTool;
  x: number;
  y: number;
}

export type WorkflowNode = TriggerNode | JobNode;

/**
 * A path from a trigger or step to the next step, as Lightning has it: what
 * makes it fire, an optional label drawn beside its badge, and whether it's
 * on. A path that's off is drawn dashed and never runs.
 */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition: EdgeCondition;
  /** The JavaScript expression a "js_expression" path matches on, with `state` in scope, e.g. "!state.error". */
  expression?: string;
  /** A name for the path, drawn beside its badge, e.g. "Exact match". */
  label?: string;
  /** Off, the path never runs. On when left out. */
  enabled?: boolean;
}

/** Whether a path runs at all: it's on unless it's been turned off. */
export const isEdgeEnabled = (edge: Pick<WorkflowEdge, "enabled">) => edge.enabled !== false;

/** The conditions a path can have, in Lightning's words and order. A path from a trigger is Always or On match. */
export const edgeConditionOptions: { value: EdgeCondition; label: string }[] = [
  { value: "always", label: "Always" },
  { value: "on_success", label: "On success" },
  { value: "on_failure", label: "On failure" },
  { value: "js_expression", label: "On match" },
];

/** The conditions a path from this source can have: a trigger's path has no step before it to succeed or fail. */
export function edgeConditionsFor(fromTrigger: boolean) {
  return fromTrigger ? edgeConditionOptions.filter((o) => o.value === "always" || o.value === "js_expression") : edgeConditionOptions;
}

/** Words in an expression that Lightning warns may be unsafe to run. */
export const isUnsafeExpression = (expression: string) => /(\bimport\b|\brequire\b|\bprocess\b|\bawait\b|\beval\b)/.test(expression);

export interface Workflow {
  id: string;
  name: string;
  project: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

/** A saved version of a workflow on main, newest first in {@link workflowVersions}. */
export interface WorkflowVersion {
  /** e.g. "v2". */
  id: string;
  message: string;
  author: string;
  date: string;
}

/** What kind of data a dataclip holds, which decides where it can be reused. */
export type DataclipType = "http_request" | "step_result" | "saved_input";

/**
 * A piece of JSON data in the project: what a trigger received, what a step
 * produced, or an input someone wrote and saved. Naming one keeps it around so
 * it can be picked again as the input for a run.
 */
export interface Dataclip {
  id: string;
  /** Set when someone has named it so it can be reused: a saved dataclip. */
  name?: string;
  /** What it's for, e.g. "An applicant already in the registry". Saved dataclips only. */
  description?: string;
  type: DataclipType;
  /** Pretty-printed JSON. */
  body: string;
  /** Pre-formatted, e.g. "today at 9:42 AM". */
  created: string;
}

export interface RunStep {
  id: string;
  /** Matches a JobNode id so the canvas can show the step on its node. */
  jobId: string;
  label: string;
  status: RunStatus;
  /** Pre-formatted duration, e.g. "179 ms" or "3 s". */
  duration: string;
  /** Why the step failed, e.g. "Identity returned 502 Bad Gateway". */
  error?: string;
  /** Dataclip the step received. */
  inputId?: string;
  /** Dataclip the step produced. */
  outputId?: string;
  /** How a Human in the loop step was answered. */
  answer?: ApprovalAnswer;
}

export interface LogLine {
  source: "RTE" | "VER" | "R/T" | "ADA" | "JOB";
  message: string;
  /** The step that wrote the line; run-level lines have none. */
  stepId?: string;
}

export interface RunDetails {
  workOrderId: string;
  runId: string;
  status: RunStatus;
  duration: string;
  started: string;
  /** Pre-formatted relative label, e.g. "yesterday at 4:38 PM". */
  when: string;
  startedBy: string;
  /** The version of the workflow that ran, e.g. "v1". */
  version: string;
  /** The dataclip the run started from. */
  inputId: string;
  steps: RunStep[];
  logs: LogLine[];
  /** Who called, for a run started by a call over X-Road. */
  xroad?: XRoadCall;
  /** What a Report outcome step recorded, if the run reached one. */
  outcome?: RunOutcome;
  /** What the run is waiting on someone to answer, while it's `waiting`. */
  waitingFor?: ApprovalRequest;
}

/**
 * One piece of incoming work (a request, an event) and every run made to
 * process it: the first run, then any retries, newest first.
 */
export interface WorkOrder {
  id: string;
  /** The status of its latest run. */
  status: RunStatus;
  /** Pre-formatted relative label for its latest run. */
  lastActivity: string;
  runs: RunDetails[];
  /** The business outcome its latest run reported, which can differ from `status`: a refusal sent without a hitch is a success with a Refused outcome. */
  outcome?: RunOutcome;
}

/**
 * Picker options for a version switcher, newest first. The newest is the
 * latest version, so it carries the "latest" id and a "Latest" tag.
 */
export function versionOptions(versions: WorkflowVersion[]) {
  return versions.map((v, i) => ({
    id: i === 0 ? "latest" : v.id,
    label: v.message,
    shortLabel: v.id,
    description: `${v.author} · ${v.date}`,
    badge: { label: v.id, tone: i === 0 ? ("green" as const) : ("gray" as const) },
    tag: i === 0 ? "Latest" : undefined,
  }));
}

/** How an edge's condition reads in the step settings, e.g. "when it succeeds". */
export const edgeConditionLabel: Record<EdgeCondition, string> = {
  always: "always",
  on_success: "when it succeeds",
  on_failure: "when it fails",
  js_expression: "when a condition is met",
};

/**
 * Why a step can't be deleted, in Lightning's words, or nothing when it can.
 * As on Lightning (`useJobDeleteValidation`), a step that other steps run
 * after can't go, nor can the first step, the one the trigger starts.
 */
export function stepDeleteBlockedReason(workflow: Workflow, jobId: string): string | undefined {
  const isJob = (id: string) => workflow.nodes.some((n) => n.id === id && n.type === "job");
  if (workflow.edges.some((e) => e.source === jobId && isJob(e.target))) return "Cannot delete: other jobs depend on this step";
  const parents = workflow.edges.filter((e) => e.target === jobId);
  const fromTrigger = parents.some((e) => !isJob(e.source));
  if (fromTrigger && !parents.some((e) => isJob(e.source))) return "You can't delete the first step in a workflow.";
  return undefined;
}

/** The edge that leads into a job: what it runs after, and when. */
export function incomingEdge(workflow: Workflow, jobId: string): WorkflowEdge | undefined {
  return workflow.edges.find((e) => e.target === jobId);
}

/**
 * The workflow as the YAML the CLI and GitHub sync use, so the editor's
 * `workflow.yaml` reads like a real project file. Job bodies are elided to
 * their first line to keep the file short. `enabled` is whether its trigger
 * is on: whether the workflow is live or paused.
 */
export function workflowToYaml(workflow: Workflow, { enabled = true }: { enabled?: boolean } = {}): string {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const trigger = workflow.nodes.find((n): n is TriggerNode => n.type === "trigger");
  const jobs = workflow.nodes.filter((n): n is JobNode => n.type === "job");
  const lines: string[] = [`name: ${workflow.name}`, "jobs:"];
  for (const job of jobs) {
    const firstLine = job.body.split("\n").find((l) => l.trim() && !l.trim().startsWith("//")) ?? "";
    lines.push(`  ${slug(job.label)}:`);
    lines.push(`    name: ${job.label}`);
    lines.push(`    adaptor: '${job.adaptorPackage}@latest'`);
    lines.push(`    body: |`);
    lines.push(`      ${firstLine.trim()}`);
    lines.push(`      # ...`);
  }
  lines.push("triggers:");
  if (trigger) {
    lines.push(`  ${trigger.triggerType}:`);
    lines.push(`    type: ${trigger.triggerType}`);
    lines.push(`    enabled: ${enabled}`);
  }
  lines.push("edges:");
  for (const edge of workflow.edges) {
    const source = workflow.nodes.find((n) => n.id === edge.source);
    const target = workflow.nodes.find((n) => n.id === edge.target);
    if (!source || !target) continue;
    const from = source.type === "trigger" ? source.triggerType : slug(source.label);
    const to = slug(target.label);
    lines.push(`  ${from}->${to}:`);
    lines.push(`    ${source.type === "trigger" ? "source_trigger" : "source_job"}: ${from}`);
    lines.push(`    target_job: ${to}`);
    lines.push(`    condition_type: ${edge.condition}`);
    if (edge.expression) lines.push(`    condition_expression: ${edge.expression}`);
    if (edge.label) lines.push(`    condition_label: ${edge.label}`);
    lines.push(`    enabled: ${isEdgeEnabled(edge)}`);
  }
  return lines.join("\n");
}

/** The settings shown beside `workflow.yaml` in the editor. */
export interface WorkflowSettings {
  name: string;
  description: string;
  concurrency: string;
  retention: string;
  logOutput: boolean;
}

export function defaultWorkflowSettings(workflow: Workflow): WorkflowSettings {
  return {
    name: workflow.name,
    description: "",
    concurrency: "Unlimited",
    retention: "Project default (90 days)",
    logOutput: true,
  };
}

/**
 * What the files the code explorer lists beside a workflow's steps hold: the
 * docs kept with it, the listing of the service it backs, and the project
 * components it uses.
 */
export interface WorkflowFileContents {
  /** context.md and spec.md. */
  docs: { context: string; spec: string };
  /** service.yaml, when the workflow backs a published service. */
  serviceListing?: string;
  /** What each form, artifact, AI skill, document and static website holds, by component id. */
  componentContents: Record<string, ComponentContent>;
  /** What each collection holds, by component id. */
  collections: Record<string, CollectionContents>;
  /** Each channel component's system, endpoint, traffic and messages, by component id. */
  channels: Record<string, ChannelDetails>;
}
