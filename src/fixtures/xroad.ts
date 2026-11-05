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

export const orgXRoad: OrgXRoadSettings = {
  instance: "FJ",
  memberClass: "GOV",
  memberCode: "MOH",
  memberName: "Ministry of Health",
  subsystems: [
    { code: "OPENFN", description: "Workflow services published from OpenFn, and the calls OpenFn makes to other members.", openfn: true },
    { code: "HMIS", description: "The national DHIS2, published directly by the HMIS team.", openfn: false },
  ],
  certificates: [
    {
      id: "cert-auth",
      kind: "Authentication",
      subject: "CN=ss1.moh.gov.fj, O=Ministry of Health",
      issuer: "Farajaland Trust Service CA",
      expires: "14 Mar 2027",
      status: "valid",
    },
    {
      id: "cert-sign",
      kind: "Signing",
      subject: "CN=MOH, O=Ministry of Health, C=FJ",
      issuer: "Farajaland Trust Service CA",
      expires: "2 Jan 2027",
      status: "expiring",
    },
  ],
  securityServers: [
    { id: "ss1", code: "MOH-SS1", address: "ss1.moh.gov.fj", version: "7.6.2", enabled: true, lastSeen: "2 minutes ago" },
  ],
  managedBy: "this-org",
};

/** The subsystem OpenFn publishes and calls as. */
export const openfnSubsystem = orgXRoad.subsystems.find((s) => s.openfn)!;

/** `FJ/GOV/MOH/OPENFN`: who OpenFn is on X-Road, sent as X-Road-Client on every call it makes. */
export const openfnClientId = [orgXRoad.instance, orgXRoad.memberClass, orgXRoad.memberCode, openfnSubsystem.code].join("/");

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

const verifyNationalId: XRoadService = {
  code: "verify-national-id",
  name: "Verify a national ID",
  description: "Checks a national ID number against the population register and says whether it matches the name and date of birth given.",
  methods: ["POST /verify"],
  builtWithOpenFn: true,
  record: {
    owner: "Ministry of Interior",
    purpose: "Confirm a person is who they say they are before a service is delivered to them.",
    dataExchanged: "Sent: national ID, name, date of birth. Returned: match yes or no, and the ID's status.",
    legalBasis: "National Identification Act 2019, s.14 (verification by public bodies)",
    classification: "Confidential",
    sla: "99.5% monthly uptime; answers within 2 seconds",
    version: "1.3",
    accessConditions: "Government members with a signed data sharing agreement. Each call must carry X-Road-UserId.",
  },
};

const patientsService: XRoadService = {
  code: "patients",
  name: "Find and register patients",
  description: "Searches the hospital's OpenMRS for a patient by identifier, and registers new patients.",
  methods: ["GET /patient", "POST /patient", "POST /encounter"],
  record: {
    owner: "National Referral Hospital",
    purpose: "Share patient identity between facilities so a referred patient keeps one record.",
    dataExchanged: "Patient identifiers, names, sex, date of birth and encounter summaries.",
    legalBasis: "Health Records Regulations 2021, reg. 9 (continuity of care)",
    classification: "Restricted",
    sla: "99% monthly uptime during clinic hours",
    version: "2.1",
    accessConditions: "Health sector members only, under a signed data sharing agreement.",
  },
};

const householdLookup: XRoadService = {
  code: "household-lookup",
  name: "Look up a household in the social registry",
  description: "Returns a household's members and the social protection programmes they are enrolled in.",
  methods: ["GET /household"],
  record: {
    owner: "Ministry of Social Protection",
    purpose: "Target health fee waivers to households already enrolled in social protection.",
    dataExchanged: "Household ID, members and programme enrolments.",
    legalBasis: "Social Protection Act 2020, s.31",
    classification: "Confidential",
    sla: "99% monthly uptime",
    version: "1.0",
    accessConditions: "Requires a data sharing agreement approved by the Ministry's data protection officer.",
  },
};

