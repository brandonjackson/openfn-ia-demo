/**
 * Run history for the "Apply for a national ID" workflow: work orders, the
 * runs made for each, and the dataclips (inputs and step results) they used.
 *
 * Runs before 24 Sep ran on v1, which had no duplicate check; later runs ran
 * on v2. Each run is built from a short spec (the steps it took, and where it
 * failed) so its steps, logs and dataclips stay consistent with each other.
 * A handful are written out by hand, for stories and tests to point at; the
 * rest of the month's traffic is generated from a fixed seed
 * (`generatedHistory`), so the canvas's 24h, 7d and 30d each show more.
 */
import type { Dataclip, LogLine, RunDetails, RunStep, Workflow, WorkOrder } from "../model/workflow";
import { happyPath, nationalIdWorkflow, registerCaseWorkflow, weeklyCaseReportWorkflow } from "./workflow";
import type { XRoadCall } from "../model/xroad";
import { openfnClientId, routeUrl } from "./xroad";
import { stampTime } from "../model/runs";

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
  priya: application("req-2f11", "Sep 23rd, 12:19 PM", {
    given_name: "Priya",
    family_name: "Nair",
    date_of_birth: "1999-05-08",
    district: "North",
    phone: "+15555550105",
  }),
  jonas: application("req-0b39", "Sep 23rd, 12:18 PM", {
    given_name: "Jonas",
    family_name: "Berg",
    date_of_birth: "1968-09-17",
    district: "West",
    phone: "+15555550106",
  }),
  mei: application("req-b4f8", "Sep 22nd, 9:22 AM", {
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
    description: "Someone not yet in the registry, so the workflow creates a record for them.",
    type: "saved_input",
    created: "Oct 10th, 2:04 PM",
    body: json({ given_name: "Test", family_name: "Applicant", date_of_birth: "2000-01-01", district: "North", phone: "+15555550100" }),
  },
  {
    id: "saved-existing-citizen",
    name: "Sample application: existing citizen",
    description: "Amara Okafor, already registered, so the workflow finds her and confirms.",
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
    when: "Sep 23rd, 12:19 PM",
    started: "23/09/2026, 12:19:08",
    duration: "2 s",
    input: inputs.priya,
    path: ["create", "confirm"],
  }),
  buildRun({
    runId: "c47e2d18",
    workOrderId: "0b393bfb",
    version: "v1",
    when: "Sep 23rd, 12:18 PM",
    started: "23/09/2026, 12:18:44",
    duration: "31 s",
    input: inputs.jonas,
    path: ["create", "queue"],
    failAt: { jobId: "create", error: "Identity returned 502 Bad Gateway" },
  }),
  buildRun({
    runId: "18aa6f3c",
    workOrderId: "b4f8902d",
    version: "v1",
    when: "Sep 22nd, 9:22 AM",
    started: "22/09/2026, 09:22:17",
    duration: "2 s",
    input: inputs.mei,
    path: ["create", "confirm"],
  }),
];

// ---------------------------------------------------------------------------
// Generated history: a month of ordinary traffic around the hand-written runs,
// the same on every load because it comes from a fixed seed.
// ---------------------------------------------------------------------------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "today at 9:42 AM", "yesterday at 5:02 PM" or "Oct 13th, 12:19 PM", as the mock history words it on 20 Oct. */
export function whenLabel(d: Date): string {
  const h = d.getHours() % 12 || 12;
  const time = `${h}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() < 12 ? "AM" : "PM"}`;
  if (d.getMonth() === 9 && d.getDate() === 20) return `today at ${time}`;
  if (d.getMonth() === 9 && d.getDate() === 19) return `yesterday at ${time}`;
  const day = d.getDate();
  const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
  return `${MONTHS[d.getMonth()]} ${day}${suffix}, ${time}`;
}

/** A date as runs write when they started: "dd/mm/yyyy, HH:MM:SS". */
function startedStamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** A small random number generator (mulberry32) that gives the same numbers for the same seed. */
function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The last moment generated runs may start, so the hand-written runs stay the newest. */
const GENERATED_UNTIL = new Date(2026, 9, 20, 9, 30);

