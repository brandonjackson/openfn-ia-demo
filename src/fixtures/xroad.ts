import type { NetworkLink, OrgXRoadSettings, XRoadMember, XRoadRoute, XRoadService } from "../model/xroad";
import { clientIdOf, findMember, findService, openfnSubsystemOf, serviceIdOf, subsystemIdOf } from "../model/xroad";

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
export const openfnSubsystem = openfnSubsystemOf(orgXRoad);

/** `FJ/GOV/MOH/OPENFN`: who OpenFn is on X-Road, sent as X-Road-Client on every call it makes. */
export const openfnClientId = clientIdOf(orgXRoad);

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

export function directoryMember(id: string): XRoadMember | undefined {
  return findMember(xroadDirectory, id);
}

export function routeService(route: XRoadRoute): XRoadService | undefined {
  return findService(xroadDirectory, route);
}

/** `FJ/GOV/MOI/IDENTITY/verify-national-id`, as X-Road names a service. */
export function routeServiceId(route: XRoadRoute): string {
  return serviceIdOf(orgXRoad.instance, directoryMember(route.memberId), route);
}

/** `FJ/GOV/NRH/OPENMRS`, as X-Road names a member's subsystem. */
export function subsystemId(member: XRoadMember, subsystem: string): string {
  return subsystemIdOf(orgXRoad.instance, member, subsystem);
}

/** The URL a call goes to: the organisation's own Security Server, which forwards it to the provider's. */
export function routeUrl(route: XRoadRoute): string {
  return `https://${orgXRoad.securityServers[0].address}/r1/${routeServiceId(route)}`;
}


/** Members the organisation exchanges data with over X-Road. Those that call in are drawn on the ecosystem map. */
export const networkLinks: NetworkLink[] = [
  { memberId: "moi", direction: "outbound" },
  { memberId: "nrh", direction: "both" },
  { memberId: "msp", direction: "outbound" },
  { memberId: "ndho", direction: "inbound" },
];
