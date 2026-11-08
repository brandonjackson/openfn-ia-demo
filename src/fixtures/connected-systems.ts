/** An X-Road system's environments: production goes through the Security Server, and there's no credential to add. */
import type { OrgCredential } from "../model/page-data";
import { type SystemListItem, type AccessGrant, type ConnectedSystemSummary, type SystemEnvironment, type SuggestedSystem, type ConnectedSystem, systemListItem, systemSummary } from "../model/connected-systems";
import type { Environment } from "../model/credentials";
import type { XRoadRoute } from "../model/xroad";
import { routeUrl } from "./xroad";
function xroadEnvironments(route: XRoadRoute): Record<Environment, SystemEnvironment> {
  return {
    production: { url: routeUrl(route) },
    staging: { url: undefined },
    mock: { url: undefined },
  };
}

/**
 * Single source of truth for connected systems.
 * Used by the Connected Systems list page, Overview dashboard, and system detail pages.
 */
export const connectedSystems: ConnectedSystem[] = [
  {
    id: "dhis2",
    name: "DHIS2",
    description: "Health information management system for data collection and analysis.",
    credentialType: "org",
    hasAccess: true,
    color: "bg-blue-100 text-blue-700",
    adaptor: "dhis2",
    owner: "Acme Health Ministry",
    ownerType: "org",
    environments: {
      production: { url: "https://dhis2.example.org", credential: "dhis2-prod" },
      staging: { url: "https://staging.dhis2.example.org", credential: "dhis2-staging" },
      mock: { url: "https://mock.dhis2.example.org", credential: "dhis2-mock" },
    },
    apiDocsUrl: "https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/introduction.html",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "CRM platform for managing customer relationships and data.",
    credentialType: "org",
    hasAccess: true,
    color: "bg-sky-100 text-sky-700",
    adaptor: "salesforce",
    owner: "Acme Operations",
    ownerType: "org",
    environments: {
      production: { url: "https://acme.my.salesforce.com", credential: "salesforce-prod" },
      staging: { url: "https://acme--uat.sandbox.my.salesforce.com", credential: undefined },
      mock: { url: undefined, credential: undefined },
    },
    apiDocsUrl: "https://developer.salesforce.com/docs/apis",
  },
  {
    id: "commcare",
    name: "CommCare",
    description: "Mobile data collection platform for frontline workers.",
    credentialType: "user",
    hasAccess: false,
    color: "bg-green-100 text-green-700",
    adaptor: "commcare",
    owner: "jsmith",
    ownerType: "user",
    environments: {
      production: { url: "https://www.commcarehq.org", credential: "commcare-prod" },
      staging: { url: "https://staging.commcarehq.org", credential: "commcare-staging" },
      mock: { url: "https://mock.commcare.example.org", credential: "commcare-mock" },
    },
    apiDocsUrl: "https://confluence.dimagi.com/display/commcarepublic/CommCare+API",
  },
  {
    id: "kobo-toolbox",
    name: "KoBoToolbox",
    description: "Data collection tool for humanitarian and development work.",
    credentialType: "user",
    hasAccess: false,
    color: "bg-orange-100 text-orange-700",
    adaptor: "kobotoolbox",
    owner: "adiallo",
    ownerType: "user",
    environments: {
      production: { url: "https://kf.kobotoolbox.org", credential: undefined },
      staging: { url: undefined, credential: undefined },
      mock: { url: undefined, credential: undefined },
    },
    apiDocsUrl: "https://support.kobotoolbox.org/api.html",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Cloud-based spreadsheet for collaborative data management.",
    credentialType: "org",
    hasAccess: true,
    color: "bg-emerald-100 text-emerald-700",
    adaptor: "googlesheets",
    owner: "Acme Data Team",
    ownerType: "org",
    environments: {
      production: { url: undefined, credential: "google-sheets-prod" },
      staging: { url: undefined, credential: undefined },
      mock: { url: undefined, credential: undefined },
    },
    apiDocsUrl: "https://developers.google.com/sheets/api",
  },
  {
    id: "fhir",
    name: "FHIR Server",
    description: "HL7 FHIR-compliant server for health data interoperability.",
    credentialType: "user",
    hasAccess: false,
    color: "bg-purple-100 text-purple-700",
    adaptor: "fhir",
    owner: "bwilson",
    ownerType: "user",
    environments: {
      production: { url: "https://fhir.example.org/r4", credential: "fhir-prod" },
      staging: { url: undefined, credential: undefined },
      mock: { url: "https://mock.fhir.example.org/r4", credential: "fhir-mock" },
    },
    apiDocsUrl: "https://hl7.org/fhir/http.html",
  },
  {
    id: "opencrvs",
    name: "OpenCRVS",
    description: "Civil registration platform for recording births and deaths.",
    credentialType: "org",
    hasAccess: true,
    color: "bg-rose-100 text-rose-700",
    adaptor: "opencrvs",
    owner: "Acme Health Ministry",
    ownerType: "org",
    environments: {
      production: { url: "https://opencrvs.example.org", credential: "opencrvs-prod" },
      staging: { url: "https://staging.opencrvs.example.org", credential: undefined },
      mock: { url: "https://mock.opencrvs.example.org", credential: "opencrvs-mock" },
    },
    apiDocsUrl: "https://documentation.opencrvs.org/technology/interoperability/",
  },
  {
    id: "openmrs",
    name: "OpenMRS",
    description: "The National Referral Hospital's electronic medical records, reached over X-Road.",
    credentialType: "org",
    hasAccess: true,
    color: "bg-teal-100 text-teal-700",
    adaptor: "openmrs",
    owner: "National Referral Hospital",
    ownerType: "org",
    environments: xroadEnvironments({ memberId: "nrh", subsystem: "OPENMRS", service: "patients" }),
    apiDocsUrl: "https://rest.openmrs.org",
    connection: {
      method: "xroad",
      route: { memberId: "nrh", subsystem: "OPENMRS", service: "patients" },
      status: "live",
      history: [
        { status: "discovered", date: "2 Aug 2026" },
        { status: "agreement-pending", date: "4 Aug 2026" },
        { status: "operator-approval", date: "21 Aug 2026" },
        { status: "access-granted", date: "28 Aug 2026" },
        { status: "live", date: "9 Sep 2026" },
      ],
      agreement: { name: "Patient identity sharing, MOH and NRH", reference: "DSA-2026-014", signedOn: "19 Aug 2026" },
      accessCheckedAt: "4 minutes ago",
      allowedMethods: ["GET /patient", "POST /patient", "POST /encounter"],
    },
  },
  {
    id: "national-id",
    name: "National ID verification",
    description: "The Ministry of Interior's service for checking a national ID against the population register.",
    credentialType: "org",
    hasAccess: true,
    color: "bg-amber-100 text-amber-700",
    adaptor: "http",
    owner: "Ministry of Interior",
    ownerType: "org",
    environments: xroadEnvironments({ memberId: "moi", subsystem: "IDENTITY", service: "verify-national-id" }),
    connection: {
      method: "xroad",
      route: { memberId: "moi", subsystem: "IDENTITY", service: "verify-national-id" },
      status: "live",
      history: [
        { status: "discovered", date: "1 Oct 2026" },
        { status: "agreement-pending", date: "1 Oct 2026" },
        { status: "operator-approval", date: "9 Oct 2026" },
        { status: "access-granted", date: "15 Oct 2026" },
        { status: "live", date: "15 Oct 2026" },
      ],
      agreement: { name: "Identity verification for health services", reference: "MOI-DSA-0442", signedOn: "8 Oct 2026" },
      accessCheckedAt: "4 minutes ago",
      allowedMethods: ["POST /verify"],
    },
  },
  {
    id: "social-registry",
    name: "Social registry",
    description: "The Ministry of Social Protection's registry of households and the programmes they're enrolled in.",
    credentialType: "org",
    hasAccess: false,
    color: "bg-lime-100 text-lime-700",
    adaptor: "http",
    owner: "Ministry of Social Protection",
    ownerType: "org",
    environments: xroadEnvironments({ memberId: "msp", subsystem: "SOCIALREG", service: "household-lookup" }),
    connection: {
      method: "xroad",
      route: { memberId: "msp", subsystem: "SOCIALREG", service: "household-lookup" },
      status: "agreement-pending",
      history: [
        { status: "discovered", date: "27 Oct 2026" },
        { status: "agreement-pending", date: "28 Oct 2026" },
      ],
      agreement: { name: "Fee waiver targeting, MOH and MSP", reference: "Draft v2" },
      accessCheckedAt: "4 minutes ago",
      allowedMethods: [],
    },
  },
];

