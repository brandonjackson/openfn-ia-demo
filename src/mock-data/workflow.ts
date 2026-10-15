/**
 * Workflow graphs for the collaborative editor (`/projects/:id/w/:workflowId`):
 * triggers, jobs, edges and canvas positions, shaped like Lightning's
 * collaborative-editor `Workflow` types (assets/js/collaborative-editor/types).
 * One graph per summary in ./workflows.ts, keyed by the same id. Static
 * fixtures only; the editor copies a graph into local React state.
 *
 * `wf-openhie` is the OpenHIE Workflow from Lightning's demo seed
 * (lib/lightning/setup_utils.ex `create_openhie_project`); its job ids match
 * the steps in ./history.ts so runs light up on the canvas.
 */

import { kickstartGraphs } from "./generated/kickstart";
import type { EditorJob, WorkflowGraph, WorkflowSnapshot, WorkflowTemplate } from "../types/workflow-graph";
import { RANK, SEED_BODY, cron, edge, webhook } from "../utils/workflowGraph";

const OPENHIE = "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa";
const DHIS2 = "1f0b7c2e-9d3a-4a4b-8f5e-2c6d7e8f9a01";
const SANDBOX = "8c1d2e3f-4a5b-4c6d-9e7f-0a1b2c3d4e5f";

const SPREAD = 185;

function httpJob(id: string, name: string): EditorJob {
  return { id, name, adaptor: "@openfn/language-http@latest", body: SEED_BODY, credentialName: null };
}

function openhieGraph(id: string, projectId: string, suffix = ""): WorkflowGraph {
  const t = `trigger-openhie${suffix}`;
  const transform = `job-transform${suffix}`;
  const send = `job-send${suffix}`;
  const ok = `job-notify-ok${suffix}`;
  const failed = `job-notify-failed${suffix}`;
  return {
    id,
    projectId,
    name: "OpenHIE Workflow",
    lockVersion: suffix ? 3 : 12,
    concurrency: null,
    enableJobLogs: true,
    triggers: [webhook(t, true)],
    jobs: [
      httpJob(transform, "Transform data to FHIR standard"),
      httpJob(send, "Send to OpenHIM to route to SHR"),
      httpJob(ok, "Notify CHW upload successful"),
      httpJob(failed, "Notify CHW upload failed"),
    ],
    edges: [
      edge(`edge-openhie-root${suffix}`, { trigger: t }, transform, "always"),
      edge(`edge-openhie-send${suffix}`, { job: transform }, send, "on_job_success"),
      edge(`edge-openhie-ok${suffix}`, { job: send }, ok, "on_job_success"),
      edge(`edge-openhie-failed${suffix}`, { job: send }, failed, "on_job_failure"),
    ],
    positions: {
      [t]: { x: 0, y: 0 },
      [transform]: { x: 0, y: RANK },
      [send]: { x: 0, y: RANK * 2 },
      [ok]: { x: -SPREAD, y: RANK * 3 },
      [failed]: { x: SPREAD, y: RANK * 3 },
    },
  };
}

