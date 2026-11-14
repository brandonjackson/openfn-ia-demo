/**
 * Workflows on the pretend server (api/workflows.md).
 *
 * Lifecycle, as the API has it:
 * - Create with `POST /api/projects/:id/workflows`: a name unique in the
 *   project and a graph that holds together (no cycles, at most one enabled
 *   trigger, exactly one enabled edge out of the triggers, and a trigger's
 *   edge is `always` or `js_expression`). Lightning gives every job, trigger
 *   and edge a fresh UUID.
 * - Update with `PATCH` (or `PUT`, the same; it never creates): a list sent
 *   replaces the stored one; triggers can change but never be removed.
 *   Turning a workflow on or off is a PATCH of its triggers' `enabled`.
 * - Every change keeps a snapshot, numbered by `lock_version`; a stale
 *   `lock_version` in the body is a 409 `concurrent_edit`.
 * - `DELETE` marks it deleted: its triggers go off, it leaves every list and
 *   its GET is a 404. Its run history stays.
 * - The demo's own `POST /api/demo/projects/:id/workflows/:id/copies` makes a
 *   copy in the same project (api/ has no copy): every id new, its triggers
 *   off and with no custom webhook path (so it can't take the original's
 *   traffic), named "… (copy)", or "… (copy 2)" when that's taken.
 */
import { projects as fixtureProjects, projectWorkflowDetails } from "../fixtures/projects";
import { authMethods } from "../fixtures/project-settings";
import { nationalIdWorkflow, nationalIdWorkflowAt, surveillanceVersions, workflowGraphs, workflowVersions } from "../fixtures/workflow";
import { apiNodeId, apiSystemId, apiWorkflowId, cloneNodeId, newId, seedId } from "../fixtures/ids";
import type { Workflow } from "../model/workflow";
import { copyName } from "../model/workflow-list";
import { toDocument, type WorkflowDocEdge, type WorkflowDocument, type WorkflowJob, type WorkflowTrigger } from "../model/workflow-document";
import { badId, conflict, forbidden, invalid, isUuid, json, noContent, notFound, now, ORIGIN, paged, unknownKeys, type Body, type Entry, type Handler } from "./answers";
import { record } from "./audit";
import { seedTime, table } from "./db";
import { addProjectStats, findProject, fixtureSandboxes, guardProject, projectIdFor, roleIn } from "./projects";
import { currentUserId } from "./session";
import { findUser, fullName } from "./users";

export interface WorkflowRow extends WorkflowDocument {
  /** When it was marked deleted; null while it's live. */
  deleted_at: string | null;
  /** For a sandbox's copy: the workflow it was copied from, and that workflow's version then. */
  copied_from: { workflow_id: string; lock_version: number } | null;
}

export interface SnapshotRow {
  id: string;
  workflow_id: string;
  lock_version: number;
  inserted_at: string;
  /** Who made the change and, when it came from a sandbox, what they said about it (the demo's "Go live" message). */
  author: string;
  message: string | null;
  workflow: Pick<WorkflowDocument, "name" | "jobs" | "triggers" | "edges" | "positions">;
}

/* ------------------------------------------------------------------ */
/*  Seed                                                               */
/* ------------------------------------------------------------------ */

/** A fixture graph with every id made a UUID unique to this workflow, and each step's system named by its id on the API. */
function seededGraph(slug: string, graph: Workflow): Workflow {
  const id = (nodeId: string) => apiNodeId(slug, nodeId);
  return {
    ...graph,
    nodes: graph.nodes.map((n) => ({ ...n, id: id(n.id), ...(n.type === "job" && n.system && { system: apiSystemId(n.system) }) })),
    edges: graph.edges.map((e) => ({ ...e, id: id(e.id), source: id(e.source), target: id(e.target) })),
  };
}

