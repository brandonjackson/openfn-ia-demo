/**
 * Mock data for the Workflow Editor prototype.
 *
 * Models a Lightning-style workflow: a trigger, a set of jobs (steps), and the
 * edges that connect them. Node positions are stored directly on each node so
 * the canvas can lay things out with simple absolute positioning.
 */

import { Clock, Globe, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * The adaptor a job uses, by package id (e.g. "http" or "dhis2"): any adaptor
 * in `adaptorCatalog`. Drives the icon shown on the node.
 */
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

export type RunStatus = "success" | "failed" | "running" | "pending";

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
  x: number;
  y: number;
}

export type WorkflowNode = TriggerNode | JobNode;

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition: EdgeCondition;
  /** Used when condition is "js_expression" — shown as a tooltip / inspector value. */
  expression?: string;
}

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
  /** Set when someone has named it so it can be reused. */
  name?: string;
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
}

// ---------------------------------------------------------------------------
// The "Apply for a national ID" workflow shown in the design reference.
// ---------------------------------------------------------------------------

const searchBody = `// Keep the original application payload safe for downstream steps
fn(state => {
  state.application = state.data;
  return state;
});

// Search Identity for potential duplicates
get(
  'https://simdpgidentity-production.up.railway.app/citizens/search',
  state => ({
    query: {
      name: state.application.given_name,
      dob: state.application.date_of_birth,
    }
  })
);

// Compare results and set match flags for branching
fn(state => {
  const app = state.application;
  const results = Array.isArray(state.data)
    ? state.data
    : state.data?.data ?? state.data?.results ?? [];

  const norm = s => (s ?? '').toString().trim().toLowerCase();

  const similar = (a, b) => {
    a = norm(a);
    b = norm(b);
    if (a === b) return 1;
    if (a && b && (a.includes(b) || b.includes(a))) return 0.8;
    return 0;
  };

  let exactMatch = false;
  return state;
});`;

export const nationalIdWorkflow: Workflow = {
  id: "apply-national-id",
  name: "Apply for a national ID",
  project: "Project A",
  version: "latest",
  nodes: [
    {
      id: "trigger",
      type: "trigger",
      triggerType: "webhook",
      label: "Webhook trigger",
      subtitle: "On each request received",
      summary: "**Starts a run** for each application posted to the webhook.",
      x: 490,
      y: 70,
    },
    {
      id: "search",
      type: "job",
      label: "Search for duplicate citizens in Identity",
      summary: "**Searches Identity** for citizens matching the application.",
      adaptor: "http",
      adaptorPackage: "@openfn/language-http",
      body: searchBody,
      x: 490,
      y: 230,
    },
    {
      id: "notify",
      type: "job",
      label: "Notify applicant of existing national ID",
      summary: "**Tells the applicant** a national ID already exists for them.",
      adaptor: "http",
      adaptorPackage: "@openfn/language-http",
      body: "// Notify the applicant that a national ID already exists\npost('https://.../notify', state => ({ body: state.match }));",
      x: 190,
      y: 410,
    },
    {
      id: "create",
      type: "job",
      label: "Create new citizen in Identity",
      summary: "**Registers the citizen** in Identity and captures the issued ID.",
      adaptor: "http",
      adaptorPackage: "@openfn/language-http",
      body: "// Register the new citizen and capture the issued national ID\npost('https://.../citizens', state => ({ body: state.application }));",
      x: 490,
      y: 410,
    },
    {
      id: "queue",
      type: "job",
      label: "Queue application for retry",
      summary: "**Parks the application** so it can be retried once Identity is back.",
      adaptor: "common",
      adaptorPackage: "@openfn/language-common",
      body: "// Park the application so it can be retried later\nfn(state => state);",
      x: 790,
      y: 410,
    },
    {
      id: "confirm",
      type: "job",
      label: "Send confirmation notification with national ID",
      summary: "**Sends the applicant** their new national ID.",
      adaptor: "http",
      adaptorPackage: "@openfn/language-http",
      body: "// Send the applicant their new national ID\npost('https://.../notify', state => ({ body: state.nationalId }));",
      x: 490,
      y: 580,
    },
  ],
  edges: [
    { id: "e-trigger-search", source: "trigger", target: "search", condition: "always" },
    {
      id: "e-search-notify",
      source: "search",
      target: "notify",
      condition: "js_expression",
      expression: "state.exactMatch === true",
    },
    {
      id: "e-search-create",
      source: "search",
      target: "create",
      condition: "js_expression",
      expression: "state.exactMatch === false",
    },
    { id: "e-search-queue", source: "search", target: "queue", condition: "on_failure" },
    { id: "e-create-confirm", source: "create", target: "confirm", condition: "on_success" },
  ],
};

