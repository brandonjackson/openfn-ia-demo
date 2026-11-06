/**
 * Finding a workflow's graph and run history from its id, shared by every
 * wrapper that opens a workflow or its runs (the editor, History), so a run
 * listed in History is the same run the editor loads.
 */
import type { Dataclip, RunDetails, Workflow, WorkOrder } from "../model/workflow";
import { nationalIdWorkflow, nationalIdWorkflowAt, workflowGraphs } from "./workflow";
import { dataclips, runHistories, workOrders } from "./runs";
import { projectWorkflowDetails, projects } from "./projects";
import type { Project } from "../model/projects";
import type { WorkflowListItem } from "../model/page-data";
import { workOrderActivity, type ActivityPeriod } from "../model/runs";

/**
 * Resolve a workflow to open from its id, at a version ("latest" by default).
 * A few workflows have a graph and history of their own ({@link workflowGraphs});
 * any other workflow component in the prototype reuses the national ID
 * workflow's graph and history ({@link nationalIdWorkflow}) but is
 * relabelled with the component's name and owning project so the editor
 * reads correctly.
 */
export function resolveWorkflow(workflowId?: string, version = "latest"): Workflow {
  if (workflowId && workflowGraphs[workflowId]) return workflowGraphs[workflowId];
  const graph = nationalIdWorkflowAt(version);
  if (!workflowId || workflowId === nationalIdWorkflow.id) return graph;
  for (const project of projects) {
    const component = project.components.find((c) => c.id === workflowId && c.type === "Workflow");
    if (component) return { ...graph, id: component.id, name: component.name, project: project.name };
  }
  return graph;
}

/** A stable 8-character hex id made from `seed`, so a borrowed run gets an id of its own. */
function hexId(seed: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "today at 9:42 AM", "yesterday at 5:02 PM" or "Oct 13th, 12:19 PM", as the mock history words it on 20 Oct. */
function whenLabel(d: Date): string {
  const h = d.getHours() % 12 || 12;
  const time = `${h}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() < 12 ? "AM" : "PM"}`;
  if (d.getMonth() === 9 && d.getDate() === 20) return `today at ${time}`;
  if (d.getMonth() === 9 && d.getDate() === 19) return `yesterday at ${time}`;
  const day = d.getDate();
  const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
  return `${MONTHS[d.getMonth()]} ${day}${suffix}, ${time}`;
}

/** A run's start moved `minutes` earlier, in both of the ways it's written. */
function shiftStart(run: RunDetails, minutes: number): Pick<RunDetails, "started" | "when"> {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})$/.exec(run.started);
  if (!m) return { started: run.started, when: run.when };
  const d = new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5] - minutes, +m[6]);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    started: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    when: whenLabel(d),
  };
}

/** A borrowed run, under ids of its own for `workflowId`, started a few minutes apart from the original. */
function borrowRun(run: RunDetails, workflowId: string): RunDetails {
  const runId = hexId(`${workflowId}:${run.runId}`);
  return {
    ...run,
    ...shiftStart(run, (parseInt(hexId(workflowId).slice(2, 4), 16) % 47) + 3),
    runId,
    workOrderId: hexId(`${workflowId}:${run.workOrderId}`),
    steps: run.steps.map((s) => ({ ...s, id: hexId(`${workflowId}:${s.id}`) })),
    logs: run.logs.map((l) => ({ ...l, message: l.message.replace(run.runId, runId) })),
  };
}

/**
 * A work order that came in a moment ago and is waiting for a worker, so
 * History has something to cancel.
 */
function enqueued(workflowId: string, input: Dataclip): WorkOrder {
  const base: RunDetails = {
    workOrderId: hexId(`${workflowId}:enqueued`),
    runId: hexId(`${workflowId}:enqueued-run`),
    status: "pending",
    duration: "",
    started: "20/10/2026, 09:58:12",
    when: "today at 9:58 AM",
    startedBy: "webhook trigger",
    version: "v2",
    inputId: input.id,
    steps: [],
    logs: [],
  };
  const run = { ...base, ...shiftStart(base, parseInt(hexId(workflowId).slice(4, 6), 16) % 9) };
  return { id: run.workOrderId, status: "pending", lastActivity: run.when, runs: [run] };
}

/**
 * A workflow's run history and the dataclips its runs used. The national ID
 * workflow and those with a history of their own keep theirs as they are.
 * Any other borrows the national ID workflow's under ids of its own, leaving
 * out a different few work orders each, and about half have one more just
 * received and waiting to run.
 */
export function workflowHistory(workflowId: string): { workOrders: WorkOrder[]; dataclips: Dataclip[] } {
  const own = runHistories[workflowId];
  if (own) return own;
  if (workflowId === nationalIdWorkflow.id) return { workOrders, dataclips };
  const skip = parseInt(hexId(workflowId).slice(0, 2), 16) % 3;
  const borrowed = workOrders
    .filter((_, i) => i % 4 !== skip)
    .map((o) => {
      const runs = o.runs.map((r) => borrowRun(r, workflowId));
      return { ...o, id: runs[0].workOrderId, lastActivity: runs[0].when, runs };
    });
  const firstInput = dataclips.find((d) => d.id === workOrders[0].runs[0].inputId) ?? dataclips[0];
  // About half of them have one waiting to run.
  const waiting = parseInt(hexId(workflowId).slice(6, 8), 16) % 2 === 0 ? [enqueued(workflowId, firstInput)] : [];
  return { workOrders: [...waiting, ...borrowed], dataclips };
}

/** Every work order in a fixture project, across its workflows. */
export function projectHistory(project: Project): WorkOrder[] {
  return projectWorkflowDetails(project).flatMap((w) => workflowHistory(w.id).workOrders);
}

/** A fixture project's workflows as its Workflows list shows them, with what their history adds up to over `period`. */
export function projectWorkflowItems(project: Project, period: ActivityPeriod = "30d"): WorkflowListItem[] {
  return projectWorkflowDetails(project).map((w) => {
    const { workOrders, failedWorkOrders, latestRun, lastRunAt } = workOrderActivity(workflowHistory(w.id).workOrders, period);
    return { ...w, workOrders, failedWorkOrders, latestRun, lastRunAt };
  });
}
