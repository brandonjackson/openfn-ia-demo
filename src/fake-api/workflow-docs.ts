/**
 * A workflow's docs on the pretend server: context.md, spec.md and any
 * other Markdown file kept alongside it. Lightning's API has none, so they
 * live under `/api/demo/`, follow api/conventions.md and hang off the
 * project (a doc names its workflow in `workflow_id`).
 *
 * Lifecycle:
 * - `GET /api/demo/projects/:project_id/workflow_docs?workflow_id=…` lists a
 *   workflow's docs (every doc in the project without it), by name, for any
 *   member.
 * - `POST` makes one (201): a file `name` ending in `.md`, unique among the
 *   workflow's docs, and its `content` (blank is fine).
 * - `PATCH .../:id` changes its name or content under the same rules;
 *   `DELETE` removes it (204). Editors and up write them.
 * - A doc belongs to its workflow, and a sandbox's copy of the workflow has
 *   its own: making a sandbox copies them, a merge preview says which are new
 *   or changed, and a merge brings those back with the workflow, never
 *   deleting the target's (sandboxes.ts).
 */
import { workflowDocs } from "../fixtures/workflow-files";
import { apiWorkflowId, seedId } from "../fixtures/ids";
import { badId, invalid, isUuid, json, maxLength, noContent, notFound, now, ORIGIN, paged, unknownKeys, type Body, type Entry, type Handler } from "./answers";
import { seedTime, table } from "./db";
import { guardProject, projectIdFor } from "./projects";
import { withSandboxCopies, type CopyPair } from "./sandbox-copies";
import { currentUserId } from "./session";
import { findUser, fullName } from "./users";
import { findWorkflow, fixtureWorkflows } from "./workflows";

