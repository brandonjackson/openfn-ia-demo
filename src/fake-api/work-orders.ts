/**
 * Work orders, runs and their input on the pretend server
 * (api/work-orders.md, api/runs.md, api/dataclips.md).
 *
 * Lifecycle, as the API has it:
 * - A work order is one piece of incoming work; each run is an attempt at
 *   it, newest first. Running a workflow makes a work order and its first
 *   run; retrying (one, many, or from a step) adds a run to the same work
 *   order, on the workflow as it now stands. A deleted workflow's work orders
 *   are skipped by a retry (`discarded`), and one of its runs refuses (409).
 * - Only a run nobody has picked up yet (pending, Lightning's `available`)
 *   can be cancelled.
 * - Planned (docs/api-plans/step-tools.md): a run that reaches a Human in
 *   the loop step waits (`waiting`) until an editor answers it
 *   (`POST /api/demo/runs/:id/approval`), then carries on along the edge
 *   for the decision. A run that reaches a Report outcome step gives its
 *   work order an `outcome_status` and `outcome_description`, which lists
 *   filter by.
 *
 * The demo's runs carry their steps, logs and input whole, as the editor and
 * History draw them; they ride along on each work order (`include=runs`).
 * Lightning's worker isn't part of the API, so the demo stands in for it:
 * a retry is simulated here, and a run the editor simulated is recorded here
 * when it's done. Run, work order and dataclip ids are the demo's short ones,
 * not UUIDs, because the pages show them whole.
 */
import { projects as fixtureProjects, projectWorkflowDetails } from "../fixtures/projects";
import { nationalIdWorkflow } from "../fixtures/workflow";
import { workflowHistory } from "../fixtures/workflow-lookup";
import { answerRun, simulateRun } from "../fixtures/runs";
import type { ApprovalAnswer } from "../model/step-tools";
import { apiNodeId, apiWorkflowId } from "../fixtures/ids";
import type { Dataclip, RunDetails, RunStatus } from "../model/workflow";
import { fromDocument } from "../model/workflow-document";
import { shortId } from "../model/runs";
import { conflict, forbidden, invalid, isUuid, json, notFound, now, ORIGIN, paged, unknownKeys, type Body, type Entry, type Handler } from "./answers";
import { seedTime, table } from "./db";
import { findProject, guardProject, projectIdFor, roleIn } from "./projects";
import { currentUserId } from "./session";
import { findUser, fullName } from "./users";
import { workflows, type WorkflowRow } from "./workflows";

export interface WorkOrderRow {
  id: string;
  workflow_id: string;
  project_id: string;
  state: RunStatus;
  /** When it came in, as the demo's runs write it ("dd/mm/yyyy, HH:MM:SS"). */
  received_at: string;
  last_activity: string;
  inserted_at: string;
  updated_at: string;
  /** Its input: the dataclip its first run started from. */
  dataclip_id: string;
  /** Every attempt at it, newest first, as the demo draws them. */
  runs: RunDetails[];
}

export interface DataclipRow extends Dataclip {
  /** The workflow whose run used or made it; none for one saved in the project by hand. */
  workflow_id: string | null;
  project_id: string;
}

const SAVED_KEYS = ["name", "description", "body", "workflow_id"];

/** Problems with a saved dataclip's name and description, as a create or a change sends them. */
function savedProblems(projectId: string, body: Body, ownId?: string): Entry[] {
  const errors: Entry[] = [];
  const name = body["name"];
  if (typeof name !== "string" || !name.trim()) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
  else if (name.trim().length > 80) errors.push({ code: "too_long", detail: "should be at most 80 characters", pointer: "#/name" });
  else if (dataclips.rows().some((d) => d.project_id === projectId && d.id !== ownId && d.name?.toLowerCase() === name.trim().toLowerCase())) {
    errors.push({ code: "taken", detail: "has already been taken", pointer: "#/name" });
  }
  const description = body["description"];
  if (description !== undefined && description !== null && typeof description !== "string") {
    errors.push({ code: "type", detail: "must be text", pointer: "#/description" });
  }
  return errors;
}

