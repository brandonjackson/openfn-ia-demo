import type { OrganizationSettingsPageData } from "../page-data";
import { instanceSettingsData } from "./instance";
import { connectedSystems, connectionOf } from "./connected-systems";
import { orgXRoad } from "./xroad";
import { projects } from "./projects";

export const organizationSettingsData: OrganizationSettingsPageData = {
  pageType: "organization-settings",
  name: orgXRoad.memberName,
  members: instanceSettingsData.members,
  visibility: { projects: "project", systems: "organization", services: "server" },
  xroad: orgXRoad,
  xroadUsage: {
    systems: connectedSystems.filter((s) => connectionOf(s).method === "xroad").length,
    services: projects.flatMap((p) => p.services).filter((s) => s.xroad?.published).length,
  },
};
