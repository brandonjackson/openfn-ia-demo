/**
 * Run history for the "Apply for a national ID" workflow: work orders, the
 * runs made for each, and the dataclips (inputs and step results) they used.
 *
 * Runs before 14 Oct ran on v1, which had no duplicate check; later runs ran
 * on v2. Each run is built from a short spec (the steps it took, and where it
 * failed) so its steps, logs and dataclips stay consistent with each other.
 */
import type {
  AdaptorKind,
  Dataclip,
  LogLine,
  RunDetails,
  RunStep,
  Workflow,
  WorkOrder,
} from "./workflow";
import { happyPath, nationalIdWorkflow, registerCaseWorkflow, weeklyCaseReportWorkflow } from "./workflow";
import type { XRoadCall } from "./xroad";
import { openfnClientId, routeUrl } from "./xroad";

type State = Record<string, unknown>;

const json = (value: unknown) => JSON.stringify(value, null, 2);

const IDENTITY = "https://simdpgidentity-production.up.railway.app";
const OPENCRVS = "https://gateway.farajaland.opencrvs.org";
const TWILIO = "https://api.twilio.com/2010-04-01/Accounts/AC5f3e/Messages.json";
const NATIONAL_ID = routeUrl({ memberId: "moi", subsystem: "IDENTITY", service: "verify-national-id" });
const OPENMRS = routeUrl({ memberId: "nrh", subsystem: "OPENMRS", service: "patients" });
const DHIS2 = "https://dhis2.example.org/api";

/** Steps whose system is reached over X-Road, so their calls carry X-Road headers. */
const XROAD_STEPS = ["verify-nid", "openmrs-patient"];

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
    { source: "VER", message: "  ▸ @openfn/language-opencrvs     1.2.2" },
    { source: "VER", message: "  ▸ @openfn/language-twilio       1.1.2" },
    { source: "R/T", message: "Workflow compilation complete in 2.2s" },
    { source: "R/T", message: `Executing ${runId}-444b-40ab-9e0e-4ef5c975e31a` },
  ];
}

const DEFAULT_DURATION: Record<string, string> = {
  verify: "842 ms",
  search: "3 s",
  create: "179 ms",
  confirm: "401 ms",
  notify: "388 ms",
  queue: "52 ms",
  "check-caller": "4 ms",
  "verify-nid": "612 ms",
  "openmrs-patient": "938 ms",
  "count-cases": "210 ms",
  "send-dhis2": "1 s",
};

/** What each step adds to the state it was given, when it succeeds. */
function stepOutput(jobId: string, input: State, seed: string): State {
  switch (jobId) {
    case "verify":
      return {
        ...input,
        birthRegistration: {
          trackingId: `B${seed.slice(0, 6).toUpperCase()}`,
          registrationNumber: `2026${seed.slice(2, 8).toUpperCase()}`,
        },
      };
    case "search":
      return { ...input, matches: [], exactMatch: false };
    case "create":
      return { ...input, nationalId: `NID-2026-${seed.slice(0, 6).toUpperCase()}` };
    case "confirm":
    case "notify":
      return { ...input, notified: true };
    case "queue":
      return { ...input, queuedForRetry: true };
    case "check-caller":
      return { ...input, callerAllowed: true };
    case "verify-nid":
      return { ...input, nationalIdVerified: { match: true, status: "active" } };
    case "openmrs-patient":
      return { ...input, patientUuid: `a1f0${seed.slice(0, 4)}-7c2e-4b1d-9e3f-${seed}0e5c` };
    case "count-cases":
      return {
        period: "2026W42",
        counts: { "Northern|Cholera": 3, "Northern|Measles": 1, "Central|Cholera": 5, "Coast|Measles": 2 },
      };
    case "send-dhis2":
      return { ...input, importSummary: { status: "SUCCESS", imported: 4, updated: 0, ignored: 0 } };
    default:
      return input;
  }
}

