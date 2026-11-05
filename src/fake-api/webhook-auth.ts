/**
 * Webhook auth methods on the pretend server (api/webhooks.md). A method
 * belongs to a project and guards the webhook triggers (and channels) that
 * name it.
 *
 * Lifecycle, as the API has it:
 * - `PUT …/webhook_auth_methods/:id` makes one (201) or renames it (200).
 *   Its name is unique in the project; its type, and a basic method's
 *   username, never change. For an API key method Lightning makes the key,
 *   and the 201 is the only answer that carries all of it.
 * - Which triggers it guards is set on the workflow: each trigger's
 *   `webhook_auth_method_ids`.
 * - `DELETE` schedules it: it leaves the list and is taken off every trigger
 *   and channel at once.
 * - Owners and admins manage them; any member can list them.
 */
import { authMethods as fixtureMethods } from "../fixtures/project-settings";
import { projects as fixtureProjects } from "../fixtures/projects";
import { seedId } from "../fixtures/ids";
import { badId, conflict, invalid, isUuid, json, noContent, notFound, now, ORIGIN, paged, unknownKeys, type Handler } from "./answers";
import { record } from "./audit";
import { seedTime, table } from "./db";
import { guardProject, projectIdFor } from "./projects";
import { workflows } from "./workflows";

export interface WebhookAuthRow {
  id: string;
  project_id: string;
  name: string;
  auth_type: "basic" | "api";
  username: string | null;
  /** The key or password. Never sent back, but for a new key's one 201. */
  secret: string;
  scheduled_deletion: string | null;
  inserted_at: string;
  updated_at: string;
}

/** A fixture method's id on the API. */
export const webhookAuthIdFor = (fixtureId: string) => seedId("webhook_auth_method", fixtureId);

export const webhookAuthMethods = table<WebhookAuthRow>("webhook_auth_methods", () =>
  fixtureProjects.flatMap((p) =>
    (fixtureMethods[p.id] ?? []).map((m) => ({
      id: webhookAuthIdFor(m.id),
      project_id: projectIdFor(p.id),
      name: m.name,
      auth_type: m.type,
      username: m.username ?? null,
      // The fixtures only know the masked key; keep its last characters.
      secret: m.maskedSecret.replace(/•/g, "0"),
      scheduled_deletion: null,
      inserted_at: seedTime("1 Jun 2026"),
      updated_at: seedTime("1 Jun 2026"),
    })),
  ),
);

