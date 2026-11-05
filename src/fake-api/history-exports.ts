/**
 * History exports on the pretend server (api/work-orders.md, History
 * exports). Asking for one answers 202 with it `enqueued`; it moves to
 * `in_progress` and then `completed`, with its file name and download link,
 * a few seconds later, as Lightning's background job would. Asking is
 * audited (`requested`). Editors and up ask; any member lists them.
 */
import { projectHistoryExports } from "../fixtures/project-settings";
import { projects as fixtureProjects } from "../fixtures/projects";
import { newId, seedId } from "../fixtures/ids";
import { badId, isUuid, json, notFound, now, ORIGIN, paged, unknownKeys, invalid, type Handler } from "./answers";
import { record } from "./audit";
import { seedTime, table } from "./db";
import { findProject, guardProject, projectIdFor } from "./projects";
import { currentUserId } from "./session";
import { findUser, fullName, users } from "./users";

export interface HistoryExportRow {
  id: string;
  project_id: string;
  state: "enqueued" | "in_progress" | "completed" | "failed";
  filename: string | null;
  created_by_id: string | null;
  created_by_name: string;
  inserted_at: string;
  updated_at: string;
}

/** How long each stage takes: long enough to see it working, short enough to wait for. */
const IN_PROGRESS_AFTER_MS = 800;
const COMPLETED_AFTER_MS = 3000;

export const historyExports = table<HistoryExportRow>("history_exports", () =>
  fixtureProjects.flatMap((p) =>
    projectHistoryExports(p.id).map((e) => {
      const by = users.rows().find((u) => `${u.first_name} ${u.last_name}` === e.requestedBy);
      return {
        id: seedId("history_export", e.id),
        project_id: projectIdFor(p.id),
        state: e.status === "processing" ? "in_progress" : e.status,
        filename: e.fileName ?? null,
        created_by_id: by?.id ?? null,
        created_by_name: e.requestedBy,
        inserted_at: seedTime(e.createdAt.replace(",", "")),
        updated_at: seedTime(e.createdAt.replace(",", "")),
      };
    }),
  ),
);

/** Moves an export on, as the background job would have by now. */
function advance(e: HistoryExportRow): HistoryExportRow {
  if (e.state === "completed" || e.state === "failed") return e;
  const age = Date.now() - Date.parse(e.inserted_at);
  if (age >= COMPLETED_AFTER_MS) {
    const project = findProject(e.project_id);
    return { ...e, state: "completed", filename: `${project?.name ?? "project"}-history-${e.inserted_at.slice(0, 10)}.json`, updated_at: now() };
  }
  if (age >= IN_PROGRESS_AFTER_MS && e.state === "enqueued") return { ...e, state: "in_progress", updated_at: now() };
  return e;
}

function current(projectId: string) {
  const before = historyExports.rows().filter((e) => e.project_id === projectId);
  const after = before.map(advance);
  if (after.some((e, i) => e !== before[i])) historyExports.update((e) => e.project_id === projectId, (e) => after.find((a) => a.id === e.id) ?? e);
  return after;
}

const entry = (e: HistoryExportRow) => ({
  type: "history_exports",
  id: e.id,
  attributes: {
    state: e.state,
    filename: e.filename,
    created_by_id: e.created_by_id,
    created_by_name: e.created_by_name,
    download_url: e.state === "completed" ? `${ORIGIN}/api/projects/${e.project_id}/history_exports/${e.id}/download` : null,
    inserted_at: e.inserted_at,
    updated_at: e.updated_at,
  },
  relationships: {},
  links: { self: `${ORIGIN}/api/projects/${e.project_id}/history_exports/${e.id}` },
});

export const historyExportRoutes: Record<string, Handler> = {
  "POST /api/projects/:project_id/history_exports": ({ project_id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    const errors = unknownKeys(body, ["filter"]);
    if (errors.length) return invalid(errors);
    const me = findUser(currentUserId());
    const at = new Date().toISOString();
    const made: HistoryExportRow = {
      id: newId(),
      project_id: p.id,
      state: "enqueued",
      filename: null,
      created_by_id: me?.id ?? null,
      created_by_name: me ? fullName(me) : "Unknown",
      inserted_at: at,
      updated_at: at,
    };
    historyExports.insert(made);
    record("requested", { type: "history_export", id: made.id, name: p.name }, {}, true);
    return json(202, { data: entry(made) });
  },

  // Newest first; any member.
  "GET /api/projects/:project_id/history_exports": ({ project_id }, _body, query) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    const rows = current(p.id)
      .sort((a, b) => b.inserted_at.localeCompare(a.inserted_at))
      .map(entry);
    return json(200, paged(`/api/projects/${p.id}/history_exports`, rows, query));
  },

  "GET /api/projects/:project_id/history_exports/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const e = current(p.id).find((r) => r.id === id);
    return e ? json(200, { data: entry(e) }) : notFound();
  },
};
