/**
 * Organizations and their members on the pretend server, as openfn-3-poc's
 * api/organizations.md has them, which Lightning answers at the same paths.
 *
 * Lifecycle:
 * - An organization sits above projects. A person can be in many, as an
 *   `admin`, who renames it and manages its members, or a `member`, who reads
 *   them. Belonging to one opens none of its projects.
 * - Only a superuser creates one, and joins it as its admin unless they list
 *   themselves. A superuser reads and manages every organization.
 * - Members are added by email and must already be users. A role changes and
 *   a member leaves, but an organization always keeps an admin (`one_admin`).
 *   Leaving takes nobody out of a project.
 * Every write lands in the audit trail.
 */
import { organizationSettingsData } from "../fixtures/organization";
import { seedId } from "../fixtures/ids";
import { badId, forbidden, invalid, isUuid, json, maxLength, noContent, notFound, now, ORIGIN, paged, unknownKeys, type Body, type Entry, type Handler } from "./answers";
import { record } from "./audit";
import { ago, seededEmpty, table } from "./db";
import { currentUserId } from "./session";
import { findUser, findUserByEmail } from "./users";

type Role = "admin" | "member";

interface OrganizationRow {
  id: string;
  name: string;
  inserted_at: string;
  updated_at: string;
}

interface OrganizationUserRow {
  organization_id: string;
  user_id: string;
  role: Role;
  inserted_at: string;
}

const DAY = 86_400_000;
// The fixture's "6 months ago", "2 weeks ago" as days, so they keep reading right.
const joinedDays: Record<string, number> = { "6 months ago": 180, "3 months ago": 90, "2 weeks ago": 14 };
const seededOrganizationId = seedId("organization", organizationSettingsData.name);

export const organizations = table<OrganizationRow>("organizations", () => [
  { id: seededOrganizationId, name: organizationSettingsData.name, inserted_at: ago(180 * DAY), updated_at: ago(30 * DAY) },
]);

export const organizationUsers = table<OrganizationUserRow>("organization_users", () =>
  organizationSettingsData.members.flatMap((m) => {
    const user = findUserByEmail(m.email);
    return user ? [{ organization_id: seededOrganizationId, user_id: user.id, role: m.role === "Admin" ? "admin" : "member", inserted_at: ago((joinedDays[m.joined] ?? 30) * DAY) } satisfies OrganizationUserRow] : [];
  }),
);

const ROLES: Role[] = ["admin", "member"];
const isSuperuser = () => findUser(currentUserId())?.role === "superuser";
const membersOf = (id: string) => organizationUsers.rows().filter((m) => m.organization_id === id);
const roleIn = (id: string, userId = currentUserId()) => membersOf(id).find((m) => m.user_id === userId)?.role;
const same = (m: OrganizationUserRow) => (r: OrganizationUserRow) => r.organization_id === m.organization_id && r.user_id === m.user_id;
const findOrganization = (id: string) => organizations.rows().find((o) => o.id === id);

/**
 * Whether you're in an organization. Beside Lightning the fake doesn't know
 * Lightning's organizations, so it takes it that you are: Lightning only
 * shows you the demo's pages once you've signed in to it.
 */
export const inAnOrganization = () => seededEmpty() || isSuperuser() || organizationUsers.rows().some((m) => m.user_id === currentUserId());

/**
 * Whether you may change the organization's settings on the demo's own
 * routes: an admin of an organization you're in, or a superuser. Beside
 * Lightning that's Lightning's to decide, and the page only offers the
 * change to its admins.
 */
export const managesAnOrganization = () => seededEmpty() || isSuperuser() || organizationUsers.rows().some((m) => m.user_id === currentUserId() && m.role === "admin");

const self = (id: string) => `${ORIGIN}/api/organizations/${id}`;

const organizationEntry = (o: OrganizationRow) => ({
  type: "organizations",
  id: o.id,
  attributes: { name: o.name, role: roleIn(o.id) ?? null, inserted_at: o.inserted_at, updated_at: o.updated_at },
  relationships: {},
  links: { self: self(o.id) },
});

const memberEntry = (m: OrganizationUserRow) => {
  const user = findUser(m.user_id)!;
  return {
    type: "organization_members",
    id: m.user_id,
    attributes: { email: user.email, first_name: user.first_name, last_name: user.last_name, role: m.role, inserted_at: m.inserted_at },
    relationships: {},
    links: { self: `${self(m.organization_id)}/members/${m.user_id}` },
  };
};

