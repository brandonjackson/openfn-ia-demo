/**
 * Projects and their members on the pretend server (api/projects.md).
 *
 * Lifecycle, as the API has it:
 * - Anyone can create a project (planned) with `PUT /api/projects/:id`, and
 *   becomes its owner. The name is URL-safe: lowercase letters, digits and
 *   hyphens. Replacing changes the name, description, colour and concurrency.
 * - `DELETE` schedules deletion: the project leaves every list, every route on
 *   it answers 409 `scheduled_for_deletion`, and only cancelling
 *   (`DELETE …/scheduled_deletion`) brings it back.
 * - A project has exactly one owner, and ownership can't be handed over: a
 *   member's role is admin, editor or viewer. Removing a member drops the
 *   project's links to credentials they own.
 * - Settings each have their own route: data retention, the MFA requirement
 *   and support access.
 */
import { createdAt as fixtureCreatedAt, instanceUsers, memberships as fixtureMemberships } from "../fixtures/admin";
import { projectMemberships as settingsMemberships, projectSettingsRecord } from "../fixtures/project-settings";
import { projects as fixtureProjects, projectSandboxes } from "../fixtures/projects";
import { hasRole, type DigestFrequency, type ProjectRole } from "../model/project-settings";
import { sandboxColorHex } from "../model/sandboxes";
import {
  badId,
  badInclude,
  conflict,
  forbidden,
  includes,
  invalid,
  isUuid,
  json,
  maxLength,
  noContent,
  notFound,
  now,
  ORIGIN,
  paged,
  problem,
  unknownKeys,
  type Entry,
  type Handler,
} from "./answers";
import { diff, record } from "./audit";
import { seedTime, table } from "./db";
import { newId, seedId } from "../fixtures/ids";
import { currentUserId } from "./session";
import { findUser, findUserByEmail, fullName, userIdFor, users } from "./users";

export type RetentionPolicy = "retain_all" | "retain_with_errors" | "erase_all";

export interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  /** Planned. The environment credentials load their values from: set when made, never changed. */
  env: string;
  /** Planned. A hex colour, mostly for sandboxes. */
  color: string | null;
  /** Planned. The project a sandbox was made from; null for a root project. */
  parent_id: string | null;
  /** Planned. How many runs at once; null for no limit, 1 for one at a time. */
  concurrency: number | null;
  retention_policy: RetentionPolicy;
  /** Days to keep history, or null to keep it all. */
  history_retention_period: number | null;
  /** Days to keep input and output data, at most the history period. */
  dataclip_retention_period: number | null;
  requires_mfa: boolean;
  allow_support_access: boolean;
  /** When the project will be removed, once its deletion is scheduled. */
  scheduled_deletion: string | null;
  inserted_at: string;
  updated_at: string;
}

export interface MemberRow {
  project_id: string;
  user_id: string;
  role: ProjectRole;
  failure_alert: boolean;
  digest: DigestFrequency;
  inserted_at: string;
}

/** A fixture project's id on the fake server, from its slug ("project-a"). */
export const projectIdFor = (slug: string) => seedId("project", slug);

/** A fixture sandbox's id on the fake server, from its project's slug and its name. */
export const sandboxIdFor = (projectSlug: string, name: string) => seedId("sandbox", `${projectSlug}/${name}`);


/** Every fixture sandbox: each project's sandboxes but main, made from main (or from another sandbox). */
export function fixtureSandboxes() {
  return fixtureProjects.flatMap((p) =>
    projectSandboxes(p)
      .filter((s) => !s.isMain)
      .map((s) => ({
        project: p,
        sandbox: s,
        id: sandboxIdFor(p.id, s.name),
        parentId: !s.parent || s.parent === "main" ? projectIdFor(p.id) : sandboxIdFor(p.id, s.parent),
      })),
  );
}

/** Days an instance waits before removing a scheduled project (`purge_deleted_after_days`). */
export const PURGE_DELETED_AFTER_DAYS = 7;
const RETENTION_DAYS = [7, 14, 30, 90, 180, 365];
const DAY_MS = 86_400_000;
const daysFromLabel = (label: string): number | null => {
  const n = Number.parseInt(label, 10);
  if (Number.isNaN(n)) return null;
  return /year/i.test(label) ? n * 365 : n;
};

