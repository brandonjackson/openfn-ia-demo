import type { PageData } from "../page-data";
import { connectedSystemListItems } from "./connected-systems";
import { serviceCatalogData } from "./service-catalog";
import { historyData } from "./history";
import { overviewData } from "./overview";

export { mockEntries } from "./history";
export type { HistoryEntry } from "./history";
export { connectedSystems, connectedSystemSummaries, connectedSystemListItems } from "./connected-systems";

export const pageDataRegistry = new Map<string, PageData>();

pageDataRegistry.set("overview", overviewData);

pageDataRegistry.set("connected-systems", {
  pageType: "list",
  filters: [{ label: "Visibility", options: ["Available", "Shared", "Private"] }],
  items: connectedSystemListItems,
  filterKey: "credentialType",
  filterMap: { Private: "user", Shared: "org" },
  showSuggestions: true,
});

pageDataRegistry.set("service-catalog", serviceCatalogData);

pageDataRegistry.set("history", historyData);
