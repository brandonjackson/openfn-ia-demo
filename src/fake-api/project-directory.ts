/**
 * The projects on the instance you aren't in, and asking to join one: the
 * demo's own routes (api/ lists only the projects you're a member of), under
 * `/api/demo/`, following api/conventions.md.
 *
 * Lifecycle:
 * - `GET /api/demo/projects/others` lists every top-level project you aren't
 *   a member of and that isn't being deleted: its name, description, owner,
 *   how many members it has, and whether you've asked to join.
 * - `POST /api/demo/projects/:id/join_requests` records that you'd like to
 *   join (201). Asking again answers the same request (200). A member asking
 *   is a 409 `already_member`. Nobody answers requests in the demo yet.
 */
import { newId } from "../fixtures/ids";
import { conflict, invalid, isUuid, json, notFound, now, ORIGIN, paged, unknownKeys, type Handler } from "./answers";
import { record } from "./audit";
import { table } from "./db";
import { findProject, membersOf, projects, roleIn, type ProjectRow } from "./projects";
import { currentUserId } from "./session";
import { findUser, fullName } from "./users";

export interface JoinRequestRow {
  id: string;
  project_id: string;
  user_id: string;
  inserted_at: string;
}

export const joinRequests = table<JoinRequestRow>("project_join_requests", () => []);

const requestOf = (projectId: string, userId = currentUserId()) => joinRequests.rows().find((r) => r.project_id === projectId && r.user_id === userId);

const entry = (p: ProjectRow) => {
  const owner = membersOf(p.id).find((m) => m.role === "owner");
  const user = owner && findUser(owner.user_id);
  return {
    type: "projects",
    id: p.id,
    attributes: {
      name: p.name,
      description: p.description,
      owner_name: user ? fullName(user) : null,
      member_count: membersOf(p.id).length,
      join_requested: !!requestOf(p.id),
    },
    links: { self: `${ORIGIN}/api/demo/projects/others` },
  };
};

const joinEntry = (r: JoinRequestRow) => ({
  type: "join_requests",
  id: r.id,
  attributes: { project_id: r.project_id, user_id: r.user_id, inserted_at: r.inserted_at },
});

export const projectDirectoryRoutes: Record<string, Handler> = {
  "GET /api/demo/projects/others": (_params, _body, query) => {
    const rows = projects
      .rows()
      .filter((p) => p.parent_id === null && !p.scheduled_deletion && !roleIn(p.id))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(entry);
    return json(200, paged("/api/demo/projects/others", rows, query));
  },

  "POST /api/demo/projects/:project_id/join_requests": ({ project_id }, body) => {
    const p = isUuid(project_id) ? findProject(project_id!) : undefined;
    if (!p || p.parent_id !== null || p.scheduled_deletion) return notFound();
    const errors = unknownKeys(body, []);
    if (errors.length) return invalid(errors);
    if (roleIn(p.id)) return conflict("already_member", "You're already a member of this project.");
    const existing = requestOf(p.id);
    if (existing) return json(200, { data: joinEntry(existing) });
    const made: JoinRequestRow = { id: newId(), project_id: p.id, user_id: currentUserId(), inserted_at: now() };
    joinRequests.insert(made);
    record("requested", { type: "project", id: p.id, name: p.name }, {}, true);
    return json(201, { data: joinEntry(made) });
  },
};
