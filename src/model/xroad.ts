
/**
 * X-Road: the organisation's identity on the national data exchange, the
 * directory of other members (what `listClients` returns), and the routes
 * connected systems take through it.
 *
 * OpenFn is always a subsystem under the owning organisation (here the
 * Ministry of Health's `OPENFN` subsystem), never a member in its own right.
 * Connected systems and published services reuse these settings instead of
 * asking for them each time.
 */

/* ------------------------------------------------------------------ */
/*  Identity                                                           */
/* ------------------------------------------------------------------ */

export type XRoadMemberClass = "GOV" | "COM" | "NGO";

export const memberClassLabels: Record<XRoadMemberClass, string> = {
  GOV: "Government",
  COM: "Commercial",
  NGO: "Non-profit",
};

export interface XRoadSubsystem {
  code: string;
  description: string;
  /** Whether OpenFn publishes and calls services as this subsystem. */
  openfn: boolean;
}

export interface XRoadCertificate {
  id: string;
  kind: "Authentication" | "Signing";
  subject: string;
  issuer: string;
  expires: string;
  status: "valid" | "expiring";
}

export interface SecurityServer {
  id: string;
  code: string;
  address: string;
  version: string;
  enabled: boolean;
  lastSeen: string;
}

/** Who runs the Security Server the organisation's traffic goes through. */
export type SecurityServerManager = "this-org" | "national-operator" | "partner";

export const securityServerManagerLabels: Record<SecurityServerManager, { label: string; hint: string }> = {
  "this-org": { label: "This organisation", hint: "Your own team installs, patches and configures it." },
  "national-operator": {
    label: "National operator",
    hint: "A shared Security Server run by the X-Road operator on your behalf.",
  },
  partner: { label: "Partner", hint: "A partner organisation or vendor runs it under contract." },
};

export interface OrgXRoadSettings {
  instance: string;
  memberClass: XRoadMemberClass;
  memberCode: string;
  memberName: string;
  subsystems: XRoadSubsystem[];
  certificates: XRoadCertificate[];
  securityServers: SecurityServer[];
  managedBy: SecurityServerManager;
}

/** The organisation's identity on X-Road, as the X-Road operator set it. Who manages its Security Server is the organisation's own setting. */
export type XRoadIdentity = Omit<OrgXRoadSettings, "managedBy">;

/* ------------------------------------------------------------------ */
/*  Service records                                                    */
/* ------------------------------------------------------------------ */

export type ServiceClassification = "Public" | "Internal" | "Confidential" | "Restricted";

/**
 * What a national API catalogue records about a service, modelled on
 * Madagascar's government API catalogue.
 */
export interface ServiceRecord {
  owner: string;
  purpose: string;
  dataExchanged: string;
  legalBasis: string;
  classification: ServiceClassification;
  sla: string;
  version: string;
  accessConditions: string;
}

/* ------------------------------------------------------------------ */
/*  Directory (listClients)                                            */
/* ------------------------------------------------------------------ */

export interface XRoadService {
  code: string;
  /** Named as an action: what you can do with it. */
  name: string;
  description: string;
  /** The endpoints a client can be allowed (what `allowedMethods` lists). */
  methods: string[];
  /** Published from an OpenFn workflow on the provider's side. */
  builtWithOpenFn?: boolean;
  record?: ServiceRecord;
}

export interface XRoadDirectorySubsystem {
  code: string;
  description: string;
  services: XRoadService[];
}

export interface XRoadMember {
  id: string;
  name: string;
  memberClass: XRoadMemberClass;
  memberCode: string;
  subsystems: XRoadDirectorySubsystem[];
}

/* ------------------------------------------------------------------ */
/*  Routes and connection status                                       */
/* ------------------------------------------------------------------ */

/** Where a connected system lives on X-Road: a member's subsystem, and the service called on it. */
export interface XRoadRoute {
  memberId: string;
  subsystem: string;
  service: string;
}

/** The steps a connection to another member's service goes through, in order. */
export type XRoadConnectionStatus = "discovered" | "agreement-pending" | "operator-approval" | "access-granted" | "live";

