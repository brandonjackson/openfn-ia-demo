/**
 * Builders for workflow graphs: the empty and blank graphs the editor starts
 * from, and the graph a template creates. Pure, client-side, as in Lightning's
 * collaborative editor (BLANK_WORKFLOW_YAML, BASE_TEMPLATES).
 */
import type {
  EdgeConditionType,
  EditorEdge,
  EditorJob,
  EditorTrigger,
  WorkflowGraph,
  WorkflowTemplate,
} from "../types/workflow-graph";

export const SEED_BODY = "fn(state => state);\n";

/** Dagre spacing in Lightning's layout: 110px nodes + 150 ranksep, 250 nodesep. */
export const RANK = 260;

export function webhook(id: string, enabled: boolean): EditorTrigger {
  return {
    id,
    type: "webhook",
    enabled,
    cronExpression: null,
    cronDescription: null,
    hasAuthMethod: false,
    webhookReply: "before_start",
  };
}

export function cron(id: string, enabled: boolean, expression: string, description: string): EditorTrigger {
  return {
    id,
    type: "cron",
    enabled,
    cronExpression: expression,
    cronDescription: description,
    hasAuthMethod: false,
    webhookReply: "before_start",
  };
}

export function edge(
  id: string,
  from: { trigger?: string; job?: string },
  targetJobId: string,
  conditionType: EdgeConditionType,
  extra: Partial<EditorEdge> = {}
): EditorEdge {
  return {
    id,
    sourceTriggerId: from.trigger ?? null,
    sourceJobId: from.job ?? null,
    targetJobId,
    conditionType,
    conditionLabel: null,
    conditionExpression: null,
    enabled: true,
    ...extra,
  };
}

/** What `/w/new` starts from: an empty, unsaved workflow. */
export function newWorkflowGraph(projectId: string): WorkflowGraph {
  return {
    id: "new",
    projectId,
    name: "Untitled workflow",
    lockVersion: 0,
    concurrency: null,
    enableJobLogs: true,
    jobs: [],
    triggers: [],
    edges: [],
    positions: {},
  };
}

/**
 * "Build from scratch" on the landing screen: a webhook trigger and one empty
 * step (Lightning's BLANK_WORKFLOW_YAML).
 */
export function blankWorkflowGraph(projectId: string): WorkflowGraph {
  return {
    ...newWorkflowGraph(projectId),
    triggers: [webhook("trigger-new", true)],
    jobs: [
      {
        id: "job-new",
        name: "Untitled step",
        adaptor: "@openfn/language-common@latest",
        body: "// Check out the Job Writing Guide for help getting started:\n// https://docs.openfn.org/documentation/jobs/job-writing-guide\n",
        credentialName: null,
      },
    ],
    edges: [edge("edge-new", { trigger: "trigger-new" }, "job-new", "always")],
    positions: { "trigger-new": { x: 0, y: 0 }, "job-new": { x: 0, y: RANK } },
  };
}

const BASE_TEMPLATE_JOBS: Record<string, Pick<EditorJob, "name" | "adaptor" | "body">> = {
  "tpl-base-webhook": {
    name: "Transform data",
    adaptor: "@openfn/language-common@latest",
    body: '// Validate and transform the data you\'ve received...\nfn(state => {\n  console.log("Do some data transformation here");\n  return state;\n})\n',
  },
  "tpl-base-cron": {
    name: "Get data",
    adaptor: "@openfn/language-http@latest",
    body: "// Get some data from an API...\nget('https://www.example.com');\n",
  },
};

/** The graph a template creates (what its preview shows). */
export function templateGraph(template: WorkflowTemplate, projectId: string): WorkflowGraph {
  const base = blankWorkflowGraph(projectId);
  const isCron = template.tags.includes("cron") || template.id === "tpl-kobo-postgres";
  const trigger = isCron ? cron("trigger-new", true, "0 0 * * *", "At 12:00 AM") : webhook("trigger-new", true);
  // Lightning's BASE_TEMPLATES (collaborative-editor/constants/baseTemplates.ts).
  const baseJob = BASE_TEMPLATE_JOBS[template.id];
  if (baseJob) {
    const job: EditorJob = { id: "job-new", credentialName: null, ...baseJob };
    return {
      ...base,
      name: template.name,
      triggers: [trigger],
      jobs: [job],
      edges: [edge("edge-new", { trigger: trigger.id }, job.id, "always")],
      positions: { [trigger.id]: { x: 0, y: 0 }, [job.id]: { x: 0, y: RANK } },
    };
  }
  const adaptors = template.tags.filter((t) => t !== "cron" && t !== "webhook");
  if (adaptors.length === 0) return { ...base, name: template.name, triggers: [trigger] };
  const jobs: EditorJob[] = adaptors.map((a, i) => ({
    id: `job-new-${i}`,
    name: i === 0 ? `Get data from ${a}` : `Send data to ${a}`,
    adaptor: `@openfn/language-${a}@latest`,
    body: SEED_BODY,
    credentialName: null,
  }));
  return {
    ...base,
    name: template.name,
    triggers: [trigger],
    jobs,
    edges: jobs.map((j, i) =>
      i === 0
        ? edge("edge-new-0", { trigger: trigger.id }, j.id, "always")
        : edge(`edge-new-${i}`, { job: jobs[i - 1].id }, j.id, "on_job_success")
    ),
    positions: Object.fromEntries([[trigger.id, { x: 0, y: 0 }], ...jobs.map((j, i) => [j.id, { x: 0, y: RANK * (i + 1) }])]),
  };
}
