/**
 * A project's forms, artifacts, AI skills, documents and static websites on
 * the pretend server. Lightning's API has none of these (they're the demo's
 * new kinds of component), so they live under `/api/demo/` and follow
 * api/conventions.md. Workflows, channels and collections are Lightning's
 * own and have their own routes.
 *
 * Lifecycle:
 * - `PUT /api/demo/projects/:project_id/components/:id` makes one (201) or
 *   changes it (200). Its `component_type` is set when it's made and never changes. Its
 *   name is unique among the project's components of that type. A form's or
 *   an artifact's content must be JSON.
 * - Every change bumps `lock_version`; a stale one is a 409
 *   `concurrent_edit`, so two people editing the same file don't lose each
 *   other's work.
 * - `DELETE` removes it.
 * - Editors and up make, change and delete them; any member reads them.
 */
import { projects as fixtureProjects } from "../fixtures/projects";
import { apiComponentId } from "../fixtures/ids";
import { componentContent } from "../fixtures/project-components";
import { contentComponentTypes, isContentComponentType, isJsonContent, type ContentComponentType } from "../model/project-components";
import { badId, conflict, invalid, isUuid, json, noContent, notFound, now, ORIGIN, paged, unknownKeys, type Entry, type Handler } from "./answers";
import { record } from "./audit";
import { seedTime, table } from "./db";
import { guardProject, projectIdFor } from "./projects";
import { currentUserId } from "./session";
import { findUser, fullName } from "./users";

export interface ComponentRow {
  id: string;
  project_id: string;
  type: ContentComponentType;
  name: string;
  description: string;
  content: string;
  lock_version: number;
  updated_by: string;
  inserted_at: string;
  updated_at: string;
}

export const components = table<ComponentRow>("components", () =>
  fixtureProjects.flatMap((p) =>
    p.components.flatMap((c) =>
      isContentComponentType(c.type)
        ? [
            {
              id: apiComponentId(p.id, c.id),
              project_id: projectIdFor(p.id),
              type: c.type,
              name: c.name,
              description: c.description,
              content: componentContent(c),
              lock_version: 1,
              updated_by: "Brandon Jackson",
              inserted_at: seedTime("1 Jun 2026"),
              updated_at: seedTime("3 days ago"),
            },
          ]
        : [],
    ),
  ),
);

export function componentEntry(c: ComponentRow) {
  return {
    type: "components",
    id: c.id,
    attributes: {
      component_type: c.type,
      name: c.name,
      description: c.description,
      content: c.content,
      lock_version: c.lock_version,
      updated_by: c.updated_by,
      inserted_at: c.inserted_at,
      updated_at: c.updated_at,
    },
    links: { self: `${ORIGIN}/api/demo/projects/${c.project_id}/components/${c.id}` },
  };
}

const KEYS = ["component_type", "name", "description", "content", "lock_version"];

export const componentRoutes: Record<string, Handler> = {
  "GET /api/demo/projects/:project_id/components": ({ project_id }, _body, query) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    const type = query.get("component_type");
    const rows = components
      .rows()
      .filter((c) => c.project_id === p.id && (!type || c.type === type))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(componentEntry);
    return json(200, paged(`/api/demo/projects/${p.id}/components`, rows, query));
  },

  "GET /api/demo/projects/:project_id/components/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const c = components.rows().find((r) => r.id === id && r.project_id === p.id);
    return c ? json(200, { data: componentEntry(c) }) : notFound();
  },

  // Makes it, or changes its name, description or content.
  "PUT /api/demo/projects/:project_id/components/:id": ({ project_id, id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const existing = components.rows().find((r) => r.id === id);
    if (existing && existing.project_id !== p.id) return conflict("id_taken", "That id belongs to a component in another project.");
    const errors: Entry[] = unknownKeys(body, KEYS);

    const type = (body["component_type"] ?? existing?.type) as ContentComponentType | undefined;
    if (!type) errors.push({ code: "required", detail: "can't be blank", pointer: "#/component_type" });
    else if (!contentComponentTypes.includes(type)) errors.push({ code: "inclusion", detail: `must be one of ${contentComponentTypes.join(", ")}`, pointer: "#/component_type" });
    else if (existing && type !== existing.type) errors.push({ code: "immutable", detail: "can't be changed", pointer: "#/component_type" });

    const name = typeof body["name"] === "string" ? body["name"].trim() : (existing?.name ?? "");
    if (!name) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
    else if (components.rows().some((c) => c.project_id === p.id && c.id !== id && c.type === type && c.name.toLowerCase() === name.toLowerCase()))
      errors.push({ code: "taken", detail: "has already been taken", pointer: "#/name" });

    if (body["description"] !== undefined && typeof body["description"] !== "string") errors.push({ code: "type", detail: "must be a string", pointer: "#/description" });
    const content = body["content"] ?? existing?.content ?? "";
    if (typeof content !== "string") errors.push({ code: "type", detail: "must be a string", pointer: "#/content" });
    else if (type && contentComponentTypes.includes(type) && isJsonContent(type)) {
      try {
        JSON.parse(content || "null");
      } catch {
        errors.push({ code: "format", detail: "isn't valid JSON", pointer: "#/content" });
      }
    }
    if (errors.length) return invalid(errors);
    if (existing && typeof body["lock_version"] === "number" && body["lock_version"] !== existing.lock_version) {
      return conflict("concurrent_edit", "Someone else changed this component. Fetch it again and retry.");
    }

    const at = now();
    const me = findUser(currentUserId());
    const row: ComponentRow = {
      id: id!,
      project_id: p.id,
      type: type!,
      name,
      description: typeof body["description"] === "string" ? body["description"].trim() : (existing?.description ?? ""),
      content: content as string,
      lock_version: (existing?.lock_version ?? 0) + 1,
      updated_by: me ? fullName(me) : "Someone",
      inserted_at: existing?.inserted_at ?? at,
      updated_at: at,
    };
    if (existing) components.update((c) => c.id === id, () => row);
    else components.insert(row);
    const before = existing && existing.name !== name ? { name: existing.name } : undefined;
    record(existing ? "updated" : "created", { type: "component", id: row.id, name }, existing ? (before ? { before, after: { name } } : {}) : { after: { name } }, true);
    return json(existing ? 200 : 201, { data: componentEntry(row) });
  },

  "DELETE /api/demo/projects/:project_id/components/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const c = components.rows().find((r) => r.id === id && r.project_id === p.id);
    if (!c) return notFound();
    components.remove((r) => r.id === id);
    record("deleted", { type: "component", id: c.id, name: c.name }, {}, true);
    return noContent();
  },
};
