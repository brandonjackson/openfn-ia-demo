/**
 * Run history for the "Apply for a national ID" workflow: work orders, the
 * runs made for each, and the dataclips (inputs and step results) they used.
 *
 * Runs before 14 Oct ran on v1, which had no duplicate check; later runs ran
 * on v2. Each run is built from a short spec (the steps it took, and where it
 * failed) so its steps, logs and dataclips stay consistent with each other.
 */
import type {
  Dataclip,
  LogLine,
  RunDetails,
  RunStep,
  Workflow,
  WorkOrder,
} from "./workflow";
import { happyPath, nationalIdWorkflow } from "./workflow";

type State = Record<string, unknown>;

const json = (value: unknown) => JSON.stringify(value, null, 2);

const IDENTITY = "https://simdpgidentity-production.up.railway.app";

/** A random 8-character hex id, like the short ids shown in history. */
export function shortId(): string {
  return Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, "0");
}

/** Lines every run starts with, before its first step. */
function setupLogs(runId: string): LogLine[] {
  return [
    { source: "RTE", message: "Memory limit: 250mb" },
    { source: "RTE", message: "Timeout: 120s" },
    { source: "RTE", message: "Payload limit: 10mb" },
    { source: "VER", message: "Versions:" },
    { source: "VER", message: "  ▸ node.js                       24.17.0" },
    { source: "VER", message: "  ▸ worker                        1.27.0" },
    { source: "VER", message: "  ▸ @openfn/language-common       3.3.3" },
    { source: "VER", message: "  ▸ @openfn/language-http         7.3.1" },
    { source: "R/T", message: "Workflow compilation complete in 2.2s" },
    { source: "R/T", message: `Executing ${runId}-444b-40ab-9e0e-4ef5c975e31a` },
  ];
}

const DEFAULT_DURATION: Record<string, string> = {
  search: "3 s",
  create: "179 ms",
  confirm: "401 ms",
  notify: "388 ms",
  queue: "52 ms",
};

/** What each step adds to the state it was given, when it succeeds. */
function stepOutput(jobId: string, input: State, seed: string): State {
  switch (jobId) {
    case "search":
      return { ...input, matches: [], exactMatch: false };
    case "create":
      return { ...input, nationalId: `NID-2026-${seed.slice(0, 6).toUpperCase()}` };
    case "confirm":
    case "notify":
      return { ...input, notified: true };
    case "queue":
      return { ...input, queuedForRetry: true };
    default:
      return input;
  }
}

/** The adaptor's line for a step's request, e.g. "GET … - 200 in 372ms". */
function requestLog(jobId: string, input: State, failed: boolean): LogLine | undefined {
  const status = (ok: number) => (failed ? `502 in 30012ms` : `${ok} in ${120 + (jobId.length * 47) % 300}ms`);
  switch (jobId) {
    case "search":
      return {
        source: "ADA",
        message: `GET ${IDENTITY}/citizens/search?name=${String(input.given_name ?? "")}&dob=${String(
          input.date_of_birth ?? ""
        )} - ${status(200)}`,
      };
    case "create":
      return { source: "ADA", message: `POST ${IDENTITY}/citizens - ${status(201)}` };
    case "confirm":
    case "notify":
      return { source: "ADA", message: `POST https://notify.example.gov/messages - ${status(202)}` };
    default:
      return undefined;
  }
}

interface RunSpec {
  runId: string;
  workOrderId: string;
  version: string;
  when: string;
  started: string;
  startedBy?: string;
  duration: string;
  input: Dataclip;
  /** Job ids in the order the run reached them. */
  path: string[];
  /** The step that failed, and why. */
  failAt?: { jobId: string; error: string };
  /** Replaces a step's output, e.g. a search that found a match. */
  outputs?: Record<string, State>;
  /** Graph to take step labels from. */
  workflow?: Workflow;
  /** Step statuses for a run that is still going (defaults to final). */
  inProgress?: boolean;
}

/**
 * Build a run from a spec: each step's input is the previous step's output,
 * and every step gets a result dataclip and its own log lines.
 */