/**
 * Times for a generated history, oldest first: `perDay(date, random)` runs on
 * each day from `from` up to {@link GENERATED_UNTIL}, during working hours.
 */
function generatedTimes(from: Date, random: () => number, perDay: (day: Date) => number): Date[] {
  const times: Date[] = [];
  for (const day = new Date(from); day <= GENERATED_UNTIL; day.setDate(day.getDate() + 1)) {
    const count = perDay(day);
    const dayTimes: Date[] = [];
    for (let i = 0; i < count; i++) {
      const minutes = 7 * 60 + Math.floor(random() * 11 * 60);
      const t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes, Math.floor(random() * 60));
      if (t >= from && t <= GENERATED_UNTIL) dayTimes.push(t);
    }
    times.push(...dayTimes.sort((a, b) => a.getTime() - b.getTime()));
  }
  return times;
}

const hex = (random: () => number) =>
  Math.floor(random() * 0xffffffff)
    .toString(16)
    .padStart(8, "0");

const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

const GIVEN = ["Abena", "Kwame", "Fatima", "Joseph", "Nadia", "Samuel", "Esi", "Daniel", "Halima", "Peter", "Zainab", "Musa", "Ruth", "Ibrahim", "Grace", "Elias", "Aisha", "Moses", "Lucia", "Omar"];
const FAMILY = ["Mensah", "Diallo", "Owusu", "Banda", "Kariuki", "Achieng", "Sesay", "Mwangi", "Tembo", "Juma", "Asante", "Kamau", "Phiri", "Ndlovu", "Okeke", "Bello"];
const DISTRICTS = ["North", "Central", "Coast", "East", "West"];

const pick = <T,>(random: () => number, items: T[]) => items[Math.floor(random() * items.length)];

/** How a generated national ID application went, by path through v2. */
interface Outcome {
  path: string[];
  failAt?: { jobId: string; error: string; duration?: string };
  duration: string;
  /** The search found the applicant already registered. */
  match?: boolean;
}

const v2Outcomes: { weight: number; outcome: Outcome }[] = [
  { weight: 68, outcome: { path: ["verify", "search", "create", "confirm"], duration: "5 s" } },
  { weight: 18, outcome: { path: ["verify", "search", "notify"], duration: "4 s", match: true } },
  {
    weight: 5,
    outcome: { path: ["verify", "search", "queue"], duration: "31 s", failAt: { jobId: "search", error: "Identity did not respond within 30s" } },
  },
  {
    weight: 4,
    outcome: { path: ["verify", "search", "create"], duration: "34 s", failAt: { jobId: "create", error: "Identity returned 502 Bad Gateway" } },
  },
  {
    weight: 3,
    outcome: {
      path: ["verify"],
      duration: "1 s",
      failAt: { jobId: "verify", error: "No birth registration found in OpenCRVS", duration: "702 ms" },
    },
  },
  {
    weight: 2,
    outcome: {
      path: ["verify", "search", "create", "confirm"],
      duration: "5 s",
      failAt: { jobId: "confirm", error: "Twilio returned 400: not a valid phone number", duration: "366 ms" },
    },
  },
];

/** On 8 Oct Identity was down from 1 to 4 PM, so most searches timed out. */
const identityOutage = (t: Date) => t.getMonth() === 9 && t.getDate() === 8 && t.getHours() >= 13 && t.getHours() < 16;

function weighted(random: () => number, options: { weight: number; outcome: Outcome }[]): Outcome {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let roll = random() * total;
  for (const o of options) {
    roll -= o.weight;
    if (roll < 0) return o.outcome;
  }
  return options[options.length - 1].outcome;
}

/**
 * A month of national ID applications: a few a day on weekdays, fewer at
 * weekends, on v1 until v2 went live on 24 Sep. Some failures were retried
 * by hand a little later and went through.
 */
