/**
 * Mock data for the Workflow Editor prototype.
 *
 * Models a Lightning-style workflow: a trigger, a set of jobs (steps), and the
 * edges that connect them. Node positions are stored directly on each node so
 * the canvas can lay things out with simple absolute positioning.
 */
import type { Workflow, WorkflowVersion } from "../model/workflow";

// ---------------------------------------------------------------------------
// The "Apply for a national ID" workflow shown in the design reference.
// ---------------------------------------------------------------------------

const verifyBody = `// Keep the original application payload safe for downstream steps
fn(state => {
  state.application = state.data;
  return state;
});

// Search registered births (v1 GraphQL advanced search).
queryEvents(
  // 1) Search parameters: the applicant's name and date of birth.
  {
    event: 'birth',
    registrationStatuses: ['REGISTERED'],
    childFirstNames: $.application.given_name,
    childLastName: $.application.family_name,
    childDoB: $.application.date_of_birth,
  },
  // 2) Paging: count defaults to 10.
  { count: 5 }
);

// Keep the birth record, or stop if there isn't one
fn(state => {
  const [record] = state.data ?? [];
  if (!record) {
    throw new Error('No registered birth found in OpenCRVS');
  }
  state.birthRegistration = {
    trackingId: record.registration?.trackingId,
    registrationNumber: record.registration?.registrationNumber,
  };
  return state;
});`;

const notifyBody = `// Send an SMS via Twilio.
// state.references is populated with Twilio's API response.
sendSMS({
  // Message body (max 1600 chars, billed per 160-char segment).
  body: \`Hi \${$.application.given_name}, you already have a national ID (\${$.matches[0].nationalId}). No new ID will be issued.\`,
  // Your Twilio sending number, in E.164 format (e.g. +14155551212).
  from: $.configuration.fromNumber,
  // Recipient, in E.164 format.
  to: $.application.phone,
});`;

const confirmBody = `// Send an SMS via Twilio.
// state.references is populated with Twilio's API response.
sendSMS({
  // Message body (max 1600 chars, billed per 160-char segment).
  body: \`Hi \${$.application.given_name}, your national ID is \${$.nationalId}. Collect your card at the \${$.application.district} office.\`,
  // Your Twilio sending number, in E.164 format (e.g. +14155551212).
  from: $.configuration.fromNumber,
  // Recipient, in E.164 format.
  to: $.application.phone,
});`;

const createBody = `// Send a POST request with a JSON body.
post('https://simdpgidentity-production.up.railway.app/citizens', $.application, {
  headers: { 'X-Trace-Id': $.run.id },
});`;

