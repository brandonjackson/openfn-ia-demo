/*
 * Page data that isn't any one record: the org-wide pages' contents, built
 * from the records in the other fixture files. Pages that show one record (a
 * project, a system) are built by their wrappers instead.
 */
import type { ListPageData, ProjectsPageData } from "../model/page-data";
import { connectionOf } from "../model/connected-systems";
import { connectedSystemListItems, connectedSystems, connectedSystemsIntro } from "./connected-systems";
import { routeKey } from "../model/xroad";
import { xroadDirectory } from "./xroad";
import { ecosystemRoutes, ecosystemStations, ecosystemWorkflows } from "./ecosystem";
import { projectSummaries } from "./projects";

/** The Projects page: every project, summarised. */
export const projectsPageData: ProjectsPageData = { pageType: "projects", projects: projectSummaries };

/** The Systems page: the organisation's connected systems, their ecosystem and the X-Road directory. */
export const systemsPageData: ListPageData = {
  pageType: "list",
  filters: [{ label: "Access", options: ["All", "You have access", "No access"] }],
  items: connectedSystemListItems,
  filterKey: "access",
  filterMap: { "You have access": "yes", "No access": "no" },
  showSuggestions: true,
  intro: connectedSystemsIntro,
  ecosystem: { stations: ecosystemStations, workflows: ecosystemWorkflows, routes: ecosystemRoutes },
  xroad: {
    directory: xroadDirectory,
    added: connectedSystems.flatMap((s) => {
      const c = connectionOf(s);
      return c.method === "xroad" ? [routeKey(c.route)] : [];
    }),
    syncedAt: "12 minutes ago",
  },
};