function generatedNationalIdHistory(): { runs: ReturnType<typeof buildRun>[]; inputs: Dataclip[] } {
  const random = seededRandom(20261020);
  const v2Live = new Date(2026, 8, 24, 11, 0);
  const times = generatedTimes(new Date(2026, 8, 20, 10, 30), random, (day) => (isWeekend(day) ? 1 + Math.floor(random() * 2) : 4 + Math.floor(random() * 4)));
  const runs: ReturnType<typeof buildRun>[] = [];
  const inputs: Dataclip[] = [];
  for (const t of times) {
    const workOrderId = hex(random);
    const runId = hex(random);
    const given = pick(random, GIVEN);
    const family = pick(random, FAMILY);
    const year = 1950 + Math.floor(random() * 56);
    const body = {
      given_name: given,
      family_name: family,
      date_of_birth: `${year}-${String(1 + Math.floor(random() * 12)).padStart(2, "0")}-${String(1 + Math.floor(random() * 28)).padStart(2, "0")}`,
      district: pick(random, DISTRICTS),
      phone: `+1555555${String(1000 + Math.floor(random() * 9000))}`,
    };
    const input = application(`req-${workOrderId.slice(0, 4)}`, whenLabel(t), body);
    inputs.push(input);

    const onV1 = t < v2Live;
    const outcome: Outcome = onV1
      ? random() < 0.85
        ? { path: ["create", "confirm"], duration: "2 s" }
        : { path: ["create", "queue"], duration: "31 s", failAt: { jobId: "create", error: "Identity returned 502 Bad Gateway" } }
      : identityOutage(t) && random() < 0.7
        ? v2Outcomes[2].outcome
        : weighted(random, v2Outcomes);
    const spec = {
      workOrderId,
      version: onV1 ? "v1" : "v2",
      input,
      ...(outcome.match && {
        outputs: { search: { ...body, matches: [{ nationalId: `NID-20${10 + Math.floor(random() * 15)}-${runId.slice(0, 6).toUpperCase()}`, given_name: given, family_name: family }], exactMatch: true } },
      }),
    };
    runs.push(buildRun({ ...spec, runId, when: whenLabel(t), started: startedStamp(t), duration: outcome.duration, path: outcome.path, failAt: outcome.failAt }));

    // Some failures at Identity were retried by hand once it was back.
    const retriable = outcome.failAt && (outcome.failAt.jobId === "search" || outcome.failAt.jobId === "create");
    if (retriable && random() < 0.45) {
      const retryAt = new Date(t.getTime() + (20 + Math.floor(random() * 160)) * 60_000);
      if (retryAt <= GENERATED_UNTIL) {
        runs.push(
          buildRun({
            ...spec,
            runId: hex(random),
            when: whenLabel(retryAt),
            started: startedStamp(retryAt),
            startedBy: pick(random, ["Brandon Jackson", "Jane Doe"]),
            duration: onV1 ? "2 s" : "5 s",
            path: onV1 ? ["create", "confirm"] : ["verify", "search", "create", "confirm"],
          })
        );
      }
    }
  }
  return { runs, inputs };
}

const generated = generatedNationalIdHistory();

/** Newest first, by when they started; runs that started together keep the order they're listed in. */
const newestFirst = <T extends { run: RunDetails }>(runs: T[]) =>
  runs
    .map((r, i) => ({ r, i, t: stampTime(r.run.started) }))
    .sort((a, b) => b.t - a.t || a.i - b.i)
    .map(({ r }) => r);

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
export const workOrders: WorkOrder[] = toWorkOrders(newestFirst([...built, ...generated.runs]).map((b) => b.run));

/** The national ID work orders made up from the seed rather than written out by hand. */
export const generatedWorkOrderIds: ReadonlySet<string> = new Set(generated.runs.map((b) => b.run.workOrderId));