/** A new API key, like Lightning's: 32 random bytes as hex. */
function generateKey(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** The triggers in the method's project that name it, with their workflows. */
const triggersGuardedBy = (id: string) => {
  const projectId = webhookAuthMethods.rows().find((m) => m.id === id)?.project_id;
  return workflows
    .rows()
    .filter((w) => !w.deleted_at && w.project_id === projectId)
    .flatMap((w) => w.triggers.filter((t) => t.webhook_auth_method_ids?.includes(id)).map((t) => ({ id: t.id, workflow_id: w.id })));
};

export function webhookAuthEntry(m: WebhookAuthRow, { withKey = false } = {}) {
  return {
    type: "webhook_auth_methods",
    id: m.id,
    attributes: {
      name: m.name,
      auth_type: m.auth_type,
      username: m.username,
      ...(m.auth_type === "api" && { api_key_last_characters: m.secret.slice(-5) }),
      ...(withKey && { api_key: m.secret }),
      triggers: triggersGuardedBy(m.id),
      inserted_at: m.inserted_at,
      updated_at: m.updated_at,
    },
    relationships: {},
    links: { self: `${ORIGIN}/api/projects/${m.project_id}/webhook_auth_methods/${m.id}` },
  };
}

/** Takes a method off every trigger that names it; channels do the same when they move to the API. */
const detachListeners: ((id: string) => void)[] = [];
export const onWebhookAuthDeleted = (listener: (id: string) => void) => void detachListeners.push(listener);

const live = (projectId: string) => webhookAuthMethods.rows().filter((m) => m.project_id === projectId && !m.scheduled_deletion);

export const webhookAuthRoutes: Record<string, Handler> = {
  "GET /api/projects/:project_id/webhook_auth_methods": ({ project_id }, _body, query) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    const rows = live(p.id)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((m) => webhookAuthEntry(m));
    return json(200, paged(`/api/projects/${p.id}/webhook_auth_methods`, rows, query));
  },

  "GET /api/projects/:project_id/webhook_auth_methods/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!, "admin");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const m = live(p.id).find((r) => r.id === id);
    return m ? json(200, { data: webhookAuthEntry(m) }) : notFound();
  },

  "PUT /api/projects/:project_id/webhook_auth_methods/:id": ({ project_id, id }, body) => {
    const p = guardProject(project_id!, "admin");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const existing = webhookAuthMethods.rows().find((r) => r.id === id);
    if (existing?.scheduled_deletion) return conflict("scheduled_for_deletion", "This webhook auth method is scheduled for deletion.");
    const errors = unknownKeys(body, ["name", "auth_type", "username", "password"]);
    const name = typeof body["name"] === "string" ? body["name"].trim() : "";
    if (!name) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
    else if (live(p.id).some((m) => m.id !== id && m.name.toLowerCase() === name.toLowerCase())) errors.push({ code: "taken", detail: "has already been taken", pointer: "#/name" });
    if (existing) {
      if (body["auth_type"] !== undefined && body["auth_type"] !== existing.auth_type) errors.push({ code: "not_allowed", detail: "can't be changed", pointer: "#/auth_type" });
      if (body["username"] !== undefined && body["username"] !== existing.username) errors.push({ code: "not_allowed", detail: "can't be changed", pointer: "#/username" });
    } else {
      const type = body["auth_type"];
      if (type !== "basic" && type !== "api") errors.push({ code: "required", detail: "must be basic or api", pointer: "#/auth_type" });
      if (type === "basic") {
        if (typeof body["username"] !== "string" || !body["username"].trim()) errors.push({ code: "required", detail: "can't be blank", pointer: "#/username" });
        const pw = body["password"];
        if (typeof pw !== "string" || !pw) errors.push({ code: "required", detail: "can't be blank", pointer: "#/password" });
        else if (pw.length < 8) errors.push({ code: "too_short", detail: "should be at least 8 character(s)", pointer: "#/password" });
        else if (pw.length > 72) errors.push({ code: "too_long", detail: "should be at most 72 character(s)", pointer: "#/password" });
      }
    }
    if (errors.length) return invalid(errors);

    if (existing) {
      const password = typeof body["password"] === "string" && body["password"] ? body["password"] : existing.secret;
      if (existing.name !== name || password !== existing.secret) {
        webhookAuthMethods.update((r) => r.id === id, (r) => ({ ...r, name, secret: password, updated_at: now() }));
        record("updated", { type: "webhook_auth_method", id: id!, name }, existing.name !== name ? { before: { name: existing.name }, after: { name } } : {}, true);
      }
      return json(200, { data: webhookAuthEntry(webhookAuthMethods.rows().find((r) => r.id === id)!) });
    }
    const at = now();
    const created: WebhookAuthRow = {
      id: id!,
      project_id: p.id,
      name,
      auth_type: body["auth_type"] as "basic" | "api",
      username: body["auth_type"] === "basic" ? (body["username"] as string).trim() : null,
      secret: body["auth_type"] === "api" ? generateKey() : (body["password"] as string),
      scheduled_deletion: null,
      inserted_at: at,
      updated_at: at,
    };
    webhookAuthMethods.insert(created);
    record("created", { type: "webhook_auth_method", id: created.id, name }, { after: { name, auth_type: created.auth_type } });
    // The whole key, this once.
    return json(201, { data: webhookAuthEntry(created, { withKey: created.auth_type === "api" }) });
  },

  // Schedules it, and takes it off every trigger and channel at once.
  "DELETE /api/projects/:project_id/webhook_auth_methods/:id": ({ project_id, id }) => {
    const p = guardProject(project_id!, "admin");
    if (p instanceof Response) return p;
    if (!isUuid(id)) return badId("id");
    const m = webhookAuthMethods.rows().find((r) => r.id === id && r.project_id === p.id);
    if (!m) return notFound();
    if (m.scheduled_deletion) return conflict("scheduled_for_deletion", "This webhook auth method is already scheduled for deletion.");
    const guarded = triggersGuardedBy(m.id);
    webhookAuthMethods.update((r) => r.id === id, (r) => ({ ...r, scheduled_deletion: now() }));
    workflows.update(
      (w) => w.triggers.some((t) => t.webhook_auth_method_ids?.includes(m.id)),
      (w) => ({ ...w, triggers: w.triggers.map((t) => ({ ...t, webhook_auth_method_ids: (t.webhook_auth_method_ids ?? []).filter((x) => x !== m.id) })) }),
    );
    for (const listener of detachListeners) listener(m.id);
    record("deleted", { type: "webhook_auth_method", id: m.id, name: m.name }, {}, true);
    for (const t of guarded) record("removed_from_trigger", { type: "webhook_auth_method", id: m.id, name: m.name }, { before: { trigger_id: t.id } }, true);
    return noContent();
  },
};