/**
 * Mock access grants per connected system.
 * Maps system ID to its access grants.
 */
export const systemAccessGrants: Record<string, AccessGrant[]> = {
  dhis2: [
    { id: "ag-1", grantedTo: "Brandon Jackson", grantedToType: "user", scope: "All Resources", lastAccessed: "2026-04-07" },
    { id: "ag-2", grantedTo: "Project A", grantedToType: "project", scope: "/api/trackedEntityInstances", lastAccessed: "2026-04-06" },
    { id: "ag-3", grantedTo: "Project B", grantedToType: "project", scope: "/api/dataValueSets", lastAccessed: "2026-03-28" },
    { id: "ag-4", grantedTo: "adiallo", grantedToType: "user", scope: "/api/analytics", lastAccessed: null },
  ],
  salesforce: [
    { id: "ag-5", grantedTo: "Project A", grantedToType: "project", scope: "All Resources", lastAccessed: "2026-04-05" },
    { id: "ag-6", grantedTo: "Brandon Jackson", grantedToType: "user", scope: "/services/data/v59.0/sobjects", lastAccessed: "2026-04-02" },
  ],
  commcare: [
    { id: "ag-7", grantedTo: "jsmith", grantedToType: "user", scope: "All Resources", lastAccessed: "2026-04-07" },
    { id: "ag-8", grantedTo: "Project B", grantedToType: "project", scope: "/a/{domain}/api/v0.5/case", lastAccessed: "2026-04-01" },
  ],
  "kobo-toolbox": [
    { id: "ag-9", grantedTo: "adiallo", grantedToType: "user", scope: "All Resources", lastAccessed: "2026-03-15" },
  ],
  "google-sheets": [
    { id: "ag-10", grantedTo: "Project A", grantedToType: "project", scope: "All Resources", lastAccessed: "2026-04-04" },
    { id: "ag-11", grantedTo: "Brandon Jackson", grantedToType: "user", scope: "All Resources", lastAccessed: "2026-04-03" },
  ],
  fhir: [
    { id: "ag-12", grantedTo: "bwilson", grantedToType: "user", scope: "All Resources", lastAccessed: "2026-04-06" },
    { id: "ag-13", grantedTo: "Project A", grantedToType: "project", scope: "/Patient", lastAccessed: "2026-04-05" },
    { id: "ag-14", grantedTo: "Project B", grantedToType: "project", scope: "/Observation", lastAccessed: null },
  ],
  openmrs: [
    { id: "ag-18", grantedTo: "Case-based surveillance", grantedToType: "project", scope: "All Resources", lastAccessed: "2026-10-20" },
  ],
  "national-id": [
    { id: "ag-19", grantedTo: "Case-based surveillance", grantedToType: "project", scope: "All Resources", lastAccessed: "2026-10-20" },
  ],
  opencrvs: [
    { id: "ag-15", grantedTo: "Project A", grantedToType: "project", scope: "All Resources", lastAccessed: "2026-04-07" },
    { id: "ag-16", grantedTo: "Brandon Jackson", grantedToType: "user", scope: "/births", lastAccessed: "2026-03-20" },
    { id: "ag-17", grantedTo: "adiallo", grantedToType: "user", scope: "/deaths", lastAccessed: null },
  ],
};

