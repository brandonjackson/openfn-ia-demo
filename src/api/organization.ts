/**
 * The organisation: its name, your role and its members from the API
 * (`/api/organizations`, api/organizations.md), and what the demo adds, its
 * visibility defaults, logo, X-Road identity and billing, from the
 * demo's own routes (`/api/demo/organization`). The hooks Organization
 * settings calls.
 *
 * The demo shows one organisation: the first you're in, by name, from
 * `GET /api/organizations` (a superuser is listed every one, so theirs comes
 * first). Picking between several is still to come (docs/api-gaps.md).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BillingDetails, OrganizationInvite, OrganizationMember, VisibilityScope } from "../model/organization";
import type { SecurityServerManager, ServiceClassification, XRoadCertificate, XRoadIdentity, XRoadMember, XRoadMemberClass } from "../model/xroad";
import { formatDate, timeAgo } from "../model/time";
import { listAll, request } from "./client";
import { combine, statusOf, type LoadStatus } from "./status";

type Visibility = { projects: VisibilityScope; systems: VisibilityScope; services: VisibilityScope };

/** An organization as `GET /api/organizations` lists it. */
interface ApiOrganization {
  id: string;
  attributes: { name: string; role: "admin" | "member" | null };
}

/** What the demo adds to the organisation, from `GET /api/demo/organization`. */
interface ApiOrganizationSettings {
  data: {
    attributes: {
      visibility: Visibility;
      security_server_managed_by: SecurityServerManager;
      logo: string | null;
      xroad_usage: { systems: number; services: number };
      billing: BillingDetails;
      mcp_server_url: string;
    };
  };
}

interface ApiMember {
  id: string;
  attributes: { email: string; first_name: string; last_name: string; role: "admin" | "member"; inserted_at: string };
}

/** The organisation as Organization settings shows it, with what you may change. */
export interface Organization {
  id: string;
  name: string;
  visibility: Visibility;
  managedBy: SecurityServerManager;
  /** Its logo, as a data URL. Absent without one. */
  logo?: string;
  xroadUsage: { systems: number; services: number };
  billing: BillingDetails;
  /** Its MCP server, where every service with MCP on is a tool for agents. */
  mcpServerUrl: string;
  /** Its admins change its settings, logo and members. */
  canManage: boolean;
}

/** The organisation's X-Road identity as GET /api/demo/organization/xroad sends it. */
interface ApiXRoadIdentity {
  data: {
    attributes: {
      instance: string;
      member_class: string;
      member_code: string;
      member_name: string;
      subsystems: { code: string; description: string; openfn: boolean }[];
      certificates: { id: string; kind: string; subject: string; issuer: string; expires_at: string; status: string }[];
      security_servers: { id: string; code: string; address: string; version: string; enabled: boolean; last_seen_at: string | null }[];
    };
  };
}

interface ApiXRoadDirectory {
  data: {
    attributes: {
      instance: string;
      synced_at: string;
      members: {
        id: string;
        name: string;
        member_class: string;
        member_code: string;
        subsystems: {
          code: string;
          description: string;
          services: {
            code: string;
            name: string;
            description: string;
            methods: string[];
            built_with_openfn: boolean;
            record?: {
              owner: string;
              purpose: string;
              data_exchanged: string;
              legal_basis: string;
              classification: string;
              sla: string;
              version: string;
              access_conditions: string;
            };
          }[];
        }[];
      }[];
    };
  };
}

const keys = {
  organizations: ["organizations"] as const,
  organization: ["organization"] as const,
  xroad: ["organization", "xroad"] as const,
  directory: ["organization", "xroad", "directory"] as const,
  members: ["organization", "members"] as const,
};

/** The organisation you're in: the first by name that you belong to, or the first you're listed. */
function useYourOrganization(enabled = true) {
  return useQuery({
    queryKey: keys.organizations,
    enabled,
    queryFn: () => listAll<ApiOrganization>("/api/organizations"),
    select: (rows) => rows.find((o) => o.attributes.role) ?? rows[0],
  });
}

