/**
 * The organisation on the pretend server: its members, the defaults for what
 * others can see, its X-Road identity, the context layers it draws on, and
 * billing. Lightning's API has no organisations (they're the demo's), so
 * these routes live under `/api/demo/` and follow api/conventions.md.
 *
 * Lifecycle:
 * - Members are invited by email with a role. Someone already on the
 *   instance joins at once; anyone else waits as invited. A role changes,
 *   and a member is removed, but the organisation always keeps an owner,
 *   and only an owner makes or unmakes another.
 * - Visibility defaults and who manages the Security Server are saved with
 *   `PATCH /api/demo/organization`; the rest of the X-Road identity is set
 *   by the X-Road operator, not here, and read from
 *   `GET /api/demo/organization/xroad`. So is the X-Road directory, every
 *   member on the organisation's X-Road instance with their subsystems and
 *   services (`GET /api/demo/organization/xroad/directory`), as the
 *   organisation's Security Server last listed it.
 * - A context layer is requested by its URL and waits for its owners'
 *   approval; it's removed (or the request cancelled) with `DELETE`.
 * - Billing is read only.
 * Anyone in the organisation reads all of it; owners and admins change it.
 */
import { organizationSettingsData } from "../fixtures/organization";
import { orgXRoad, xroadDirectory } from "../fixtures/xroad";
import { seedId } from "../fixtures/ids";
import type { ContextLayer, OrganizationMember, VisibilityScope } from "../model/organization";
import { securityServerManagerLabels, type SecurityServerManager } from "../model/xroad";
import { badId, conflict, forbidden, invalid, isUuid, json, noContent, notFound, now, ORIGIN, paged, unknownKeys, type Entry, type Handler } from "./answers";
import { record } from "./audit";
import { ago, seedTime, table } from "./db";
import { currentUserId } from "./session";
import { findUser, findUserByEmail, fullName } from "./users";
import { systems } from "./connected-systems";
import { services } from "./services";

type OrgRole = OrganizationMember["role"];

export interface OrgMemberRow {
  id: string;
  email: string;
  /** The name they were invited under, until they're on the instance. */
  name: string;
  role: OrgRole;
  /** Null while they're invited and haven't joined. */
  joined_at: string | null;
  last_active_at: string | null;
  inserted_at: string;
}

export interface ContextLayerRow {
  id: string;
  name: string;
  host: string;
  url: string;
  status: ContextLayer["status"];
  last_fetched_at: string | null;
  inserted_at: string;
}

interface OrgRow {
  id: string;
  name: string;
  visibility: { projects: VisibilityScope; systems: VisibilityScope; services: VisibilityScope };
  security_server_managed_by: SecurityServerManager;
  updated_at: string;
}

// The fixtures' "Today", "3 days ago" as times, so they keep reading right.
const lastActive: Record<string, number> = { Today: 0, Yesterday: 1, "3 days ago": 3, "2 weeks ago": 14 };
const DAY = 86_400_000;

export const orgMembers = table<OrgMemberRow>("organization_members", () =>
  organizationSettingsData.members.map((m) => ({
    id: seedId("org_member", m.id),
    email: m.email,
    name: m.name,
    role: m.role,
    joined_at: ago(180 * DAY),
    last_active_at: ago((lastActive[m.lastActive] ?? 30) * DAY),
    inserted_at: ago(180 * DAY),
  })),
);

export const contextLayers = table<ContextLayerRow>("context_layers", () =>
  organizationSettingsData.contextLayers.map((l) => ({
    id: seedId("context_layer", l.id),
    name: l.name,
    host: l.host,
    url: l.url,
    status: l.status,
    last_fetched_at: l.status === "connected" ? ago(14 * 60_000) : null,
    inserted_at: ago(90 * DAY),
  })),
);

const org = table<OrgRow>("organization", () => {
  const v = organizationSettingsData.visibility;
  return [
    {
      id: seedId("organization", organizationSettingsData.name),
      name: organizationSettingsData.name,
      visibility: { projects: v.projects, systems: v.systems ?? "organization", services: v.services ?? "organization" },
      security_server_managed_by: organizationSettingsData.xroad?.managedBy ?? "this-org",
      updated_at: ago(30 * DAY),
    },
  ];
});