/**
 * The organization `id` once you may act on it, or the refusal. Anyone who
 * may not hears 403 whether or not it exists; only a superuser learns that an
 * id names none (404) or isn't a UUID (400).
 */
function reach(id: string | undefined, action: "read" | "manage", param = "organization_id"): OrganizationRow | Response {
  const superuser = isSuperuser();
  if (!isUuid(id)) return superuser ? badId(param) : forbidden();
  const organization = findOrganization(id);
  const role = organization && roleIn(organization.id);
  const allowed = superuser || (action === "read" ? !!role : role === "admin");
  if (!allowed) return forbidden();
  return organization ?? notFound();
}

const nameErrors = (body: Body, errors: Entry[]) => {
  const name = typeof body["name"] === "string" ? body["name"].trim() : "";
  if (!name) errors.push({ code: "required", detail: "can't be blank", pointer: "#/name" });
  else maxLength(name, 160, "#/name", errors);
  return name;
};

/** Would the change leave the organization without an admin? */
const leavesNoAdmin = (m: OrganizationUserRow, role: Role | null) =>
  m.role === "admin" && role !== "admin" && membersOf(m.organization_id).filter((x) => x.role === "admin").length === 1;

const oneAdmin = (location: Pick<Entry, "pointer" | "path">) => invalid([{ code: "one_admin", detail: "would leave the organization with no admin", ...location }]);

const audited = (o: OrganizationRow) => ({ type: "organization", id: o.id, name: o.name });

