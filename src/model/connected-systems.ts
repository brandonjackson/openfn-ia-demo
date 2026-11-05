/**
 * How OpenFn reaches a system. Workflows and adaptors reference the system,
 * never the transport: a step on an X-Road system looks the same as one on
 * a direct system, and the X-Road route and headers come from here and the
 * organisation's X-Road settings.
 */
import type { Environment, SystemEnvironment } from "./page-data";
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