export const projects = table<ProjectRow>("projects", () =>
  fixtureProjects.map((p): ProjectRow => {
    const settings = projectSettingsRecord(p);
    const io = settings.dataStorage;
    return {
      id: projectIdFor(p.id),
      // Lightning names projects in URL-safe words; the fixture's slug is that name.
      name: p.id,
      description: p.description || null,
      env: p.environment,
      color: null,
      parent_id: null,
      concurrency: settings.concurrencyDisabled ? 1 : null,
      retention_policy: io.ioDataPolicy === "zero-persistence" ? "erase_all" : "retain_all",
      history_retention_period: daysFromLabel(io.retentionPeriod),
      dataclip_retention_period: io.ioDataPolicy === "zero-persistence" ? null : daysFromLabel(io.ioRetentionPeriod),
      requires_mfa: settings.mfaRequired,
      allow_support_access: false,
      scheduled_deletion: p.id === "data-quality-checks" ? seedTime("10 Nov 2026") : null,
      inserted_at: seedTime(fixtureCreatedAt[p.id] ?? "1 Jan 2025"),
      updated_at: seedTime(p.lastActivity),
    };
  }).concat(
    fixtureSandboxes().map(({ sandbox, id, parentId }): ProjectRow => ({
      id,
      name: sandbox.name,
      description: sandbox.description || null,
      env: "staging",
      color: sandboxColorHex[sandbox.color] ?? null,
      parent_id: parentId,
      concurrency: null,
      retention_policy: "retain_all",
      history_retention_period: 30,
      dataclip_retention_period: 7,
      requires_mfa: false,
      allow_support_access: false,
      scheduled_deletion: null,
      inserted_at: seedTime(sandbox.lastActivity, 7 * 86_400_000),
      updated_at: seedTime(sandbox.lastActivity),
    })),
  ),
);

export const members = table<MemberRow>("project_members", () => {
  const roots = fixtureProjects.flatMap((p) => {
    const alerts = settingsMemberships(p.id);
    return (fixtureMemberships[p.id] ?? []).map((m) => {
      const user = instanceUsers.find((u) => u.id === m.userId);
      const settings = alerts.find((a) => a.email === user?.email);
      return {
        project_id: projectIdFor(p.id),
        user_id: userIdFor(m.userId),
        role: m.role,
        failure_alert: settings?.failureAlert ?? m.role === "owner",
        digest: settings?.digest ?? "never",
        inserted_at: seedTime(fixtureCreatedAt[p.id] ?? "1 Jan 2025"),
      };
    });
  });
  // A sandbox copies its parent's members; the parent's owner becomes an admin, and whoever made it (Jane, here) its owner.
  const maker = userIdFor("user-jane");
  const sandboxes = fixtureSandboxes().flatMap(({ project, sandbox, id }) => [
    ...roots
      .filter((m) => m.project_id === projectIdFor(project.id) && m.user_id !== maker)
      .map((m) => ({ ...m, project_id: id, role: m.role === "owner" ? ("admin" as const) : m.role, inserted_at: seedTime(sandbox.lastActivity, 7 * 86_400_000) })),
    { project_id: id, user_id: maker, role: "owner" as const, failure_alert: true, digest: "never" as const, inserted_at: seedTime(sandbox.lastActivity, 7 * 86_400_000) },
  ]);
  return [...roots, ...sandboxes];
});

/* ------------------------------------------------------------------ */
/*  Who may do what                                                    */
/* ------------------------------------------------------------------ */

export const findProject = (id: string) => projects.rows().find((p) => p.id === id);
export const membersOf = (projectId: string) => members.rows().filter((m) => m.project_id === projectId);
export const roleIn = (projectId: string, userId = currentUserId()) =>
  members.rows().find((m) => m.project_id === projectId && m.user_id === userId)?.role;
const me = () => findUser(currentUserId());
const isSuperuser = () => me()?.role === "superuser";
/** A member can open the project, unless it requires MFA they haven't set up. Superusers too need a membership. */
const canEnter = (p: ProjectRow) => !!roleIn(p.id) && (!p.requires_mfa || !!me()?.mfa_enabled);
const isAtLeast = (p: ProjectRow, least: ProjectRole) => {
  const role = roleIn(p.id);
  return !!role && hasRole(role, least);
};
/** The project at the top of a sandbox's tree. */
export const rootOf = (p: ProjectRow): ProjectRow => {
  const parent = p.parent_id ? findProject(p.parent_id) : undefined;
  return parent ? rootOf(parent) : p;
};

