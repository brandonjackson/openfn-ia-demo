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

export interface RunHistoryEntry {
  id: string;
  /** Pre-formatted relative label, e.g. "yesterday at 4:38 PM". */
  when: string;
  status: RunStatus;
}

export interface RunStep {
  id: string;
  /** Matches a JobNode id so the canvas can highlight the active step. */
  jobId: string;
  label: string;
  status: RunStatus;
  /** Pre-formatted duration, e.g. "179 ms" or "3 s". */
  duration: string;
}

export interface LogLine {
  source: "RTE" | "VER" | "R/T" | "ADA" | "JOB";
  message: string;
}

export interface RunDetails {
  workOrderId: string;
  runId: string;
  status: RunStatus;
  duration: string;
  started: string;
  startedBy: string;
  steps: RunStep[];
  logs: LogLine[];
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
  project: "ytsg",
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

export const recentHistory: RunHistoryEntry[] = [
  { id: "b10d4fb0", when: "yesterday at 4:38 PM", status: "success" },
  { id: "57c51fd5", when: "yesterday at 2:09 PM", status: "success" },
  { id: "896d2dcb", when: "yesterday at 11:11 AM", status: "success" },
  { id: "2f11d4f1", when: "June 14th, 12:19 PM", status: "success" },
  { id: "0b393bfb", when: "June 14th, 12:18 PM", status: "success" },
  { id: "7143df53", when: "June 14th, 6:12 AM", status: "failed" },
  { id: "b4f8902d", when: "June 13th, 9:22 AM", status: "success" },
  { id: "297efcfb", when: "June 13th, 9:21 AM", status: "success" },
];

export const sampleRun: RunDetails = {
  workOrderId: "b10d4fb0",
  runId: "afa317bf",
  status: "success",
  duration: "6 s",
  started: "25/06/2026, 16:37:57",
  startedBy: "webhook trigger",
  steps: [
    { id: "s1", jobId: "search", label: "Search for duplicate citizens in Identity", status: "success", duration: "3 s" },
    { id: "s2", jobId: "create", label: "Create new citizen in Identity", status: "success", duration: "179 ms" },
    { id: "s3", jobId: "confirm", label: "Send confirmation notification with national ID", status: "success", duration: "401 ms" },
  ],
  logs: [
    { source: "RTE", message: "Memory limit: 250mb" },
    { source: "RTE", message: "Timeout: 120s" },
    { source: "R/T", message: "Compiling all workflow steps ..." },
    { source: "RTE", message: "Payload limit: 10mb" },
    { source: "VER", message: "Versions:" },
    { source: "VER", message: "  ▸ node.js                       24.17.0" },
    { source: "VER", message: "  ▸ worker                        1.27.0" },
    { source: "VER", message: "  ▸ @openfn/language-common       3.3.3" },
    { source: "VER", message: "  ▸ @openfn/language-http         7.3.1" },
    { source: "R/T", message: "Compiled Search for duplicate citizens in Identity in 0.41s" },
    { source: "R/T", message: "Compiled Notify applicant of existing national ID in 0.11s" },
    { source: "R/T", message: "Compiled Create new citizen in Identity in 0.077s" },
    { source: "R/T", message: "Compiled Send confirmation notification with national ID in 0.12s" },
    { source: "R/T", message: "Compiled Queue application for retry in 0.043s" },
    { source: "R/T", message: "Workflow compilation complete in 2.2s" },
    { source: "R/T", message: "Executing afa317bf-444b-40ab-9e0e-4ef5c975e31a" },
    { source: "R/T", message: "Starting step Search for duplicate citizens in Identity" },
    { source: "R/T", message: "Resolved adaptor @openfn/language-http to version 7.3.1" },
    { source: "ADA", message: "GET https://simdpgidentity-production.up.railway.app/citizens/search?name=Aleksa&dob=1950-01-01 - 200 in 372ms" },
  ],
};
