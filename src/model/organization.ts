/**
 * The organisation. Its name and members are the API's
 * (api/organizations.md); its visibility defaults, context layers, X-Road
 * identity and billing are on the demo's own routes (`/api/demo/organization`).
 */
import type { OrgXRoadSettings } from "./xroad";

/** Someone in the organisation. */
export interface OrganizationMember {
  /** Their user id. */
  id: string;
  name: string;
  email: string;
  /** Admins manage the organisation and its members; members read them. There's no owner. */
  role: "Admin" | "Member";
  /** When they joined, e.g. "3 days ago". */
  joined: string;
}

export interface BillingDetails {
  plan: string;
  /** e.g. "$1,200 / month". */
  price: string;
  renewsOn: string;
  runsUsed: number;
  runsIncluded: number;
  invoices: { id: string; date: string; amount: string; status: "Paid" | "Due" }[];
}

/** A context layer: a shared source of handbook, systems and services. */
export interface ContextLayer {
  id: string;
  name: string;
  /** Where the layer lives, e.g. "Hosted on OpenFn Cloud". */
  host: string;
  url: string;
  status: "connected" | "pending";
  /** Human-readable time of the last successful fetch. */
  lastFetched?: string;
}

/** Who can find and use something by default: its project's members, the whole organisation, or everyone on the server. */
export type VisibilityScope = "project" | "organization" | "server";

/** A role in the organisation, from most to least it can do. */
export const organizationRoles: OrganizationMember["role"][] = ["Admin", "Member"];

/** Someone on OpenFn to add to the organisation, by email. */
export interface OrganizationInvite {
  email: string;
  role: OrganizationMember["role"];
}

/** Everything the organisation sets once: who's in it, what others see, where its context comes from, X-Road and billing. */
export interface OrganizationSettings {
  name: string;
  members: OrganizationMember[];
  /** Default discoverability and access for new projects, systems and services. Systems and services are absent when the organisation has none. */
  visibility: { projects: VisibilityScope; systems?: VisibilityScope; services?: VisibilityScope };
  /** Shared sources of handbook pages, systems and services the organisation draws on. */
  contextLayers: ContextLayer[];
  /** Its identity on X-Road. Absent when it isn't on X-Road, which leaves out the X-Road section. */
  xroad?: OrgXRoadSettings;
  /** How many connected systems and published services use the X-Road settings. */
  xroadUsage: { systems: number; services: number };
  billing: BillingDetails;
}
