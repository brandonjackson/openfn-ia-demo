/**
 * The organisation's connected systems and who has access to each, on the
 * pretend server. Lightning's API has no connected systems (they're the
 * demo's), so these routes live under `/api/demo/` and follow
 * api/conventions.md: UUIDs, JSON:API entries, one 422 listing every
 * problem with a body.
 *
 * Lifecycle:
 * - `PUT /api/demo/connected_systems/:id` adds a system (201) or changes it
 *   (200). Its name is unique in the organisation; its URLs are http(s).
 * - Adding one from the X-Road directory gives it an X-Road connection whose
 *   status starts at "discovered": terms are agreed later.
 * - `DELETE` removes it, with every access grant to it.
 * - Revoking a grant removes that one person's or project's access.
 * Anyone in the organisation reads them; the demo's people may change them.
 */
import { connectedSystems, systemAccessGrants } from "../fixtures/connected-systems";
import { apiSystemId, seedId } from "../fixtures/ids";
import type { ConnectedSystem } from "../model/connected-systems";
import type { AccessGrant } from "../model/page-data";
import { badId, invalid, isUuid, json, noContent, notFound, now, ORIGIN, paged, unknownKeys, type Entry, type Handler } from "./answers";
import { record } from "./audit";
import { seedTime, table } from "./db";

export interface SystemRow extends Omit<ConnectedSystem, "id"> {
  id: string;
  inserted_at: string;
  updated_at: string;
}

export interface GrantRow extends AccessGrant {
  system_id: string;
}

export const systems = table<SystemRow>("connected_systems", () =>
  connectedSystems.map((s) => ({ ...s, id: apiSystemId(s.id), inserted_at: seedTime("1 Mar 2026"), updated_at: seedTime("1 Mar 2026") })),
);

export const grants = table<GrantRow>("system_access_grants", () =>
  Object.entries(systemAccessGrants).flatMap(([slug, list]) => list.map((g) => ({ ...g, id: seedId("access_grant", g.id), system_id: apiSystemId(slug) }))),
);

const entry = (s: SystemRow) => ({
  type: "connected_systems",
  id: s.id,
  attributes: { ...s, id: undefined, access_grant_count: grants.rows().filter((g) => g.system_id === s.id).length },
  relationships: {},
  links: { self: `${ORIGIN}/api/demo/connected_systems/${s.id}` },
});

const URL_RE = /^https?:\/\/\S+$/;
const SYSTEM_KEYS = ["name", "description", "adaptor", "credentialType", "hasAccess", "color", "owner", "ownerType", "environments", "apiDocsUrl", "linkTo", "connection"];

export const systemRoutes: Record<string, Handler> = {
  "GET /api/demo/connected_systems": (_params, _body, query) => {
    const rows = systems
      .rows()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(entry);
    return json(200, paged("/api/demo/connected_systems", rows, query));
  },
  "GET /api/demo/connected_systems/:id": ({ id }) => {
    if (!isUuid(id)) return badId("id");
    const s = systems.rows().find((r) => r.id === id);
    return s ? json(200, { data: entry(s) }) : notFound();
  },
  "PUT /api/demo/connected_systems/:id": ({ id }, body) => {
    if (!isUuid(id)) return badId("id");
    const existing = systems.rows().find((r) => r.id === id);
    const errors: Entry[] = unknownKeys(body, SYSTEM_KEYS);
    const name = typeof body["name"] === "string" ? body["name"].trim() : existing?.name ?? "";
    if (!name) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
    else if (systems.rows().some((r) => r.id !== id && r.name.toLowerCase() === name.toLowerCase())) errors.push({ code: "taken", detail: "has already been taken", pointer: "#/name" });
    if (typeof body["description"] === "string" && body["description"].length > 240) errors.push({ code: "too_long", detail: "should be at most 240 character(s)", pointer: "#/description" });
    if (!existing && (typeof body["adaptor"] !== "string" || !body["adaptor"])) errors.push({ code: "required", detail: "can't be blank", pointer: "#/adaptor" });
    const docs = body["apiDocsUrl"];
    if (typeof docs === "string" && docs && !URL_RE.test(docs)) errors.push({ code: "format", detail: "must be an http or https URL", pointer: "#/apiDocsUrl" });
    const envs = body["environments"] as SystemRow["environments"] | undefined;
    if (envs) {
      for (const [env, value] of Object.entries(envs)) {
        if (value.url && !URL_RE.test(value.url)) errors.push({ code: "format", detail: "must be an http or https URL", pointer: `#/environments/${env}/url` });
      }
    }
    if (errors.length) return invalid(errors);
    const at = now();
    const blank = { url: "", credential: "" };
    const row: SystemRow = {
      ...(existing ?? {
        id: id!,
        description: "",
        credentialType: "org",
        hasAccess: true,
        color: "gray",
        adaptor: "http",
        owner: "Org",
        ownerType: "org",
        environments: { production: blank, staging: blank, mock: blank },
        inserted_at: at,
      }),
      ...(body as Partial<SystemRow>),
      id: id!,
      name,
      updated_at: at,
    } as SystemRow;
    if (existing) systems.update((r) => r.id === id, () => row);
    else systems.insert(row);
    record(existing ? "updated" : "created", { type: "connected_system", id: id!, name }, existing ? {} : { after: { name } }, true);
    return json(existing ? 200 : 201, { data: entry(row) });
  },
  // Removes it, with everyone's access to it.
  "DELETE /api/demo/connected_systems/:id": ({ id }) => {
    if (!isUuid(id)) return badId("id");
    const s = systems.rows().find((r) => r.id === id);
    if (!s) return notFound();
    systems.remove((r) => r.id === id);
    grants.remove((g) => g.system_id === id);
    record("deleted", { type: "connected_system", id: s.id, name: s.name }, {}, true);
    return noContent();
  },

  "GET /api/demo/connected_systems/:id/access_grants": ({ id }, _body, query) => {
    if (!isUuid(id)) return badId("id");
    if (!systems.rows().some((r) => r.id === id)) return notFound();
    return json(200, paged(`/api/demo/connected_systems/${id}/access_grants`, grants.rows().filter((g) => g.system_id === id), query));
  },
  "DELETE /api/demo/connected_systems/:id/access_grants/:grant_id": ({ id, grant_id }) => {
    const g = grants.rows().find((r) => r.id === grant_id && r.system_id === id);
    if (!g) return notFound();
    grants.remove((r) => r.id === grant_id);
    record("access_revoked", { type: "connected_system", id: id!, name: systems.rows().find((s) => s.id === id)?.name }, { before: { [g.grantedTo]: g.scope } }, true);
    return noContent();
  },
};
