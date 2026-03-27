export interface ConnectedSystem {
  id: string;
  name: string;
  description: string;
  credentialType: "user" | "org";
  url?: string;
  owner: string;
  ownerType: "user" | "org";
  productionCredential?: string;
  stagingCredential?: string;
  apiDocsUrl?: string;
}

export const connectedSystems: ConnectedSystem[] = [
  {
    id: "dhis2",
    name: "DHIS2",
    description: "Health information management system for data collection and analysis.",
    credentialType: "org",
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
    url: "https://opencrvs.example.org",
    owner: "Acme Health Ministry",
    ownerType: "org",
    productionCredential: "opencrvs-prod",
    stagingCredential: undefined,
    apiDocsUrl: "https://documentation.opencrvs.org/technology/interoperability/",
  },
];