/** The fixture workflows: each project's Workflow components, and the national ID workflow in Project A. */
function fixtureWorkflows() {
  const rows: { slug: string; name: string; projectSlug: string; graphAt: (version: string) => Workflow; versions: typeof workflowVersions; enabled: boolean; cron: boolean; updatedAt: string }[] = [];
  for (const p of fixtureProjects) {
    for (const item of projectWorkflowDetails(p)) {
      const own = workflowGraphs[item.id];
      rows.push({
        slug: item.id,
        name: item.name,
        projectSlug: p.id,
        graphAt: (version) => own ?? { ...nationalIdWorkflowAt(version), id: item.id, name: item.name },
        versions: own ? surveillanceVersions : workflowVersions,
        enabled: item.enabled,
        cron: item.triggerType === "cron",
        updatedAt: item.updatedAt,
      });
    }
  }
  if (!rows.some((r) => r.slug === nationalIdWorkflow.id)) {
    rows.push({
      slug: nationalIdWorkflow.id,
      name: nationalIdWorkflow.name,
      projectSlug: "project-a",
      graphAt: nationalIdWorkflowAt,
      versions: workflowVersions,
      enabled: true,
      cron: false,
      updatedAt: "2026-10-14T10:00:00Z",
    });
  }
  return rows;
}

/** The webhook auth methods that guard a fixture workflow's webhook trigger, by their ids on the API. */
const methodsGuarding = (slug: string) =>
  Object.values(authMethods)
    .flat()
    .filter((m) => m.triggerIds.includes(`${slug}:webhook`))
    .map((m) => seedId("webhook_auth_method", m.id));

/** The fixture graph as stored: a cron workflow's trigger is a cron trigger (the list said so; the borrowed graph didn't). */
function seedDocument(w: ReturnType<typeof fixtureWorkflows>[number], version: string) {
  const doc = toDocument(seededGraph(w.slug, w.graphAt(version)), { enabled: w.enabled });
  doc.triggers = doc.triggers.map((t) => ({ ...t, webhook_auth_method_ids: w.cron ? [] : methodsGuarding(w.slug) }));
  if (w.cron) {
    doc.triggers = doc.triggers.map((t) => ({
      ...t,
      type: "cron",
      cron_expression: "0 6 * * *",
      webhook_reply: null,
      label: "Cron trigger",
      subtitle: "Every day at 06:00",
      summary: "**Starts a run** every morning at 06:00.",
    }));
  }
  return doc;
}

/**
 * A sandbox's copy of a workflow, as making the sandbox makes it: every id
 * new (worked out from the sandbox and the original, so a copy can be traced
 * back), every trigger off, and a note of the version it was copied at.
 */
export function cloneInto(w: WorkflowRow, sandboxId: string, at: string): WorkflowRow {
  const id = (old: string) => cloneNodeId(sandboxId, old);
  return {
    ...w,
    id: seedId("workflow", `${sandboxId}/${w.id}`),
    project_id: sandboxId,
    jobs: w.jobs.map((j) => ({ ...j, id: id(j.id) })),
    triggers: w.triggers.map((t) => ({ ...t, id: id(t.id), enabled: false })),
    edges: w.edges.map((e) => ({
      ...e,
      id: id(e.id),
      source_trigger_id: e.source_trigger_id && id(e.source_trigger_id),
      source_job_id: e.source_job_id && id(e.source_job_id),
      target_job_id: id(e.target_job_id),
    })),
    positions: w.positions && Object.fromEntries(Object.entries(w.positions).map(([k, v]) => [id(k), v])),
    inserted_at: at,
    updated_at: at,
    lock_version: 1,
    deleted_at: null,
    copied_from: { workflow_id: w.id, lock_version: w.lock_version },
  };
}

const mainWorkflows = (): WorkflowRow[] =>
  fixtureWorkflows().map((w) => ({
    ...seedDocument(w, "latest"),
    id: apiWorkflowId(w.slug),
    project_id: projectIdFor(w.projectSlug),
    concurrency: null,
    enable_job_logs: true,
    inserted_at: seedTime(w.versions.at(-1)?.date ?? "1 Jan 2026"),
    updated_at: w.updatedAt,
    lock_version: w.versions.length,
    deleted_at: null,
    copied_from: null,
  }));

// The fixture sandboxes' copies. A workflow the fixtures say changed in a sandbox has an edit in its
// first step; one that's also "diverged" was copied before main's latest version.
const sandboxCopies = (main: WorkflowRow[]): WorkflowRow[] =>
  fixtureSandboxes().flatMap(({ sandbox, id, parentId }) =>
    main
      .filter((w) => w.project_id === parentId)
      .map((w) => {
        const copy = cloneInto(w, id, seedTime(sandbox.lastActivity));
        const change = sandbox.changes.find((c) => apiWorkflowId(c.workflowId) === w.id);
        if (!change) return copy;
        const [first, ...rest] = copy.jobs;
        return {
          ...copy,
          jobs: first ? [{ ...first, body: `${first.body}\n\n// Changed in ${sandbox.name}: ${sandbox.description}` }, ...rest] : copy.jobs,
          lock_version: 2,
          copied_from: change.diverged ? { workflow_id: w.id, lock_version: Math.max(1, w.lock_version - 1) } : copy.copied_from,
        };
      }),
  );

