/**
 * Mock data for the Workflow Editor prototype.
 *
 * Models a Lightning-style workflow: a trigger, a set of jobs (steps), and the
 * edges that connect them. Node positions are stored directly on each node so
 * the canvas can lay things out with simple absolute positioning.
 */

/** The kind of adaptor a job uses — drives the icon shown on the node. */
export type AdaptorKind = "http" | "common" | "dhis2" | "salesforce" | "postgresql";

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
  triggerType: "webhook" | "cron" | "kafka";
  label: string;
  subtitle: string;
  x: number;
  y: number;
}

export interface JobNode {
  id: string;
  type: "job";
  label: string;
  adaptor: AdaptorKind;
  /** Adaptor version string shown under the icon, e.g. "@openfn/language-http". */
  adaptorPackage: string;
  /** Source body shown in the code editor when this job is selected. */
  body: string;
  /** The project credential the job connects with, if its adaptor needs one. */
  credential?: string;
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
      x: 360,
      y: 70,
    },
    {
      id: "search",
      type: "job",
      label: "Search for duplicate citizens in Identity",
      adaptor: "http",
      adaptorPackage: "@openfn/language-http",
      body: searchBody,
      x: 360,
      y: 230,
    },
    {
      id: "notify",
      type: "job",
      label: "Notify applicant of existing national ID",
      adaptor: "http",
      adaptorPackage: "@openfn/language-http",
      body: "// Notify the applicant that a national ID already exists\npost('https://.../notify', state => ({ body: state.match }));",
      x: 130,
      y: 410,
    },
    {
      id: "create",
      type: "job",
      label: "Create new citizen in Identity",
      adaptor: "http",
      adaptorPackage: "@openfn/language-http",
      body: "// Register the new citizen and capture the issued national ID\npost('https://.../citizens', state => ({ body: state.application }));",
      x: 360,
      y: 410,
    },
    {
      id: "queue",
      type: "job",
      label: "Queue application for retry",
      adaptor: "common",
      adaptorPackage: "@openfn/language-common",
      body: "// Park the application so it can be retried later\nfn(state => state);",
      x: 600,
      y: 410,
    },
    {
      id: "confirm",
      type: "job",
      label: "Send confirmation notification with national ID",
      adaptor: "http",
      adaptorPackage: "@openfn/language-http",
      body: "// Send the applicant their new national ID\npost('https://.../notify', state => ({ body: state.nationalId }));",
      x: 360,
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
      if (n.id === "confirm") return { ...n, x: 240, y: 410 };
      if (n.id === "queue") return { ...n, x: 480, y: 410 };
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
        x: 360,
        y: 70,
      },
      {
        id: "first-step",
        type: "job",
        label: "Untitled step",
        adaptor: "common",
        adaptorPackage: "@openfn/language-common",
        body: "// Start writing your job here\nfn(state => state);",
        x: 360,
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

/** Picker options for a version switcher: "Latest", then the version history. */
export function versionOptions(versions: WorkflowVersion[]) {
  return [
    { id: "latest", label: "Latest" },
    ...versions.map((v, i) => ({
      id: v.id,
      label: v.message,
      shortLabel: v.id,
      description: `${v.author} · ${v.date}`,
      badge: { label: v.id, tone: i === 0 ? ("green" as const) : ("gray" as const) },
      group: "Version history",
    })),
  ];
}

/** Display names for the adaptors a job can use. */
export const adaptorNames: Record<AdaptorKind, string> = {
  http: "HTTP",
  common: "Common",
  dhis2: "DHIS2",
  salesforce: "Salesforce",
  postgresql: "PostgreSQL",
};

/** The version of each adaptor jobs run on, e.g. "7.3.1". */
export const adaptorVersions: Record<AdaptorKind, string> = {
  http: "7.3.1",
  common: "3.3.3",
  dhis2: "6.1.0",
  salesforce: "8.0.2",
  postgresql: "5.1.4",
};

/** Credentials in the project, by the adaptor they work with. Common needs none. */
export const credentialsByAdaptor: Record<AdaptorKind, string[]> = {
  http: ["Identity API (production)", "Identity API (staging)"],
  common: [],
  dhis2: ["DHIS2 national instance"],
  salesforce: ["Salesforce sandbox"],
  postgresql: ["Reporting database"],
};

/** A workflow's jobs in the order a run reaches them: breadth-first from the trigger. */
export function orderedJobs(workflow: Workflow): JobNode[] {
  const jobs = workflow.nodes.filter((n): n is JobNode => n.type === "job");
  const trigger = workflow.nodes.find((n) => n.type === "trigger");
  const order: string[] = [];
  const queue = trigger ? [trigger.id] : [];
  while (queue.length) {
    const id = queue.shift()!;
    for (const e of workflow.edges.filter((e) => e.source === id)) {
      if (!order.includes(e.target)) {
        order.push(e.target);
        queue.push(e.target);
      }
    }
  }
  const rank = (j: JobNode) => (order.includes(j.id) ? order.indexOf(j.id) : order.length);
  return [...jobs].sort((a, b) => rank(a) - rank(b));
}
