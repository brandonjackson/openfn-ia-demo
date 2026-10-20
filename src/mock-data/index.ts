import type { PageData } from "../page-data";
import { connectedSystemListItems } from "./connected-systems";
import { serviceCatalogData } from "./service-catalog";
import { historyData } from "./history";
import { overviewData } from "./overview";
import { statusData } from "./status";
import { insightsData } from "./insights";
import { projectSummaries } from "./projects";
import { handbookData } from "./handbook";

export { mockEntries } from "./history";
export type { HistoryEntry } from "./history";
export { connectedSystems, connectedSystemSummaries, connectedSystemListItems } from "./connected-systems";

export const pageDataRegistry = new Map<string, PageData>();

pageDataRegistry.set("overview", overviewData);

pageDataRegistry.set("projects", { pageType: "projects", projects: projectSummaries });

pageDataRegistry.set("connected-systems", {
  pageType: "list",
  filters: [{ label: "Access", options: ["All", "You have access", "No access"] }],
  items: connectedSystemListItems,
  filterKey: "access",
  filterMap: { "You have access": "yes", "No access": "no" },
  showSuggestions: true,
});

pageDataRegistry.set("service-catalog", serviceCatalogData);

pageDataRegistry.set("history", historyData);

pageDataRegistry.set("status", statusData);

pageDataRegistry.set("insights", insightsData);

pageDataRegistry.set("handbook", handbookData);