export const workflows = table<WorkflowRow>("workflows", () => {
  const main = mainWorkflows();
  return [...main, ...sandboxCopies(main)];
});

export const snapshots = table<SnapshotRow>("workflow_snapshots", () =>
  fixtureWorkflows().flatMap((w) =>
    [...w.versions].reverse().map((v, i) => {
      const doc = seedDocument(w, v.id);
      return {
        id: seedId("snapshot", `${w.slug}/${v.id}`),
        workflow_id: apiWorkflowId(w.slug),
        lock_version: i + 1,
        inserted_at: seedTime(v.date),
        author: v.author,
        message: v.message,
        workflow: { name: w.name, jobs: doc.jobs, triggers: doc.triggers, edges: doc.edges, positions: doc.positions },
      };
    }),
  ),
);

/* ------------------------------------------------------------------ */
/*  Reading                                                            */
/* ------------------------------------------------------------------ */

export const liveWorkflowsIn = (projectId: string) => workflows.rows().filter((w) => w.project_id === projectId && !w.deleted_at);
export const findWorkflow = (id: string) => workflows.rows().find((w) => w.id === id && !w.deleted_at);

/** A workflow as the API sends it. */
export function workflowEntry(w: WorkflowRow) {
  const { deleted_at: _deleted, copied_from: _copied, ...doc } = w;
  void _deleted;
  void _copied;
  return doc;
}

// Projects count their live workflows, and their last activity is when one last changed.
addProjectStats((projectId) => {
  const own = liveWorkflowsIn(projectId);
  return { workflows_count: own.length, last_activity: own.map((w) => w.updated_at).sort().at(-1) ?? null };
});

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

const WORKFLOW_KEYS = ["id", "project_id", "name", "jobs", "triggers", "edges", "positions", "concurrency", "enable_job_logs", "lock_version"];

/**
 * Whether a project credential (a link) may be used by a step in a project:
 * linked there, or to a project it's a sandbox of (sandboxes share their
 * parent's credentials). credentials.ts answers it.
 */
let credentialUsable: (projectId: string, linkId: string) => boolean = () => true;
export const setCredentialCheck = (check: typeof credentialUsable) => void (credentialUsable = check);
/** Whether a project may use a project credential: linked to it, or to a project it's a sandbox of. */
export const canUseCredential = (projectId: string, linkId: string) => credentialUsable(projectId, linkId);