/** Your role in the organisation, or undefined when you aren't in it. */
const myRole = (): OrgRole | undefined => {
  const email = findUser(currentUserId())?.email.toLowerCase();
  return orgMembers.rows().find((m) => m.email.toLowerCase() === email && m.joined_at)?.role;
};
/** Whether you're in the organisation (and have joined). */
export const inOrganization = () => myRole() !== undefined;
const canManage = () => myRole() === "Owner" || myRole() === "Admin";
const owners = () => orgMembers.rows().filter((m) => m.role === "Owner" && m.joined_at);

const ROLES: OrgRole[] = ["Owner", "Admin", "Member"];
const SCOPES: VisibilityScope[] = ["project", "organization", "server"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s/]+\S*$/;

const memberEntry = (m: OrgMemberRow) => {
  const user = findUserByEmail(m.email);
  return {
    type: "organization_members",
    id: m.id,
    attributes: { email: m.email, name: user ? fullName(user) : m.name, role: m.role, joined_at: m.joined_at, last_active_at: m.last_active_at, inserted_at: m.inserted_at },
    links: { self: `${ORIGIN}/api/demo/organization/members/${m.id}` },
  };
};

const layerEntry = (l: ContextLayerRow) => ({
  type: "context_layers",
  id: l.id,
  attributes: { ...l, id: undefined },
  links: { self: `${ORIGIN}/api/demo/organization/context_layers/${l.id}` },
});

/** Refuses a change of role that would take the last owner away, or that only an owner may make. */
function roleProblem(m: OrgMemberRow, role: OrgRole | null): Response | undefined {
  if ((m.role === "Owner" || role === "Owner") && myRole() !== "Owner") return forbidden();
  if (m.role === "Owner" && role !== "Owner" && m.joined_at && owners().length === 1)
    return conflict("last_owner", "The organisation needs at least one owner. Make someone else an owner first.");
  return undefined;
}

/** The organisation's X-Road identity, as the X-Road operator set it. Read only, so seeded once. */
interface XRoadIdentityRow {
  id: string;
  instance: string;
  member_class: string;
  member_code: string;
  member_name: string;
  subsystems: { code: string; description: string; openfn: boolean }[];
  certificates: { id: string; kind: string; subject: string; issuer: string; expires_at: string; status: string }[];
  security_servers: { id: string; code: string; address: string; version: string; enabled: boolean; last_seen_at: string }[];
}

const xroadIdentity = table<XRoadIdentityRow>("xroad_identity", () => {
  const x = orgXRoad;
  return [
    {
      id: seedId("xroad_identity", `${x.instance}/${x.memberClass}/${x.memberCode}`),
      instance: x.instance,
      member_class: x.memberClass,
      member_code: x.memberCode,
      member_name: x.memberName,
      subsystems: x.subsystems.map((v) => ({ code: v.code, description: v.description, openfn: v.openfn })),
      certificates: x.certificates.map((c) => ({ id: seedId("xroad_certificate", c.id), kind: c.kind, subject: c.subject, issuer: c.issuer, expires_at: seedTime(c.expires), status: c.status })),
      security_servers: x.securityServers.map((v) => ({ id: seedId("security_server", v.id), code: v.code, address: v.address, version: v.version, enabled: v.enabled, last_seen_at: seedTime(v.lastSeen) })),
    },
  ];
});

