/**
 * A project's environment variables on the pretend server. Lightning's API
 * has none, so they live under `/api/demo/` and follow api/conventions.md.
 *
 * Lifecycle:
 * - `GET /api/demo/projects/:project_id/env_vars` lists them, by key, for
 *   any member. A secret's `value` is always null: it's stored, never sent.
 * - `POST` makes one (201): a `key` of letters, digits and underscores, not
 *   starting with a digit; a `value`; `environments`, one or more of
 *   production, staging and mock; and whether it's `secret`. A key can be set
 *   once in each environment, so the same key can hold another value
 *   elsewhere: setting it twice in one is 422 `taken` on the key.
 * - `PATCH .../:id` changes its key, value or environments, under the same
 *   rules. A secret's blank or missing value keeps the stored one; a plain
 *   variable can be made secret, but a secret can't be made plain again.
 * - `DELETE .../:id` removes it (204).
 * - Editors and up make, change and delete them. Each change is in the
 *   audit trail, without its value.
 * - Every project has its own, sandboxes included: making a sandbox copies
 *   its parent's (secrets' stored values too), runs there use the sandbox's
 *   values for its environment, and a merge brings its new and changed ones
 *   back (sandboxes.ts).
 */
import { envVarsByProject, seededSecretValues } from "../fixtures/env-vars";
import { seedId } from "../fixtures/ids";
import { ENVIRONMENTS, type Environment } from "../model/credentials";
import { listEnvironments } from "../model/env-vars";
import { badId, invalid, isUuid, json, maxLength, noContent, notFound, now, ORIGIN, paged, unknownKeys, type Body, type Entry, type Handler } from "./answers";
import { record } from "./audit";
import { seedTime, table } from "./db";
import { guardProject, projectIdFor } from "./projects";
import { withSandboxCopies } from "./sandbox-copies";
import { currentUserId } from "./session";
import { findUser, fullName } from "./users";

export interface EnvVarRow {
  id: string;
  project_id: string;
  key: string;
  value: string;
  secret: boolean;
  environments: Environment[];
  updated_by: string;
  inserted_at: string;
  updated_at: string;
  /** In a sandbox, the parent's variable it was copied from, which a merge changes; null for one made here. */
  copied_from?: string | null;
}

/** A sandbox's copy of a variable, value and all, remembering where it came from. */
export const copyEnvVar = (v: EnvVarRow, sandboxId: string): EnvVarRow => ({
  ...v,
  id: seedId("env_var", `${sandboxId}/${v.id}`),
  project_id: sandboxId,
  copied_from: v.id,
});

/** Every project's envVars, as the fixtures have them, before the sandboxes' copies. */
const envVarsSeed = (): EnvVarRow[] =>
  Object.entries(envVarsByProject).flatMap(([slug, vars]) =>
    vars.map((v) => ({
      id: seedId("env_var", `${slug}/${v.id}`),
      project_id: projectIdFor(slug),
      key: v.key,
      value: v.value ?? seededSecretValues[v.id] ?? "",
      secret: v.secret,
      environments: v.environments,
      updated_by: v.updatedBy,
      inserted_at: seedTime("3 months ago"),
      updated_at: seedTime(v.updatedAt),
    })),
  );

export const envVars = table<EnvVarRow>("env_vars", () => withSandboxCopies(envVarsSeed(), copyEnvVar));

const entry = (v: EnvVarRow) => ({
  type: "env_vars",
  id: v.id,
  attributes: {
    key: v.key,
    value: v.secret ? null : v.value,
    secret: v.secret,
    environments: v.environments,
    updated_by: v.updated_by,
    inserted_at: v.inserted_at,
    updated_at: v.updated_at,
  },
  links: { self: `${ORIGIN}/api/demo/projects/${v.project_id}/env_vars/${v.id}` },
});

