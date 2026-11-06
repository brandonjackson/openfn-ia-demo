/**
 * `/api/users` on the pretend server (api/users.md). Lightning opens these to
 * the service account today; a superuser's own token is planned, and that's
 * who the demo signs in as. Anyone else is refused.
 *
 * Lifecycle: created with a password; updated (never the email, except as the
 * planned superuser edit); `DELETE` schedules deletion, disabling the user at
 * once, and cancelling re-enables them. A superuser can't be scheduled.
 */
import { badId, conflict, forbidden, invalid, isUuid, json, noContent, notFound, now, paged, problem, unknownKeys, type Entry, type Handler } from "./answers";
import { diff, record } from "./audit";
import { newId } from "../fixtures/ids";
import { currentUserId } from "./session";
import { findUser, findUserByEmail, userEntry, users, type UserRow } from "./users";
import { updateSelf } from "./account";

const SELF_KEYS = ["first_name", "last_name", "contact_preference", "email", "password"];

const PURGE_DAYS = 7;
const isSuperuser = () => findUser(currentUserId())?.role === "superuser";
const one = (u: UserRow, status = 200) => json(status, { data: userEntry(u) });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const userRoutes: Record<string, Handler> = {
  "GET /api/users": (_params, _body, query) => {
    if (!isSuperuser()) return forbidden();
    const email = query.get("email");
    if (query.getAll("email").length > 1) {
      return problem({ status: 400, code: "invalid_parameter", errors: [{ code: "invalid", detail: "must be a single email", parameter: "email" }] });
    }
    const q = (query.get("q") ?? "").toLowerCase();
    const rows = users
      .rows()
      .filter((u) => !email || u.email.toLowerCase() === email.toLowerCase())
      .filter((u) => !q || [u.first_name, u.last_name, u.email, u.role].some((t) => t.toLowerCase().includes(q)))
      .sort((a, b) => a.email.localeCompare(b.email))
      .map(userEntry);
    return json(200, paged("/api/users", rows, query));
  },

  "GET /api/users/:id": ({ id }) => {
    if (!isSuperuser()) return forbidden();
    if (!isUuid(id)) return badId("id");
    const u = findUser(id);
    return u ? one(u) : notFound();
  },

  "POST /api/users": (_params, body) => {
    if (!isSuperuser()) return forbidden();
    const errors: Entry[] = unknownKeys(body, ["email", "password", "first_name", "last_name", "role", "confirmed", "support_user", "disabled"]);
    for (const key of ["email", "first_name", "last_name"]) {
      if (typeof body[key] !== "string" || !(body[key] as string).trim()) errors.push({ code: "required", detail: "can't be blank", pointer: `#/${key}` });
    }
    const email = typeof body["email"] === "string" ? body["email"].trim() : "";
    if (email && !EMAIL.test(email)) errors.push({ code: "format", detail: "must be an email address", pointer: "#/email" });
    else if (email && findUserByEmail(email)) errors.push({ code: "taken", detail: "has already been taken", pointer: "#/email" });
    const password = body["password"];
    if (typeof password !== "string" || !password) errors.push({ code: "required", detail: "can't be blank", pointer: "#/password" });
    else if (password.length < 12) errors.push({ code: "too_short", detail: "should be at least 12 character(s)", pointer: "#/password" });
    else if (password.length > 72) errors.push({ code: "too_long", detail: "should be at most 72 character(s)", pointer: "#/password" });
    if (body["role"] !== undefined && !["user", "superuser"].includes(body["role"] as string)) {
      errors.push({ code: "invalid", detail: "must be user or superuser", pointer: "#/role" });
    }
    if (errors.length) return invalid(errors);
    const created: UserRow = {
      id: newId(),
      email,
      first_name: (body["first_name"] as string).trim(),
      last_name: (body["last_name"] as string).trim(),
      role: (body["role"] as UserRow["role"]) ?? "user",
      support_user: body["support_user"] === true,
      disabled: body["disabled"] === true,
      scheduled_deletion: null,
      has_activity_in_projects: false,
      last_login_at: null,
      mfa_enabled: false,
      contact_preference: "critical",
      pending_email: null,
      github_connected: false,
      inserted_at: now(),
    };
    users.insert(created);
    record("created", { type: "user", id: created.id, name: created.email }, { after: { email, first_name: created.first_name, last_name: created.last_name, role: created.role } });
    return one(created, 201);
  },

  // first_name, last_name, role, password; planned: support_user, disabled, and the superuser's email and scheduled_deletion edit.
  "PATCH /api/users/:id": ({ id }, body) => {
    // Planned: a person changes their own name, contact preference, email (once they confirm it) and password.
    if (id === currentUserId() && Object.keys(body).every((k) => SELF_KEYS.includes(k))) return updateSelf(body);
    if (!isSuperuser()) return forbidden();
    if (!isUuid(id)) return badId("id");
    const u = findUser(id);
    if (!u) return notFound();
    const errors = unknownKeys(body, ["first_name", "last_name", "role", "password", "confirmed", "support_user", "disabled", "email"]);
    for (const key of ["first_name", "last_name"]) {
      if (body[key] !== undefined && (typeof body[key] !== "string" || !(body[key] as string).trim())) errors.push({ code: "required", detail: "can't be blank", pointer: `#/${key}` });
    }
    if (body["role"] !== undefined && !["user", "superuser"].includes(body["role"] as string)) errors.push({ code: "invalid", detail: "must be user or superuser", pointer: "#/role" });
    if (body["email"] !== undefined) {
      const email = String(body["email"]).trim();
      if (!EMAIL.test(email)) errors.push({ code: "format", detail: "must be an email address", pointer: "#/email" });
      else if (findUserByEmail(email) && findUserByEmail(email)!.id !== u.id) errors.push({ code: "taken", detail: "has already been taken", pointer: "#/email" });
    }
    if (typeof body["password"] === "string" && body["password"].length < 12) errors.push({ code: "too_short", detail: "should be at least 12 character(s)", pointer: "#/password" });
    if (u.id === currentUserId() && (body["role"] !== undefined || body["disabled"] !== undefined || body["support_user"] !== undefined)) {
      if ((body["role"] ?? u.role) !== u.role || (body["disabled"] ?? u.disabled) !== u.disabled || (body["support_user"] ?? u.support_user) !== u.support_user) {
        errors.push({ code: "not_allowed", detail: "you can't change your own role or access", pointer: "#/role" });
      }
    }
    if (errors.length) return invalid(errors);
    const next: UserRow = {
      ...u,
      ...(typeof body["first_name"] === "string" && { first_name: body["first_name"].trim() }),
      ...(typeof body["last_name"] === "string" && { last_name: body["last_name"].trim() }),
      ...(typeof body["email"] === "string" && { email: body["email"].trim() }),
      ...(body["role"] !== undefined && { role: body["role"] as UserRow["role"] }),
      ...(typeof body["support_user"] === "boolean" && { support_user: body["support_user"] }),
      ...(typeof body["disabled"] === "boolean" && { disabled: body["disabled"] }),
    };
    const changes = diff(u as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>);
    users.update((r) => r.id === u.id, () => next);
    if (changes.after) record("updated", { type: "user", id: u.id, name: next.email }, changes);
    return one(next);
  },

  // Schedules deletion: disabled at once, removed after the retention period unless they have activity.
  "DELETE /api/users/:id": ({ id }) => {
    if (!isSuperuser()) return forbidden();
    if (!isUuid(id)) return badId("id");
    const u = findUser(id);
    if (!u) return notFound();
    if (u.scheduled_deletion) return conflict("scheduled_for_deletion", "This user is already scheduled for deletion.");
    if (u.role === "superuser" || u.id === currentUserId()) {
      return invalid([{ code: "not_allowed", detail: "superusers and your own account can't be deleted", path: "id" }]);
    }
    const when = new Date(Date.now() + PURGE_DAYS * 86_400_000).toISOString().replace(/\.\d+Z$/, "Z");
    users.update((r) => r.id === u.id, (r) => ({ ...r, disabled: true, scheduled_deletion: when }));
    record("deleted", { type: "user", id: u.id, name: u.email }, { after: { scheduled_deletion: when } }, true);
    return noContent();
  },

  "DELETE /api/users/:id/scheduled_deletion": ({ id }) => {
    if (!isSuperuser()) return forbidden();
    if (!isUuid(id)) return badId("id");
    const u = findUser(id);
    if (!u || !u.scheduled_deletion) return notFound();
    const next = { ...u, disabled: false, scheduled_deletion: null };
    users.update((r) => r.id === u.id, () => next);
    record("updated", { type: "user", id: u.id, name: u.email }, { before: { scheduled_deletion: u.scheduled_deletion }, after: { scheduled_deletion: null } });
    return one(next);
  },
};
