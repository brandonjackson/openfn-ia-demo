/**
 * The organisation, on the demo's own routes (`/api/demo/organization`;
 * Lightning's API has no organisations): its settings, members and context
 * layers, and the hooks Organization settings calls.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BillingDetails, ContextLayer, OrganizationInvite, OrganizationMember, VisibilityScope } from "../model/organization";
import type { SecurityServerManager, ServiceClassification, XRoadCertificate, XRoadIdentity, XRoadMember, XRoadMemberClass } from "../model/xroad";
import { formatDate, timeAgo } from "../model/time";
import { listAll, request } from "./client";
import { statusOf, type LoadStatus } from "./status";

type Visibility = { projects: VisibilityScope; systems: VisibilityScope; services: VisibilityScope };

interface ApiOrganization {
  data: {
    id: string;
    attributes: {
      name: string;
      visibility: Visibility;
      security_server_managed_by: SecurityServerManager;
      xroad_usage: { systems: number; services: number };
      billing: BillingDetails;
      mcp_server_url: string;
      role: OrganizationMember["role"] | null;
      permissions: { manage: boolean; manage_owners: boolean };
    };
  };
}

interface ApiMember {
  id: string;
  attributes: { email: string; name: string; role: OrganizationMember["role"]; joined_at: string | null; last_active_at: string | null };
}

interface ApiLayer {
  id: string;
  attributes: { name: string; host: string; url: string; status: ContextLayer["status"]; last_fetched_at: string | null };
}

/** The organisation as Organization settings shows it, with what you may change. */
export interface Organization {
  id: string;
  name: string;
  visibility: Visibility;
  managedBy: SecurityServerManager;
  xroadUsage: { systems: number; services: number };
  billing: BillingDetails;
  /** Its MCP server, where every service with MCP on is a tool for agents. */
  mcpServerUrl: string;
  /** Owners and admins change its settings, members and context layers. */
  canManage: boolean;
  /** Only owners make or unmake an owner. */
  canManageOwners: boolean;
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
  organization: ["organization"] as const,
  xroad: ["organization", "xroad"] as const,
  directory: ["organization", "xroad", "directory"] as const,
  members: ["organization", "members"] as const,
  layers: ["organization", "context_layers"] as const,
};

export function useOrganization(): { status: LoadStatus; organization: Organization | undefined } {
  const query = useQuery({
    queryKey: keys.organization,
    queryFn: () => request<ApiOrganization>("GET", "/api/demo/organization"),
    select: ({ data: { id, attributes: a } }): Organization => ({
      id,
      name: a.name,
      visibility: a.visibility,
      managedBy: a.security_server_managed_by,
      xroadUsage: a.xroad_usage,
      billing: a.billing,
      mcpServerUrl: a.mcp_server_url,
      canManage: a.permissions.manage,
      canManageOwners: a.permissions.manage_owners,
    }),
  });
  return { status: statusOf(query), organization: query.data };
}

/** The organisation's identity on X-Road, which the X-Road operator sets. Loads nothing while `enabled` is false. */
export function useOrganizationXRoad(enabled: boolean): { status: LoadStatus; xroad: XRoadIdentity | undefined } {
  const query = useQuery({
    queryKey: keys.xroad,
    queryFn: () => request<ApiXRoadIdentity>("GET", "/api/demo/organization/xroad"),
    enabled,
    select: ({ data: { attributes: a } }): XRoadIdentity => ({
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
  return enabled ? { status: statusOf(query), xroad: query.data } : { status: { state: "ready" }, xroad: undefined };
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

/** Everyone in the organisation, owners first; someone invited who hasn't joined shows as invited. */
export function useOrganizationMembers(): { status: LoadStatus; members: OrganizationMember[] } {
  const query = useQuery({
    queryKey: keys.members,
    queryFn: () => listAll<ApiMember>("/api/demo/organization/members"),
    select: (rows) =>
      rows.map(({ id, attributes: a }): OrganizationMember => ({
        id,
        name: a.name,
        email: a.email,
        role: a.role,
        lastActive: !a.joined_at ? "Invited" : a.last_active_at ? timeAgo(a.last_active_at) : "Not yet",
      })),
  });
  return { status: statusOf(query), members: query.data ?? [] };
}

/** The context layers the organisation draws on, and those it's asked for. */
export function useContextLayers(): { status: LoadStatus; layers: ContextLayer[] } {
  const query = useQuery({
    queryKey: keys.layers,
    queryFn: () => listAll<ApiLayer>("/api/demo/organization/context_layers"),
    select: (rows) =>
      rows.map(({ id, attributes: a }): ContextLayer => ({
        id,
        name: a.name,
        host: a.host,
        url: a.url,
        status: a.status,
        ...(a.last_fetched_at && { lastFetched: timeAgo(a.last_fetched_at) }),
      })),
  });
  return { status: statusOf(query), layers: query.data ?? [] };
}

/**
 * Every change Organization settings makes. Each resolves once what it
 * changed has reloaded, and rejects with what the server said.
 */
export function useOrganizationSaves() {
  const queryClient = useQueryClient();
  const run = useMutation({
    mutationFn: ({ work }: { work: () => Promise<unknown>; reload: readonly string[] }) => work(),
    onSuccess: (_d, { reload }) => queryClient.invalidateQueries({ queryKey: reload }),
  });
  const go = (reload: readonly string[], work: () => Promise<unknown>) => run.mutateAsync({ work, reload }).then(() => undefined);
  return {
    saveVisibility: (visibility: Partial<Visibility>) => go(keys.organization, () => request("PATCH", "/api/demo/organization", { visibility })),
    saveSecurityServerManager: (managedBy: SecurityServerManager) =>
      go(keys.organization, () => request("PATCH", "/api/demo/organization", { security_server_managed_by: managedBy })),
    invite: (invite: OrganizationInvite) => go(keys.members, () => request("POST", "/api/demo/organization/members", invite)),
    // Your own role may change, and with it what you can do: reload the organisation too.
    changeRole: (id: string, role: OrganizationMember["role"]) => go(keys.organization, () => request("PATCH", `/api/demo/organization/members/${id}`, { role })),
    remove: (id: string) => go(keys.organization, () => request("DELETE", `/api/demo/organization/members/${id}`)),
    requestContextLayer: (url: string) => go(keys.layers, () => request("POST", "/api/demo/organization/context_layers", { url })),
    removeContextLayer: (id: string) => go(keys.layers, () => request("DELETE", `/api/demo/organization/context_layers/${id}`)),
  };
}
