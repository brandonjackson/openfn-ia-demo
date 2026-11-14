/**
 * What the demo adds to an organisation on the pretend server: the defaults
 * for what others can see, its logo, its X-Road identity, and billing. The organisation itself, its name and members, is the
 * API's (`organizations.ts`, api/organizations.md); these extras aren't in it,
 * so they live under `/api/demo/` and follow api/conventions.md. They're one
 * set, for the organisation you're in.
 *
 * Lifecycle:
 * - Visibility defaults and who manages the Security Server are saved with
 *   `PATCH /api/demo/organization`; the rest of the X-Road identity is set
 *   by the X-Road operator, not here, and read from
 *   `GET /api/demo/organization/xroad`. So is the X-Road directory, every
 *   member on the organisation's X-Road instance with their subsystems and
 *   services (`GET /api/demo/organization/xroad/directory`), as the
 *   organisation's Security Server last listed it.
 * - Its logo is an image sent as a data URL (`PUT /api/demo/organization/logo`:
 *   PNG, JPEG, SVG or WebP, up to 256 KB), and taken off with `DELETE`.
 * - Billing is read only.
 * Anyone in the organisation reads all of it; its admins change it.
 */
import { organizationSettingsData } from "../fixtures/organization";
import { orgXRoad, xroadDirectory } from "../fixtures/xroad";
import { mcpServerUrl } from "../fixtures/service-catalog";
import { seedId } from "../fixtures/ids";
import { LOGO_ACCEPT, LOGO_MAX_BYTES, type VisibilityScope } from "../model/organization";
import { securityServerManagerLabels, type SecurityServerManager } from "../model/xroad";
import { forbidden, invalid, json, noContent, notFound, now, unknownKeys, type Entry, type Handler } from "./answers";
import { record } from "./audit";
import { ago, seedTime, table } from "./db";
import { managesAnOrganization as canManage } from "./organizations";
import { systems } from "./connected-systems";
import { services } from "./services";

interface OrgRow {
  id: string;
  name: string;
  visibility: { projects: VisibilityScope; systems: VisibilityScope; services: VisibilityScope };
  security_server_managed_by: SecurityServerManager;
  /** Its logo, as a data URL, or null for none. */
  logo: string | null;
  updated_at: string;
}

const DAY = 86_400_000;

const orgDefaults = (): OrgRow => ({
  id: seedId("organization", organizationSettingsData.name),
  name: organizationSettingsData.name,
  visibility: { projects: "project", systems: "organization", services: "organization" },
  security_server_managed_by: "this-org",
  logo: null,
  updated_at: now(),
});

// Beside Lightning the extras start at their defaults, so the page has something to show and change.
const org = table<OrgRow>(
  "organization",
  () => {
    const v = organizationSettingsData.visibility;
    return [
      {
        ...orgDefaults(),
        visibility: { projects: v.projects, systems: v.systems ?? "organization", services: v.services ?? "organization" },
        security_server_managed_by: organizationSettingsData.xroad?.managedBy ?? "this-org",
        updated_at: ago(30 * DAY),
      },
    ];
  },
  { empty: () => [orgDefaults()] },
);

const SCOPES: VisibilityScope[] = ["project", "organization", "server"];

const LOGO_TYPES = LOGO_ACCEPT.split(",");
const DATA_URL_RE = /^data:([a-z+/-]+);base64,([A-Za-z0-9+/]+={0,2})$/;

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

const routes: Record<string, Handler> = {
  "GET /api/demo/organization": () => {
    const o = org.rows()[0]!;
    return json(200, {
      data: {
        type: "organization_settings",
        id: o.id,
        attributes: {
          visibility: o.visibility,
          security_server_managed_by: o.security_server_managed_by,
          logo: o.logo ?? null,
          // How many connected systems and published services use the X-Road identity.
          xroad_usage: {
            systems: systems.rows().filter((s) => s.connection?.method === "xroad").length,
            services: services.rows().filter((s) => s.xroad?.published).length,
          },
          billing: organizationSettingsData.billing,
          // The organisation's MCP server, where every service with MCP on is a tool.
          mcp_server_url: mcpServerUrl,
          updated_at: o.updated_at,
        },
      },
    });
  },
  // The organisation's identity on X-Road, which the X-Road operator sets: read only. Who manages its Security Server is on the organisation.
  "GET /api/demo/organization/xroad": () => {
    const identity = xroadIdentity.rows()[0];
    // Beside Lightning the organisation isn't on X-Road, so it has no identity there.
    if (!identity) return notFound();
    const { id, ...attributes } = identity;
    return json(200, { data: { type: "xroad_identities", id, attributes } });
  },
  "GET /api/demo/organization/xroad/directory": () => {
    const identity = xroadIdentity.rows()[0];
    // Without an X-Road identity (beside Lightning) there's no instance to list, so the directory is empty.
    if (!identity) return json(200, { data: { type: "xroad_directories", id: seedId("xroad_directory", "none"), attributes: { instance: "", synced_at: now(), members: [] } } });
    const { id, instance } = identity;
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

  // Sets the logo from an image sent as a data URL.
  "PUT /api/demo/organization/logo": (_params, body) => {
    if (!canManage()) return forbidden();
    const errors: Entry[] = unknownKeys(body, ["logo"]);
    const logo = typeof body["logo"] === "string" ? body["logo"] : "";
    const match = DATA_URL_RE.exec(logo);
    if (!logo) errors.push({ code: "required", detail: "can't be blank", pointer: "#/logo" });
    else if (!match) errors.push({ code: "format", detail: "must be an image sent as a base64 data URL", pointer: "#/logo" });
    else if (!LOGO_TYPES.includes(match[1]!)) errors.push({ code: "inclusion", detail: "must be a PNG, JPEG, SVG or WebP image", pointer: "#/logo" });
    else if (Math.floor((match[2]!.length * 3) / 4) > LOGO_MAX_BYTES) errors.push({ code: "too_large", detail: "must be 256 KB or smaller", pointer: "#/logo" });
    if (errors.length) return invalid(errors);
    const o = org.rows()[0]!;
    org.update(() => true, () => ({ ...o, logo, updated_at: now() }));
    record("logo_updated", { type: "organization", id: o.id, name: o.name }, {}, true);
    return organizationRoutes["GET /api/demo/organization"]!({}, {}, new URLSearchParams());
  },
  // Takes the logo off, so the organisation's initials stand in.
  "DELETE /api/demo/organization/logo": () => {
    if (!canManage()) return forbidden();
    const o = org.rows()[0]!;
    org.update(() => true, () => ({ ...o, logo: null, updated_at: now() }));
    record("logo_removed", { type: "organization", id: o.id, name: o.name }, {}, true);
    return noContent();
  },
};

export const organizationRoutes = routes;