/** Every member in the national directory, as `listClients` returns them. */
export const xroadDirectory: XRoadMember[] = [
  {
    id: "moi",
    name: "Ministry of Interior",
    memberClass: "GOV",
    memberCode: "MOI",
    subsystems: [
      {
        code: "IDENTITY",
        description: "The national population register.",
        services: [
          verifyNationalId,
          {
            code: "person-by-nid",
            name: "Get a person's details by national ID",
            description: "Returns name, sex, date of birth and place of residence for a national ID.",
            methods: ["GET /person"],
          },
        ],
      },
      {
        code: "CIVREG",
        description: "Civil registration of births, deaths and marriages.",
        services: [
          {
            code: "register-birth",
            name: "Register a birth",
            description: "Declares a birth for registration with the civil registrar.",
            methods: ["POST /birth"],
          },
          {
            code: "death-by-nid",
            name: "Check whether a person has died",
            description: "Returns the registered date of death for a national ID, if there is one.",
            methods: ["GET /death"],
          },
        ],
      },
    ],
  },
  {
    id: "nrh",
    name: "National Referral Hospital",
    memberClass: "GOV",
    memberCode: "NRH",
    subsystems: [
      { code: "OPENMRS", description: "The hospital's electronic medical records.", services: [patientsService] },
    ],
  },
  {
    id: "msp",
    name: "Ministry of Social Protection",
    memberClass: "GOV",
    memberCode: "MSP",
    subsystems: [
      {
        code: "SOCIALREG",
        description: "The single registry of social protection beneficiaries.",
        services: [
          householdLookup,
          {
            code: "enrol-beneficiary",
            name: "Enrol a household in a programme",
            description: "Adds a household to a social protection programme.",
            methods: ["POST /enrolment"],
          },
        ],
      },
    ],
  },
  {
    id: "ndho",
    name: "Northern District Health Office",
    memberClass: "GOV",
    memberCode: "NDHO",
    subsystems: [
      {
        code: "SURVEILLANCE",
        description: "District disease surveillance team.",
        services: [
          {
            code: "district-alerts",
            name: "Send an outbreak alert to the district",
            description: "Raises an alert with the district rapid response team.",
            methods: ["POST /alert"],
          },
        ],
      },
    ],
  },
  {
    id: "nso",
    name: "National Statistics Office",
    memberClass: "GOV",
    memberCode: "NSO",
    subsystems: [
      {
        code: "STATS",
        description: "Official statistics.",
        services: [
          {
            code: "population-estimates",
            name: "Get population estimates for an area",
            description: "Returns the projected population of a district or facility catchment area by age and sex.",
            methods: ["GET /population"],
          },
        ],
      },
    ],
  },
  {
    id: "nhif",
    name: "National Health Insurance Fund",
    memberClass: "GOV",
    memberCode: "NHIF",
    subsystems: [
      {
        code: "CLAIMS",
        description: "Membership and claims.",
        services: [
          {
            code: "check-coverage",
            name: "Check a member's insurance cover",
            description: "Says whether a person is covered and what their plan pays for.",
            methods: ["GET /coverage"],
          },
          {
            code: "submit-claim",
            name: "Submit a claim for a visit",
            description: "Sends a claim for a patient visit for payment.",
            methods: ["POST /claim"],
          },
        ],
      },
    ],
  },
  {
    id: "medlog",
    name: "MedLogistics Ltd",
    memberClass: "COM",
    memberCode: "60023118",
    subsystems: [
      {
        code: "LMIS",
        description: "Medical stock held in district stores.",
        services: [
          {
            code: "stock-levels",
            name: "Check stock of a medicine in a district",
            description: "Returns stock on hand and months of supply for a product at each district store.",
            methods: ["GET /stock"],
          },
        ],
      },
    ],
  },
  {
    id: "frc",
    name: "Farajaland Red Cross",
    memberClass: "NGO",
    memberCode: "FRC",
    subsystems: [
      {
        code: "RELIEF",
        description: "Emergency relief distribution.",
        services: [
          {
            code: "beneficiary-check",
            name: "Check whether a household received relief",
            description: "Returns relief distributions made to a household in the last 12 months.",
            methods: ["GET /distribution"],
          },
        ],
      },
    ],
  },
];

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

export function directoryMember(id: string): XRoadMember | undefined {
  return xroadDirectory.find((m) => m.id === id);
}

export function routeService(route: XRoadRoute): XRoadService | undefined {
  return directoryMember(route.memberId)
    ?.subsystems.find((s) => s.code === route.subsystem)
    ?.services.find((s) => s.code === route.service);
}

/** `FJ/GOV/MOI/IDENTITY/verify-national-id`, as X-Road names a service. */
export function routeServiceId(route: XRoadRoute): string {
  const member = directoryMember(route.memberId);
  return [orgXRoad.instance, member?.memberClass, member?.memberCode, route.subsystem, route.service].join("/");
}

/** `FJ/GOV/NRH/OPENMRS`, as X-Road names a member's subsystem. */
export function subsystemId(member: XRoadMember, subsystem: string): string {
  return [orgXRoad.instance, member.memberClass, member.memberCode, subsystem].join("/");
}

/** The URL a call goes to: the organisation's own Security Server, which forwards it to the provider's. */
export function routeUrl(route: XRoadRoute): string {
  return `https://${orgXRoad.securityServers[0].address}/r1/${routeServiceId(route)}`;
}

/* ------------------------------------------------------------------ */
/*  Headers                                                            */
/* ------------------------------------------------------------------ */

export interface XRoadHeader {
  name: string;
  required: boolean;
  description: string;
}

/** The X-Road headers OpenFn reads on calls in and adds to calls out. */
export const xroadHeaders: XRoadHeader[] = [
  { name: "X-Road-Client", required: true, description: "The member and subsystem making the call." },
  { name: "X-Road-Id", required: false, description: "The message ID, to match a run to the Security Server's logs." },
  { name: "X-Road-UserId", required: false, description: "The official behind the call." },
  { name: "X-Road-Issue", required: false, description: "A business case reference, such as a case or ticket number." },
];

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

/** Members the organisation exchanges data with over X-Road. Those that call in are drawn on the ecosystem map. */
export const networkLinks: NetworkLink[] = [
  { memberId: "moi", direction: "outbound" },
  { memberId: "nrh", direction: "both" },
  { memberId: "msp", direction: "outbound" },
  { memberId: "ndho", direction: "inbound" },
];