/**
 * The same workflow at v1, before the duplicate check was promoted: every
 * application went straight to Identity. Step ids match the latest version,
 * so a v1 run can be shown on either graph.
 */
export const nationalIdWorkflowV1: Workflow = {
  ...nationalIdWorkflow,
  version: "v1",
  nodes: nationalIdWorkflow.nodes
    .filter((n) => n.id !== "search" && n.id !== "notify")
    .map((n) => {
      if (n.id === "create") return { ...n, y: 230 };
      if (n.id === "confirm") return { ...n, x: 340, y: 410 };
      if (n.id === "queue") return { ...n, x: 640, y: 410 };
      return n;
    }),
  edges: [
    { id: "e-trigger-create", source: "trigger", target: "create", condition: "always" },
    { id: "e-create-confirm", source: "create", target: "confirm", condition: "on_success" },
    { id: "e-create-queue", source: "create", target: "queue", condition: "on_failure" },
  ],
};

/** The national ID workflow's graph at a version; "latest" (or v2) is the current one. */
export function nationalIdWorkflowAt(version: string): Workflow {
  return version === "v1" ? nationalIdWorkflowV1 : nationalIdWorkflow;
}

/**
 * The steps a run takes when everything succeeds, starting from `fromJobId`
 * or the step after the trigger. Where a step branches, the run takes the
 * "no duplicate found" path, the common case.
 */
export function happyPath(workflow: Workflow, fromJobId?: string): string[] {
  const next = (id: string) => {
    const out = workflow.edges.filter((e) => e.source === id && e.condition !== "on_failure");
    return (out.find((e) => e.expression?.includes("false")) ?? out[0])?.target;
  };
  const trigger = workflow.nodes.find((n) => n.type === "trigger");
  const path: string[] = [];
  let current = fromJobId ?? (trigger ? next(trigger.id) : undefined);
  while (current && !path.includes(current)) {
    path.push(current);
    current = next(current);
  }
  return path;
}

/**
 * A blank workflow for "New Workflow": a trigger wired to one empty step.
 * Starting from an event channel names the trigger after that channel so
 * the new workflow fires when the channel does.
 */
export function buildStarterWorkflow({
  projectName,
  channel,
}: {
  projectName: string;
  channel?: { name: string; system: string };
}): Workflow {
  return {
    id: "new",
    name: "Untitled workflow",
    project: projectName,
    version: "latest",
    nodes: [
      {
        id: "trigger",
        type: "trigger",
        triggerType: "webhook",
        label: channel ? channel.name : "Webhook trigger",
        subtitle: channel ? `On each ${channel.system} event` : "On each request received",
        summary: channel ? `**Starts a run** for each ${channel.system} event.` : "**Starts a run** for each request received.",
        x: 490,
        y: 70,
      },
      {
        id: "first-step",
        type: "job",
        label: "Untitled step",
        adaptor: "common",
        adaptorPackage: "@openfn/language-common",
        body: "// Start writing your job here\nfn(state => state);",
        x: 490,
        y: 230,
      },
    ],
    edges: [{ id: "e-trigger-first-step", source: "trigger", target: "first-step", condition: "always" }],
  };
}

/** Version history of a workflow on main, newest first. The newest is live. */
export const workflowVersions: WorkflowVersion[] = [
  {
    id: "v2",
    message: "Promoted sandbox adding duplicate-application check",
    author: "Brandon Jackson",
    date: "14 Oct 2026",
  },
  { id: "v1", message: "Initial go-live", author: "Brandon Jackson", date: "2 Sep 2026" },
];

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

/** The edge that leads into a job: what it runs after, and when. */
export function incomingEdge(workflow: Workflow, jobId: string): WorkflowEdge | undefined {
  return workflow.edges.find((e) => e.target === jobId);
}

/**
 * The workflow as the YAML the CLI and GitHub sync use, so the editor's
 * `workflow.yaml` reads like a real project file. Job bodies are elided to
 * their first line to keep the file short.
 */
export function workflowToYaml(workflow: Workflow): string {
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
    lines.push(`    enabled: true`);
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
    lines.push(`    enabled: true`);
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
