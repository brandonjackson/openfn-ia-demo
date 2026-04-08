import type { ListItem, ConnectedSystemSummary, AccessGrant } from "../page-data";

export interface ConnectedSystem {
  id: string;
  name: string;
  description: string;
  credentialType: "user" | "org";
  color: string;
  url?: string;
  owner: string;
  ownerType: "user" | "org";
  productionCredential?: string;
  stagingCredential?: string;
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
    color: "bg-blue-100 text-blue-700",
    url: "https://dhis2.example.org",
    owner: "Acme Health Ministry",
    ownerType: "org",
    productionCredential: "dhis2-prod",
    stagingCredential: "dhis2-staging",
    apiDocsUrl: "https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/introduction.html",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "CRM platform for managing customer relationships and data.",
    credentialType: "org",
    color: "bg-sky-100 text-sky-700",
    url: "https://acme.my.salesforce.com",
    owner: "Acme Operations",
    ownerType: "org",
    productionCredential: "salesforce-prod",
    stagingCredential: undefined,
    apiDocsUrl: "https://developer.salesforce.com/docs/apis",
  },
  {
    id: "commcare",
    name: "CommCare",
    description: "Mobile data collection platform for frontline workers.",
    credentialType: "user",
    color: "bg-green-100 text-green-700",
    url: "https://www.commcarehq.org",
    owner: "jsmith",
    ownerType: "user",
    productionCredential: "commcare-prod",
    stagingCredential: "commcare-staging",
    apiDocsUrl: "https://confluence.dimagi.com/display/commcarepublic/CommCare+API",
  },
  {
    id: "kobo-toolbox",
    name: "KoBoToolbox",
    description: "Data collection tool for humanitarian and development work.",
    credentialType: "user",
    color: "bg-orange-100 text-orange-700",
    url: "https://kf.kobotoolbox.org",
    owner: "adiallo",
    ownerType: "user",
    productionCredential: undefined,
    stagingCredential: undefined,
    apiDocsUrl: "https://support.kobotoolbox.org/api.html",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Cloud-based spreadsheet for collaborative data management.",
    credentialType: "org",
    color: "bg-emerald-100 text-emerald-700",
    url: undefined,
    owner: "Acme Data Team",
    ownerType: "org",
    productionCredential: "google-sheets-prod",
    stagingCredential: undefined,
    apiDocsUrl: "https://developers.google.com/sheets/api",
  },
  {
    id: "fhir",
    name: "FHIR Server",
    description: "HL7 FHIR-compliant server for health data interoperability.",
    credentialType: "user",
    color: "bg-purple-100 text-purple-700",
    url: "https://fhir.example.org/r4",
    owner: "bwilson",
    ownerType: "user",
    productionCredential: "fhir-prod",
    stagingCredential: undefined,
    apiDocsUrl: "https://hl7.org/fhir/http.html",
  },
  {
    id: "opencrvs",
    name: "OpenCRVS",
    description: "Civil registration platform for recording births and deaths.",
    credentialType: "org",
    color: "bg-rose-100 text-rose-700",
    url: "https://opencrvs.example.org",
    owner: "Acme Health Ministry",
    ownerType: "org",
    productionCredential: "opencrvs-prod",
    stagingCredential: undefined,
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

/** ListItem shape for the list template */
export const connectedSystemListItems: ListItem[] = connectedSystems.map((s) => ({
  id: s.id,
  name: s.name,
  description: s.description,
  metadata: { credentialType: s.credentialType, ...(s.url ? { url: s.url } : {}) },
  linkTo: s.linkTo,
}));

/** Dashboard summary shape */
export const connectedSystemSummaries: ConnectedSystemSummary[] = connectedSystems.map((s) => ({
  id: s.id,
  name: s.name,
  credentialType: s.credentialType,
  color: s.color,
}));
