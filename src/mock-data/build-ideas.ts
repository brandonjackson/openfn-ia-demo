import type {
  BuildIdea,
  BuildingBlock,
  CatalogEntry,
  ChannelCatalogEntry,
  ProjectCreatePageData,
  WorkflowCatalogEntry,
} from "../page-data";
import { connectedSystems } from "./connected-systems";
import { serviceCatalogData } from "./service-catalog";

/**
 * Starter ideas for new public services, each built from systems and
 * channels this organization already has.
 */
export const buildIdeas: BuildIdea[] = [
  {
    id: "birth-to-benefits",
    title: "Enrol newborns in child benefits",
    description:
      "When a birth is registered, check eligibility and open a child benefit application for the family.",
    systems: ["OpenCRVS", "Salesforce"],
    prompt:
      "When a birth is registered in OpenCRVS, check whether the family is eligible for the child benefit and open an application for them in Salesforce.",
  },
  {
    id: "death-closes-cases",
    title: "Close open cases after a death",
    description:
      "Tidy up health and social welfare records when a death is registered, so families aren't contacted in error.",
    systems: ["OpenCRVS", "DHIS2", "CommCare"],
    prompt:
      "When a death is registered in OpenCRVS, close the person's open cases in CommCare and mark their DHIS2 Tracker enrolments as completed.",
  },
  {
    id: "survey-to-dashboard",
    title: "Turn field surveys into a live dashboard",
    description:
      "Collect household surveys in the field and publish the results to a shared sheet the ministry can read.",
    systems: ["KoBoToolbox", "Google Sheets"],
    prompt:
      "Every night, take new KoBoToolbox household survey submissions, clean them up and append them to the ministry's Google Sheet.",
  },
  {
    id: "referral-loop",
    title: "Close the loop on referrals",
    description:
      "Let community health workers know when a patient they referred has been seen at a facility.",
    systems: ["DHIS2", "CommCare"],
    prompt:
      "When a referred patient is seen at a facility in DHIS2, send a follow-up to the community health worker's CommCare case.",
  },
];

export const buildSystems: BuildingBlock[] = connectedSystems.map((s) => ({
  id: s.id,
  name: s.name,
  description: s.description,
  meta: s.owner,
  to: `/connected-systems/${s.id}`,
}));

export const buildChannels: BuildingBlock[] = serviceCatalogData.entries
  .filter((e: CatalogEntry): e is ChannelCatalogEntry => e.kind === "channel")
  .map((e) => ({ id: e.id, name: e.name, description: e.description, meta: e.system, to: e.systemPath }));

export const buildServices: BuildingBlock[] = serviceCatalogData.entries
  .filter((e: CatalogEntry): e is WorkflowCatalogEntry => e.kind === "workflow")
  .map((e) => ({ id: e.id, name: e.name, description: e.description, meta: e.project, to: e.projectPath }));

export function buildCreatePageData(projectId: string): ProjectCreatePageData {
  return {
    pageType: "project-create",
    projectId,
    ideas: buildIdeas,
    systems: buildSystems,
    channels: buildChannels,
    services: buildServices,
  };
}
