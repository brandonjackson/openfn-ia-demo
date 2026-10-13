import type {
  ListItem,
  ConnectedSystemSummary,
  AccessGrant,
  Environment,
  OrgCredential,
  SystemEnvironment,
} from "../page-data";

export interface ConnectedSystem {
  id: string;
  name: string;
  description: string;
  credentialType: "user" | "org";
  /** Whether the current user personally has access to this system. */
  hasAccess: boolean;
  color: string;
  owner: string;
  ownerType: "user" | "org";
  /** Where the system lives, and which credential reaches it, in each environment. */
  environments: Record<Environment, SystemEnvironment>;
  apiDocsUrl?: string;
  linkTo?: string;
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
    owner: "Acme Health Ministry",
    ownerType: "org",
    environments: {
      production: { url: "https://opencrvs.example.org", credential: "opencrvs-prod" },
      staging: { url: "https://staging.opencrvs.example.org", credential: undefined },
      mock: { url: "https://mock.opencrvs.example.org", credential: "opencrvs-mock" },
    },
    apiDocsUrl: "https://documentation.opencrvs.org/technology/interoperability/",
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

/** ListItem shape for the list template */
export const connectedSystemListItems: ListItem[] = connectedSystems.map((s) => {
  const url = s.environments.production.url;
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    metadata: {
      credentialType: s.credentialType,
      access: s.hasAccess ? "yes" : "no",
      ...(url ? { url } : {}),
    },
    linkTo: s.linkTo,
  };
});

/** Dashboard summary shape */
export const connectedSystemSummaries: ConnectedSystemSummary[] = connectedSystems.map((s) => ({
  id: s.id,
  name: s.name,
  credentialType: s.credentialType,
  color: s.color,
}));