export const xroadStatusSteps: { id: XRoadConnectionStatus; label: string }[] = [
  { id: "discovered", label: "Discovered" },
  { id: "agreement-pending", label: "Agreement pending" },
  { id: "operator-approval", label: "Operator approval" },
  { id: "access-granted", label: "Access granted" },
  { id: "live", label: "Live" },
];

/** Whether a status means calls will go through. */
export function hasXRoadAccess(status: XRoadConnectionStatus): boolean {
  return status === "access-granted" || status === "live";
}

export interface XRoadAgreement {
  name: string;
  reference: string;
  /** Unset while the agreement is still being negotiated. */
  signedOn?: string;
}

/** `nrh/OPENMRS/patients`: a route as one string, to tell routes apart. */
export function routeKey(route: XRoadRoute): string {
  return `${route.memberId}/${route.subsystem}/${route.service}`;
}

/** The organisation's subsystem that OpenFn runs as. */
export function openfnSubsystemOf(org: XRoadIdentity): XRoadSubsystem {
  return org.subsystems.find((s) => s.openfn)!;
}

/** `FJ/GOV/MOH/OPENFN`: who OpenFn is on X-Road, sent as X-Road-Client on every call it makes. */
export function clientIdOf(org: XRoadIdentity): string {
  return [org.instance, org.memberClass, org.memberCode, openfnSubsystemOf(org).code].join("/");
}

/** A member in the X-Road directory, by its id. */
export function findMember(directory: XRoadMember[], memberId: string): XRoadMember | undefined {
  return directory.find((m) => m.id === memberId);
}

/** The service a route goes to, in the X-Road directory. */
export function findService(directory: XRoadMember[], route: XRoadRoute): XRoadService | undefined {
  return findMember(directory, route.memberId)
    ?.subsystems.find((s) => s.code === route.subsystem)
    ?.services.find((s) => s.code === route.service);
}

/** `FJ/GOV/MOI/IDENTITY/verify-national-id`, as X-Road names a service. */
export function serviceIdOf(instance: string, member: XRoadMember | undefined, route: XRoadRoute): string {
  return [instance, member?.memberClass, member?.memberCode, route.subsystem, route.service].join("/");
}

/** `FJ/GOV/NRH/OPENMRS`, as X-Road names a member's subsystem. */
export function subsystemIdOf(instance: string, member: XRoadMember, subsystem: string): string {
  return [instance, member.memberClass, member.memberCode, subsystem].join("/");
}

/** The X-Road headers OpenFn reads on calls in and adds to calls out. */
export const xroadHeaders: XRoadHeader[] = [
  { name: "X-Road-Client", required: true, description: "The member and subsystem making the call." },
  { name: "X-Road-Id", required: false, description: "The message ID, to match a run to the Security Server's logs." },
  { name: "X-Road-UserId", required: false, description: "The official behind the call." },
  { name: "X-Road-Issue", required: false, description: "A business case reference, such as a case or ticket number." },
];

/* ------------------------------------------------------------------ */
/*  Headers                                                            */
/* ------------------------------------------------------------------ */

export interface XRoadHeader {
  name: string;
  required: boolean;
  description: string;
}

/** Who made a call that came in over X-Road, as a run records it. */
export interface XRoadCall {
  /** The calling member's subsystem, e.g. `FJ/GOV/NRH/OPENMRS`. */
  client: string;
  /** The calling member's name. */
  clientName: string;
  messageId: string;
  userId?: string;
  issue?: string;
}

/* ------------------------------------------------------------------ */
/*  Network                                                            */
/* ------------------------------------------------------------------ */

export interface NetworkLink {
  memberId: string;
  /** We call their services, they call ours, or both. */
  direction: "outbound" | "inbound" | "both";
}

/** What a page needs to show an X-Road route: the organisation's own settings, and where the route goes. */
export interface XRoadRouteContext {
  org: XRoadIdentity;
  /** The member the route goes to, from the directory. */
  member?: XRoadMember;
  /** The service the route goes to, from the directory. */
  service?: XRoadService;
}