/** Every problem with a workflow's graph, in one list (api/workflows.md). */
export function graphProblems(doc: Pick<WorkflowDocument, "jobs" | "triggers" | "edges">, { selfId, projectId }: { selfId?: string; projectId?: string } = {}): Entry[] {
  const errors: Entry[] = [];
  if (projectId) {
    doc.jobs.forEach((j, i) => {
      if (j.project_credential_id && !credentialUsable(projectId, j.project_credential_id)) {
        errors.push({ code: "credential_not_allowed", detail: "isn't a credential this project can use", pointer: `#/jobs/${i}/project_credential_id` });
      }
    });
  }
  const jobIds = new Set(doc.jobs.map((j) => j.id));
  const triggerIds = new Set(doc.triggers.map((t) => t.id));
  doc.jobs.forEach((j, i) => {
    if (!j.id) errors.push({ code: "required", detail: "can't be blank", pointer: `#/jobs/${i}/id` });
    if (!j.name?.trim()) errors.push({ code: "required", detail: "can't be blank", pointer: `#/jobs/${i}/name` });
    if (!j.adaptor) errors.push({ code: "required", detail: "can't be blank", pointer: `#/jobs/${i}/adaptor` });
  });
  doc.triggers.forEach((t, i) => {
    if (!["webhook", "cron", "kafka"].includes(t.type)) errors.push({ code: "invalid", detail: "must be webhook or cron", pointer: `#/triggers/${i}/type` });
    if (t.type === "cron" && !t.cron_expression) errors.push({ code: "required", detail: "a cron trigger needs a schedule", pointer: `#/triggers/${i}/cron_expression` });
  });
  if (doc.triggers.filter((t) => t.enabled).length > 1) errors.push({ code: "one_enabled", detail: "only one trigger can be enabled", pointer: "#/triggers" });
  doc.edges.forEach((e, i) => {
    const source = e.source_trigger_id ?? e.source_job_id;
    if (!source || !(jobIds.has(source) || triggerIds.has(source))) errors.push({ code: "not_found", detail: "is not a job or trigger in this workflow", pointer: `#/edges/${i}` });
    if (!jobIds.has(e.target_job_id)) errors.push({ code: "not_found", detail: "is not a job in this workflow", pointer: `#/edges/${i}/target_job_id` });
    if (e.source_trigger_id && !["always", "js_expression"].includes(e.condition_type)) {
      errors.push({ code: "invalid", detail: "an edge from a trigger is always or a JavaScript expression", pointer: `#/edges/${i}/condition_type` });
    }
  });
  const fromTriggers = doc.edges.filter((e) => e.source_trigger_id && e.enabled);
  if (doc.jobs.length > 0 && doc.triggers.length > 0 && fromTriggers.length !== 1) {
    errors.push({ code: "missing_trigger_edge", detail: "exactly one enabled edge must leave the triggers", pointer: "#/edges" });
  }
  // No cycles: walk the edges from every node.
  const next = new Map<string, string[]>();
  for (const e of doc.edges) {
    const s = e.source_trigger_id ?? e.source_job_id;
    if (s) next.set(s, [...(next.get(s) ?? []), e.target_job_id]);
  }
  const visiting = new Set<string>();
  const done = new Set<string>();
  const cyclic = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (done.has(id)) return false;
    visiting.add(id);
    const found = (next.get(id) ?? []).some(cyclic);
    visiting.delete(id);
    done.add(id);
    return found;
  };
  if ([...jobIds, ...triggerIds].some(cyclic)) errors.push({ code: "cycle", detail: "the edges form a loop", pointer: "#/edges" });
  // An id already used by another workflow's job or trigger.
  const elsewhere = new Set(
    workflows
      .rows()
      .filter((w) => w.id !== selfId)
      .flatMap((w) => [...w.jobs.map((j) => j.id), ...w.triggers.map((t) => t.id)]),
  );
  doc.jobs.forEach((j, i) => elsewhere.has(j.id) && errors.push({ code: "taken", detail: "is used by another workflow", pointer: `#/jobs/${i}/id` }));
  doc.triggers.forEach((t, i) => elsewhere.has(t.id) && errors.push({ code: "taken", detail: "is used by another workflow", pointer: `#/triggers/${i}/id` }));
  return errors;
}

const nameTaken = (projectId: string, name: string, except?: string) =>
  liveWorkflowsIn(projectId).some((w) => w.id !== except && w.name.trim().toLowerCase() === name.trim().toLowerCase());

/** Fills a job, trigger or edge the client sent with the fields it left out. */
const job = (j: Partial<WorkflowJob>): WorkflowJob => ({
  id: j.id ?? newId(),
  name: j.name ?? "",
  body: j.body ?? "",
  adaptor: j.adaptor ?? "@openfn/language-common@latest",
  project_credential_id: j.project_credential_id ?? null,
  keychain_credential_id: j.keychain_credential_id ?? null,
  ...(j.summary !== undefined && { summary: j.summary }),
  system_id: j.system_id ?? null,
});
const trigger = (t: Partial<WorkflowTrigger>): WorkflowTrigger => ({
  id: t.id ?? newId(),
  type: t.type ?? "webhook",
  enabled: t.enabled ?? false,
  cron_expression: t.cron_expression ?? null,
  custom_path: t.custom_path ?? null,
  comment: t.comment ?? null,
  webhook_reply: t.webhook_reply ?? (t.type === "webhook" || !t.type ? "before_start" : null),
  webhook_auth_method_ids: t.webhook_auth_method_ids ?? [],
  ...(t.label !== undefined && { label: t.label }),
  ...(t.subtitle !== undefined && { subtitle: t.subtitle }),
  ...(t.summary !== undefined && { summary: t.summary }),
});
const edge = (e: Partial<WorkflowDocEdge>): WorkflowDocEdge => ({
  id: e.id ?? newId(),
  source_trigger_id: e.source_trigger_id ?? null,
  source_job_id: e.source_job_id ?? null,
  target_job_id: e.target_job_id ?? "",
  condition_type: e.condition_type ?? "always",
  condition_expression: e.condition_expression ?? null,
  condition_label: e.condition_label ?? null,
  enabled: e.enabled ?? true,
});