const searchBody = `// Search Identity for potential duplicates
get('https://simdpgidentity-production.up.railway.app/citizens/search', {
  query: { name: $.application.given_name, dob: $.application.date_of_birth },
});

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
      id: "verify",
      type: "job",
      label: "Verify birth registration in OpenCRVS",
      summary: "**Checks OpenCRVS** for the applicant's registered birth.",
      adaptor: "opencrvs",
      adaptorPackage: "@openfn/language-opencrvs",
      body: verifyBody,
      system: "opencrvs",
      x: 490,
      y: 230,
    },
    {
      id: "search",
      type: "job",
      label: "Search for duplicate citizens in Identity",
      summary: "**Searches Identity** for citizens matching the application.",
      adaptor: "http",
      adaptorPackage: "@openfn/language-http",
      body: searchBody,
      system: "identity",
      x: 490,
      y: 390,
    },
    {
      id: "notify",
      type: "job",
      label: "Notify applicant of existing national ID",
      summary: "**Tells the applicant** a national ID already exists for them.",
      adaptor: "twilio",
      adaptorPackage: "@openfn/language-twilio",
      body: notifyBody,
      system: "twilio",
      x: 190,
      y: 570,
    },
    {
      id: "create",
      type: "job",
      label: "Create new citizen in Identity",
      summary: "**Registers the citizen** in Identity and captures the issued ID.",
      adaptor: "http",
      adaptorPackage: "@openfn/language-http",
      body: createBody,
      system: "identity",
      x: 490,
      y: 570,
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
      y: 570,
    },
    {
      id: "confirm",
      type: "job",
      label: "Send confirmation notification with national ID",
      summary: "**Sends the applicant** their new national ID.",
      adaptor: "twilio",
      adaptorPackage: "@openfn/language-twilio",
      body: confirmBody,
      system: "twilio",
      x: 490,
      y: 740,
    },
  ],
  edges: [
    { id: "e-trigger-verify", source: "trigger", target: "verify", condition: "always" },
    { id: "e-verify-search", source: "verify", target: "search", condition: "on_success" },
    {
      id: "e-search-notify",
      source: "search",
      target: "notify",
      condition: "js_expression",
      expression: "state.exactMatch === true",
      label: "Exact match",
    },
    {
      id: "e-search-create",
      source: "search",
      target: "create",
      condition: "js_expression",
      expression: "state.exactMatch === false",
      label: "No match",
    },
    { id: "e-search-queue", source: "search", target: "queue", condition: "on_failure" },
    { id: "e-create-confirm", source: "create", target: "confirm", condition: "on_success" },
  ],
};

/**
 * The same workflow at v1, before the birth check and duplicate check were
 * promoted: every application went straight to Identity. Step ids match the latest version,
 * so a v1 run can be shown on either graph.
 */
export const nationalIdWorkflowV1: Workflow = {
  ...nationalIdWorkflow,
  version: "v1",
  nodes: nationalIdWorkflow.nodes
    .filter((n) => n.id !== "verify" && n.id !== "search" && n.id !== "notify")
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
    const out = workflow.edges.filter((e) => e.source === id && e.condition !== "on_failure" && e.enabled !== false);
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

// ---------------------------------------------------------------------------
// Case-based surveillance: two workflows that look the same in the editor,
// though one reaches its systems over X-Road and the other directly.
// ---------------------------------------------------------------------------

const checkCallerBody = `// Who called us over X-Road, as OpenFn read it from the
// X-Road headers. Read-only: the workflow can't change it.
fn(state => {
  const { client, userId } = state.xroad ?? {};
  const allowed = ['NRH', 'NDHO'];

  if (client && !allowed.includes(client.memberCode)) {
    throw new Error(\`\${client.name} may not report cases\`);
  }

  state.report = state.data;
  state.reportedBy = { member: client?.name ?? 'Direct webhook', userId };
  return state;
});`;

const verifyIdBody = `// Ask the Ministry of Interior's "Verify a national ID" service.
// It's a workflow service of theirs, reached over X-Road: the
// system adds the route and headers, so this is a plain POST.
post('/verify', {
  nationalId: $.report.patient.nationalId,
  name: \`\${$.report.patient.givenName} \${$.report.patient.familyName}\`,
  dateOfBirth: $.report.patient.dateOfBirth,
});

fn(state => {
  if (!state.data.match) throw new Error('National ID does not match the patient');
  return state;
});`;

const openmrsPatientBody = `// Find the patient in the hospital's OpenMRS by national ID,
// and register them if they aren't there yet.
searchPatient({ identifier: $.report.patient.nationalId });

fn(state => {
  const [patient] = state.data.results ?? [];
  state.patientUuid = patient?.uuid;
  return state;
});

fnIf(!$.patientUuid, create('patient', {
  identifiers: [{ identifier: $.report.patient.nationalId, identifierType: 'National ID' }],
  person: {
    gender: $.report.patient.sex,
    birthdate: $.report.patient.dateOfBirth,
    names: [{ givenName: $.report.patient.givenName, familyName: $.report.patient.familyName }],
  },
}));`;

const countCasesBody = `// Count last week's suspected cases by district and disease.
collections.get('suspected-cases', { createdAfter: 'now - 7d' });

fn(state => {
  const counts = {};
  for (const { value } of state.data) {
    const key = \`\${value.district}|\${value.disease}\`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  state.counts = counts;
  return state;
});`;

const sendDhis2Body = `// Send the week's totals to the national DHIS2 as data values.
create('dataValueSets', {
  dataSet: 'IDSR-weekly',
  period: $.period,
  dataValues: Object.entries($.counts).map(([key, value]) => {
    const [orgUnit, dataElement] = key.split('|');
    return { orgUnit, dataElement, value };
  }),
});`;

/**
 * Workflow A: facilities report suspected cases to it over X-Road, and it
 * calls OpenMRS and the Ministry of Interior's own workflow service over
 * X-Road too. The step that verifies the national ID calls another
 * organisation's published workflow: services built from workflows, used by
 * workflows, across organisations.
 */
export const registerCaseWorkflow: Workflow = {
  id: "register-case-workflow",
  name: "register-case-workflow",
  project: "Case-based surveillance",
  version: "latest",
  nodes: [
    {
      id: "trigger",
      type: "trigger",
      triggerType: "webhook",
      label: "Webhook trigger",
      subtitle: "On each case reported",
      summary: "**Starts a run** for each suspected case a facility reports.",
      x: 490,
      y: 70,
    },
    {
      id: "check-caller",
      type: "job",
      label: "Check the caller may report cases",
      summary: "**Checks who called**, from the X-Road identity on state.",
      adaptor: "common",
      adaptorPackage: "@openfn/language-common",
      body: checkCallerBody,
      x: 490,
      y: 230,
    },
    {
      id: "verify-nid",
      type: "job",
      label: "Verify the patient's national ID",
      summary: "**Verifies the national ID** with the Ministry of Interior.",
      adaptor: "http",
      adaptorPackage: "@openfn/language-http",
      body: verifyIdBody,
      system: "national-id",
      x: 490,
      y: 390,
    },
    {
      id: "openmrs-patient",
      type: "job",
      label: "Find or register the patient in OpenMRS",
      summary: "**Finds the patient** in the hospital's OpenMRS, or registers them.",
      adaptor: "openmrs",
      adaptorPackage: "@openfn/language-openmrs",
      body: openmrsPatientBody,
      system: "openmrs",
      x: 490,
      y: 550,
    },
  ],
  edges: [
    { id: "e-trigger-check-caller", source: "trigger", target: "check-caller", condition: "always" },
    { id: "e-check-caller-verify-nid", source: "check-caller", target: "verify-nid", condition: "on_success" },
    { id: "e-verify-nid-openmrs-patient", source: "verify-nid", target: "openmrs-patient", condition: "on_success" },
  ],
};

/** Workflow B: sends weekly counts to DHIS2, reached directly with a credential. */
export const weeklyCaseReportWorkflow: Workflow = {
  id: "weekly-case-report-workflow",
  name: "weekly-case-report-workflow",
  project: "Case-based surveillance",
  version: "latest",
  nodes: [
    {
      id: "trigger",
      type: "trigger",
      triggerType: "cron",
      label: "Cron trigger",
      subtitle: "Every Monday at 06:00",
      summary: "**Starts a run** every Monday at 06:00.",
      x: 490,
      y: 70,
    },
    {
      id: "count-cases",
      type: "job",
      label: "Count last week's cases by district",
      summary: "**Counts suspected cases** by district and disease.",
      adaptor: "common",
      adaptorPackage: "@openfn/language-common",
      body: countCasesBody,
      x: 490,
      y: 230,
    },
    {
      id: "send-dhis2",
      type: "job",
      label: "Send weekly totals to DHIS2",
      summary: "**Sends the totals** to the national DHIS2.",
      adaptor: "dhis2",
      adaptorPackage: "@openfn/language-dhis2",
      body: sendDhis2Body,
      system: "dhis2",
      x: 490,
      y: 390,
    },
  ],
  edges: [
    { id: "e-trigger-count-cases", source: "trigger", target: "count-cases", condition: "always" },
    { id: "e-count-cases-send-dhis2", source: "count-cases", target: "send-dhis2", condition: "on_success" },
  ],
};

/** Workflows with a graph of their own, by id. Any other workflow borrows the national ID workflow's. */
export const workflowGraphs: Record<string, Workflow> = {
  [registerCaseWorkflow.id]: registerCaseWorkflow,
  [weeklyCaseReportWorkflow.id]: weeklyCaseReportWorkflow,
};

/** The version history of a workflow with its own graph. */
export const surveillanceVersions: WorkflowVersion[] = [
  { id: "v1", message: "Initial go-live", author: "Jane Doe", date: "15 Oct 2026" },
];

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
    date: "24 Sep 2026",
  },
  { id: "v1", message: "Initial go-live", author: "Brandon Jackson", date: "2 Sep 2026" },
];