/** The planned `permissions` on GET /api/projects/:id: what the caller may do here. */
export function permissionsIn(p: ProjectRow) {
  const at = (least: ProjectRole) => isAtLeast(p, least);
  return {
    access_project: canEnter(p),
    delete_project: roleIn(p.id) === "owner" || isSuperuser(),
    edit_project: at("admin"),
    edit_data_retention: at("admin"),
    edit_run_settings: at("admin"),
    add_project_user: at("admin"),
    remove_project_user: at("admin"),
    write_webhook_auth_method: at("admin"),
    write_github_connection: at("admin"),
    create_workflow: at("editor"),
    edit_workflow: at("editor"),
    delete_workflow: at("editor"),
    run_workflow: at("editor"),
    create_project_credential: at("editor"),
    initiate_github_sync: at("editor"),
    create_channel: at("editor"),
    update_channel: at("editor"),
    delete_channel: at("editor"),
    edit_failure_alerts: at("viewer"),
    edit_digest_alerts: at("viewer"),
    create_keychain_credential: at("admin"),
    manage_collection: at("admin"),
    provision_sandbox: at("editor"),
  };
}

/**
 * The checks every route under `/api/projects/:id/…` makes first (api/errors.md,
 * order of checks): you must be able to open the project (403 otherwise,
 * whether or not it exists), it mustn't be scheduled for deletion (409), and
 * you need at least `least` to change things.
 */
export function guardProject(id: string, least: ProjectRole = "viewer", { superuser = false, evenIfScheduled = false } = {}): ProjectRow | Response {
  const p = isUuid(id) ? findProject(id) : undefined;
  // Admin settings lets a superuser manage any project's members; the API doesn't say so yet (a gap, in the morning report).
  const asSuperuser = superuser && isSuperuser();
  if (!p || (!asSuperuser && (!canEnter(p) || !isAtLeast(p, least)))) return forbidden();
  if (p.scheduled_deletion && !(asSuperuser && evenIfScheduled)) return conflict("scheduled_for_deletion", "This project is scheduled for deletion.");
  return p;
}

/* ------------------------------------------------------------------ */
/*  What the API sends                                                 */
/* ------------------------------------------------------------------ */

/** Counts the list's planned `include=stats` adds. Other resources register theirs as they move to the API. */
type StatsProvider = (projectId: string) => { workflows_count?: number; last_activity?: string | null; failed_work_orders_count?: number };
const statsProviders: StatsProvider[] = [];
export const addProjectStats = (provider: StatsProvider) => void statsProviders.push(provider);


const memberEntry = (m: MemberRow) => {
  const u = findUser(m.user_id);
  return {
    type: "project_members",
    id: m.user_id,
    attributes: {
      email: u?.email ?? null,
      first_name: u?.first_name ?? null,
      last_name: u?.last_name ?? null,
      role: m.role,
      failure_alert: m.failure_alert,
      digest: m.digest,
    },
    relationships: {},
    links: { self: `${ORIGIN}/api/projects/${m.project_id}/members/${m.user_id}` },
  };
};

const ownerOf = (p: ProjectRow) => {
  const owner = membersOf(p.id).find((m) => m.role === "owner");
  const u = owner && findUser(owner.user_id);
  return u ? { id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name } : null;
};

const displayName = (p: ProjectRow): string => {
  const parent = p.parent_id ? findProject(p.parent_id) : undefined;
  return parent ? `${displayName(parent)}/${p.name}` : p.name;
};

/** A project as GET /api/projects/:id answers it, planned attributes included. */
export function projectEntry(p: ProjectRow, { list = false, stats = false } = {}) {
  const extra = stats
    ? Object.assign(
        {
          role: roleIn(p.id) ?? null,
          workflows_count: 0,
          collaborators_count: membersOf(p.id).length,
          last_activity: null as string | null,
          failed_work_orders_count: 0,
        },
        ...statsProviders.map((provide) => provide(p.id)),
      )
    : {};
  return {
    type: "projects",
    id: p.id,
    attributes: {
      name: p.name,
      description: p.description,
      env: p.env,
      color: p.color,
      concurrency: p.concurrency,
      retention_policy: p.retention_policy,
      history_retention_period: p.history_retention_period,
      dataclip_retention_period: p.dataclip_retention_period,
      requires_mfa: p.requires_mfa,
      allow_support_access: p.allow_support_access,
      parent_id: p.parent_id,
      scheduled_deletion: p.scheduled_deletion,
      inserted_at: p.inserted_at,
      allowed_retention_periods: RETENTION_DAYS,
      ...(p.parent_id && { root_id: rootOf(p).id, display_name: displayName(p) }),
      ...(list ? { owner: ownerOf(p) } : { members: membersOf(p.id).map((m) => memberEntry(m).attributes), permissions: permissionsIn(p) }),
      ...extra,
    },
    relationships: {},
    links: { self: `${ORIGIN}/api/projects/${p.id}` },
  };
}