/**
 * The organisation you're in, with what the demo adds to it. `organization`
 * stays undefined, with the status ready, when you're in none. Loads nothing
 * while `enabled` is false.
 */
export function useOrganization(enabled = true): { status: LoadStatus; organization: Organization | undefined } {
  const yours = useYourOrganization(enabled);
  const settings = useQuery({
    queryKey: keys.organization,
    enabled,
    queryFn: () => request<ApiOrganizationSettings>("GET", "/api/demo/organization"),
    select: ({ data: { attributes: a } }) => a,
  });
  const o = yours.data;
  const a = settings.data;
  if (!enabled) return { status: { state: "ready" }, organization: undefined };
  return {
    status: combine(statusOf(yours), statusOf(settings)),
    organization:
      o && a
        ? {
            id: o.id,
            name: o.attributes.name,
            visibility: a.visibility,
            managedBy: a.security_server_managed_by,
            ...(a.logo && { logo: a.logo }),
            xroadUsage: a.xroad_usage,
            billing: a.billing,
            mcpServerUrl: a.mcp_server_url,
            canManage: o.attributes.role === "admin",
          }
        : undefined,
  };
}

/**
 * The organisation's identity on X-Road, which the X-Road operator sets, or
 * none. Loads nothing while `enabled` is false.
 */
export function useOrganizationXRoad(enabled: boolean): { status: LoadStatus; xroad: XRoadIdentity | undefined } {
  const query = useQuery({
    queryKey: keys.xroad,
    // None is a 404 (beside Lightning, an organisation that isn't on X-Road): that's "not on X-Road", not a failure.
    queryFn: () =>
      request<ApiXRoadIdentity>("GET", "/api/demo/organization/xroad").then(
        (a) => a.data.attributes,
        (e: unknown) => {
          if ((e as { code?: string }).code === "not_found") return null;
          throw e;
        },
      ),
    enabled,
    select: (a): XRoadIdentity | null => a && ({
      instance: a.instance,
      memberClass: a.member_class as XRoadMemberClass,
      memberCode: a.member_code,
      memberName: a.member_name,
      subsystems: a.subsystems.map((v) => ({ code: v.code, description: v.description, openfn: v.openfn })),
      certificates: a.certificates.map((c) => ({
        id: c.id,
        kind: c.kind as XRoadCertificate["kind"],
        subject: c.subject,
        issuer: c.issuer,
        expires: formatDate(c.expires_at),
        status: c.status as XRoadCertificate["status"],
      })),
      securityServers: a.security_servers.map((v) => ({ id: v.id, code: v.code, address: v.address, version: v.version, enabled: v.enabled, lastSeen: timeAgo(v.last_seen_at) })),
    }),
  });
  return enabled ? { status: statusOf(query), xroad: query.data ?? undefined } : { status: { state: "ready" }, xroad: undefined };
}

/** The X-Road directory: every member on the organisation's X-Road instance, as its Security Server last listed them. */
export interface XRoadDirectory {
  /** The X-Road instance the directory is for, e.g. `FJ`. */
  instance: string;
  /** When the Security Server last listed the directory. */
  syncedAt: string;
  members: XRoadMember[];
}