/** Every dataclip in the project: trigger inputs, saved inputs and step results. */
export const dataclips: Dataclip[] = [
  ...Object.values(inputs),
  ...generated.inputs,
  ...savedInputs,
  ...built.flatMap((b) => b.dataclips),
  ...generated.runs.flatMap((b) => b.dataclips),
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

/**
 * Case reports since access was granted on 15 Oct: a few a day, mostly from
 * facilities over X-Road, now and then one on the plain webhook.
 */
function generatedCaseHistory(): { runs: ReturnType<typeof buildRun>[]; inputs: Dataclip[] } {
  const random = seededRandom(1101);
  const callers = [
    { client: "FJ/GOV/NRH/OPENMRS", clientName: "National Referral Hospital", facilities: ["NRH-OPD", "NRH-PAED"], prefix: "nrh" },
    { client: "FJ/GOV/NDHO/SURVEILLANCE", clientName: "Northern District Health Office", facilities: ["NDHO-KAR"], prefix: "ndho" },
  ];
  const times = generatedTimes(new Date(2026, 9, 15, 11, 30), random, (day) => (isWeekend(day) ? 1 : 2 + Math.floor(random() * 3)));
  const runs: ReturnType<typeof buildRun>[] = [];
  const inputs: Dataclip[] = [];
  for (const t of times) {
    const workOrderId = hex(random);
    const runId = hex(random);
    const caller = random() < 0.85 ? pick(random, callers) : undefined;
    const year = 1950 + Math.floor(random() * 75);
    const input = caseReport(`req-${workOrderId.slice(0, 4)}`, whenLabel(t), {
      disease: pick(random, ["1A00", "1F03"]),
      onsetDate: `2026-10-${String(Math.max(1, t.getDate() - 1 - Math.floor(random() * 3))).padStart(2, "0")}`,
      facility: caller ? pick(random, caller.facilities) : "CEN-HC-04",
      patient: {
        nationalId: `FJ-${year}-${String(Math.floor(random() * 1_000_000)).padStart(6, "0")}`,
        givenName: pick(random, GIVEN),
        familyName: pick(random, FAMILY),
        sex: random() < 0.5 ? "F" : "M",
        dateOfBirth: `${year}-${String(1 + Math.floor(random() * 12)).padStart(2, "0")}-${String(1 + Math.floor(random() * 28)).padStart(2, "0")}`,
      },
    });
    inputs.push(input);
    const failed = random() < 0.05;
    runs.push(
      buildRun({
        runId,
        workOrderId,
        version: "v1",
        when: whenLabel(t),
        started: startedStamp(t),
        startedBy: caller ? `${caller.clientName}, over X-Road` : undefined,
        duration: failed ? "33 s" : "2 s",
        input,
        path: caseRunPath,
        failAt: failed ? { jobId: "openmrs-patient", error: "OpenMRS did not respond within 30s" } : undefined,
        workflow: registerCaseWorkflow,
        xroad: caller && { client: caller.client, clientName: caller.clientName, messageId: `${caller.prefix}-${runId}-${hex(random).slice(0, 4)}` },
      })
    );
  }
  return { runs, inputs };
}

const generatedCases = generatedCaseHistory();

/** Recent work orders for the register-case workflow, newest first. */
export const registerCaseWorkOrders: WorkOrder[] = toWorkOrders(newestFirst([...builtCases, ...generatedCases.runs]).map((b) => b.run));

export const registerCaseDataclips: Dataclip[] = [
  ...Object.values(cases),
  ...generatedCases.inputs,
  ...builtCases.flatMap((b) => b.dataclips),
  ...generatedCases.runs.flatMap((b) => b.dataclips),
];

/** The run that was refused by the provider, for stories. */
export const accessNotGrantedRun: RunDetails = registerCaseWorkOrders.find((o) => o.id === "e902b5c4")!.runs.at(-1)!;

const weeklyInput = (id: string, when: string): Dataclip => ({ id, type: "http_request", body: json({}), created: when });

const builtWeekly = [
  { runId: "7e30c1aa", workOrderId: "w42d1e09", when: "yesterday at 6:00 AM", started: "19/10/2026, 06:00:02" },
  { runId: "52b8e4f0", workOrderId: "w41c7a33", when: "Oct 12th, 6:00 AM", started: "12/10/2026, 06:00:01" },
  { runId: "19dd07b2", workOrderId: "w40b25e1", when: "Oct 5th, 6:00 AM", started: "05/10/2026, 06:00:03" },
  { runId: "a4c19e07", workOrderId: "w39f0d12", when: "Sep 28th, 6:00 AM", started: "28/09/2026, 06:00:02" },
  { runId: "0f6b3d95", workOrderId: "w38e6c40", when: "Sep 21st, 6:00 AM", started: "21/09/2026, 06:00:04" },
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