const KEYS = ["key", "value", "secret", "environments"];
const KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** The row a body makes of `existing` (or of nothing), and what's wrong with it. */
function checked(projectId: string, body: Body, existing?: EnvVarRow): { errors: Entry[]; key: string; value: string; secret: boolean; environments: Environment[] } {
  const errors = unknownKeys(body, KEYS);

  const key = typeof body["key"] === "string" ? body["key"].trim() : (existing?.key ?? "");
  if (body["key"] !== undefined && typeof body["key"] !== "string") errors.push({ code: "type", detail: "must be a string", pointer: "#/key" });
  else if (!key) errors.push({ code: "required", detail: "can't be blank", pointer: "#/key" });
  else if (!KEY.test(key)) errors.push({ code: "format", detail: "must be letters, digits and underscores, not starting with a digit", pointer: "#/key" });
  maxLength(key, 256, "#/key", errors);

  if (body["secret"] !== undefined && typeof body["secret"] !== "boolean") errors.push({ code: "type", detail: "must be a boolean", pointer: "#/secret" });
  const secret = typeof body["secret"] === "boolean" ? body["secret"] : (existing?.secret ?? false);
  if (existing?.secret && !secret) errors.push({ code: "immutable", detail: "a secret can't be made plain again", pointer: "#/secret" });

  if (body["value"] !== undefined && typeof body["value"] !== "string") errors.push({ code: "type", detail: "must be a string", pointer: "#/value" });
  const sent = typeof body["value"] === "string" ? body["value"] : undefined;
  // A secret's blank value keeps the stored one; anything else is replaced.
  const value = sent === undefined || (existing?.secret && sent === "") ? (existing?.value ?? "") : sent;
  if (!existing && !value) errors.push({ code: "required", detail: "can't be blank", pointer: "#/value" });
  maxLength(value, 65_536, "#/value", errors);

  const raw = body["environments"] ?? existing?.environments;
  const environments = Array.isArray(raw) ? [...new Set(raw)] : [];
  if (!Array.isArray(raw) || environments.length === 0) errors.push({ code: "required", detail: "must name at least one environment", pointer: "#/environments" });
  else if (environments.some((e) => !ENVIRONMENTS.includes(e as Environment)))
    errors.push({ code: "inclusion", detail: `must each be one of ${ENVIRONMENTS.join(", ")}`, pointer: "#/environments" });

  const clash = envVars
    .rows()
    .filter((v) => v.project_id === projectId && v.id !== existing?.id && v.key === key)
    .flatMap((v) => v.environments.filter((e) => environments.includes(e)));
  if (key && clash.length) errors.push({ code: "taken", detail: `is already set in ${listEnvironments(clash)}`, pointer: "#/key" });

  return { errors, key, value, secret, environments: ENVIRONMENTS.filter((e) => environments.includes(e)) };
}

const by = () => {
  const me = findUser(currentUserId());
  return me ? fullName(me) : "Someone";
};

export const envVarRoutes: Record<string, Handler> = {
  "GET /api/demo/projects/:project_id/env_vars": ({ project_id }, _body, query) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    const rows = envVars
      .rows()
      .filter((v) => v.project_id === p.id)
      .sort((a, b) => a.key.localeCompare(b.key) || ENVIRONMENTS.indexOf(a.environments[0]!) - ENVIRONMENTS.indexOf(b.environments[0]!))
      .map(entry);
    return json(200, paged(`/api/demo/projects/${p.id}/env_vars`, rows, query));
  },

  "POST /api/demo/projects/:project_id/env_vars": ({ project_id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    const { errors, ...v } = checked(p.id, body);
    if (errors.length) return invalid(errors);
    const at = now();
    const row: EnvVarRow = { id: crypto.randomUUID(), project_id: p.id, ...v, updated_by: by(), inserted_at: at, updated_at: at };
    envVars.insert(row);
    record("created", { type: "env_var", id: row.id, name: row.key }, { after: { key: row.key, environments: row.environments.join(", ") } }, true);
    return json(201, { data: entry(row) });
  },

  "PATCH /api/demo/projects/:project_id/env_vars/:id": ({ project_id, id }, body) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const existing = envVars.rows().find((v) => v.id === id && v.project_id === p.id);
    if (!existing) return notFound();
    const { errors, ...v } = checked(p.id, body, existing);
    if (errors.length) return invalid(errors);
    const row: EnvVarRow = { ...existing, ...v, updated_by: by(), updated_at: now() };
    envVars.update((r) => r.id === id, () => row);
    record("updated", { type: "env_var", id: row.id, name: row.key }, existing.key !== row.key ? { before: { key: existing.key }, after: { key: row.key } } : {}, true);
    return json(200, { data: entry(row) });
  },

  "DELETE /api/demo/projects/:project_id/env_vars/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!, "editor");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const v = envVars.rows().find((r) => r.id === id && r.project_id === p.id);
    if (!v) return notFound();
    envVars.remove((r) => r.id === id);
    record("deleted", { type: "env_var", id: v.id, name: v.key }, {}, true);
    return noContent();
  },
};
