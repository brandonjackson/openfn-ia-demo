/**
 * The audit trail on the pretend server (api/audit-events.md): every write
 * that Lightning audits records an event here, seeded with the admin
 * fixtures' history. Events are never changed or deleted.
 */
import { auditEvents as fixtureEvents, instanceUsers } from "../fixtures/admin";
import { forbidden, json, now, ORIGIN, paged, type Handler } from "./answers";
import { seedTime, table } from "./db";
import { newId, seedId } from "../fixtures/ids";
import { currentUserId } from "./session";
import { findUser, fullName, userIdFor } from "./users";

export interface AuditRow {
  id: string;
  event: string;
  item_type: string;
  item_id: string;
  actor_type: "user" | "service_account" | "trigger" | "project_repo_connection" | "system";
  actor_id: string | null;
  /** Lightning sends `{identifier, label}`; the label is the person's name or the system's. */
  actor_display: { identifier: string | null; label: string };
  /** Only the fields that changed; a `created` has no `before`. */
  changes: { before?: Record<string, unknown>; after?: Record<string, unknown> };
  /** The item's name when it happened, so the trail still reads after a rename or a delete. */
  metadata: { item_name?: string };
  inserted_at: string;
}

export const audit = table<AuditRow>("audit_events", () =>
  fixtureEvents.map((e) => {
    const person = e.actor.identifier ? findUserByEmailInFixtures(e.actor.identifier) : undefined;
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};
    for (const c of e.changes) {
      if (c.before !== undefined) before[c.field] = c.before;
      if (c.after !== undefined) after[c.field] = c.after;
    }
    return {
      id: seedId("audit", e.id),
      event: e.event,
      item_type: e.itemType,
      item_id: seedId(e.itemType, e.item.id),
      actor_type: person ? "user" : "system",
      actor_id: person ?? null,
      actor_display: { identifier: e.actor.identifier ?? null, label: e.actor.label },
      changes: { ...(Object.keys(before).length && { before }), ...(Object.keys(after).length && { after }) },
      metadata: { item_name: e.item.name },
      inserted_at: seedTime(e.occurredAt.replace(",", "")),
    } satisfies AuditRow;
  }),
);

// A fixture actor's user id, found by email in the same fixtures the users table is seeded from.
function findUserByEmailInFixtures(email: string): string | undefined {
  const user = instanceUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return user && userIdFor(user.id);
}

/**
 * Records that the signed-in person did something. `changes` holds only the
 * fields that changed; pass nothing when nothing did, and no event is written
 * (a repeated PUT writes no second event, api/conventions.md).
 */
export function record(event: string, item: { type: string; id: string; name?: string }, changes: AuditRow["changes"] = {}, force = false) {
  const changed = changes.after && Object.keys(changes.after).length > 0;
  if (!changed && !force && event === "updated") return;
  const me = findUser(currentUserId());
  audit.write([
    {
      id: newId(),
      event,
      item_type: item.type,
      item_id: item.id,
      actor_type: "user",
      actor_id: me?.id ?? null,
      actor_display: { identifier: me?.email ?? null, label: me ? fullName(me) : "Unknown" },
      changes,
      metadata: { item_name: item.name },
      inserted_at: now(),
    },
    ...audit.rows(),
  ]);
}

/** The before and after of the fields that differ between two records. */
export function diff(before: Record<string, unknown>, after: Record<string, unknown>): AuditRow["changes"] {
  const b: Record<string, unknown> = {};
  const a: Record<string, unknown> = {};
  for (const key of Object.keys(after)) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      b[key] = before[key];
      a[key] = after[key];
    }
  }
  return Object.keys(a).length ? { before: b, after: a } : {};
}

/** An audit event as GET /api/audit_events answers it. */
export const auditEntry = (e: AuditRow) => ({
  type: "audit_events",
  id: e.id,
  attributes: {
    event: e.event,
    item_type: e.item_type,
    item_id: e.item_id,
    actor_type: e.actor_type,
    actor_id: e.actor_id,
    actor_display: e.actor_display,
    changes: e.changes,
    metadata: e.metadata,
    inserted_at: e.inserted_at,
  },
  relationships: {},
  links: { self: `${ORIGIN}/api/audit_events/${e.id}` },
});

const isSuperuser = () => findUser(currentUserId())?.role === "superuser";

/** GET /api/audit_events (Private): a superuser's, newest first, paged, with its filters. */
export const auditRoutes: Record<string, Handler> = {
  "GET /api/audit_events": (_params, _body, query) => {
    if (!isSuperuser()) return forbidden();
    const filters: [string, (e: AuditRow, v: string) => boolean][] = [
      ["item_type", (e, v) => e.item_type === v],
      ["item_id", (e, v) => e.item_id === v],
      ["actor_id", (e, v) => e.actor_id === v],
      ["event", (e, v) => e.event === v],
      ["inserted_after", (e, v) => e.inserted_at > v],
      ["inserted_before", (e, v) => e.inserted_at < v],
    ];
    const rows = audit
      .rows()
      .filter((e) => filters.every(([key, test]) => !query.get(key) || test(e, query.get(key)!)))
      .sort((a, b) => b.inserted_at.localeCompare(a.inserted_at))
      .map(auditEntry);
    return json(200, paged("/api/audit_events", rows, query));
  },
};