/** Who's making a change, for a snapshot. */
const author = () => {
  const u = findUser(currentUserId());
  return u ? fullName(u) : "Unknown";
};

/** Keeps a snapshot of a workflow as it now is. */
export function snapshot(w: WorkflowRow, message: string | null = null) {
  snapshots.insert({
    id: newId(),
    workflow_id: w.id,
    lock_version: w.lock_version,
    inserted_at: w.updated_at,
    author: author(),
    message,
    workflow: { name: w.name, jobs: w.jobs, triggers: w.triggers, edges: w.edges, positions: w.positions },
  });
}

/** Saves a changed workflow: a new version and its snapshot, when anything that's snapshotted changed. */
export function saveWorkflow(before: WorkflowRow, after: WorkflowRow, message: string | null = null): WorkflowRow {
  // Turning a trigger on or off isn't a new version of the workflow (the demo's choice; Lightning snapshots it too).
  const switchesOff = (w: WorkflowRow) => ({ ...w, triggers: w.triggers.map((t) => ({ ...t, enabled: false })) });
  const graphChanged = (["name", "jobs", "triggers", "edges"] as const).some(
    (k) => JSON.stringify(switchesOff(before)[k]) !== JSON.stringify(switchesOff(after)[k]),
  );
  const anyChange = graphChanged || JSON.stringify(before) !== JSON.stringify(after);
  if (!anyChange) return before;
  const saved = { ...after, updated_at: now(), lock_version: graphChanged ? before.lock_version + 1 : before.lock_version };
  workflows.update((w) => w.id === before.id, () => saved);
  if (graphChanged) snapshot(saved, message);
  return saved;
}

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

const one = (w: WorkflowRow, status = 200) => json(status, { workflow: workflowEntry(w) });

function list(projectId: string | null, query: URLSearchParams) {
  const rows = workflows
    .rows()
    .filter((w) => !w.deleted_at && (projectId ? w.project_id === projectId : !!roleIn(w.project_id)))
    .filter((w) => !findProject(w.project_id)?.scheduled_deletion)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(workflowEntry);
  // Not paged today; paging is planned, so a client that sends page_size gets pages.
  if (query.get("page_size")) return json(200, paged(projectId ? `/api/projects/${projectId}/workflows` : "/api/workflows", rows, query, "workflows"));
  return json(200, { workflows: rows });
}

function update(projectId: string, id: string, body: Body): Response {
  const p = guardProject(projectId, "editor");
  if (p instanceof Response) return p;
  if (!isUuid(id)) return badId("id");
  const existing = findWorkflow(id);
  if (!existing || existing.project_id !== p.id) return notFound();
  const errors = unknownKeys(body, WORKFLOW_KEYS);
  if (body["id"] !== undefined && body["id"] !== id) errors.push({ code: "mismatch", detail: "does not match the path", pointer: "#/id" });
  if (body["project_id"] !== undefined && body["project_id"] !== p.id) errors.push({ code: "mismatch", detail: "does not match the path", pointer: "#/project_id" });
  if (body["name"] !== undefined) {
    if (typeof body["name"] !== "string" || !body["name"].trim()) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
    else if (nameTaken(p.id, body["name"], id)) errors.push({ code: "taken", detail: "has already been taken", pointer: "#/name" });
  }
  const next: WorkflowRow = {
    ...existing,
    ...(typeof body["name"] === "string" && { name: body["name"].trim() }),
    ...(Array.isArray(body["jobs"]) && { jobs: (body["jobs"] as Partial<WorkflowJob>[]).map(job) }),
    ...(Array.isArray(body["triggers"]) && { triggers: (body["triggers"] as Partial<WorkflowTrigger>[]).map(trigger) }),
    ...(Array.isArray(body["edges"]) && { edges: (body["edges"] as Partial<WorkflowDocEdge>[]).map(edge) }),
    ...(body["positions"] !== undefined && { positions: body["positions"] as WorkflowRow["positions"] }),
    ...(body["concurrency"] !== undefined && { concurrency: body["concurrency"] as number | null }),
    ...(typeof body["enable_job_logs"] === "boolean" && { enable_job_logs: body["enable_job_logs"] }),
  };
  // Triggers can change, never go.
  if (Array.isArray(body["triggers"])) {
    const kept = new Set(next.triggers.map((t) => t.id));
    if (existing.triggers.some((t) => !kept.has(t.id))) errors.push({ code: "trigger_removed", detail: "a trigger can't be removed", pointer: "#/triggers" });
  }
  errors.push(...graphProblems(next, { selfId: id, projectId: p.id }));
  if (errors.length) return invalid(errors);
  if (typeof body["lock_version"] === "number" && body["lock_version"] !== existing.lock_version) {
    return conflict("concurrent_edit", "Someone else changed this workflow. Fetch it again and retry.");
  }
  const saved = saveWorkflow(existing, next);
  if (saved !== existing) {
    const toggled = existing.triggers.some((t) => next.triggers.find((n) => n.id === t.id)?.enabled !== t.enabled);
    const graphChanged = saved.lock_version !== existing.lock_version;
    if (graphChanged) record("snapshot_created", { type: "workflow", id, name: saved.name }, { before: { lock_version: existing.lock_version }, after: { lock_version: saved.lock_version } });
    else if (toggled) record(next.triggers.some((t) => t.enabled) ? "enabled" : "disabled", { type: "workflow", id, name: saved.name }, {}, true);
  }
  return one(saved);
}

