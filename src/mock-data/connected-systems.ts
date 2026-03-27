import type { ListItem, ConnectedSystemSummary } from "../page-data";

/**
 * Single source of truth for connected systems.
 * Used by both the Connected Systems list page and the Overview dashboard.
 */
export const connectedSystems: (ListItem & { credentialType: "user" | "org"; color: string })[] = [
  {
    id: "dhis2",
    name: "DHIS2",
    description: "Health information management system for data collection and analysis.",
    credentialType: "org",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "CRM platform for managing customer relationships and data.",
    credentialType: "org",
    color: "bg-sky-100 text-sky-700",
  },
  {
    id: "commcare",
    name: "CommCare",
    description: "Mobile data collection platform for frontline workers.",
    credentialType: "user",
    color: "bg-green-100 text-green-700",
  },
  {
    id: "kobo-toolbox",
    name: "KoBoToolbox",
    description: "Data collection tool for humanitarian and development work.",
    credentialType: "user",
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Cloud-based spreadsheet for collaborative data management.",
    credentialType: "org",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "fhir",
    name: "FHIR Server",
    description: "HL7 FHIR-compliant server for health data interoperability.",
    credentialType: "user",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "opencrvs",
    name: "OpenCRVS",
    description: "Civil registration platform for recording births and deaths.",
    credentialType: "org",
    color: "bg-rose-100 text-rose-700",
    linkTo: "/connected-systems/opencrvs",
  },
];

/** ListItem shape for the list template */
export const connectedSystemListItems: ListItem[] = connectedSystems.map((s) => ({
  id: s.id,
  name: s.name,
  description: s.description,
  metadata: { credentialType: s.credentialType },
  linkTo: s.linkTo,
}));

/** Dashboard summary shape */
export const connectedSystemSummaries: ConnectedSystemSummary[] = connectedSystems.map((s) => ({
  id: s.id,
  name: s.name,
  credentialType: s.credentialType,
  color: s.color,
}));