/** The adaptor's line for a step's request, e.g. "GET … - 200 in 372ms". */
function requestLog(jobId: string, input: State, failed: boolean): LogLine | undefined {
  const status = (ok: number) => (failed ? `502 in 30012ms` : `${ok} in ${120 + (jobId.length * 47) % 300}ms`);
  switch (jobId) {
    case "verify":
      return { source: "ADA", message: `POST ${OPENCRVS}/graphql - ${status(200)}` };
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
      return { source: "ADA", message: `POST ${TWILIO} - ${status(201)}` };
    case "verify-nid":
      return { source: "ADA", message: `POST ${NATIONAL_ID}/verify - ${failed ? "403 in 211ms" : status(200)}` };
    case "openmrs-patient":
      return { source: "ADA", message: `GET ${OPENMRS}/patient?identifier=… - ${status(200)}` };
    case "send-dhis2":
      return { source: "ADA", message: `POST ${DHIS2}/dataValueSets - ${status(200)}` };
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
  failAt?: { jobId: string; error: string; duration?: string };
  /** Who called, for a run started by a call over X-Road. */
  xroad?: XRoadCall;
  /** Replaces a step's output, e.g. a search that found a match. */
  outputs?: Record<string, State>;
  /** Graph to take step labels from. */
  workflow?: Workflow;
  /**
   * For a run still going: how many steps have finished. The next step is
   * running and the rest are pending. Unset means the run is over.
   */
  progress?: number;
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
  if (spec.xroad) {
    logs.push({
      source: "R/T",
      message: `Started by an X-Road call from ${spec.xroad.client} (X-Road-Id ${spec.xroad.messageId})`,
    });
  }
  let state = JSON.parse(spec.input.body) as State;
  let inputId = spec.input.id;

  const inProgress = spec.progress !== undefined;
  spec.path.forEach((jobId, i) => {
    const stepId = `${spec.runId}-${jobId}`;
    const failed = spec.failAt?.jobId === jobId;
    // Whether this step is over yet; in a finished run every step is.
    const done = !inProgress || i < spec.progress!;
    const status = !done ? (i === spec.progress ? "running" : "pending") : failed ? "failed" : "success";
    const output = failed
      ? { ...state, error: spec.failAt!.error }
      : spec.outputs?.[jobId] ?? stepOutput(jobId, state, spec.runId);
    const duration = failed ? (spec.failAt!.duration ?? "30 s") : DEFAULT_DURATION[jobId] ?? "12 ms";

    const outputId = `${stepId}-out`;
    if (done) {
      dataclips.push({ id: outputId, type: "step_result", body: json(output), created: spec.when });
    }
    steps.push({
      id: stepId,
      jobId,
      label: label(jobId),
      status,
      duration: done ? duration : "",
      error: done && failed ? spec.failAt!.error : undefined,
      inputId,
      outputId: done ? outputId : undefined,
    });

    if (status === "running") logs.push({ source: "R/T", message: `Starting step ${label(jobId)}`, stepId });
    if (done) {
      logs.push({ source: "R/T", message: `Starting step ${label(jobId)}`, stepId });
      if (XROAD_STEPS.includes(jobId)) {
        logs.push({ source: "ADA", message: `Added X-Road headers: X-Road-Client ${openfnClientId}, X-Road-Id ${spec.runId}-${jobId}`, stepId });
      }
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

  if (!inProgress) {
    logs.push({ source: "R/T", message: `Run ${spec.failAt ? "failed" : "complete"} in ${spec.duration}` });
  }

  return {
    run: {
      workOrderId: spec.workOrderId,
      runId: spec.runId,
      status: inProgress ? "running" : spec.failAt ? "failed" : "success",
      duration: inProgress ? "" : spec.duration,
      started: spec.started,
      when: spec.when,
      startedBy: spec.startedBy ?? "webhook trigger",
      version: spec.version,
      inputId: spec.input.id,
      steps,
      logs,
      xroad: spec.xroad,
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
    phone: "+15555550101",
  }),
  tomas: application("req-57c5", "today at 8:15 AM", {
    given_name: "Tomás",
    family_name: "Rivera",
    date_of_birth: "1984-11-02",
    district: "Coast",
    phone: "+15555550102",
  }),
  lina: application("req-7143", "yesterday at 4:38 PM", {
    given_name: "Lina",
    family_name: "Haddad",
    date_of_birth: "2001-07-21",
    district: "Central",
    phone: "+15555550103",
  }),
  kofi: application(
    "req-896d",
    "yesterday at 11:11 AM",
    { given_name: "Kofi", family_name: "Mensah", date_of_birth: "1976-01-30", district: "East",
    phone: "+15555550104" },
    "Application that hit the Identity 502"
  ),
  priya: application("req-2f11", "Oct 13th, 12:19 PM", {
    given_name: "Priya",
    family_name: "Nair",
    date_of_birth: "1999-05-08",
    district: "North",
    phone: "+15555550105",
  }),
  jonas: application("req-0b39", "Oct 13th, 12:18 PM", {
    given_name: "Jonas",
    family_name: "Berg",
    date_of_birth: "1968-09-17",
    district: "West",
    phone: "+15555550106",
  }),
  mei: application("req-b4f8", "Oct 12th, 9:22 AM", {
    given_name: "Mei",
    family_name: "Chen",
    date_of_birth: "1995-12-03",
    district: "Central",
    phone: "+15555550107",
  }),
};

/** Inputs written by hand and saved under a name, ready to run with. */
const savedInputs: Dataclip[] = [
  {
    id: "saved-new-citizen",
    name: "Sample application: new citizen",
    type: "saved_input",
    created: "Oct 10th, 2:04 PM",
    body: json({ given_name: "Test", family_name: "Applicant", date_of_birth: "2000-01-01", district: "North", phone: "+15555550100" }),
  },
  {
    id: "saved-existing-citizen",
    name: "Sample application: existing citizen",
    type: "saved_input",
    created: "Oct 10th, 2:06 PM",
    body: json({ given_name: "Amara", family_name: "Okafor", date_of_birth: "1991-03-14", district: "North", phone: "+15555550101" }),
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
    path: ["verify", "search", "create", "confirm"],
  }),
  buildRun({
    runId: "3c9e1a07",
    workOrderId: "57c51fd5",
    version: "v2",
    when: "today at 8:15 AM",
    started: "20/10/2026, 08:15:40",
    duration: "4 s",
    input: inputs.tomas,
    path: ["verify", "search", "notify"],
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
    path: ["verify", "search", "create", "confirm"],
  }),
  buildRun({
    runId: "e81b55c2",
    workOrderId: "7143df53",
    version: "v2",
    when: "yesterday at 4:38 PM",
    started: "19/10/2026, 16:38:02",
    duration: "31 s",
    input: inputs.lina,
    path: ["verify", "search", "queue"],
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
    path: ["verify", "search", "create"],
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

// ---------------------------------------------------------------------------
// Case-based surveillance. Facilities report cases over X-Road, so most runs
// carry the caller's identity; one came in on the plain webhook. The run on
// 14 Oct failed because the Ministry of Interior hadn't granted access yet;
// it was retried once they had.
// ---------------------------------------------------------------------------

function caseReport(id: string, when: string, body: State, name?: string): Dataclip {
  return { id, type: "http_request", body: json(body), created: when, name };
}

const cases = {
  chisomo: caseReport("req-c4e1", "today at 9:51 AM", {
    disease: "1A00",
    onsetDate: "2026-10-18",
    facility: "NRH-OPD",
    patient: { nationalId: "FJ-1990-004417", givenName: "Chisomo", familyName: "Phiri", sex: "F", dateOfBirth: "1990-06-11" },
  }),
  yusuf: caseReport("req-8b20", "today at 8:02 AM", {
    disease: "1F03",
    onsetDate: "2026-10-17",
    facility: "NDHO-KAR",
    patient: { nationalId: "FJ-2016-118203", givenName: "Yusuf", familyName: "Kamara", sex: "M", dateOfBirth: "2016-02-23" },
  }),
  ama: caseReport("req-3d7a", "yesterday at 3:14 PM", {
    disease: "1A00",
    onsetDate: "2026-10-18",
    facility: "NRH-PAED",
    patient: { nationalId: "FJ-2021-220981", givenName: "Ama", familyName: "Boateng", sex: "F", dateOfBirth: "2021-09-30" },
  }),
  tendai: caseReport("req-61f9", "yesterday at 9:30 AM", {
    disease: "1F03",
    onsetDate: "2026-10-16",
    facility: "CEN-HC-04",
    patient: { nationalId: "FJ-1978-031177", givenName: "Tendai", familyName: "Moyo", sex: "M", dateOfBirth: "1978-12-01" },
  }),
  grace: caseReport(
    "req-e902",
    "Oct 14th, 2:20 PM",
    {
      disease: "1A00",
      onsetDate: "2026-10-13",
      facility: "NRH-OPD",
      patient: { nationalId: "FJ-1985-077310", givenName: "Grace", familyName: "Banda", sex: "F", dateOfBirth: "1985-04-27" },
    },
    "Report refused before Interior granted access"
  ),
};

const nrh = (messageId: string, userId?: string, issue?: string): XRoadCall => ({
  client: "FJ/GOV/NRH/OPENMRS",
  clientName: "National Referral Hospital",
  messageId,
  userId,
  issue,
});

const caseRunPath = ["check-caller", "verify-nid", "openmrs-patient"];

const builtCases = [
  buildRun({
    runId: "c4e18a62",
    workOrderId: "5a0c71e2",
    version: "v1",
    when: "today at 9:51 AM",
    started: "20/10/2026, 09:51:07",
    startedBy: "National Referral Hospital, over X-Road",
    duration: "2 s",
    input: cases.chisomo,
    path: caseRunPath,
    workflow: registerCaseWorkflow,
    xroad: nrh("nrh-5f1c0a2e-93b4-4d1e-8c2a", "FJ-HW-20431", "CASE-2026-1182"),
  }),
  buildRun({
    runId: "8b20f4d1",
    workOrderId: "d93e0b47",
    version: "v1",
    when: "today at 8:02 AM",
    started: "20/10/2026, 08:02:44",
    startedBy: "Northern District Health Office, over X-Road",
    duration: "2 s",
    input: cases.yusuf,
    path: caseRunPath,
    workflow: registerCaseWorkflow,
    xroad: {
      client: "FJ/GOV/NDHO/SURVEILLANCE",
      clientName: "Northern District Health Office",
      messageId: "ndho-0b7d44e1-2a6c-41f0",
    },
  }),
  buildRun({
    runId: "3d7a9c05",
    workOrderId: "f1b6a3d8",
    version: "v1",
    when: "yesterday at 3:14 PM",
    started: "19/10/2026, 15:14:52",
    startedBy: "National Referral Hospital, over X-Road",
    duration: "3 s",
    input: cases.ama,
    path: caseRunPath,
    workflow: registerCaseWorkflow,
    xroad: nrh("nrh-a83d61b0-0f2e-4c77-b915", "FJ-HW-18802", "CASE-2026-1175"),
  }),
  buildRun({
    runId: "61f9e2b7",
    workOrderId: "0e47c9a1",
    version: "v1",
    when: "yesterday at 9:30 AM",
    started: "19/10/2026, 09:30:18",
    duration: "2 s",
    input: cases.tendai,
    path: caseRunPath,
    workflow: registerCaseWorkflow,
  }),
  // Retried by hand once the Ministry of Interior had granted access.
  buildRun({
    runId: "a2c7d910",
    workOrderId: "e902b5c4",
    version: "v1",
    when: "Oct 15th, 11:02 AM",
    started: "15/10/2026, 11:02:31",
    startedBy: "Jane Doe",
    duration: "2 s",
    input: cases.grace,
    path: caseRunPath,
    workflow: registerCaseWorkflow,
    xroad: nrh("nrh-71e09c3a-55d2-4b08-a3e4", "FJ-HW-20431", "CASE-2026-1101"),
  }),
  buildRun({
    runId: "e902b5c4",
    workOrderId: "e902b5c4",
    version: "v1",
    when: "Oct 14th, 2:20 PM",
    started: "14/10/2026, 14:20:09",
    startedBy: "National Referral Hospital, over X-Road",
    duration: "1 s",
    input: cases.grace,
    path: ["check-caller", "verify-nid"],
    failAt: { jobId: "verify-nid", error: "Access not granted by provider", duration: "211 ms" },
    workflow: registerCaseWorkflow,
    xroad: nrh("nrh-71e09c3a-55d2-4b08-a3e4", "FJ-HW-20431", "CASE-2026-1101"),
  }),
];

/** Recent work orders for the register-case workflow, newest first. */
export const registerCaseWorkOrders: WorkOrder[] = toWorkOrders(builtCases.map((b) => b.run));

export const registerCaseDataclips: Dataclip[] = [...Object.values(cases), ...builtCases.flatMap((b) => b.dataclips)];

/** The run that was refused by the provider, for stories. */
export const accessNotGrantedRun: RunDetails = registerCaseWorkOrders.find((o) => o.id === "e902b5c4")!.runs.at(-1)!;

const weeklyInput = (id: string, when: string): Dataclip => ({ id, type: "http_request", body: json({}), created: when });

const builtWeekly = [
  { runId: "7e30c1aa", workOrderId: "w42d1e09", when: "yesterday at 6:00 AM", started: "19/10/2026, 06:00:02" },
  { runId: "52b8e4f0", workOrderId: "w41c7a33", when: "Oct 12th, 6:00 AM", started: "12/10/2026, 06:00:01" },
  { runId: "19dd07b2", workOrderId: "w40b25e1", when: "Oct 5th, 6:00 AM", started: "05/10/2026, 06:00:03" },
].map((r) =>
  buildRun({
    ...r,
    version: "v1",
    startedBy: "cron trigger",
    duration: "2 s",
    input: weeklyInput(`cron-${r.runId}`, r.when),
    path: ["count-cases", "send-dhis2"],
    workflow: weeklyCaseReportWorkflow,
  })
);

/** Recent work orders for the weekly DHIS2 report, newest first. */
export const weeklyReportWorkOrders: WorkOrder[] = toWorkOrders(builtWeekly.map((b) => b.run));

export const weeklyReportDataclips: Dataclip[] = builtWeekly.flatMap((b) => b.dataclips);

/** Run history for each workflow that has its own, by workflow id. */
export const runHistories: Record<string, { workOrders: WorkOrder[]; dataclips: Dataclip[] }> = {
  [registerCaseWorkflow.id]: { workOrders: registerCaseWorkOrders, dataclips: registerCaseDataclips },
  [weeklyCaseReportWorkflow.id]: { workOrders: weeklyReportWorkOrders, dataclips: weeklyReportDataclips },
};

/**
 * A new run of `workflow` from `input`, along every step it would take when
 * all goes well: from `fromJobId` when retrying from a step, otherwise from
 * the start. With `progress`, the run is still going and that many steps
 * have finished (0 means it has only just started); the editor calls this
 * once per step to show the run advancing live.
 */
export function simulateRun({
  workflow,
  version,
  input,
  workOrderId,
  runId,
  fromJobId,
  startedBy,
  progress,
}: {
  workflow: Workflow;
  version: string;
  input: Dataclip;
  workOrderId: string;
  runId: string;
  fromJobId?: string;
  startedBy: string;
  progress?: number;
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
    progress,
  });
}

// ---------------------------------------------------------------------------
// Activity: what the run history adds up to, for the canvas overlay.
// ---------------------------------------------------------------------------

/** How far back the canvas's activity overlay looks. */
export type ActivityPeriod = "24h" | "7d" | "30d";

export const activityPeriods: { id: ActivityPeriod; label: string; shortLabel: string; hours: number }[] = [
  { id: "24h", label: "Last 24 hours", shortLabel: "24h", hours: 24 },
  { id: "7d", label: "Last 7 days", shortLabel: "7d", hours: 24 * 7 },
  { id: "30d", label: "Last 30 days", shortLabel: "30d", hours: 24 * 30 },
];

export function activityPeriodLabel(period: ActivityPeriod): string {
  return activityPeriods.find((p) => p.id === period)?.label ?? period;
}

/** "Now" for the mock history, the morning its newest runs happened. */
const MOCK_NOW = new Date(2026, 9, 20, 10, 0, 0).getTime();

/** When a run started, from its "dd/mm/yyyy, HH:MM:SS" stamp. */
function startedAt(run: RunDetails): number {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})$/.exec(run.started);
  if (!m) return MOCK_NOW;
  return new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +m[6]).getTime();
}

/** The runs in `workOrders` that started within `period`, newest first. Runs started after the mock's "now" count as just now. */
export function runsInPeriod(workOrders: WorkOrder[], period: ActivityPeriod): RunDetails[] {
  const hours = activityPeriods.find((p) => p.id === period)?.hours ?? Infinity;
  return workOrders.flatMap((o) => o.runs).filter((r) => Math.max(0, MOCK_NOW - startedAt(r)) <= hours * 3600_000);
}

/**
 * The work orders with only the runs started within `period`. Work orders
 * left with no runs are dropped.
 */
export function filterWorkOrders(workOrders: WorkOrder[], period: ActivityPeriod): WorkOrder[] {
  const inPeriod = new Set(runsInPeriod(workOrders, period).map((r) => r.runId));
  return workOrders
    .map((o) => ({ ...o, runs: o.runs.filter((r) => inPeriod.has(r.runId)) }))
    .filter((o) => o.runs.length > 0);
}

export interface NodeActivity {
  /** Runs that reached the node. */
  runs: number;
  /** Runs where the node's step failed. */
  failed: number;
  /** The run the step last failed in, to open from a failure count. */
  lastFailure?: RunDetails;
}

/** The run history summed up per node and edge of a workflow. */
export interface RunActivity {
  period: ActivityPeriod;
  runs: number;
  failed: number;
  /** Keyed by node id; the trigger counts every run that started from it. */
  nodes: Record<string, NodeActivity>;
  /** Keyed by edge id: how many runs went along it. */
  edges: Record<string, number>;
  /** The most runs along any one edge, to scale the others against. */
  busiest: number;
}

/**
 * The steps of `run` that it reached along `workflow`'s connectors from the
 * trigger, in order. A run that didn't start at the trigger, such as one on
 * an older version whose first step isn't next to the trigger here, walked
 * none of this graph; one that leaves the graph part-way stops there.
 */
function walkedSteps(workflow: Workflow, run: RunDetails): RunStep[] {
  const trigger = workflow.nodes.find((n) => n.type === "trigger");
  if (!trigger) return [];
  const walked: RunStep[] = [];
  let from = trigger.id;
  for (const step of run.steps) {
    if (!workflow.edges.some((e) => e.source === from && e.target === step.jobId)) break;
    walked.push(step);
    from = step.jobId;
  }
  return walked;
}

/**
 * Sum up `workOrders` over the nodes and edges of `workflow`: how many runs
 * reached each step and how many failed there, and how many went along each
 * edge, taken from the order the steps ran in. Runs still going aren't
 * counted.
 *
 * A run counts only along the path it walked from the trigger (see
 * `walkedSteps`), so the numbers add up down the graph: the trigger counts
 * every run, each connector carries no more runs than reached the step it
 * leaves, and each step counts exactly the runs its incoming connectors
 * carried. Counts never grow as the workflow goes on. Runs that didn't walk
 * this graph from its trigger, such as runs on an older version, are left
 * out of every number here, the totals included.
 */
export function runActivity(workflow: Workflow, workOrders: WorkOrder[], period: ActivityPeriod = "7d"): RunActivity {
  const nodes: Record<string, NodeActivity> = {};
  const edges: Record<string, number> = {};
  for (const node of workflow.nodes) nodes[node.id] = { runs: 0, failed: 0 };
  for (const edge of workflow.edges) edges[edge.id] = 0;
  const trigger = workflow.nodes.find((n) => n.type === "trigger");

  let runs = 0;
  let failed = 0;
  for (const run of runsInPeriod(workOrders, period)) {
    if (run.status === "running") continue;
    const walked = walkedSteps(workflow, run);
    if (!trigger || walked.length === 0) continue;
    runs += 1;
    if (run.status === "failed") failed += 1;
    nodes[trigger.id].runs += 1;
    let from = trigger.id;
    for (const step of walked) {
      const edge = workflow.edges.find((e) => e.source === from && e.target === step.jobId);
      if (edge) edges[edge.id] += 1;
      const node = nodes[step.jobId];
      node.runs += 1;
      if (step.status === "failed") {
        node.failed += 1;
        node.lastFailure ??= run;
      }
      from = step.jobId;
    }
  }

  return {
    period,
    runs,
    failed,
    nodes,
    edges,
    busiest: Math.max(0, ...Object.values(edges)),
  };
}

/** One reason runs failed, with the runs it explains, for the failures view. */
export interface FailureReason {
  reason: string;
  count: number;
  /** Newest first. */
  runs: RunDetails[];
  /** The steps the failure happened at, e.g. "Create new citizen in Identity". */
  steps: string[];
}

/**
 * Why runs failed in `period`, grouped by the error their failing step
 * raised and ranked by how often it happened. With `jobId`, only failures
 * at that step; otherwise every failure in the workflow. Like
 * `runActivity`, only runs that walked this graph from its trigger count,
 * so these add up to the failed counts on the canvas.
 */
export function failureReasons(workflow: Workflow, workOrders: WorkOrder[], period: ActivityPeriod, jobId?: string): FailureReason[] {
  const label = (id: string) => workflow.nodes.find((n) => n.id === id)?.label ?? id;
  const byReason = new Map<string, FailureReason>();
  for (const run of runsInPeriod(workOrders, period)) {
    const step = walkedSteps(workflow, run).find((s) => s.status === "failed" && (jobId === undefined || s.jobId === jobId));
    if (!step) continue;
    const reason = step.error ?? "Failed without an error message";
    const entry = byReason.get(reason) ?? { reason, count: 0, runs: [], steps: [] };
    entry.count += 1;
    entry.runs.push(run);
    if (!entry.steps.includes(label(step.jobId))) entry.steps.push(label(step.jobId));
    byReason.set(reason, entry);
  }
  return [...byReason.values()].sort((a, b) => b.count - a.count);
}

// ---------------------------------------------------------------------------
// Health: the workflow's run history summed up over a period, for the
// editor's Health tab.
// ---------------------------------------------------------------------------

/** How many runs started in one slice of the period, and how many of those failed. */
export interface HealthBucket {
  /** Names the slice in a tooltip, e.g. "Oct 14" or "Oct 19, 10:00 – 12:00". */
  label: string;
  /** Under the bar on the axis; "" where it would crowd its neighbours. */
  tick: string;
  runs: number;
  failed: number;
}

/** A step and how many runs failed there. */
export interface StepFailures {
  jobId: string;
  label: string;
  adaptor?: AdaptorKind;
  failed: number;
}

/** The workflow's health over a period: every run of it, on any version. */
export interface WorkflowHealth {
  period: ActivityPeriod;
  /** Work orders by the outcome of their latest run in the period. */
  workOrders: { total: number; succeeded: number; failed: number; running: number };
  runs: { total: number; failed: number };
  /** What each bucket covers, e.g. "2 hours" or "day". */
  per: string;
  buckets: HealthBucket[];
  /** Steps with failures, most first. */
  steps: StepFailures[];
  /** Why runs failed, most common first. */
  reasons: FailureReason[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabel = (t: number) => {
  const d = new Date(t);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
};
const hourLabel = (t: number) => `${String(new Date(t).getHours()).padStart(2, "0")}:00`;

/**
 * Sum up every run of the workflow in `period`, whatever version it ran on
 * and wherever it started: work orders by outcome, runs over time, the steps
 * runs failed at and why. Unlike the canvas's counts (`runActivity`), which
 * follow one version's graph, this is the whole workflow's history, so its
 * totals match the run history list.
 */
export function workflowHealth(workflow: Workflow, workOrders: WorkOrder[], period: ActivityPeriod): WorkflowHealth {
  const orders = filterWorkOrders(workOrders, period);
  const runs = orders.flatMap((o) => o.runs);
  const latest = orders.map((o) => o.runs[0].status);

  // 24 hours in 2-hour bars, 7 days in days, 30 days in days with a tick every fifth.
  const hours = activityPeriods.find((p) => p.id === period)!.hours;
  const size = period === "24h" ? 2 : 24;
  const count = hours / size;
  const hour = 3600_000;
  // Bars end at the mock's "now", rounded up to a whole bar.
  const end = period === "24h" ? Math.ceil(MOCK_NOW / (size * hour)) * size * hour : new Date(MOCK_NOW).setHours(24, 0, 0, 0);
  const buckets: HealthBucket[] = Array.from({ length: count }, (_, i) => {
    const from = end - (count - i) * size * hour;
    return period === "24h"
      ? {
          label: `${dayLabel(from)}, ${hourLabel(from)} – ${hourLabel(from + size * hour)}`,
          tick: i % 2 === 0 ? hourLabel(from) : "",
          runs: 0,
          failed: 0,
        }
      : { label: dayLabel(from), tick: period === "30d" && (count - 1 - i) % 5 !== 0 ? "" : dayLabel(from), runs: 0, failed: 0 };
  });
  for (const run of runs) {
    const i = Math.floor((Math.min(startedAt(run), end - 1) - (end - count * size * hour)) / (size * hour));
    const bucket = buckets[Math.max(0, i)];
    bucket.runs += 1;
    if (run.status === "failed") bucket.failed += 1;
  }

  const steps = new Map<string, StepFailures>();
  for (const run of runs) {
    for (const step of run.steps.filter((s) => s.status === "failed")) {
      const node = workflow.nodes.find((n) => n.id === step.jobId);
      const entry = steps.get(step.jobId) ?? {
        jobId: step.jobId,
        label: node?.label ?? step.label,
        adaptor: node?.type === "job" ? node.adaptor : undefined,
        failed: 0,
      };
      entry.failed += 1;
      steps.set(step.jobId, entry);
    }
  }

  const byReason = new Map<string, FailureReason>();
  for (const run of runs) {
    const step = run.steps.find((s) => s.status === "failed");
    if (!step) continue;
    const reason = step.error ?? "Failed without an error message";
    const entry = byReason.get(reason) ?? { reason, count: 0, runs: [], steps: [] };
    entry.count += 1;
    entry.runs.push(run);
    const label = workflow.nodes.find((n) => n.id === step.jobId)?.label ?? step.label;
    if (!entry.steps.includes(label)) entry.steps.push(label);
    byReason.set(reason, entry);
  }

  return {
    period,
    workOrders: {
      total: orders.length,
      succeeded: latest.filter((s) => s === "success").length,
      failed: latest.filter((s) => s === "failed").length,
      running: latest.filter((s) => s === "running").length,
    },
    runs: { total: runs.length, failed: runs.filter((r) => r.status === "failed").length },
    per: period === "24h" ? "2 hours" : "day",
    buckets,
    steps: [...steps.values()].sort((a, b) => b.failed - a.failed || a.label.localeCompare(b.label)),
    reasons: [...byReason.values()].sort((a, b) => b.count - a.count),
  };
}