export const workflowGraphs: WorkflowGraph[] = [
  openhieGraph("wf-openhie", OPENHIE),
  {
    id: "wf-referrals",
    projectId: OPENHIE,
    name: "Referral follow-ups",
    lockVersion: 7,
    concurrency: 1,
    enableJobLogs: true,
    triggers: [cron("trigger-referrals", true, "0 6 * * *", "At 06:00 AM")],
    jobs: [
      {
        id: "job-referrals",
        name: "Fetch overdue referrals",
        adaptor: "@openfn/language-commcare@latest",
        body: "get('/a/referrals', { query: { status: 'overdue' } });\n",
        credentialName: "CommCare HQ",
      },
      {
        id: "job-referral-sms",
        name: "Send SMS reminders",
        adaptor: "@openfn/language-twilio@latest",
        body: "each('$.data[*]', sendSMS(state => ({\n  to: state.data.phone,\n  body: 'Your referral is overdue',\n})));\n",
        credentialName: null,
      },
      {
        id: "job-referral-errors",
        name: "Log failed lookups",
        adaptor: "@openfn/language-common@latest",
        body: "fn(state => {\n  console.log(state.errors);\n  return state;\n});\n",
        credentialName: null,
      },
    ],
    edges: [
      edge("edge-referrals-root", { trigger: "trigger-referrals" }, "job-referrals", "always"),
      edge("edge-referrals-sms", { job: "job-referrals" }, "job-referral-sms", "js_expression", {
        conditionLabel: "Has overdue referrals",
        conditionExpression: "state.data.length > 0",
      }),
      edge("edge-referrals-errors", { job: "job-referrals" }, "job-referral-errors", "on_job_failure"),
    ],
    positions: {
      "trigger-referrals": { x: 0, y: 0 },
      "job-referrals": { x: 0, y: RANK },
      "job-referral-sms": { x: -SPREAD, y: RANK * 2 },
      "job-referral-errors": { x: SPREAD, y: RANK * 2 },
    },
  },
  {
    id: "wf-facility-sync",
    projectId: OPENHIE,
    name: "Facility registry sync",
    lockVersion: 2,
    concurrency: null,
    enableJobLogs: false,
    triggers: [cron("trigger-facility", false, "0 2 * * 1", "At 02:00 AM, only on Monday")],
    jobs: [
      {
        id: "job-facility-get",
        name: "Get facilities from DHIS2",
        adaptor: "@openfn/language-dhis2@latest",
        body: "get('organisationUnits', { fields: '*', paging: false });\n",
        credentialName: "DHIS2 play",
      },
      {
        id: "job-facility-upsert",
        name: "Upsert locations in OpenMRS",
        adaptor: "@openfn/language-openmrs@latest",
        body: "each('$.data.organisationUnits[*]', upsert('location', state => state.data));\n",
        credentialName: null,
      },
    ],
    edges: [
      edge("edge-facility-root", { trigger: "trigger-facility" }, "job-facility-get", "always"),
      edge("edge-facility-upsert", { job: "job-facility-get" }, "job-facility-upsert", "on_job_success"),
    ],
    positions: {
      "trigger-facility": { x: 0, y: 0 },
      "job-facility-get": { x: 0, y: RANK },
      "job-facility-upsert": { x: 0, y: RANK * 2 },
    },
  },
  {
    // Lightning's seed: create_dhis2_project.
    id: "wf-dhis2-sheets",
    projectId: DHIS2,
    name: "DHIS2 to Sheets",
    lockVersion: 4,
    concurrency: null,
    enableJobLogs: true,
    triggers: [cron("trigger-dhis2", true, "0 * * * *", "Every hour")],
    jobs: [
      {
        id: "job-dhis2-get",
        name: "Get DHIS2 data",
        adaptor: "@openfn/language-dhis2@latest",
        body: "get('trackedEntityInstances', {\n  ou: 'DiszpKrYNg8',\n  program: 'IpHINAT79UW',\n});\n",
        credentialName: "DHIS2 play",
      },
      {
        id: "job-dhis2-sheet",
        name: "Upload to Google Sheet",
        adaptor: "@openfn/language-googlesheets@latest",
        body: "appendValues({\n  spreadsheetId: '1O-a4_RgPF_p8W3I6b5K9wobA3-CBW8hLClZfUik5sos',\n  range: 'Sheet1!A1:E1',\n  values: state.data,\n});\n",
        credentialName: null,
      },
    ],
    edges: [
      edge("edge-dhis2-root", { trigger: "trigger-dhis2" }, "job-dhis2-get", "always"),
      edge("edge-dhis2-sheet", { job: "job-dhis2-get" }, "job-dhis2-sheet", "on_job_success"),
    ],
    positions: {
      "trigger-dhis2": { x: 0, y: 0 },
      "job-dhis2-get": { x: 0, y: RANK },
      "job-dhis2-sheet": { x: 0, y: RANK * 2 },
    },
  },
  openhieGraph("wf-openhie-sandbox", SANDBOX, "-sb"),
  // Projects loaded from kickstart/exports/ (see kickstart/sync.mjs).
  ...kickstartGraphs,
];

export function findWorkflowGraph(id: string | undefined): WorkflowGraph | undefined {
  return workflowGraphs.find((w) => w.id === id);
}

/** Saved snapshots for the version dropdown, newest first. */
export function snapshotsOf(graph: WorkflowGraph): WorkflowSnapshot[] {
  const count = Math.min(graph.lockVersion, 6);
  return Array.from({ length: count }, (_, i) => ({
    lockVersion: graph.lockVersion - i,
    insertedAt: new Date(Date.UTC(2026, 9, Math.max(10 - i * 3, 1), 11 - i, 0)).toISOString(),
  }));
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "tpl-base-webhook",
    name: "Event-based workflow",
    description: "A basic template for a workflow that does something on-demand, when a webhook notification is received.",
    tags: ["webhook"],
  },
  {
    id: "tpl-base-cron",
    name: "Scheduled workflow",
    description: 'A basic template for a workflow that does something periodically, using a "cron" schedule.',
    tags: ["cron"],
  },
  {
    id: "tpl-kobo-postgres",
    name: "KoboToolbox to Postgres",
    description: "Fetch new KoboToolbox submissions on a schedule and upsert them into a PostgreSQL table.",
    tags: ["kobotoolbox", "postgresql"],
  },
  {
    id: "tpl-commcare-dhis2",
    name: "CommCare to DHIS2",
    description: "Map CommCare form submissions to DHIS2 tracker events as they arrive.",
    tags: ["commcare", "dhis2"],
  },
];