/**
 * Copies a project's saved dataclips into a sandbox made from it, under new
 * ids, each on the sandbox's copy of its workflow (`copies`, by the
 * original's id): `"all"` of them, or the ones listed. Unknown or unnamed
 * ids are skipped.
 */
export function copyDataclipsInto(fromProjectId: string, sandboxId: string, ids: string[] | "all", copies: Map<string, string>) {
  const chosen = ids === "all" ? dataclips.rows().filter((x) => x.project_id === fromProjectId && x.name).map((x) => x.id) : ids;
  for (const id of new Set(chosen)) {
    const d = dataclips.rows().find((x) => x.id === id && x.project_id === fromProjectId && x.name);
    if (!d) continue;
    dataclips.insert({ ...d, id: shortId(), project_id: sandboxId, workflow_id: d.workflow_id ? (copies.get(d.workflow_id) ?? null) : null, created: "just now" });
  }
}

/** The fixture workflows that have a run history: each project's, and the national ID workflow in Project A. */
function fixtureHistories() {
  const rows: { slug: string; projectSlug: string }[] = [];
  for (const p of fixtureProjects) for (const item of projectWorkflowDetails(p)) rows.push({ slug: item.id, projectSlug: p.id });
  if (!rows.some((r) => r.slug === nationalIdWorkflow.id)) rows.push({ slug: nationalIdWorkflow.id, projectSlug: "project-a" });
  return rows;
}

/** A fixture run with its steps named by the API's ids for them. */
const onApiIds = (slug: string, run: RunDetails): RunDetails => ({
  ...run,
  steps: run.steps.map((s) => ({ ...s, jobId: apiNodeId(slug, s.jobId) })),
  ...(run.waitingFor && { waitingFor: { ...run.waitingFor, jobId: apiNodeId(slug, run.waitingFor.jobId) } }),
});

export const workOrders = table<WorkOrderRow>("work_orders", () =>
  fixtureHistories().flatMap(({ slug, projectSlug }) =>
    workflowHistory(slug).workOrders.map((wo) => {
      const first = wo.runs[wo.runs.length - 1]!;
      return {
        id: wo.id,
        workflow_id: apiWorkflowId(slug),
        project_id: projectIdFor(projectSlug),
        state: wo.status,
        received_at: first.started,
        last_activity: wo.lastActivity,
        inserted_at: seedTime("1 Oct 2026"),
        updated_at: seedTime("1 Oct 2026"),
        dataclip_id: first.inputId,
        runs: wo.runs.map((r) => onApiIds(slug, r)),
      };
    }),
  ),
);

export const dataclips = table<DataclipRow>("dataclips", () =>
  fixtureHistories().flatMap(({ slug, projectSlug }) =>
    workflowHistory(slug).dataclips.map((d) => ({ ...d, workflow_id: apiWorkflowId(slug), project_id: projectIdFor(projectSlug) })),
  ),
);

/* ------------------------------------------------------------------ */
/*  What the API sends                                                 */
/* ------------------------------------------------------------------ */

function workOrderEntry(w: WorkOrderRow, withRuns: boolean) {
  const input = dataclips.rows().find((d) => d.id === w.dataclip_id);
  return {
    type: "work_orders",
    id: w.id,
    attributes: {
      state: w.state,
      last_activity: w.last_activity,
      inserted_at: w.inserted_at,
      updated_at: w.updated_at,
      workflow_id: w.workflow_id,
      dataclip_id: w.dataclip_id,
      // Planned: the business outcome its latest run reported, if it reached a Report outcome step.
      outcome_status: w.runs[0]?.outcome?.status ?? null,
      outcome_description: w.runs[0]?.outcome?.description ?? null,
      // Planned (include=runs), with the demo's runs whole.
      ...(withRuns && { runs: w.runs, input: input ?? null, received_at: w.received_at }),
    },
    relationships: {},
    links: { self: `${ORIGIN}/api/work_orders/${w.id}` },
  };
}

