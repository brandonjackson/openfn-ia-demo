/*
 * Page data that isn't any one record: the org-wide pages' contents, built
 * from the records in the other fixture files. Pages that show one record (a
 * project, a system) are built by their wrappers instead.
 */
import type { ListPageData } from "../model/page-data";
import { connectionOf } from "../model/connected-systems";
import { connectedSystemListItems, connectedSystems, connectedSystemsIntro } from "./connected-systems";
import { routeKey } from "../model/xroad";
import { orgXRoad, xroadDirectory } from "./xroad";
import { ecosystemRoutes, ecosystemStations, ecosystemWorkflows } from "./ecosystem";
import { adaptors } from "./adaptors";

/** The Systems page: the organisation's connected systems, their ecosystem and the X-Road directory. */
export const systemsPageData: ListPageData = {
  pageType: "list",
  adaptors,
  filters: [{ label: "Access", options: ["All", "You have access", "No access"] }],
  items: connectedSystemListItems,
  filterKey: "access",
  filterMap: { "You have access": "yes", "No access": "no" },
  showSuggestions: true,
  intro: connectedSystemsIntro,
  ecosystem: { stations: ecosystemStations, workflows: ecosystemWorkflows, routes: ecosystemRoutes },
  xroad: {
    directory: xroadDirectory,
    instance: orgXRoad.instance,
    added: connectedSystems.flatMap((s) => {
      const c = connectionOf(s);
      return c.method === "xroad" ? [routeKey(c.route)] : [];
    }),
    syncedAt: "12 minutes ago",
  },
};