const one = (p: ProjectRow, status = 200) =>
  json(status, { data: projectEntry(p), included: [], links: { self: `${ORIGIN}/api/projects/${p.id}` } });

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

const PROJECT_NAME = /^[a-z0-9-]+$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const PROJECT_KEYS = ["id", "name", "description", "members", "notify", "color", "concurrency", "env"];

function checkName(name: unknown, errors: Entry[], taken: (name: string) => boolean = () => false): string | undefined {
  if (typeof name !== "string" || name === "") {
    errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
    return undefined;
  }
  if (!PROJECT_NAME.test(name)) errors.push({ code: "format", detail: "has invalid format", pointer: "#/name" });
  else if (taken(name)) errors.push({ code: "taken", detail: "has already been taken", pointer: "#/name" });
  return name;
}

function checkDescription(value: unknown, errors: Entry[]) {
  if (value !== null && value !== undefined && typeof value !== "string") {
    errors.push({ code: "type", detail: "is not a string", pointer: "#/description" });
  }
  maxLength(value, 240, "#/description", errors);
}

function checkConcurrency(value: unknown, errors: Entry[]) {
  if (value !== undefined && value !== null && !(Number.isInteger(value) && (value as number) > 0)) {
    errors.push({ code: "out_of_range", detail: "must be a positive whole number, or null", pointer: "#/concurrency" });
  }
}

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