/* ------------------------------------------------------------------ */
/*  Running and retrying                                               */
/* ------------------------------------------------------------------ */

const me = () => findUser(currentUserId());
const startedBy = () => {
  const u = me();
  return u ? fullName(u) : "Unknown";
};

/** The workflow as it now stands, as the canvas would draw it, with the version a new run runs on. */
function current(workflowId: string): { workflow: WorkflowRow | undefined; graph: ReturnType<typeof fromDocument> | undefined; version: string } {
  const w = workflows.rows().find((x) => x.id === workflowId);
  return { workflow: w, graph: w && fromDocument(w, ""), version: `v${w?.lock_version ?? 1}` };
}

/** Adds a run to a work order: newest first, the order's state its latest run's, and any new dataclips kept. */
function addRun(order: WorkOrderRow, run: RunDetails, made: Dataclip[]) {
  workOrders.update(
    (w) => w.id === order.id,
    (w) => ({ ...w, runs: [run, ...w.runs], state: run.status, last_activity: run.when, updated_at: now() }),
  );
  for (const d of made) if (!dataclips.rows().some((x) => x.id === d.id)) dataclips.insert({ ...d, workflow_id: order.workflow_id, project_id: order.project_id });
}

/** A new run of a work order, on the workflow as it now stands, from its first input or from a step. Undefined when it can't be retried. */
function retry(order: WorkOrderRow, fromJobId?: string): RunDetails | undefined {
  const { workflow, graph, version } = current(order.workflow_id);
  const input = dataclips.rows().find((d) => d.id === order.dataclip_id);
  if (!workflow || workflow.deleted_at || !graph || !input) return undefined;
  const { run, dataclips: made } = simulateRun({ workflow: graph, version, input, workOrderId: order.id, runId: shortId(), fromJobId, startedBy: startedBy() });
  addRun(order, run, made);
  return run;
}

/** Cancels a work order's runs nobody has picked up yet; answers how many. */
function cancel(order: WorkOrderRow): number {
  const pending = order.runs.filter((r) => r.status === "pending").length;
  if (!pending) return 0;
  workOrders.update(
    (w) => w.id === order.id,
    (w) => {
      const runs = w.runs.map((r) => (r.status === "pending" ? { ...r, status: "cancelled" as const } : r));
      return { ...w, runs, state: runs[0]!.status, updated_at: now() };
    },
  );
  return pending;
}

/** The work orders a bulk action names, all in the project: either `work_order_ids` or a `filter`, never both. */
function chosen(projectId: string, body: Body): WorkOrderRow[] | Entry[] {
  const ids = body["work_order_ids"];
  const filter = body["filter"] as { workflow_id?: string; state?: string } | undefined;
  if (ids !== undefined && filter !== undefined) return [{ code: "exclusive", detail: "send work_order_ids or filter, not both", pointer: "#/work_order_ids" }];
  if (ids === undefined && filter === undefined) return [{ code: "required", detail: "send work_order_ids or filter", pointer: "#/work_order_ids" }];
  const own = workOrders.rows().filter((w) => w.project_id === projectId);
  if (Array.isArray(ids)) {
    if (ids.length > 100) return [{ code: "too_long", detail: "at most 100 at once", pointer: "#/work_order_ids" }];
    return own.filter((w) => (ids as string[]).includes(w.id));
  }
  const states = (filter?.state ?? "").split(",").filter(Boolean);
  return own.filter((w) => (!filter?.workflow_id || w.workflow_id === filter.workflow_id) && (!states.length || states.includes(w.state)));
}

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

