/**
 * The organisation, on the demo's own routes (`/api/demo/organization`;
 * Lightning's API has no organisations): its settings, members and context
 * layers, and the hooks Organization settings calls.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BillingDetails, ContextLayer, OrganizationInvite, OrganizationMember, VisibilityScope } from "../model/organization";
import type { OrgXRoadSettings, SecurityServerManager, XRoadCertificate, XRoadMemberClass, XRoadSubsystem } from "../model/xroad";
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
      member_class: XRoadMemberClass;
      member_code: string;
      member_name: string;
      subsystems: XRoadSubsystem[];
      certificates: (Omit<XRoadCertificate, "expires"> & { expires_at: string })[];
      security_servers: { id: string; code: string; address: string; version: string; enabled: boolean; last_seen_at: string | null }[];
    };
  };
}

const keys = {
  organization: ["organization"] as const,
  xroad: ["organization", "xroad"] as const,
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
      canManage: a.permissions.manage,
      canManageOwners: a.permissions.manage_owners,
    }),
  });
  return { status: statusOf(query), organization: query.data };
}

/**
 * The organisation's identity on X-Road, which the X-Road operator sets, with
 * who manages its Security Server (saved on the organisation). Loads nothing
 * while `enabled` is false.
 */
export function useOrganizationXRoad(
  managedBy: SecurityServerManager | undefined,
  enabled: boolean,
): { status: LoadStatus; xroad: OrgXRoadSettings | undefined } {
  const query = useQuery({
    queryKey: keys.xroad,
    queryFn: () => request<ApiXRoadIdentity>("GET", "/api/demo/organization/xroad"),
    enabled,
  });
  if (!enabled) return { status: { state: "ready" }, xroad: undefined };
  const a = query.data?.data.attributes;
  return {
    status: statusOf(query),
    xroad:
      a && managedBy
        ? {
            instance: a.instance,
            memberClass: a.member_class,
            memberCode: a.member_code,
            memberName: a.member_name,
            subsystems: a.subsystems,
            certificates: a.certificates.map(({ expires_at, ...c }) => ({ ...c, expires: formatDate(expires_at) })),
            securityServers: a.security_servers.map((v) => ({ id: v.id, code: v.code, address: v.address, version: v.version, enabled: v.enabled, lastSeen: timeAgo(v.last_seen_at) })),
            managedBy,
          }
        : undefined,
  };
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