export const workflowRoutes: Record<string, Handler> = {
  "GET /api/workflows": (_params, _body, query) => {
    const projectId = query.get("project_id");
    if (projectId) {
      const p = guardProject(projectId);
      if (p instanceof Response) return p;
    }
    return list(projectId, query);
  },
  "GET /api/projects/:project_id/workflows": ({ project_id }, _body, query) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    return list(p.id, query);
  },
  "GET /api/projects/:project_id/workflows/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const w = findWorkflow(id);
    return w && w.project_id === p.id ? one(w) : notFound();
  },
  // Top level: anyone who can open its project; everyone else hears 403, whether or not it exists.
  "GET /api/workflows/:id": ({ id }) => {
    const w = isUuid(id) ? findWorkflow(id) : undefined;
    if (!w) return forbidden();
    const p = guardProject(w.project_id);
    return p instanceof Response ? p : one(w);
  },

  "POST /api/projects/:project_id/workflows": ({ project_id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    const errors = unknownKeys(body, WORKFLOW_KEYS);
    const name = typeof body["name"] === "string" ? body["name"].trim() : "";
    if (!name) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
    else if (nameTaken(p.id, name)) errors.push({ code: "taken", detail: "has already been taken", pointer: "#/name" });
    const sent = {
      jobs: ((body["jobs"] as Partial<WorkflowJob>[] | undefined) ?? []).map(job),
      triggers: ((body["triggers"] as Partial<WorkflowTrigger>[] | undefined) ?? []).map(trigger),
      edges: ((body["edges"] as Partial<WorkflowDocEdge>[] | undefined) ?? []).map(edge),
    };
    errors.push(...graphProblems({ ...sent, jobs: sent.jobs.map((j) => ({ ...j, id: j.id })) }, { selfId: "__new__" }).filter((e) => e.code !== "taken"));
    if (errors.length) return invalid(errors);
    // The client's ids only tie edges to jobs and triggers; Lightning gives each a fresh UUID.
    const fresh = new Map<string, string>();
    const idFor = (old: string | null) => (old === null ? null : (fresh.get(old) ?? (fresh.set(old, newId()), fresh.get(old)!)));
    const positions = (body["positions"] as WorkflowRow["positions"]) ?? null;
    const at = now();
    const created: WorkflowRow = {
      id: newId(),
      project_id: p.id,
      name,
      jobs: sent.jobs.map((j) => ({ ...j, id: idFor(j.id)! })),
      triggers: sent.triggers.map((t) => ({ ...t, id: idFor(t.id)! })),
      edges: sent.edges.map((e) => ({
        ...e,
        id: idFor(e.id)!,
        source_trigger_id: idFor(e.source_trigger_id),
        source_job_id: idFor(e.source_job_id),
        target_job_id: idFor(e.target_job_id)!,
      })),
      positions: positions && Object.fromEntries(Object.entries(positions).map(([k, v]) => [idFor(k)!, v])),
      concurrency: (body["concurrency"] as number | undefined) ?? null,
      enable_job_logs: (body["enable_job_logs"] as boolean | undefined) ?? true,
      inserted_at: at,
      updated_at: at,
      lock_version: 1,
      deleted_at: null,
      copied_from: null,
    };
    workflows.insert(created);
    snapshot(created);
    record("created", { type: "workflow", id: created.id, name }, { after: { name } });
    return one(created, 201);
  },

  "PATCH /api/projects/:project_id/workflows/:id": ({ project_id, id }, body) => update(project_id!, id!, body),
  "PUT /api/projects/:project_id/workflows/:id": ({ project_id, id }, body) => update(project_id!, id!, body),

  // Marks it deleted: triggers off at once, gone from lists; its run history stays.
  "DELETE /api/projects/:project_id/workflows/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const w = findWorkflow(id);
    if (!w || w.project_id !== p.id) return notFound();
    const at = now();
    workflows.update(
      (r) => r.id === w.id,
      (r) => ({ ...r, deleted_at: at, updated_at: at, triggers: r.triggers.map((t) => ({ ...t, enabled: false })) }),
    );
    record("marked_for_deletion", { type: "workflow", id: w.id, name: w.name }, {}, true);
    return noContent();
  },

  // The demo's own: a copy of a workflow in its project, paused, with fresh ids and a name of its own.
  "POST /api/demo/projects/:project_id/workflows/:id/copies": ({ project_id, id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const w = findWorkflow(id);
    if (!w || w.project_id !== p.id) return notFound();
    const errors = unknownKeys(body, []);
    if (errors.length) return invalid(errors);
    const fresh = new Map<string, string>();
    const idFor = (old: string) => fresh.get(old) ?? (fresh.set(old, newId()), fresh.get(old)!);
    const at = now();
    const name = copyName(w.name, liveWorkflowsIn(p.id).map((x) => x.name));
    const copy: WorkflowRow = {
      ...w,
      id: newId(),
      name,
      jobs: w.jobs.map((j) => ({ ...j, id: idFor(j.id) })),
      triggers: w.triggers.map((t) => ({ ...t, id: idFor(t.id), enabled: false, custom_path: null })),
      edges: w.edges.map((e) => ({
        ...e,
        id: idFor(e.id),
        source_trigger_id: e.source_trigger_id && idFor(e.source_trigger_id),
        source_job_id: e.source_job_id && idFor(e.source_job_id),
        target_job_id: idFor(e.target_job_id),
      })),
      positions: w.positions && Object.fromEntries(Object.entries(w.positions).map(([k, v]) => [idFor(k), v])),
      inserted_at: at,
      updated_at: at,
      lock_version: 1,
      deleted_at: null,
      // `copied_from` pairs a sandbox's copy with its parent's; a copy beside the original is a workflow of its own.
      copied_from: null,
    };
    workflows.insert(copy);
    snapshot(copy);
    record("created", { type: "workflow", id: copy.id, name }, { after: { name, copied_from: w.id } });
    return one(copy, 201);
  },

  "GET /api/workflows/:id/snapshots": ({ id }, _body, query) => {
    const w = isUuid(id) ? workflows.rows().find((r) => r.id === id) : undefined;
    if (!w) return forbidden();
    const p = guardProject(w.project_id);
    if (p instanceof Response) return p;
    const latest = Math.max(...snapshots.rows().filter((s) => s.workflow_id === id).map((s) => s.lock_version));
    const rows = snapshots
      .rows()
      .filter((s) => s.workflow_id === id)
      .sort((a, b) => b.lock_version - a.lock_version)
      .map((s) => ({
        id: s.id,
        lock_version: s.lock_version,
        inserted_at: s.inserted_at,
        latest: s.lock_version === latest,
        // The demo's: who made it and what they said about it.
        author: s.author,
        message: s.message,
        links: { self: `${ORIGIN}/api/workflows/${id}/snapshots/${s.id}` },
      }));
    return json(200, paged(`/api/workflows/${id}/snapshots`, rows, query));
  },

  "GET /api/workflows/:id/snapshots/:snapshot_id": ({ id, snapshot_id }) => {
    const w = isUuid(id) ? workflows.rows().find((r) => r.id === id) : undefined;
    if (!w) return forbidden();
    const p = guardProject(w.project_id);
    if (p instanceof Response) return p;
    const s = snapshots.rows().find((r) => r.id === snapshot_id && r.workflow_id === id);
    if (!s) return notFound();
    return json(200, { snapshot: { id: w.id, project_id: w.project_id, ...s.workflow, lock_version: s.lock_version, inserted_at: s.inserted_at } });
  },
};
