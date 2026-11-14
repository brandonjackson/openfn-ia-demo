/**
 * The organisation's connected systems and who has access to each, on the
 * pretend server. Lightning's API has no connected systems (they're the
 * demo's), so these routes live under `/api/demo/` and follow
 * api/conventions.md: UUIDs, JSON:API entries, one 422 listing every
 * problem with a body.
 *
 * Lifecycle:
 * - `PUT /api/demo/connected_systems/:id` adds a system (201) or changes it
 *   (200). Its name is unique in the organisation; its URLs (each
 *   environment's, its API docs and its OpenAPI spec) are http(s).
 * - Adding one from the X-Road directory gives it an X-Road connection whose
 *   status starts at "discovered": terms are agreed later.
 * - `DELETE` removes it, with every access grant to it.
 * - Revoking a grant removes that one person's or project's access.
 * - The adaptors a system can use (`GET /api/demo/adaptors`), the catalog
 *   they're picked from, sorted into categories (`GET
 *   /api/demo/adaptor_catalog`, which "Add a step" and "Connect a system"
 *   share), and the
 *   systems it might connect next (`GET /api/demo/connected_systems/suggestions`,
 *   leaving out any it already has by that name) are read only, as are the
 *   channels each system offers to workflows (`GET
 *   /api/demo/connected_systems/channels`: read from it, write to it, or
 *   start one on its events), which leave with their system.
 * Anyone in the organisation reads them; the demo's people may change them.
 */
import { connectedSystems, recommendedSystems, systemAccessGrants } from "../fixtures/connected-systems";
import { adaptors } from "../fixtures/adaptors";
import { adaptorCatalog, aiActions, aiModels, builtInTools, catalogCategories } from "../fixtures/adaptor-catalog";
import { serviceCatalogData } from "../fixtures/service-catalog";
import { apiSystemId, seedId } from "../fixtures/ids";
import type { ConnectedSystem, AccessGrant } from "../model/connected-systems";
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
const SYSTEM_KEYS = ["name", "description", "adaptor", "credentialType", "hasAccess", "color", "owner", "ownerType", "environments", "apiDocsUrl", "openApiSpecUrl", "linkTo", "connection"];

export const systemRoutes: Record<string, Handler> = {
  // Every adaptor a system can be connected with, named by its package.
  "GET /api/demo/adaptors": (_params, _body, query) => {
    const rows = adaptors.map((a) => ({ type: "adaptors", id: a.id, attributes: { name: a.name, description: a.description, category: a.category } }));
    return json(200, paged("/api/demo/adaptors", rows, query));
  },
  // Every adaptor, sorted into the categories "Add a step" and "Connect a system" show, with the built-in tools and the AI tab's actions.
  "GET /api/demo/adaptor_catalog": () =>
    json(200, {
      data: {
        type: "adaptor_catalogs",
        id: "adaptor-catalog",
        attributes: { adaptors: adaptorCatalog, categories: catalogCategories, built_in_tools: builtInTools, ai_models: aiModels, ai_actions: aiActions },
      },
    }),
  // What each connected system offers to workflows, filed under who offers it.
  "GET /api/demo/connected_systems/channels": (_params, _body, query) => {
    const rows = serviceCatalogData.entries.flatMap((e) => {
      if (e.kind !== "channel") return [];
      const systemId = apiSystemId(e.systemPath.split("/").pop()!);
      if (!systems.rows().some((s) => s.id === systemId)) return [];
      return [
        {
          type: "system_channels",
          id: seedId("system_channel", e.id),
          attributes: { name: e.name, description: e.description, channel_type: e.channelType, section: e.section },
          relationships: { connected_system: { data: { type: "connected_systems", id: systemId } } },
        },
      ];
    });
    return json(200, paged("/api/demo/connected_systems/channels", rows, query));
  },
  // Systems the organisation might connect next: the suggestions it hasn't connected yet, by name.
  "GET /api/demo/connected_systems/suggestions": (_params, _body, query) => {
    const taken = new Set(systems.rows().map((s) => s.name.toLowerCase()));
    const rows = recommendedSystems
      .filter((r) => !taken.has(r.name.toLowerCase()))
      .map((r) => ({ type: "system_suggestions", id: seedId("system_suggestion", r.name), attributes: { name: r.name, description: r.description, adaptor: r.adaptor ?? null } }));
    return json(200, paged("/api/demo/connected_systems/suggestions", rows, query));
  },
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
    for (const key of ["apiDocsUrl", "openApiSpecUrl"]) {
      const url = body[key];
      if (typeof url === "string" && url && !URL_RE.test(url)) errors.push({ code: "format", detail: "must be an http or https URL", pointer: `#/${key}` });
    }
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
    const rows = grants
      .rows()
      .filter((g) => g.system_id === id)
      .map((g) => ({
        type: "access_grants",
        id: g.id,
        attributes: { granted_to: g.grantedTo, granted_to_type: g.grantedToType, scope: g.scope, last_accessed: g.lastAccessed },
        relationships: { connected_system: { data: { type: "connected_systems", id } } },
      }));
    return json(200, paged(`/api/demo/connected_systems/${id}/access_grants`, rows, query));
  },
  "DELETE /api/demo/connected_systems/:id/access_grants/:grant_id": ({ id, grant_id }) => {
    const g = grants.rows().find((r) => r.id === grant_id && r.system_id === id);
    if (!g) return notFound();
    grants.remove((r) => r.id === grant_id);
    record("access_revoked", { type: "connected_system", id: id!, name: systems.rows().find((s) => s.id === id)?.name }, { before: { [g.grantedTo]: g.scope } }, true);
    return noContent();
  },
};