export interface WorkflowDocRow {
  id: string;
  project_id: string;
  workflow_id: string;
  /** Its file name, e.g. "spec.md". */
  name: string;
  content: string;
  updated_by: string;
  inserted_at: string;
  updated_at: string;
  /** In a sandbox, the doc in the parent it was copied from, which a merge changes; null for one made here. */
  copied_from?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Seed                                                               */
/* ------------------------------------------------------------------ */

/** A sandbox's copy of a doc, on the sandbox's copy of its workflow. */
export const copyWorkflowDoc = (d: WorkflowDocRow, sandboxId: string, workflowId = seedId("workflow", `${sandboxId}/${d.workflow_id}`)): WorkflowDocRow => ({
  ...d,
  id: seedId("workflow_doc", `${sandboxId}/${d.id}`),
  project_id: sandboxId,
  workflow_id: workflowId,
  copied_from: d.id,
});

// The docs are written for the fixtures' workflows, so each has its context and spec.
const docsSeed = (): WorkflowDocRow[] =>
  fixtureWorkflows().flatMap((w) =>
    (
      [
        ["context.md", workflowDocs.context],
        ["spec.md", workflowDocs.spec],
      ] as const
    ).map(([name, content]) => {
      const at = seedTime("1 Oct 2026");
      return {
        id: seedId("workflow_doc", `${w.slug}/${name}`),
        project_id: projectIdFor(w.projectSlug),
        workflow_id: apiWorkflowId(w.slug),
        name,
        content,
        updated_by: "Brandon Jackson",
        inserted_at: at,
        updated_at: at,
      };
    }),
  );

export const workflowDocRows = table<WorkflowDocRow>("workflow_docs", () => withSandboxCopies(docsSeed(), (d, sandboxId) => copyWorkflowDoc(d, sandboxId)));

/* ------------------------------------------------------------------ */
/*  Sandboxes                                                          */
/* ------------------------------------------------------------------ */

/** Copies the docs of each workflow a new sandbox copied (by the parent's workflow id to its copy's). */
export function copyWorkflowDocsInto(sandboxId: string, copies: Map<string, string>) {
  for (const d of workflowDocRows.rows().filter((x) => copies.has(x.workflow_id))) workflowDocRows.insert(copyWorkflowDoc(d, sandboxId, copies.get(d.workflow_id)!));
}

/**
 * A sandbox workflow's docs paired with the target's copy of the workflow
 * (none when the workflow is new there): by the one each was copied from,
 * or name.
 */
export function workflowDocPairs(sandboxWorkflowId: string, targetWorkflowId: string | null, targetProjectId: string): CopyPair[] {
  const theirs = targetWorkflowId ? workflowDocRows.rows().filter((x) => x.workflow_id === targetWorkflowId) : [];
  return workflowDocRows
    .rows()
    .filter((x) => x.workflow_id === sandboxWorkflowId)
    .map((d) => {
      const pair = theirs.find((x) => x.id === d.copied_from) ?? theirs.find((x) => x.name.toLowerCase() === d.name.toLowerCase());
      return {
        name: d.name,
        isNew: !pair,
        same: !!pair && pair.name === d.name && pair.content === d.content,
        apply: () => {
          const at = now();
          if (pair) workflowDocRows.update((x) => x.id === pair.id, (x) => ({ ...x, name: d.name, content: d.content, updated_by: by(), updated_at: at }));
          // The workflow it goes with is made before its docs are, so the id is known by now.
          else workflowDocRows.insert({ ...d, id: crypto.randomUUID(), project_id: targetProjectId, workflow_id: targetWorkflowId!, updated_by: by(), inserted_at: at, updated_at: at, copied_from: null });
        },
      };
    });
}

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

const NAME = /^[a-z0-9][a-z0-9._-]*\.md$/i;

const entry = (d: WorkflowDocRow) => ({
  type: "workflow_docs",
  id: d.id,
  attributes: { workflow_id: d.workflow_id, name: d.name, content: d.content, updated_by: d.updated_by, inserted_at: d.inserted_at, updated_at: d.updated_at },
  links: { self: `${ORIGIN}/api/demo/projects/${d.project_id}/workflow_docs/${d.id}` },
});

const by = () => {
  const me = findUser(currentUserId());
  return me ? fullName(me) : "Someone";
};

/** The name and content a body makes of `existing` (or of nothing), and what's wrong with them. */
function checked(projectId: string, body: Body, existing?: WorkflowDocRow) {
  const errors: Entry[] = unknownKeys(body, existing ? ["name", "content"] : ["workflow_id", "name", "content"]);
  const workflowId = existing?.workflow_id ?? (typeof body["workflow_id"] === "string" ? body["workflow_id"] : "");
  if (!existing) {
    const w = isUuid(workflowId) ? findWorkflow(workflowId) : undefined;
    if (!w || w.project_id !== projectId) errors.push({ code: "not_found", detail: "isn't a workflow in this project", pointer: "#/workflow_id" });
  }
  const rawName = body["name"] ?? existing?.name;
  const name = typeof rawName === "string" ? rawName.trim() : "";
  if (!name) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
  else if (!NAME.test(name)) errors.push({ code: "format", detail: "must be a file name ending in .md", pointer: "#/name" });
  else if (workflowDocRows.rows().some((d) => d.workflow_id === workflowId && d.id !== existing?.id && d.name.toLowerCase() === name.toLowerCase())) {
    errors.push({ code: "taken", detail: "is already the name of another doc of this workflow", pointer: "#/name" });
  }
  maxLength(name, 120, "#/name", errors);
  const rawContent = body["content"] ?? existing?.content ?? "";
  if (typeof rawContent !== "string") errors.push({ code: "type", detail: "must be a string", pointer: "#/content" });
  const content = typeof rawContent === "string" ? rawContent : "";
  maxLength(content, 200_000, "#/content", errors);
  return { errors, workflowId, name, content };
}

/** A doc of the project, by id, or the answer saying why not. */
function found(projectId: string, id: string, least: "viewer" | "editor") {
  const p = guardProject(projectId, least);
  if (p instanceof Response) return p;
  if (!isUuid(id)) return badId("id");
  return workflowDocRows.rows().find((d) => d.id === id && d.project_id === p.id) ?? notFound();
}

export const workflowDocRoutes: Record<string, Handler> = {
  "GET /api/demo/projects/:project_id/workflow_docs": ({ project_id }, _body, query) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    const workflowId = query.get("workflow_id");
    const rows = workflowDocRows
      .rows()
      .filter((d) => d.project_id === p.id && (!workflowId || d.workflow_id === workflowId))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(entry);
    return json(200, paged(`/api/demo/projects/${p.id}/workflow_docs`, rows, query));
  },

  "POST /api/demo/projects/:project_id/workflow_docs": ({ project_id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    const { errors, workflowId, name, content } = checked(p.id, body);
    if (errors.length) return invalid(errors);
    const at = now();
    const row: WorkflowDocRow = { id: crypto.randomUUID(), project_id: p.id, workflow_id: workflowId, name, content, updated_by: by(), inserted_at: at, updated_at: at };
    workflowDocRows.insert(row);
    return json(201, { data: entry(row) });
  },

  "PATCH /api/demo/projects/:project_id/workflow_docs/:id": ({ project_id, id }, body) => {
    const d = found(project_id!, id!, "editor");
    if (d instanceof Response) return d;
    const { errors, name, content } = checked(d.project_id, body, d);
    if (errors.length) return invalid(errors);
    const row: WorkflowDocRow = { ...d, name, content, updated_by: by(), updated_at: now() };
    workflowDocRows.update((x) => x.id === d.id, () => row);
    return json(200, { data: entry(row) });
  },

  "DELETE /api/demo/projects/:project_id/workflow_docs/:id": ({ project_id, id }) => {
    const d = found(project_id!, id!, "editor");
    if (d instanceof Response) return d;
    workflowDocRows.remove((x) => x.id === d.id);
    return noContent();
  },
};