export const organizationRoutes: Record<string, Handler> = {
  "GET /api/demo/organization": () => {
    const o = org.rows()[0]!;
    return json(200, {
      data: {
        type: "organizations",
        id: o.id,
        attributes: {
          name: o.name,
          visibility: o.visibility,
          security_server_managed_by: o.security_server_managed_by,
          // How many connected systems and published services use the X-Road identity.
          xroad_usage: {
            systems: systems.rows().filter((s) => s.connection?.method === "xroad").length,
            services: services.rows().filter((s) => s.xroad?.published).length,
          },
          billing: organizationSettingsData.billing,
          role: myRole() ?? null,
          permissions: { manage: canManage(), manage_owners: myRole() === "Owner" },
          updated_at: o.updated_at,
        },
      },
    });
  },
  // The organisation's identity on X-Road, which the X-Road operator sets: read only. Who manages its Security Server is on the organisation.
  "GET /api/demo/organization/xroad": () => {
    const { id, ...attributes } = xroadIdentity.rows()[0]!;
    return json(200, { data: { type: "xroad_identities", id, attributes } });
  },
  "GET /api/demo/organization/xroad/directory": () => {
    const { id, instance } = xroadIdentity.rows()[0]!;
    const members = xroadDirectory.map((m) => ({
      // A member's id is its name in the directory, not a record of ours.
      id: m.id,
      name: m.name,
      member_class: m.memberClass,
      member_code: m.memberCode,
      subsystems: m.subsystems.map((sub) => ({
        code: sub.code,
        description: sub.description,
        services: sub.services.map((v) => ({
          code: v.code,
          name: v.name,
          description: v.description,
          methods: v.methods,
          built_with_openfn: v.builtWithOpenFn ?? false,
          record: v.record && {
            owner: v.record.owner,
            purpose: v.record.purpose,
            data_exchanged: v.record.dataExchanged,
            legal_basis: v.record.legalBasis,
            classification: v.record.classification,
            sla: v.record.sla,
            version: v.record.version,
            access_conditions: v.record.accessConditions,
          },
        })),
      })),
    }));
    return json(200, { data: { type: "xroad_directories", id, attributes: { instance, synced_at: ago(12 * 60_000), members } } });
  },
  "PATCH /api/demo/organization": (_params, body) => {
    if (!canManage()) return forbidden();
    const o = org.rows()[0]!;
    const errors: Entry[] = unknownKeys(body, ["visibility", "security_server_managed_by"]);
    const visibility = body["visibility"] as Record<string, unknown> | undefined;
    if (visibility) {
      errors.push(...unknownKeys(visibility, ["projects", "systems", "services"], "visibility/"));
      for (const [k, v] of Object.entries(visibility)) {
        if (!SCOPES.includes(v as VisibilityScope)) errors.push({ code: "inclusion", detail: "must be project, organization or server", pointer: `#/visibility/${k}` });
      }
    }
    const managedBy = body["security_server_managed_by"];
    if (managedBy !== undefined && !(managedBy as string in securityServerManagerLabels)) errors.push({ code: "inclusion", detail: "is not a known manager", pointer: "#/security_server_managed_by" });
    if (errors.length) return invalid(errors);
    const next: OrgRow = {
      ...o,
      visibility: { ...o.visibility, ...(visibility as Partial<OrgRow["visibility"]>) },
      security_server_managed_by: (managedBy as SecurityServerManager | undefined) ?? o.security_server_managed_by,
      updated_at: now(),
    };
    org.update(() => true, () => next);
    record("updated", { type: "organization", id: o.id, name: o.name }, { before: { ...o.visibility, managed_by: o.security_server_managed_by }, after: { ...next.visibility, managed_by: next.security_server_managed_by } }, true);
    return organizationRoutes["GET /api/demo/organization"]!({}, {}, new URLSearchParams());
  },

  "GET /api/demo/organization/members": (_params, _body, query) => {
    const order = (m: OrgMemberRow) => ROLES.indexOf(m.role);
    const rows = orgMembers.rows().sort((a, b) => order(a) - order(b) || memberEntry(a).attributes.name.localeCompare(memberEntry(b).attributes.name));
    return json(200, paged("/api/demo/organization/members", rows.map(memberEntry), query));
  },
  // Invites someone by email. Someone already on the instance joins at once.
  "POST /api/demo/organization/members": (_params, body) => {
    if (!canManage()) return forbidden();
    const errors: Entry[] = unknownKeys(body, ["email", "role", "name"]);
    const email = typeof body["email"] === "string" ? body["email"].trim() : "";
    const role = (body["role"] ?? "Member") as OrgRole;
    if (!email) errors.push({ code: "required", detail: "can't be blank", pointer: "#/email" });
    else if (!EMAIL_RE.test(email)) errors.push({ code: "format", detail: "is not an email address", pointer: "#/email" });
    else if (orgMembers.rows().some((m) => m.email.toLowerCase() === email.toLowerCase())) errors.push({ code: "taken", detail: "is already in the organisation", pointer: "#/email" });
    if (!ROLES.includes(role)) errors.push({ code: "inclusion", detail: "must be Owner, Admin or Member", pointer: "#/role" });
    if (errors.length) return invalid(errors);
    if (role === "Owner" && myRole() !== "Owner") return forbidden();
    const user = findUserByEmail(email);
    const at = now();
    const row: OrgMemberRow = {
      id: crypto.randomUUID(),
      email,
      name: user ? fullName(user) : typeof body["name"] === "string" && body["name"].trim() ? body["name"].trim() : email,
      role,
      joined_at: user ? at : null,
      last_active_at: null,
      inserted_at: at,
    };
    orgMembers.insert(row);
    record(user ? "member_added" : "member_invited", { type: "organization", id: org.rows()[0]!.id, name: org.rows()[0]!.name }, { after: { [email]: role } }, true);
    return json(201, { data: memberEntry(row) });
  },
  "PATCH /api/demo/organization/members/:id": ({ id }, body) => {
    if (!canManage()) return forbidden();
    if (!isUuid(id)) return badId("id");
    const m = orgMembers.rows().find((r) => r.id === id);
    if (!m) return notFound();
    const errors: Entry[] = unknownKeys(body, ["role"]);
    const role = body["role"] as OrgRole;
    if (!ROLES.includes(role)) errors.push({ code: "inclusion", detail: "must be Owner, Admin or Member", pointer: "#/role" });
    if (errors.length) return invalid(errors);
    const refused = roleProblem(m, role);
    if (refused) return refused;
    orgMembers.update((r) => r.id === id, (r) => ({ ...r, role }));
    record("role_changed", { type: "organization", id: org.rows()[0]!.id, name: org.rows()[0]!.name }, { before: { [m.email]: m.role }, after: { [m.email]: role } }, true);
    return json(200, { data: memberEntry({ ...m, role }) });
  },
  // Removes a member, or withdraws an invitation.
  "DELETE /api/demo/organization/members/:id": ({ id }) => {
    if (!canManage()) return forbidden();
    if (!isUuid(id)) return badId("id");
    const m = orgMembers.rows().find((r) => r.id === id);
    if (!m) return notFound();
    const refused = roleProblem(m, null);
    if (refused) return refused;
    orgMembers.remove((r) => r.id === id);
    record("member_removed", { type: "organization", id: org.rows()[0]!.id, name: org.rows()[0]!.name }, { before: { [m.email]: m.role } }, true);
    return noContent();
  },

  "GET /api/demo/organization/context_layers": (_params, _body, query) =>
    json(200, paged("/api/demo/organization/context_layers", contextLayers.rows().map(layerEntry), query)),
  // Asks for a layer by its URL. It waits for its owners to approve.
  "POST /api/demo/organization/context_layers": (_params, body) => {
    if (!canManage()) return forbidden();
    const errors: Entry[] = unknownKeys(body, ["url"]);
    const url = typeof body["url"] === "string" ? body["url"].trim() : "";
    if (!url) errors.push({ code: "required", detail: "can't be blank", pointer: "#/url" });
    else if (!URL_RE.test(url)) errors.push({ code: "format", detail: "must be an http or https URL", pointer: "#/url" });
    else if (contextLayers.rows().some((l) => l.url === url)) errors.push({ code: "taken", detail: "is already connected or requested", pointer: "#/url" });
    if (errors.length) return invalid(errors);
    const host = new URL(url).host;
    const row: ContextLayerRow = { id: crypto.randomUUID(), name: host, host: url, url, status: "pending", last_fetched_at: null, inserted_at: now() };
    contextLayers.insert(row);
    record("context_requested", { type: "organization", id: org.rows()[0]!.id, name: org.rows()[0]!.name }, { after: { url } }, true);
    return json(201, { data: layerEntry(row) });
  },
  "DELETE /api/demo/organization/context_layers/:id": ({ id }) => {
    if (!canManage()) return forbidden();
    if (!isUuid(id)) return badId("id");
    const l = contextLayers.rows().find((r) => r.id === id);
    if (!l) return notFound();
    contextLayers.remove((r) => r.id === id);
    record("context_removed", { type: "organization", id: org.rows()[0]!.id, name: org.rows()[0]!.name }, { before: { url: l.url } }, true);
    return noContent();
  },
};
