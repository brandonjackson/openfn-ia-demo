import type { CatalogPageData } from "../page-data";

export const serviceCatalogData: CatalogPageData = {
  pageType: "catalog",
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

    // Department of Planning
    {
      kind: "workflow",
      id: "project-a-planning-application-intake",
      name: "Planning Application Intake",
      description:
        "Receives planning applications from the e-planning portal and routes them to the local authority case management system.",
      project: "Project A",
      projectPath: "/projects/project-a/services/planning-application-intake",
      badges: ["Live"],
      section: "Department of Planning",
    },

    // Ministry of Social Welfare
    {
      kind: "workflow",
      id: "project-b-commcare-case-sync",
      name: "CommCare Case Sync",
      description: "Syncs case data from CommCare to the shared data warehouse.",
      project: "Project B",
      projectPath: "/projects/project-b/services/commcare-case-sync",
      badges: ["Live"],
      section: "Ministry of Social Welfare",
    },
  ],
};