/**
 * Org credentials shared with projects, each tagged with the environment it
 * reaches. Names match the per-environment credentials on `connectedSystems`.
 */
export const orgCredentials: OrgCredential[] = [
  { id: "cred-dhis2-prod", name: "dhis2-prod", system: "DHIS2", environment: "production", owner: "Org", hasAccess: true },
  { id: "cred-dhis2-staging", name: "dhis2-staging", system: "DHIS2", environment: "staging", owner: "Org", hasAccess: true },
  { id: "cred-dhis2-mock", name: "dhis2-mock", system: "DHIS2", environment: "mock", owner: "Org", hasAccess: true },
  { id: "cred-commcare-prod", name: "commcare-prod", system: "CommCare", environment: "production", owner: "Org", hasAccess: false },
  { id: "cred-commcare-mock", name: "commcare-mock", system: "CommCare", environment: "mock", owner: "Org", hasAccess: true },
  { id: "cred-salesforce-prod", name: "salesforce-prod", system: "Salesforce", environment: "production", owner: "Org", hasAccess: false },
];

/** SystemListItem shape for the list template */
export const connectedSystemListItems: SystemListItem[] = connectedSystems.map(systemListItem);

/** Dashboard summary shape */
export const connectedSystemSummaries: ConnectedSystemSummary[] = connectedSystems.map(systemSummary);

/** Systems we suggest connecting next, shown on the Overview. */
export const recommendedSystems: SuggestedSystem[] = [
  { name: "PostgreSQL", description: "Relational database", adaptor: "postgresql" },
  { name: "WhatsApp Business", description: "Messaging and notifications", adaptor: "whatsapp" },
  { name: "RapidPro", description: "SMS and chat flows", adaptor: "rapidpro" },
  { name: "ODK", description: "Offline mobile data collection", adaptor: "odk" },
  { name: "Twilio", description: "SMS and voice messaging", adaptor: "twilio" },
  { name: "Primero", description: "Child protection case management", adaptor: "primero" },
  { name: "OpenHIM", description: "Health information mediator", adaptor: "openhim" },
];