function buildRun(spec: RunSpec): { run: RunDetails; dataclips: Dataclip[] } {
  const workflow = spec.workflow ?? nationalIdWorkflow;
  const label = (jobId: string) => {
    const node = workflow.nodes.find((n) => n.id === jobId);
    return node?.label ?? jobId;
  };

  const dataclips: Dataclip[] = [];
  const steps: RunStep[] = [];
  const logs: LogLine[] = setupLogs(spec.runId);
  let state = JSON.parse(spec.input.body) as State;
  let inputId = spec.input.id;

  spec.path.forEach((jobId, i) => {
    const stepId = `${spec.runId}-${jobId}`;
    const failed = spec.failAt?.jobId === jobId;
    const status = spec.inProgress ? (i === 0 ? "running" : "pending") : failed ? "failed" : "success";
    const output = failed
      ? { ...state, error: spec.failAt!.error }
      : spec.outputs?.[jobId] ?? stepOutput(jobId, state, spec.runId);
    const duration = failed ? "30 s" : DEFAULT_DURATION[jobId] ?? "12 ms";

    const outputId = `${stepId}-out`;
    if (!spec.inProgress) {
      dataclips.push({ id: outputId, type: "step_result", body: json(output), created: spec.when });
    }
    steps.push({
      id: stepId,
      jobId,
      label: label(jobId),
      status,
      duration: spec.inProgress ? "" : duration,
      inputId,
      outputId: spec.inProgress ? undefined : outputId,
    });

    if (!spec.inProgress) {
      logs.push({ source: "R/T", message: `Starting step ${label(jobId)}`, stepId });
      const request = requestLog(jobId, state, failed);
      if (request) logs.push({ ...request, stepId });
      if (jobId === "queue") logs.push({ source: "JOB", message: "Parked application for retry", stepId });
      logs.push(
        failed
          ? { source: "JOB", message: `Error: ${spec.failAt!.error}`, stepId }
          : { source: "R/T", message: `Completed step ${label(jobId)} in ${duration}`, stepId }
      );
    }

    state = output;
    inputId = outputId;
  });

  if (!spec.inProgress) {
    logs.push({ source: "R/T", message: `Run ${spec.failAt ? "failed" : "complete"} in ${spec.duration}` });
  }

  return {
    run: {
      workOrderId: spec.workOrderId,
      runId: spec.runId,
      status: spec.inProgress ? "running" : spec.failAt ? "failed" : "success",
      duration: spec.inProgress ? "" : spec.duration,
      started: spec.started,
      when: spec.when,
      startedBy: spec.startedBy ?? "webhook trigger",
      version: spec.version,
      inputId: spec.input.id,
      steps,
      logs,
    },
    dataclips,
  };
}

// ---------------------------------------------------------------------------
// Inputs: what the webhook received for each work order, plus inputs people
// have saved by name.
// ---------------------------------------------------------------------------

function application(id: string, when: string, body: State, name?: string): Dataclip {
  return { id, type: "http_request", body: json(body), created: when, name };
}

const inputs = {
  amara: application("req-b10d", "today at 9:42 AM", {
    given_name: "Amara",
    family_name: "Okafor",
    date_of_birth: "1991-03-14",
    district: "North",
  }),
  tomas: application("req-57c5", "today at 8:15 AM", {
    given_name: "Tomás",
    family_name: "Rivera",
    date_of_birth: "1984-11-02",
    district: "Coast",
  }),
  lina: application("req-7143", "yesterday at 4:38 PM", {
    given_name: "Lina",
    family_name: "Haddad",
    date_of_birth: "2001-07-21",
    district: "Central",
  }),
  kofi: application(
    "req-896d",
    "yesterday at 11:11 AM",
    { given_name: "Kofi", family_name: "Mensah", date_of_birth: "1976-01-30", district: "East" },
    "Application that hit the Identity 502"
  ),
  priya: application("req-2f11", "Oct 13th, 12:19 PM", {
    given_name: "Priya",
    family_name: "Nair",
    date_of_birth: "1999-05-08",
    district: "North",
  }),
  jonas: application("req-0b39", "Oct 13th, 12:18 PM", {
    given_name: "Jonas",
    family_name: "Berg",
    date_of_birth: "1968-09-17",
    district: "West",
  }),
  mei: application("req-b4f8", "Oct 12th, 9:22 AM", {
    given_name: "Mei",
    family_name: "Chen",
    date_of_birth: "1995-12-03",
    district: "Central",
  }),
};

/** Inputs written by hand and saved under a name, ready to run with. */
const savedInputs: Dataclip[] = [
  {
    id: "saved-new-citizen",
    name: "Sample application: new citizen",
    type: "saved_input",
    created: "Oct 10th, 2:04 PM",
    body: json({ given_name: "Test", family_name: "Applicant", date_of_birth: "2000-01-01", district: "North" }),
  },
  {
    id: "saved-existing-citizen",
    name: "Sample application: existing citizen",
    type: "saved_input",
    created: "Oct 10th, 2:06 PM",
    body: json({ given_name: "Amara", family_name: "Okafor", date_of_birth: "1991-03-14", district: "North" }),
  },
];

// ---------------------------------------------------------------------------
// Work orders, newest first.
// ---------------------------------------------------------------------------

