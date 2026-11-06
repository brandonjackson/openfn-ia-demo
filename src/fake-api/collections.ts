/**
 * Collections and their items on the pretend server (api/collections.md).
 *
 * Lifecycle, as the API has it:
 * - A collection belongs to one project. `PUT …/collections/:id` makes it
 *   (201) or renames it (200), keeping its items. Its name is unique in the
 *   project: lowercase letters and digits, joined by `-`, `_` or `.`. An id
 *   held by another project's collection is a 409 `id_taken`.
 * - `DELETE` removes it and every item in it.
 * - Items live under `/collections/:name`, by key. Those routes answer 404,
 *   not 403, for what you can't see, and 409 `ambiguous_name` when two of
 *   your projects have a collection of that name.
 * - Owners and admins manage collections; any member reads items; editors
 *   and up write them.
 */
import { collectionItems as settingsItems, projectCollections } from "../fixtures/project-settings";
import { componentCollectionItems } from "../fixtures/project-components";
import { instanceCollections } from "../fixtures/admin";
import { projects as fixtureProjects } from "../fixtures/projects";
import { seedId } from "../fixtures/ids";
import { badId, conflict, forbidden, invalid, isUuid, json, noContent, notFound, now, paged, problem, unknownKeys, type Handler } from "./answers";
import { record } from "./audit";
import { seedTime, table } from "./db";
import { findProject, guardProject, projectIdFor, roleIn } from "./projects";
import { currentUserId } from "./session";
import { findUser } from "./users";

export interface CollectionRow {
  id: string;
  project_id: string;
  name: string;
  inserted_at: string;
  updated_at: string;
  /** How many items the fixtures say it holds beyond the sample items seeded below. */
  unseeded_count: number;
  /** Their size, in bytes. */
  unseeded_bytes: number;
}

export interface ItemRow {
  collection_id: string;
  key: string;
  value: string;
  inserted_at: string;
  updated_at: string;
}

const NAME = /^[a-z0-9]+([._-][a-z0-9]+)*$/;

const fixtureItems = { ...settingsItems, ...componentCollectionItems };

/** Every fixture collection, once per project and name: the settings', Admin settings' and the projects' components lists together. */
function fixtureCollections() {
  const rows: { slug: string; projectSlug: string; name: string; count: number; bytes: number; updatedAt: string }[] = [];
  for (const p of fixtureProjects) {
    for (const c of projectCollections(p.id)) rows.push({ slug: c.id, projectSlug: p.id, name: c.name, count: c.itemCount, bytes: c.byteSize, updatedAt: c.updatedAt });
    for (const c of p.components.filter((x) => x.type === "Collection")) {
      if (rows.some((r) => r.projectSlug === p.id && r.name === c.name)) continue;
      const sample = componentCollectionItems[c.id] ?? [];
      rows.push({ slug: c.id, projectSlug: p.id, name: c.name, count: sample.length, bytes: 0, updatedAt: sample[0]?.updatedAt ?? "1 day ago" });
    }
  }
  for (const c of instanceCollections) {
    const project = fixtureProjects.find((p) => p.name === c.projectName);
    if (!project || rows.some((r) => r.projectSlug === project.id && r.name === c.name)) continue;
    rows.push({ slug: c.id, projectSlug: project.id, name: c.name, count: c.items, bytes: c.bytes, updatedAt: "1 day ago" });
  }
  return rows;
}

export const collections = table<CollectionRow>("collections", () =>
  fixtureCollections().map((c) => {
    const sample = fixtureItems[c.slug] ?? [];
    const sampleBytes = sample.reduce((n, i) => n + i.value.length, 0);
    return {
      id: seedId("collection", `${c.projectSlug}/${c.name}`),
      project_id: projectIdFor(c.projectSlug),
      name: c.name,
      inserted_at: seedTime("1 Jan 2026"),
      updated_at: seedTime(c.updatedAt),
      unseeded_count: Math.max(0, c.count - sample.length),
      unseeded_bytes: Math.max(0, c.bytes - sampleBytes),
    };
  }),
);

export const items = table<ItemRow>("collection_items", () =>
  fixtureCollections().flatMap((c) =>
    (fixtureItems[c.slug] ?? []).map((i) => ({
      collection_id: seedId("collection", `${c.projectSlug}/${c.name}`),
      key: i.key,
      value: i.value,
      inserted_at: seedTime(i.updatedAt),
      updated_at: seedTime(i.updatedAt),
    })),
  ),
);

