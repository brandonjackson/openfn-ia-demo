import type { DashboardPageData } from "../page-data";
import { connectedSystemSummaries } from "./connected-systems";

export const overviewData: DashboardPageData = {
  pageType: "dashboard",
  metrics: [
    { label: "Connected Systems", value: connectedSystemSummaries.length },
    { label: "Active Services", value: 12 },
    { label: "Work Orders (24h)", value: 347 },
  ],
  connectedSystems: connectedSystemSummaries,
  recommendedSystems: [
    { name: "OpenMRS", description: "Electronic medical records" },
    { name: "PostgreSQL", description: "Relational database" },
    { name: "WhatsApp Business", description: "Messaging & notifications" },
  ],
  suggestedServices: [
    {
      id: "commcare-dhis2",
      title: "Mobile data sync to national reporting",
      description:
        "Automatically push form submissions from CommCare to DHIS2 aggregates — no manual exports, no data gaps.",
      fromSystems: ["CommCare"],
      toSystems: ["DHIS2"],
      category: "Data sync",
      why: "CommCare and DHIS2 are both connected. This is the most common integration for programs using both.",
    },
    {
      id: "opencrvs-dhis2",
      title: "Civil registration to population analytics",
      description:
        "Stream birth and death events from OpenCRVS into DHIS2 population dashboards in real time.",
      fromSystems: ["OpenCRVS"],
      toSystems: ["DHIS2"],
      category: "Event-driven",
      why: "OpenCRVS events can feed DHIS2 population data automatically — a high-value, low-effort integration.",
    },
    {
      id: "fhir-dhis2",
      title: "Patient record interoperability",
      description:
        "Translate HL7 FHIR patient records into DHIS2 tracked entities for longitudinal health tracking.",
      fromSystems: ["FHIR Server"],
      toSystems: ["DHIS2"],
      category: "Interoperability",
      why: "Your FHIR Server and DHIS2 are both connected — this is a standard HIE integration pattern.",
    },
    {
      id: "kobo-sheets",
      title: "Survey data to dashboard",
      description:
        "Push KoBoToolbox survey responses to Google Sheets automatically, keeping stakeholder dashboards up to date.",
      fromSystems: ["KoBoToolbox"],
      toSystems: ["Google Sheets"],
      category: "Reporting",
      why: "Both systems are connected and this is a popular lightweight reporting workflow.",
    },
  ],
  recommended: 10,
};