export const organizationsRoutes: Record<string, Handler> = {
  "GET /api/organizations": (_params, _body, query) => {
    const rows = organizations
      .rows()
      .filter((o) => isSuperuser() || roleIn(o.id))
      .sort((a, b) => a.name.localeCompare(b.name));
    return json(200, { ...paged("/api/organizations", rows.map(organizationEntry), query), included: [] });
  },
  "POST /api/organizations": (_params, body) => {
    if (!isSuperuser()) return forbidden();
    const errors: Entry[] = unknownKeys(body, ["name", "members"]);
    const name = nameErrors(body, errors);
    const listed = body["members"] ?? [];
    const members: { user_id: string; email: string; role: Role }[] = [];
    if (!Array.isArray(listed)) errors.push({ code: "type", detail: "is invalid", pointer: "#/members" });
    else
      listed.forEach((m: { email?: unknown; role?: unknown }, i) => {
        const user = typeof m.email === "string" ? findUserByEmail(m.email) : undefined;
        if (!ROLES.includes(m.role as Role)) errors.push({ code: "not_allowed", detail: "is invalid", pointer: `#/members/${i}/role` });
        if (!user) errors.push({ code: "not_found", detail: "names nothing you can see", pointer: `#/members/${i}/email` });
        else if (members.some((x) => x.user_id === user.id)) errors.push({ code: "duplicate", detail: `names the same user as #/members/${members.findIndex((x) => x.user_id === user.id)}`, pointer: `#/members/${i}/email` });
        else members.push({ user_id: user.id, email: user.email, role: m.role as Role });
      });
    const me = findUser(currentUserId())!;
    if (!members.some((m) => m.user_id === me.id)) members.push({ user_id: me.id, email: me.email, role: "admin" });
    if (Array.isArray(listed) && !members.some((m) => m.role === "admin")) errors.push({ code: "one_admin", detail: "needs at least one admin", pointer: "#/members" });
    if (errors.length) return invalid(errors);
    const at = now();
    const row: OrganizationRow = { id: crypto.randomUUID(), name, inserted_at: at, updated_at: at };
    organizations.insert(row);
    record("created", audited(row), { after: { name } }, true);
    for (const m of members) {
      organizationUsers.insert({ organization_id: row.id, user_id: m.user_id, role: m.role, inserted_at: at });
      record("member_added", audited(row), { after: { email: m.email, role: m.role } }, true);
    }
    return json(201, { data: organizationEntry(row), included: [], links: { self: self(row.id) } });
  },
  "GET /api/organizations/:id": ({ id }) => {
    const o = reach(id, "read", "id");
    if (o instanceof Response) return o;
    return json(200, { data: organizationEntry(o), included: [], links: { self: self(o.id) } });
  },
  "PATCH /api/organizations/:id": ({ id }, body) => {
    const o = reach(id, "manage", "id");
    if (o instanceof Response) return o;
    const errors: Entry[] = unknownKeys(body, ["name"]);
    const name = nameErrors(body, errors);
    if (errors.length) return invalid(errors);
    if (name !== o.name) {
      organizations.update((r) => r.id === o.id, (r) => ({ ...r, name, updated_at: now() }));
      record("updated", audited(o), { before: { name: o.name }, after: { name } }, true);
    }
    const updated = findOrganization(o.id)!;
    return json(200, { data: organizationEntry(updated), included: [], links: { self: self(o.id) } });
  },

  "GET /api/organizations/:organization_id/members": ({ organization_id }, _body, query) => {
    const o = reach(organization_id, "read");
    if (o instanceof Response) return o;
    const name = (m: OrganizationUserRow) => findUser(m.user_id)?.first_name ?? "";
    const rows = membersOf(o.id).sort((a, b) => name(a).localeCompare(name(b)));
    return json(200, { ...paged(`/api/organizations/${o.id}/members`, rows.map(memberEntry), query), included: [] });
  },
  // Adds someone already on the instance, by email. It opens none of the organization's projects.
  "POST /api/organizations/:organization_id/members": ({ organization_id }, body) => {
    const o = reach(organization_id, "manage");
    if (o instanceof Response) return o;
    const errors: Entry[] = unknownKeys(body, ["email", "role"]);
    const email = typeof body["email"] === "string" ? body["email"].trim() : "";
    const role = body["role"] as Role;
    if (!email) errors.push({ code: "required", detail: "can't be blank", pointer: "#/email" });
    if (body["role"] === undefined) errors.push({ code: "required", detail: "can't be blank", pointer: "#/role" });
    else if (!ROLES.includes(role)) errors.push({ code: "not_allowed", detail: "is invalid", pointer: "#/role" });
    if (errors.length) return invalid(errors);
    const user = findUserByEmail(email);
    if (!user) return invalid([{ code: "not_found", detail: "names nothing you can see", pointer: "#/email" }]);
    if (roleIn(o.id, user.id)) return invalid([{ code: "taken", detail: "is already a member of the organization", pointer: "#/email" }]);
    const row: OrganizationUserRow = { organization_id: o.id, user_id: user.id, role, inserted_at: now() };
    organizationUsers.insert(row);
    record("member_added", audited(o), { after: { email: user.email, role } }, true);
    return json(201, { data: memberEntry(row), included: [], links: { self: `${self(o.id)}/members/${user.id}` } });
  },
  "PATCH /api/organizations/:organization_id/members/:user_id": ({ organization_id, user_id }, body) => {
    const o = reach(organization_id, "manage");
    if (o instanceof Response) return o;
    if (!isUuid(user_id)) return badId("user_id");
    const m = membersOf(o.id).find((r) => r.user_id === user_id);
    if (!m) return notFound();
    const errors: Entry[] = unknownKeys(body, ["role"]);
    const role = body["role"] as Role;
    if (body["role"] === undefined) errors.push({ code: "required", detail: "can't be blank", pointer: "#/role" });
    else if (!ROLES.includes(role)) errors.push({ code: "not_allowed", detail: "is invalid", pointer: "#/role" });
    if (errors.length) return invalid(errors);
    if (leavesNoAdmin(m, role)) return oneAdmin({ pointer: "#/role" });
    if (role !== m.role) {
      organizationUsers.update(same(m), (r) => ({ ...r, role }));
      const email = findUser(m.user_id)?.email;
      record("member_role_changed", audited(o), { before: { email, role: m.role }, after: { email, role } }, true);
    }
    return json(200, { data: memberEntry({ ...m, role }), included: [], links: { self: `${self(o.id)}/members/${m.user_id}` } });
  },
  // Takes someone out of the organization. Their account and projects stay as they are.
  "DELETE /api/organizations/:organization_id/members/:user_id": ({ organization_id, user_id }) => {
    const o = reach(organization_id, "manage");
    if (o instanceof Response) return o;
    if (!isUuid(user_id)) return badId("user_id");
    const m = membersOf(o.id).find((r) => r.user_id === user_id);
    if (!m) return notFound();
    if (leavesNoAdmin(m, null)) return oneAdmin({ path: "user_id" });
    organizationUsers.remove(same(m));
    record("member_removed", audited(o), { before: { email: findUser(m.user_id)?.email, role: m.role } }, true);
    return noContent();
  },
};