export const projectRoutes: Record<string, Handler> = {
  // Members see their projects; a superuser (planned) sees every project, scheduled ones too.
  "GET /api/projects": (_params, _body, query) => {
    const refused = badInclude(query, ["stats"]);
    if (refused) return refused;
    const stats = includes(query, "stats");
    const tree = query.get("depth") === "all";
    const everything = isSuperuser();
    const q = (query.get("q") ?? "").toLowerCase();
    const sort = query.get("sort") ?? "name";
    const field = sort.replace(/^-/, "");
    if (!["name", "inserted_at", "last_activity"].includes(field)) {
      return problem({ status: 400, code: "invalid_parameter", errors: [{ code: "invalid", detail: "is not a sort field", parameter: "sort" }] });
    }
    let rows = projects
      .rows()
      .filter((p) => (everything ? true : canEnter(p) && !p.scheduled_deletion))
      .filter((p) => tree || everything || p.parent_id === null)
      .map((p) => projectEntry(p, { list: true, stats: stats || field === "last_activity" }))
      .filter((e) => {
        if (!q) return true;
        const owner = e.attributes.owner;
        return [e.attributes.name, e.attributes.description ?? "", owner ? `${owner.first_name} ${owner.last_name}` : ""].some((t) =>
          t.toLowerCase().includes(q),
        );
      });
    const key = (e: (typeof rows)[number]) => String((e.attributes as Record<string, unknown>)[field] ?? "");
    rows = rows.sort((a, b) => key(a).localeCompare(key(b)));
    if (sort.startsWith("-")) rows.reverse();
    return json(200, { ...paged("/api/projects", rows, query, "data", true), meta: { total_entries: rows.length } });
  },

  "GET /api/projects/:id": ({ id }) => {
    const p = isUuid(id) ? findProject(id!) : undefined;
    if (!p || !canEnter(p)) {
      if (isSuperuser() && !isUuid(id)) return badId("id");
      if (isSuperuser() && !p) return notFound();
      return forbidden();
    }
    if (p.scheduled_deletion) return conflict("scheduled_for_deletion", "This project is scheduled for deletion.");
    return one(p);
  },

  // Creates the project under :id with the caller as owner (planned for any user), or replaces it.
  "PUT /api/projects/:id": ({ id }, body) => {
    if (!isUuid(id)) return isSuperuser() ? badId("id") : forbidden();
    const existing = findProject(id);
    if (existing) {
      // Owners and admins replace a project; so does a superuser, from Admin settings (not in api/ yet).
      if (!isSuperuser() && (!canEnter(existing) || !isAtLeast(existing, "admin"))) return forbidden();
      if (existing.scheduled_deletion) return conflict("scheduled_for_deletion", "This project is scheduled for deletion.");
    }
    const errors = unknownKeys(body, PROJECT_KEYS);
    // A sandbox's name is unique among its siblings; root project names aren't checked (api/projects.md).
    const siblingTaken = (name: string) =>
      !!existing?.parent_id && projects.rows().some((p) => p.parent_id === existing.parent_id && p.id !== existing.id && p.name === name);
    const name = checkName(body["name"], errors, siblingTaken);
    checkDescription(body["description"], errors);
    checkConcurrency(body["concurrency"], errors);
    if (body["color"] !== undefined && body["color"] !== null && !(typeof body["color"] === "string" && HEX.test(body["color"]))) {
      errors.push({ code: "format", detail: "must be a hex colour like #336699", pointer: "#/color" });
    }
    if (body["id"] !== undefined && body["id"] !== id) errors.push({ code: "mismatch", detail: "does not match the path", pointer: "#/id" });
    if (existing && body["members"] !== undefined) errors.push({ code: "not_allowed", detail: "can only be set when creating", pointer: "#/members" });
    // Members when creating: existing users, each once, exactly one owner (api/projects.md).
    const listed: { user_id: string; role: ProjectRole }[] = [];
    if (!existing && body["members"] !== undefined) {
      if (!Array.isArray(body["members"])) errors.push({ code: "type", detail: "must be a list", pointer: "#/members" });
      else {
        (body["members"] as { email?: unknown; role?: unknown }[]).forEach((m, i) => {
          const user = typeof m?.email === "string" ? findUserByEmail(m.email) : undefined;
          if (!user) errors.push({ code: "not_found", detail: "is not a user on this instance", pointer: `#/members/${i}/email` });
          else if (listed.some((l) => l.user_id === user.id)) errors.push({ code: "duplicate", detail: "is listed twice", pointer: `#/members/${i}/email` });
          if (!["owner", "admin", "editor", "viewer"].includes(m?.role as string)) errors.push({ code: "invalid", detail: "must be owner, admin, editor or viewer", pointer: `#/members/${i}/role` });
          if (user) listed.push({ user_id: user.id, role: m.role as ProjectRole });
        });
        if (listed.filter((l) => l.role === "owner").length !== 1) errors.push({ code: "one_owner", detail: "needs exactly one owner", pointer: "#/members" });
      }
    }
    if (existing && body["env"] !== undefined && body["env"] !== existing.env) {
      errors.push({ code: "not_allowed", detail: "can't be changed", pointer: "#/env" });
    }
    if (errors.length) return invalid(errors);

    const description = typeof body["description"] === "string" && body["description"] !== "" ? body["description"] : null;
    if (existing) {
      const next: ProjectRow = {
        ...existing,
        name: name!,
        description,
        ...(body["color"] !== undefined && { color: body["color"] as string | null }),
        ...(body["concurrency"] !== undefined && { concurrency: body["concurrency"] as number | null }),
      };
      const changes = diff(existing as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>);
      if (changes.after) {
        next.updated_at = now();
        projects.update((p) => p.id === id, () => next);
        record("updated", { type: "project", id: id!, name: next.name }, changes);
      }
      return one(next);
    }

    const at = now();
    const created: ProjectRow = {
      id: id!,
      name: name!,
      description,
      env: typeof body["env"] === "string" && body["env"] ? body["env"] : "main",
      color: (body["color"] as string | undefined) ?? null,
      parent_id: null,
      concurrency: (body["concurrency"] as number | undefined) ?? null,
      retention_policy: "retain_all",
      history_retention_period: null,
      dataclip_retention_period: null,
      requires_mfa: false,
      allow_support_access: false,
      scheduled_deletion: null,
      inserted_at: at,
      updated_at: at,
    };
    projects.insert(created);
    const people = listed.length ? listed : [{ user_id: currentUserId(), role: "owner" as const }];
    for (const m of people) members.insert({ project_id: id!, user_id: m.user_id, role: m.role, failure_alert: m.role === "owner", digest: "never", inserted_at: at });
    record("created", { type: "project", id: id!, name: created.name }, { after: { name: created.name, description } });
    return one(created, 201);
  },

  // Schedules deletion. The owner may; a superuser may (planned).
  "DELETE /api/projects/:id": ({ id }) => {
    const p = isUuid(id) ? findProject(id) : undefined;
    // A sandbox can also be deleted by its admins and by the owners and admins of its root.
    const sandboxAdmin = (q: ProjectRow) => !!q.parent_id && [roleIn(q.id), roleIn(rootOf(q).id)].some((r) => r === "owner" || r === "admin");
    if (!p || !(roleIn(p.id) === "owner" || isSuperuser() || sandboxAdmin(p))) return forbidden();
    if (p.scheduled_deletion) return conflict("scheduled_for_deletion", "This project is already scheduled for deletion.");
    const when = new Date(Date.now() + PURGE_DELETED_AFTER_DAYS * DAY_MS).toISOString().replace(/\.\d+Z$/, "Z");
    // A project's sandboxes go with it.
    const doomed = new Set([p.id]);
    for (let grew = true; grew; ) {
      grew = false;
      for (const q of projects.rows()) {
        if (q.parent_id && doomed.has(q.parent_id) && !doomed.has(q.id)) {
          doomed.add(q.id);
          grew = true;
        }
      }
    }
    projects.update((q) => doomed.has(q.id), (q) => ({ ...q, scheduled_deletion: when }));
    record("deleted", { type: "project", id: p.id, name: p.name }, { after: { scheduled_deletion: when } }, true);
    return noContent();
  },

  "DELETE /api/projects/:id/scheduled_deletion": ({ id }) => {
    const p = isUuid(id) ? findProject(id) : undefined;
    if (!p || !(roleIn(p.id) === "owner" || isSuperuser())) return forbidden();
    if (!p.scheduled_deletion) return notFound();
    projects.update(
      (q) => q.id === p.id || (q.scheduled_deletion === p.scheduled_deletion && rootOf(q).id === rootOf(p).id),
      (q) => ({ ...q, scheduled_deletion: null }),
    );
    record("updated", { type: "project", id: p.id, name: p.name }, { before: { scheduled_deletion: p.scheduled_deletion }, after: { scheduled_deletion: null } });
    // A member gets the project back; a superuser who isn't one gets 204, having no view of it.
    return canEnter(p) ? one(findProject(p.id)!) : noContent();
  },

  "PUT /api/projects/:id/data_retention": ({ id }, body) => {
    const p = guardProject(id!, "admin");
    if (p instanceof Response) return p;
    const errors = unknownKeys(body, ["retention_policy", "history_retention_period", "dataclip_retention_period"]);
    const policy = body["retention_policy"];
    if (!["retain_all", "retain_with_errors", "erase_all"].includes(policy as string)) {
      errors.push({ code: "required", detail: "must be retain_all, retain_with_errors or erase_all", pointer: "#/retention_policy" });
    }
    const period = (key: string) => {
      const v = body[key];
      if (v === null || v === undefined) return null;
      if (!RETENTION_DAYS.includes(v as number)) errors.push({ code: "not_allowed", detail: "is not a period this project's plan allows", pointer: `#/${key}` });
      return v as number;
    };
    const history = period("history_retention_period");
    let dataclips = period("dataclip_retention_period");
    if (policy === "erase_all") dataclips = null;
    else if (dataclips !== null && (history === null || dataclips > history)) {
      errors.push({ code: "out_of_range", detail: "must be no longer than the history retention period", pointer: "#/dataclip_retention_period" });
    }
    if (errors.length) return invalid(errors);
    const next = { ...p, retention_policy: policy as RetentionPolicy, history_retention_period: history, dataclip_retention_period: dataclips };
    const changes = diff(p as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>);
    if (changes.after) {
      projects.update((q) => q.id === p.id, () => ({ ...next, updated_at: now() }));
      if ("history_retention_period" in changes.after) record("history_retention_period_updated", { type: "project", id: p.id, name: p.name }, changes);
      if ("dataclip_retention_period" in changes.after) record("dataclip_retention_period_updated", { type: "project", id: p.id, name: p.name }, changes);
    }
    return one(findProject(p.id)!);
  },

  "PUT /api/projects/:id/mfa_requirement": ({ id }, body) => {
    const p = guardProject(id!, "admin");
    if (p instanceof Response) return p;
    const errors = unknownKeys(body, ["requires_mfa"]);
    if (typeof body["requires_mfa"] !== "boolean") errors.push({ code: "required", detail: "must be true or false", pointer: "#/requires_mfa" });
    if (p.parent_id) errors.push({ code: "not_allowed", detail: "a sandbox keeps its parent's setting", pointer: "#/requires_mfa" });
    if (errors.length) return invalid(errors);
    if (p.requires_mfa !== body["requires_mfa"]) {
      projects.update((q) => q.id === p.id, (q) => ({ ...q, requires_mfa: body["requires_mfa"] as boolean, updated_at: now() }));
      record("requires_mfa_updated", { type: "project", id: p.id, name: p.name }, { before: { requires_mfa: p.requires_mfa }, after: { requires_mfa: body["requires_mfa"] } });
    }
    return one(findProject(p.id)!);
  },

  "PUT /api/projects/:id/support_access": ({ id }, body) => {
    const p = guardProject(id!, "admin");
    if (p instanceof Response) return p;
    const errors = unknownKeys(body, ["allow_support_access"]);
    if (typeof body["allow_support_access"] !== "boolean") errors.push({ code: "required", detail: "must be true or false", pointer: "#/allow_support_access" });
    if (errors.length) return invalid(errors);
    if (p.allow_support_access !== body["allow_support_access"]) {
      projects.update((q) => q.id === p.id, (q) => ({ ...q, allow_support_access: body["allow_support_access"] as boolean, updated_at: now() }));
      record(
        "allow_support_access_updated",
        { type: "project", id: p.id, name: p.name },
        { before: { allow_support_access: p.allow_support_access }, after: { allow_support_access: body["allow_support_access"] } },
      );
    }
    return one(findProject(p.id)!);
  },

  /* ---------------- Members ---------------- */

  // Sorted by first name, paged.
  "GET /api/projects/:project_id/members": ({ project_id }, _body, query) => {
    // A superuser sees who's in a project waiting to be deleted, so Admin settings can name its owner.
    const p = guardProject(project_id!, "viewer", { superuser: true, evenIfScheduled: true });
    if (p instanceof Response) return p;
    const rows = membersOf(p.id)
      .map(memberEntry)
      .sort((a, b) => (a.attributes.first_name ?? "").localeCompare(b.attributes.first_name ?? ""));
    return json(200, { ...paged(`/api/projects/${p.id}/members`, rows, query), included: [] });
  },

  // Adds someone with an account, or changes their role. The owner's role can't change, and no one else can become owner.
  "PUT /api/projects/:project_id/members/:user_id": ({ project_id, user_id }, body) => {
    const p = guardProject(project_id!, "admin", { superuser: true });
    if (p instanceof Response) return p;
    if (!isUuid(user_id)) return badId("user_id");
    const user = findUser(user_id);
    if (!user) return notFound();
    const errors = unknownKeys(body, ["role", "notify"]);
    const role = body["role"];
    const existing = membersOf(p.id).find((m) => m.user_id === user.id);
    if (role === "owner" || existing?.role === "owner") {
      errors.push({ code: "one_owner", detail: "a project has exactly one owner, and ownership can't be handed over", pointer: "#/role" });
    } else if (!["admin", "editor", "viewer"].includes(role as string)) {
      errors.push({ code: "required", detail: "must be admin, editor or viewer", pointer: "#/role" });
    }
    if (errors.length) return invalid(errors);
    if (existing) {
      if (existing.role !== role) {
        members.update((m) => m.project_id === p.id && m.user_id === user.id, (m) => ({ ...m, role: role as ProjectRole }));
        record("collaborator_role_changed", { type: "project", id: p.id, name: p.name }, { before: { [user.email]: existing.role }, after: { [user.email]: role } });
      }
      return json(200, { data: memberEntry(membersOf(p.id).find((m) => m.user_id === user.id)!) });
    }
    const added: MemberRow = { project_id: p.id, user_id: user.id, role: role as ProjectRole, failure_alert: true, digest: "never", inserted_at: now() };
    members.insert(added);
    record("collaborator_added", { type: "project", id: p.id, name: p.name }, { after: { [user.email]: role } });
    return json(201, { data: memberEntry(added) });
  },

  // Removing someone also drops the project's links to credentials they own (credentials.ts listens for this).
  "DELETE /api/projects/:project_id/members/:user_id": ({ project_id, user_id }) => {
    const p = guardProject(project_id!, "admin", { superuser: true });
    if (p instanceof Response) return p;
    if (!isUuid(user_id)) return badId("user_id");
    const member = membersOf(p.id).find((m) => m.user_id === user_id);
    if (!member) return notFound();
    if (member.role === "owner") {
      return invalid([{ code: "one_owner", detail: "the owner can't be removed", path: "user_id" }]);
    }
    members.remove((m) => m.project_id === p.id && m.user_id === user_id);
    for (const listener of memberRemovedListeners) listener(p.id, user_id!);
    const u = findUser(user_id!);
    record("collaborator_removed", { type: "project", id: p.id, name: p.name }, { before: { [u?.email ?? user_id!]: member.role } }, true);
    return noContent();
  },

  // Your own alerts in a project. Only the member themself may change them.
  "PUT /api/projects/:project_id/members/:user_id/notifications": ({ project_id, user_id }, body) => {
    const p = guardProject(project_id!);
    if (p instanceof Response) return p;
    if (user_id !== currentUserId()) return forbidden();
    const errors = unknownKeys(body, ["failure_alert", "digest"]);
    if (typeof body["failure_alert"] !== "boolean") errors.push({ code: "required", detail: "must be true or false", pointer: "#/failure_alert" });
    if (!["never", "daily", "weekly", "monthly"].includes(body["digest"] as string)) {
      errors.push({ code: "required", detail: "must be never, daily, weekly or monthly", pointer: "#/digest" });
    }
    if (errors.length) return invalid(errors);
    members.update(
      (m) => m.project_id === p.id && m.user_id === user_id,
      (m) => ({ ...m, failure_alert: body["failure_alert"] as boolean, digest: body["digest"] as DigestFrequency }),
    );
    return json(200, { data: memberEntry(membersOf(p.id).find((m) => m.user_id === user_id)!) });
  },

  // Invites someone without an account: makes their user and their membership.
  "POST /api/projects/:project_id/invitations": ({ project_id }, body) => {
    const p = guardProject(project_id!, "admin");
    if (p instanceof Response) return p;
    const errors = unknownKeys(body, ["email", "first_name", "last_name", "role"]);
    for (const key of ["email", "first_name", "last_name"]) {
      if (typeof body[key] !== "string" || (body[key] as string).trim() === "") errors.push({ code: "required", detail: "can't be blank", pointer: `#/${key}` });
    }
    const email = typeof body["email"] === "string" ? body["email"].trim() : "";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push({ code: "format", detail: "must be an email address", pointer: "#/email" });
    else if (email && findUserByEmail(email)) errors.push({ code: "taken", detail: "has already been taken", pointer: "#/email" });
    if (!["admin", "editor", "viewer"].includes(body["role"] as string)) errors.push({ code: "required", detail: "must be admin, editor or viewer", pointer: "#/role" });
    if (errors.length) return invalid(errors);
    const at = now();
    const user = {
      id: newId(),
      email,
      first_name: (body["first_name"] as string).trim(),
      last_name: (body["last_name"] as string).trim(),
      role: "user" as const,
      support_user: false,
      disabled: false,
      scheduled_deletion: null,
      has_activity_in_projects: false,
      last_login_at: null,
      mfa_enabled: false,
      inserted_at: at,
    };
    users.insert(user);
    const added: MemberRow = { project_id: p.id, user_id: user.id, role: body["role"] as ProjectRole, failure_alert: true, digest: "never", inserted_at: at };
    members.insert(added);
    record("created", { type: "user", id: user.id, name: user.email }, { after: { email, first_name: user.first_name, last_name: user.last_name } });
    record("collaborator_added", { type: "project", id: p.id, name: p.name }, { after: { [email]: added.role } });
    return json(201, { data: memberEntry(added) });
  },
};

/** Run when a member leaves a project, so other resources can follow (credentials drop their links). */
type MemberRemoved = (projectId: string, userId: string) => void;
const memberRemovedListeners: MemberRemoved[] = [];
export const onMemberRemoved = (listener: MemberRemoved) => void memberRemovedListeners.push(listener);

/** "Ada Lovelace", for a member's user id. */
export const memberName = (userId: string) => {
  const u = findUser(userId);
  return u ? fullName(u) : "Unknown";
};
