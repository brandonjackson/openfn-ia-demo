import type { Environment } from "./credentials";
import type { FeatureFlags } from "./feature-flags";
/**
 * How OpenFn reaches a system. Workflows and adaptors reference the system,
 * never the transport: a step on an X-Road system looks the same as one on
 * a direct system, and the X-Road route and headers come from here and the
 * organisation's X-Road settings.
 */
import type { XRoadAgreement, XRoadConnectionStatus, XRoadRoute } from "./xroad";
export type SystemConnection =
  | { method: "direct" }
  | {
      method: "xroad";
      route: XRoadRoute;
      status: XRoadConnectionStatus;
      /** When each status was reached, oldest first. */
      history: { status: XRoadConnectionStatus; date: string }[];
      agreement?: XRoadAgreement;
      /** When access was last checked with `allowedMethods`. */
      accessCheckedAt: string;
      /** What `allowedMethods` said we may call. */
      allowedMethods: string[];
    };

export type ConnectionMethod = SystemConnection["method"];

export interface ConnectedSystem {
  id: string;
  name: string;
  description: string;
  credentialType: "user" | "org";
  /** Whether the current user personally has access to this system. */
  hasAccess: boolean;
  color: string;
  /** OpenFn adaptor package id, used for the system's logo. */
  adaptor: string;
  owner: string;
  ownerType: "user" | "org";
  /** Where the system lives, and which credential reaches it, in each environment. */
  environments: Record<Environment, SystemEnvironment>;
  apiDocsUrl?: string;
  linkTo?: string;
  /** Direct (standard credentials) when unset. */
  connection?: SystemConnection;
}

/** How a system is reached; systems without one are reached directly. */
export function connectionOf(system: ConnectedSystem): SystemConnection {
  return system.connection ?? { method: "direct" };
}

/** A system's row on the Systems list: how it's reached, whether you have access, and its production address. */
export function systemListItem(s: ConnectedSystem): SystemListItem {
  const url = s.environments.production.url;
  const connection = connectionOf(s);
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    metadata: {
      credentialType: s.credentialType,
      access: s.hasAccess ? "yes" : "no",
      adaptor: s.adaptor,
      connection: connection.method,
      ...(connection.method === "xroad" ? { xroadStatus: connection.status } : {}),
      ...(url ? { url } : {}),
    },
    linkTo: s.linkTo,
  };
}

/** A system as the Overview summarises it. */
export function systemSummary(s: ConnectedSystem): ConnectedSystemSummary {
  return { id: s.id, name: s.name, credentialType: s.credentialType, hasAccess: s.hasAccess, color: s.color, adaptor: s.adaptor };
}

/** What editing a connected system changes. */
export interface SystemChanges {
  name: string;
  description: string;
  /** Where its API is documented; blank for none. */
  docsUrl: string;
  /** Where it lives in each environment. Left out for a system reached over X-Road, whose route says where. */
  urls?: Record<Environment, string>;
}

/** How one connected system is reached in one environment. */
export interface SystemEnvironment {
  url?: string;
  /** Name of the credential used in this environment, if one has been added. */
  credential?: string;
}

export interface ConnectedSystemSummary {
  id: string;
  name: string;
  credentialType: "user" | "org";
  hasAccess: boolean;
  color: string;
  /** OpenFn adaptor package id, used for the system's logo. */
  adaptor?: string;
}

/** A system we suggest connecting. */
export interface SuggestedSystem {
  name: string;
  description: string;
  adaptor?: string;
}

export interface AccessGrant {
  id: string;
  grantedTo: string;
  grantedToType: "user" | "project";
  scope: string;
  lastAccessed: string | null;
}

/** True for a system reached over X-Road, which isn't there without the X-Road flag. */
export function isXRoadSystem(system: ConnectedSystem): boolean {
  return connectionOf(system).method === "xroad";
}

/** The systems the flags leave: none without Connected systems, and none reached over X-Road without X-Road. */
export function systemsFor(flags: FeatureFlags, systems: ConnectedSystem[]): ConnectedSystem[] {
  if (!flags.connectedSystems) return [];
  return flags.xroad ? systems : systems.filter((s) => !isXRoadSystem(s));
}

export interface SystemListItem {
  id: string;
  name: string;
  description: string;
  metadata?: Record<string, string>;
  linkTo?: string;
}