/** The X-Road directory. Loads nothing while `enabled` is false. */
export function useXRoadDirectory(enabled: boolean): { status: LoadStatus; directory: XRoadDirectory | undefined } {
  const query = useQuery({
    queryKey: keys.directory,
    queryFn: () => request<ApiXRoadDirectory>("GET", "/api/demo/organization/xroad/directory"),
    enabled,
    select: ({ data: { attributes: a } }): XRoadDirectory => ({
      instance: a.instance,
      syncedAt: a.synced_at,
      members: a.members.map((m) => ({
        id: m.id,
        name: m.name,
        memberClass: m.member_class as XRoadMemberClass,
        memberCode: m.member_code,
        subsystems: m.subsystems.map((sub) => ({
          code: sub.code,
          description: sub.description,
          services: sub.services.map((v) => ({
            code: v.code,
            name: v.name,
            description: v.description,
            methods: v.methods,
            builtWithOpenFn: v.built_with_openfn || undefined,
            record: v.record && {
              owner: v.record.owner,
              purpose: v.record.purpose,
              dataExchanged: v.record.data_exchanged,
              legalBasis: v.record.legal_basis,
              classification: v.record.classification as ServiceClassification,
              sla: v.record.sla,
              version: v.record.version,
              accessConditions: v.record.access_conditions,
            },
          })),
        })),
      })),
    }),
  });
  return enabled ? { status: statusOf(query), directory: query.data } : { status: { state: "ready" }, directory: undefined };
}

const roleOf = { admin: "Admin", member: "Member" } as const;
const apiRole = (role: OrganizationMember["role"]) => (role === "Admin" ? "admin" : "member");

/** Everyone in the organisation `organizationId`, by first name. Loads nothing until it's known. */
export function useOrganizationMembers(organizationId: string | undefined): { status: LoadStatus; members: OrganizationMember[] } {
  const query = useQuery({
    queryKey: [...keys.members, organizationId],
    queryFn: () => listAll<ApiMember>(`/api/organizations/${organizationId}/members`),
    enabled: !!organizationId,
    select: (rows) =>
      rows.map(({ id, attributes: a }): OrganizationMember => ({
        id,
        name: `${a.first_name} ${a.last_name}`.trim() || a.email,
        email: a.email,
        role: roleOf[a.role],
        joined: timeAgo(a.inserted_at),
      })),
  });
  return organizationId ? { status: statusOf(query), members: query.data ?? [] } : { status: { state: "ready" }, members: [] };
}

/**
 * Every change Organization settings makes. Each resolves once what it
 * changed has reloaded, and rejects with what the server said.
 */
export function useOrganizationSaves(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  const run = useMutation({
    mutationFn: ({ work }: { work: () => Promise<unknown>; reload: (readonly string[])[] }) => work(),
    onSuccess: (_d, { reload }) => Promise.all(reload.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  });
  const go = (reload: (readonly string[])[], work: () => Promise<unknown>) => run.mutateAsync({ work, reload }).then(() => undefined);
  const members = `/api/organizations/${organizationId}/members`;
  return {
    // The name is the API's organization, which every page reads from the list.
    rename: (name: string) => go([keys.organizations], () => request("PATCH", `/api/organizations/${organizationId}`, { name })),
    saveVisibility: (visibility: Partial<Visibility>) => go([keys.organization], () => request("PATCH", "/api/demo/organization", { visibility })),
    saveSecurityServerManager: (managedBy: SecurityServerManager) =>
      go([keys.organization], () => request("PATCH", "/api/demo/organization", { security_server_managed_by: managedBy })),
    invite: (invite: OrganizationInvite) => go([keys.members], () => request("POST", `${members}`, { email: invite.email, role: apiRole(invite.role) })),
    // Your own role may change, and with it what you can do: reload the organisation and its members.
    changeRole: (userId: string, role: OrganizationMember["role"]) => go([keys.organizations, ["organization"]], () => request("PATCH", `${members}/${userId}`, { role: apiRole(role) })),
    remove: (userId: string) => go([keys.organizations, ["organization"]], () => request("DELETE", `${members}/${userId}`)),
    // The logo shows in the shell's corner too, which reads the organisation.
    saveLogo: (logo: string) => go([keys.organization], () => request("PUT", "/api/demo/organization/logo", { logo })),
    removeLogo: () => go([keys.organization], () => request("DELETE", "/api/demo/organization/logo")),
  };
}