const built = [
  buildRun({
    runId: "afa317bf",
    workOrderId: "b10d4fb0",
    version: "v2",
    when: "today at 9:42 AM",
    started: "20/10/2026, 09:42:13",
    duration: "6 s",
    input: inputs.amara,
    path: ["search", "create", "confirm"],
  }),
  buildRun({
    runId: "3c9e1a07",
    workOrderId: "57c51fd5",
    version: "v2",
    when: "today at 8:15 AM",
    started: "20/10/2026, 08:15:40",
    duration: "4 s",
    input: inputs.tomas,
    path: ["search", "notify"],
    outputs: {
      search: {
        ...(JSON.parse(inputs.tomas.body) as State),
        matches: [{ nationalId: "NID-2019-77A0C2", given_name: "Tomás", family_name: "Rivera" }],
        exactMatch: true,
      },
    },
  }),
  // A failure, then a retry that went through once Identity was back.
  buildRun({
    runId: "9d02c4af",
    workOrderId: "7143df53",
    version: "v2",
    when: "yesterday at 5:02 PM",
    started: "19/10/2026, 17:02:51",
    startedBy: "Brandon Jackson",
    duration: "5 s",
    input: inputs.lina,
    path: ["search", "create", "confirm"],
  }),
  buildRun({
    runId: "e81b55c2",
    workOrderId: "7143df53",
    version: "v2",
    when: "yesterday at 4:38 PM",
    started: "19/10/2026, 16:38:02",
    duration: "31 s",
    input: inputs.lina,
    path: ["search", "queue"],
    failAt: { jobId: "search", error: "Identity did not respond within 30s" },
  }),
  buildRun({
    runId: "41f7d8e3",
    workOrderId: "896d2dcb",
    version: "v2",
    when: "yesterday at 11:11 AM",
    started: "19/10/2026, 11:11:26",
    duration: "34 s",
    input: inputs.kofi,
    path: ["search", "create"],
    failAt: { jobId: "create", error: "Identity returned 502 Bad Gateway" },
  }),
  buildRun({
    runId: "6b2d90aa",
    workOrderId: "2f11d4f1",
    version: "v1",
    when: "Oct 13th, 12:19 PM",
    started: "13/10/2026, 12:19:08",
    duration: "2 s",
    input: inputs.priya,
    path: ["create", "confirm"],
  }),
  buildRun({
    runId: "c47e2d18",
    workOrderId: "0b393bfb",
    version: "v1",
    when: "Oct 13th, 12:18 PM",
    started: "13/10/2026, 12:18:44",
    duration: "31 s",
    input: inputs.jonas,
    path: ["create", "queue"],
    failAt: { jobId: "create", error: "Identity returned 502 Bad Gateway" },
  }),
  buildRun({
    runId: "18aa6f3c",
    workOrderId: "b4f8902d",
    version: "v1",
    when: "Oct 12th, 9:22 AM",
    started: "12/10/2026, 09:22:17",
    duration: "2 s",
    input: inputs.mei,
    path: ["create", "confirm"],
  }),
];

/** Group runs into work orders, keeping the order they're listed in. */
function toWorkOrders(runs: RunDetails[]): WorkOrder[] {
  const orders: WorkOrder[] = [];
  for (const run of runs) {
    const order = orders.find((o) => o.id === run.workOrderId);
    if (order) order.runs.push(run);
    else orders.push({ id: run.workOrderId, status: run.status, lastActivity: run.when, runs: [run] });
  }
  return orders;
}

/** Recent work orders for the national ID workflow, newest first. */
export const workOrders: WorkOrder[] = toWorkOrders(built.map((b) => b.run));

/** Every dataclip in the project: trigger inputs, saved inputs and step results. */
export const dataclips: Dataclip[] = [
  ...Object.values(inputs),
  ...savedInputs,
  ...built.flatMap((b) => b.dataclips),
];

/** The most recent run, for stories that show a single run. */
export const sampleRun: RunDetails = workOrders[0].runs[0];

/** A failed run, for stories that show a failure. */
export const failedRun: RunDetails = workOrders.find((o) => o.id === "896d2dcb")!.runs[0];

/** A run on v1, older than the latest version. */
export const olderRun: RunDetails = workOrders.find((o) => o.id === "2f11d4f1")!.runs[0];

/**
 * A new run of `workflow` from `input`, along every step it would take when
 * all goes well: from `fromJobId` when retrying from a step, otherwise from
 * the start. With `inProgress`, the run has only just started.
 */
export function simulateRun({
  workflow,
  version,
  input,
  workOrderId,
  runId,
  fromJobId,
  startedBy,
  inProgress = false,
}: {
  workflow: Workflow;
  version: string;
  input: Dataclip;
  workOrderId: string;
  runId: string;
  fromJobId?: string;
  startedBy: string;
  inProgress?: boolean;
}): { run: RunDetails; dataclips: Dataclip[] } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return buildRun({
    runId,
    workOrderId,
    version,
    when: "just now",
    started: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}, ${pad(now.getHours())}:${pad(
      now.getMinutes()
    )}:${pad(now.getSeconds())}`,
    startedBy,
    duration: "3 s",
    input,
    path: happyPath(workflow, fromJobId),
    workflow,
    inProgress,
  });
}