const itemsOf = (id: string) => items.rows().filter((i) => i.collection_id === id);

/** A collection as the API sends it: planned `byte_size_sum`, and the demo's item count and last write. */
export function collectionEntry(c: CollectionRow, withProject = false) {
  const own = itemsOf(c.id);
  const last = own.map((i) => i.updated_at).sort().at(-1);
  return {
    id: c.id,
    project_id: c.project_id,
    name: c.name,
    byte_size_sum: c.unseeded_bytes + own.reduce((n, i) => n + i.key.length + i.value.length, 0),
    item_count: c.unseeded_count + own.length,
    updated_at: last && last > c.updated_at ? last : c.updated_at,
    ...(withProject && { project_name: findProject(c.project_id)?.name ?? null }),
  };
}

const isSuperuser = () => findUser(currentUserId())?.role === "superuser";

export const collectionRoutes: Record<string, Handler> = {
  "GET /api/projects/:project_id/collections": ({ project_id }, _body, query) => {
    const p = guardProject(project_id!, "admin");
    if (p instanceof Response) return p;
    const sort = query.get("sort") ?? "name";
    const field = sort.replace(/^-/, "");
    if (!["name", "byte_size_sum"].includes(field)) {
      return problem({ status: 400, code: "invalid_parameter", errors: [{ code: "invalid", detail: "is not a sort field", parameter: "sort" }] });
    }
    const rows = collections
      .rows()
      .filter((c) => c.project_id === p.id)
      .map((c) => collectionEntry(c))
      .sort((a, b) => (field === "name" ? a.name.localeCompare(b.name) : a.byte_size_sum - b.byte_size_sum));
    if (sort.startsWith("-")) rows.reverse();
    return json(200, paged(`/api/projects/${p.id}/collections`, rows, query));
  },

  // Every collection on the instance, for a superuser, with its project's name.
  "GET /api/collections": (_params, _body, query) => {
    if (!isSuperuser()) return forbidden();
    const rows = collections
      .rows()
      .filter((c) => !findProject(c.project_id)?.scheduled_deletion)
      .map((c) => collectionEntry(c, true))
      .sort((a, b) => a.name.localeCompare(b.name));
    return json(200, paged("/api/collections", rows, query));
  },

  "GET /api/projects/:project_id/collections/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!, "admin");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const c = collections.rows().find((r) => r.id === id && r.project_id === p.id);
    return c ? json(200, { data: collectionEntry(c) }) : notFound();
  },

  // Makes it, or renames it keeping its items.
  "PUT /api/projects/:project_id/collections/:id": ({ project_id, id }, body) => {
    const p = guardProject(project_id!, "admin");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const elsewhere = collections.rows().find((r) => r.id === id && r.project_id !== p.id);
    if (elsewhere) return conflict("id_taken", "That id belongs to a collection in another project.");
    const existing = collections.rows().find((r) => r.id === id);
    const errors = unknownKeys(body, ["id", "name"]);
    const name = body["name"];
    if (typeof name !== "string" || !name) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
    else if (!NAME.test(name)) errors.push({ code: "format", detail: "must be lowercase letters and digits, joined by - _ or .", pointer: "#/name" });
    else if (collections.rows().some((r) => r.project_id === p.id && r.id !== id && r.name === name)) errors.push({ code: "taken", detail: "has already been taken", pointer: "#/name" });
    if (body["id"] !== undefined && body["id"] !== id) errors.push({ code: "mismatch", detail: "does not match the path", pointer: "#/id" });
    if (errors.length) return invalid(errors);
    if (existing) {
      if (existing.name !== name) {
        collections.update((r) => r.id === id, (r) => ({ ...r, name: name as string, updated_at: now() }));
        record("updated", { type: "collection", id: id!, name: name as string }, { before: { name: existing.name }, after: { name } });
      }
      return json(200, { data: collectionEntry(collections.rows().find((r) => r.id === id)!) });
    }
    const at = now();
    const created: CollectionRow = { id: id!, project_id: p.id, name: name as string, inserted_at: at, updated_at: at, unseeded_count: 0, unseeded_bytes: 0 };
    collections.insert(created);
    record("created", { type: "collection", id: id!, name: created.name }, { after: { name: created.name } });
    return json(201, { data: collectionEntry(created) });
  },

  // Removes it and every item in it. Lightning doesn't audit this yet; the route should, so the fake does.
  "DELETE /api/projects/:project_id/collections/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!, "admin", { superuser: true });
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const c = collections.rows().find((r) => r.id === id && r.project_id === p.id);
    if (!c) return notFound();
    collections.remove((r) => r.id === id);
    items.remove((i) => i.collection_id === id);
    record("deleted", { type: "collection", id: id!, name: c.name }, {}, true);
    return noContent();
  },

  /* ---------------- Items, by name ---------------- */

  "GET /collections/:name": ({ name }, _body, query) => {
    const c = byName(name!, query.get("project_id"));
    if (c instanceof Response) return c;
    const known = ["key", "limit", "cursor", "project_id", "created_after", "created_before", "updated_after", "updated_before"];
    const unknown = [...query.keys()].filter((k) => !known.includes(k));
    if (unknown.length) return problem({ status: 400, code: "invalid_parameter", errors: unknown.map((k) => ({ code: "unknown_key", detail: "is not a known parameter", parameter: k })) });
    const pattern = query.get("key");
    const matches = (key: string) => !pattern || new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*")}$`).test(key);
    const limit = Math.min(Number(query.get("limit")) || 1000, 1000);
    const start = Number(atob(query.get("cursor") ?? "") || 0);
    const rows = itemsOf(c.id)
      .filter((i) => matches(i.key))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    const page = rows.slice(start, start + limit);
    return json(200, {
      items: page.map((i) => ({ key: i.key, value: i.value, created: i.inserted_at, updated: i.updated_at })),
      cursor: start + limit < rows.length ? btoa(String(start + limit)) : null,
    });
  },

  "GET /collections/:name/:key": ({ name, key }, _body, query) => {
    const c = byName(name!, query.get("project_id"));
    if (c instanceof Response) return c;
    const item = itemsOf(c.id).find((i) => i.key === key);
    return item ? json(200, { key: item.key, value: item.value, created: item.inserted_at, updated: item.updated_at }) : noContent();
  },

  "PUT /collections/:name/:key": ({ name, key }, body, query) => {
    const c = byName(name!, query.get("project_id"), "editor");
    if (c instanceof Response) return c;
    if (typeof body["value"] !== "string") return invalid([{ code: "required", detail: "must be a string", pointer: "#/value" }]);
    if (body["value"].length > 1_000_000) return invalid([{ code: "too_long", detail: "should be at most 1000000 character(s)", pointer: "#/value" }]);
    const at = now();
    const existing = itemsOf(c.id).find((i) => i.key === key);
    if (existing) items.update((i) => i.collection_id === c.id && i.key === key, (i) => ({ ...i, value: body["value"] as string, updated_at: at }));
    else items.insert({ collection_id: c.id, key: key!, value: body["value"], inserted_at: at, updated_at: at });
    return json(200, { upserted: 1, error: null });
  },

  "DELETE /collections/:name/:key": ({ name, key }, _body, query) => {
    const c = byName(name!, query.get("project_id"), "editor");
    if (c instanceof Response) return c;
    const had = itemsOf(c.id).some((i) => i.key === key);
    items.remove((i) => i.collection_id === c.id && i.key === key);
    return json(200, { key, deleted: had ? 1 : 0 });
  },
};

/** The collection a name means to you: 404 for one you can't see, 409 when two of your projects have it. */
function byName(name: string, projectId: string | null, least: "viewer" | "editor" = "viewer"): CollectionRow | Response {
  if (projectId !== null && !isUuid(projectId)) return notFound();
  const mine = collections.rows().filter((c) => {
    const role = roleIn(c.project_id);
    const p = findProject(c.project_id);
    return c.name === name && !!role && !!p && !p.scheduled_deletion && (!projectId || c.project_id === projectId);
  });
  if (mine.length > 1) return conflict("ambiguous_name", "More than one of your projects has a collection with this name. Add project_id.");
  const c = mine[0];
  if (!c) return notFound();
  if (least === "editor" && roleIn(c.project_id) === "viewer") return notFound();
  return c;
}
