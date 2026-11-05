/** Services from the X-Road systems you've added, as the catalogue lists them. */
import type { CatalogPageData, UsedServiceEntry } from "../model/page-data";
import { connectionOf } from "../model/connected-systems";
import { connectedSystems } from "./connected-systems";
import { directoryMember, routeService, routeServiceId } from "./xroad";
const xroadUsedServices: UsedServiceEntry[] = connectedSystems.flatMap((system) => {
  const connection = connectionOf(system);
  if (connection.method !== "xroad") return [];
  const service = routeService(connection.route);
  if (!service) return [];
  return [
    {
      id: `${system.id}-${service.code}`,
      name: service.name,
      description: service.description,
      system: system.name,
      systemPath: `/connected-systems/${system.id}`,
      adaptor: system.adaptor,
      connection: "xroad" as const,
      xroadStatus: connection.status,
      owner: directoryMember(connection.route.memberId)?.name ?? system.owner,
      methods: service.methods,
      serviceId: routeServiceId(connection.route),
      builtWithOpenFn: service.builtWithOpenFn,
      record: service.record,
    },
  ];
});

/** The organization's MCP server: every callable service is also a tool here. */
export const mcpServerUrl = "https://app.openfn.org/mcp/ministry-of-health";

export const serviceCatalogData: CatalogPageData = {
  pageType: "catalog",
  mcpServerUrl,
  usedServices: xroadUsedServices,
  entries: [
    // Ministry of Health — vital events via OpenCRVS
    {
      kind: "channel",
      id: "opencrvs-notify-birth",
      name: "Notify a birth",
      description: "Submit a birth notification from a health facility.",
      channelType: "write",
      system: "OpenCRVS",
      systemPath: "/connected-systems/opencrvs",
      section: "Ministry of Health",
    },
    {
      kind: "channel",
      id: "opencrvs-birth-registered",
      name: "Birth registered",
      description: "Fires when a birth is officially registered.",
      channelType: "event",
      system: "OpenCRVS",
      systemPath: "/connected-systems/opencrvs",
      section: "Ministry of Health",
    },
    {
      kind: "channel",
      id: "opencrvs-search-birth",
      name: "Search for a birth record",
      description: "Look up births by name, date, location, or ID.",
      channelType: "read",
      system: "OpenCRVS",
      systemPath: "/connected-systems/opencrvs",
      section: "Ministry of Health",
    },
    {
      kind: "channel",
      id: "opencrvs-notify-death",
      name: "Notify a death",
      description: "Submit a death notification from a health facility.",
      channelType: "write",
      system: "OpenCRVS",
      systemPath: "/connected-systems/opencrvs",
      section: "Ministry of Health",
    },
    {
      kind: "channel",
      id: "opencrvs-death-registered",
      name: "Death registered",
      description: "Fires when a death is officially registered.",
      channelType: "event",
      system: "OpenCRVS",
      systemPath: "/connected-systems/opencrvs",
      section: "Ministry of Health",
    },
    {
      kind: "channel",
      id: "opencrvs-search-death",
      name: "Search for a death record",
      description: "Look up deaths by name, date, location, or ID.",
      channelType: "read",
      system: "OpenCRVS",
      systemPath: "/connected-systems/opencrvs",
      section: "Ministry of Health",
    },
    {
      kind: "workflow",
      id: "malawi-chw-referrals-client-registry-lookup",
      name: "Look up a client's national ID",
      description: "Matches a patient against the national client registry and returns their national ID.",
      project: "Malawi CHW Referrals",
      projectPath: "/projects/malawi-chw-referrals/services/client-registry-lookup",
      badges: ["Live"],
      section: "Ministry of Health",
      callableAs: ["workflow", "mcp"],
      mcpToolName: "client_registry_lookup",
      usage: { organisations: 3, calls30d: 2310 },
    },
    {
      kind: "workflow",
      id: "malawi-chw-referrals-chw-referral-sync",
      name: "Send CHW referrals to DHIS2 Tracker",
      description: "Pushes CommCare referrals into DHIS2 Tracker every 15 minutes.",
      project: "Malawi CHW Referrals",
      projectPath: "/projects/malawi-chw-referrals/services/chw-referral-sync",
      badges: ["Live"],
      section: "Ministry of Health",
    },
    {
      kind: "workflow",
      id: "case-surveillance-register-suspected-case",
      name: "Register a suspected case",
      description:
        "Records a suspected case of a notifiable disease reported by a facility, after checking the patient's national ID and hospital record.",
      project: "Case-based surveillance",
      projectPath: "/projects/case-surveillance/services/register-suspected-case",
      badges: ["Live"],
      section: "Ministry of Health",
      callableAs: ["workflow", "xroad"],
      usage: { organisations: 4, calls30d: 1284 },
    },

    // Department of Planning
    {
      kind: "workflow",
      id: "project-a-planning-application-intake",
      name: "Submit a planning application",
      description:
        "Receives planning applications from the e-planning portal and routes them to the local authority case management system.",
      project: "Project A",
      projectPath: "/projects/project-a/services/planning-application-intake",
      badges: ["Live"],
      section: "Department of Planning",
      callableAs: ["workflow", "mcp"],
      mcpToolName: "submit_planning_application",
      usage: { organisations: 2, calls30d: 412 },
    },

    // Ministry of Social Welfare
    {
      kind: "workflow",
      id: "project-b-commcare-case-sync",
      name: "Copy CommCare cases to the data warehouse",
      description: "Syncs case data from CommCare to the shared data warehouse.",
      project: "Project B",
      projectPath: "/projects/project-b/services/commcare-case-sync",
      badges: ["Live"],
      section: "Ministry of Social Welfare",
      callableAs: ["workflow"],
      usage: { organisations: 1, calls30d: 6420 },
    },
  ],
};
