import type { ListItem, ConnectedSystemSummary } from "../page-data";

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
    linkTo: "/connected-systems/opencrvs",
    url: "https://opencrvs.example.org",
    owner: "Acme Health Ministry",
    ownerType: "org",
    productionCredential: "opencrvs-prod",
    stagingCredential: undefined,
    apiDocsUrl: "https://documentation.opencrvs.org/technology/interoperability/",
  },
];

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