function list(projectIds: string[], query: URLSearchParams, path: string) {
  const states = (query.get("state") ?? "").split(",").filter(Boolean);
  // Planned: by the business outcome its latest run reported.
  const outcomes = (query.get("outcome_status") ?? "").split(",").filter(Boolean);
  const workflowId = query.get("workflow_id");
  const live = new Set(workflows.rows().filter((w) => !w.deleted_at).map((w) => w.id));
  const rows = workOrders
    .rows()
    .filter((w) => projectIds.includes(w.project_id) && live.has(w.workflow_id))
    .filter((w) => (!workflowId || w.workflow_id === workflowId) && (!states.length || states.includes(w.state)))
    .filter((w) => !outcomes.length || outcomes.includes(w.runs[0]?.outcome?.status ?? ""))
    .map((w) => workOrderEntry(w, (query.get("include") ?? "").split(",").includes("runs")));
  return json(200, paged(path, rows, query, "data", true));
}

export const workOrderRoutes: Record<string, Handler> = {
  "GET /api/projects/:project_id/work_orders": ({ project_id }, _body, query) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    return list([p.id], query, `/api/projects/${p.id}/work_orders`);
  },
  // Across every project you can open, or one.
  "GET /api/work_orders": (_params, _body, query) => {
    const projectId = query.get("project_id");
    if (projectId) {
      const p = guardProject(projectId);
      if (p instanceof Response) return p;
      return list([p.id], query, "/api/work_orders");
    }
    const mine = workOrders.rows().map((w) => w.project_id).filter((id, i, all) => all.indexOf(id) === i && !!roleIn(id) && !findProject(id)?.scheduled_deletion);
    return list(mine, query, "/api/work_orders");
  },

  // Planned: a project's dataclips, newest first (the demo's carry their bodies).
  "GET /api/projects/:project_id/dataclips": ({ project_id }, _body, query) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    const workflowId = query.get("workflow_id");
    const rows = dataclips.rows().filter((d) => d.project_id === p.id && (!workflowId || d.workflow_id === workflowId));
    return json(200, paged(`/api/projects/${p.id}/dataclips`, rows, query));
  },

  // The demo's own (api/dataclips.md has no way to save one): saves an input under a name, to run with again.
  "POST /api/demo/projects/:project_id/dataclips": ({ project_id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    const errors = [...unknownKeys(body, SAVED_KEYS), ...savedProblems(p.id, body)];
    const text = body["body"];
    if (typeof text !== "string") errors.push({ code: "required", detail: "can't be blank", pointer: "#/body" });
    else {
      try {
        JSON.parse(text);
      } catch {
        errors.push({ code: "invalid", detail: "must be JSON", pointer: "#/body" });
      }
    }
    const workflowId = body["workflow_id"];
    if (workflowId !== undefined && workflowId !== null && !workflows.rows().some((w) => w.id === workflowId && w.project_id === p.id)) {
      errors.push({ code: "not_found", detail: "isn't a workflow in this project", pointer: "#/workflow_id" });
    }
    if (errors.length) return invalid(errors);
    const row: DataclipRow = {
      id: shortId(),
      name: (body["name"] as string).trim(),
      description: ((body["description"] as string | undefined) ?? "").trim() || undefined,
      type: "saved_input",
      body: text as string,
      created: "just now",
      workflow_id: (workflowId as string | undefined) ?? null,
      project_id: p.id,
    };
    dataclips.insert(row);
    return json(201, { data: row });
  },

  // The demo's own: renames a dataclip or changes what it says it's for.
  // Naming one saves it; the same dataclip listed under several workflows changes everywhere.
  "PATCH /api/demo/projects/:project_id/dataclips/:id": ({ project_id, id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    const rows = dataclips.rows().filter((d) => d.id === id && d.project_id === p.id);
    if (!rows.length) return notFound();
    const errors = [...unknownKeys(body, ["name", "description"]), ...savedProblems(p.id, { name: rows[0]!.name, ...body }, id)];
    if (errors.length) return invalid(errors);
    const changes: Partial<DataclipRow> = {};
    if (typeof body["name"] === "string") changes.name = body["name"].trim();
    if (body["description"] !== undefined) changes.description = ((body["description"] as string | null) ?? "").trim() || undefined;
    dataclips.update((d) => d.id === id && d.project_id === p.id, (d) => ({ ...d, ...changes }));
    return json(200, { data: { ...rows[0]!, ...changes } });
  },

  // Runs a workflow by hand. The demo's editor runs it itself and sends the finished run to record (standing in for the worker); without one, it's simulated here.
  "POST /api/projects/:project_id/workflows/:workflow_id/work_orders": ({ project_id, workflow_id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    const w = isUuid(workflow_id) ? workflows.rows().find((x) => x.id === workflow_id && x.project_id === p.id && !x.deleted_at) : undefined;
    if (!w) return notFound();
    const errors = unknownKeys(body, ["job_id", "trigger_id", "dataclip_id", "body", "run", "dataclips", "work_order_id"]);
    if (errors.length) return invalid(errors);
    const run = body["run"] as RunDetails | undefined;
    const made = (body["dataclips"] as Dataclip[] | undefined) ?? [];
    const existing = typeof body["work_order_id"] === "string" ? workOrders.rows().find((o) => o.id === body["work_order_id"] && o.workflow_id === w.id) : undefined;
    if (existing && run) {
      addRun(existing, run, made);
      return json(201, { data: workOrderEntry(workOrders.rows().find((o) => o.id === existing.id)!, true) });
    }
    if (!run) return invalid([{ code: "required", detail: "the demo records a run its editor made", pointer: "#/run" }]);
    const order: WorkOrderRow = {
      id: run.workOrderId,
      workflow_id: w.id,
      project_id: p.id,
      state: run.status,
      received_at: run.started,
      last_activity: run.when,
      inserted_at: now(),
      updated_at: now(),
      dataclip_id: run.inputId,
      runs: [run],
    };
    workOrders.insert(order);
    for (const d of made) if (!dataclips.rows().some((x) => x.id === d.id)) dataclips.insert({ ...d, workflow_id: w.id, project_id: p.id });
    return json(201, { data: workOrderEntry(order, true) });
  },

  // Each work order gets a new run, from the start or from a step. Those of a deleted workflow, or whose input is gone, are discarded.
  "POST /api/projects/:project_id/work_orders/retries": ({ project_id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    const errors = unknownKeys(body, ["work_order_ids", "filter", "job_id"]);
    const orders = chosen(p.id, body);
    if (!Array.isArray(orders) || (orders.length && "code" in orders[0]!)) errors.push(...(orders as Entry[]));
    const picked = errors.length ? [] : (orders as WorkOrderRow[]);
    const jobId = body["job_id"] as string | undefined;
    if (jobId && new Set(picked.map((o) => o.workflow_id)).size > 1) errors.push({ code: "mismatch", detail: "retrying from a step needs work orders of one workflow", pointer: "#/job_id" });
    if (errors.length) return invalid(errors);
    let enqueued = 0;
    for (const order of picked) if (retry(order, jobId)) enqueued++;
    return json(202, { enqueued, discarded: picked.length - enqueued });
  },

  "POST /api/projects/:project_id/work_orders/cancellations": ({ project_id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    const orders = chosen(p.id, body);
    if (orders.length && "code" in orders[0]!) return invalid(orders as Entry[]);
    let cancelled = 0;
    for (const order of orders as WorkOrderRow[]) cancelled += cancel(order);
    return json(202, { cancelled });
  },

  // Cancels the work order's runs nobody has picked up; refused when there are none.
  "PATCH /api/work_orders/:id": ({ id }, body) => {
    const order = workOrders.rows().find((w) => w.id === id);
    if (!order || !roleIn(order.project_id)) return forbidden();
    const p = guardProject(order.project_id, "editor");
    if (p instanceof Response) return p;
    if (body["state"] !== "cancelled" || Object.keys(body).length !== 1) return invalid([{ code: "not_allowed", detail: "only cancelling is allowed", pointer: "#/state" }]);
    if (!cancel(order)) return invalid([{ code: "not_allowed", detail: "has no run waiting to start", pointer: "#/state" }]);
    return json(200, { data: workOrderEntry(workOrders.rows().find((w) => w.id === id)!, false) });
  },

  // Planned, the demo's for now: answers the Human in the loop step a run is waiting on, and the run carries on.
  "POST /api/demo/runs/:id/approval": ({ id }, body) => {
    const order = workOrders.rows().find((w) => w.runs.some((r) => r.runId === id));
    if (!order || !roleIn(order.project_id)) return notFound();
    const p = guardProject(order.project_id, "editor");
    if (p instanceof Response) return p;
    const errors = unknownKeys(body, ["decision", "comment"]);
    const decision = body["decision"];
    if (decision !== "approved" && decision !== "rejected") errors.push({ code: "invalid", detail: "must be approved or rejected", pointer: "#/decision" });
    const comment = typeof body["comment"] === "string" ? body["comment"].trim() : "";
    if (body["comment"] !== undefined && body["comment"] !== null && typeof body["comment"] !== "string") errors.push({ code: "type", detail: "must be text", pointer: "#/comment" });
    const run = order.runs.find((r) => r.runId === id)!;
    if (!errors.length && decision === "rejected" && run.waitingFor?.comment === "required_on_reject" && !comment) {
      errors.push({ code: "required", detail: "say why it's rejected", pointer: "#/comment" });
    }
    if (errors.length) return invalid(errors);
    if (run.status !== "waiting" || !run.waitingFor) return conflict("not_waiting", "This run isn't waiting for an answer.");
    const { workflow, graph } = current(order.workflow_id);
    const input = dataclips.rows().find((d) => d.id === run.inputId);
    if (!workflow || workflow.deleted_at || !graph) return conflict("scheduled_for_deletion", "This run's workflow has been deleted.");
    if (!input) return conflict("dataclip_wiped", "This run's input is gone.");
    const answer: ApprovalAnswer = { decision: decision as ApprovalAnswer["decision"], by: startedBy(), at: "just now", ...(comment && { comment }) };
    const { run: carried, dataclips: made } = answerRun({ workflow: graph, run, input, answer });
    workOrders.update(
      (w) => w.id === order.id,
      (w) => {
        const runs = w.runs.map((r) => (r.runId === id ? carried : r));
        return { ...w, runs, state: runs[0]!.status, last_activity: runs[0]!.when, updated_at: now() };
      },
    );
    for (const d of made) if (!dataclips.rows().some((x) => x.id === d.id)) dataclips.insert({ ...d, workflow_id: order.workflow_id, project_id: order.project_id });
    return json(200, { data: workOrderEntry(workOrders.rows().find((w) => w.id === order.id)!, true) });
  },

  // A new run on the same work order, from a step of this run.
  "POST /api/runs/:id/retries": ({ id }, body) => {
    const order = workOrders.rows().find((w) => w.runs.some((r) => r.runId === id));
    if (!order || !roleIn(order.project_id)) return forbidden();
    const p = guardProject(order.project_id, "editor");
    if (p instanceof Response) return p;
    const run = order.runs.find((r) => r.runId === id)!;
    const stepId = body["step_id"] as string | undefined;
    const step = stepId ? run.steps.find((s) => s.id === stepId || s.jobId === stepId) : undefined;
    if (stepId && !step) return invalid([{ code: "not_found", detail: "isn't a step of this run", pointer: "#/step_id" }]);
    const { workflow } = current(order.workflow_id);
    if (!workflow || workflow.deleted_at) return conflict("scheduled_for_deletion", "This run's workflow has been deleted.");
    const made = retry(order, step?.jobId);
    return made ? json(201, { data: { type: "runs", id: made.runId, attributes: { state: made.status } } }) : conflict("dataclip_wiped", "This run's input is gone.");
  },
};
