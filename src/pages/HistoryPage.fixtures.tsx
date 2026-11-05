import type { PageRoute } from "../app/ia-utils";
import type { TablePageData } from "../model/page-data";
import { historyData } from "../fixtures/history";
import HistoryPage from "./HistoryPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/** The org-wide History table, narrowed to a single project. */
function projectHistoryData(projectName: string): TablePageData {
  return {
    ...historyData,
    filters: historyData.filters.filter((f) => f.label !== "Project"),
    columns: historyData.columns.filter((c) => c.key !== "project"),
    rows: historyData.rows.filter((r) => r.project === projectName),
  };
}

/** Feeds History from fixtures: the organisation's, or one project's. */
export default function HistoryPageFixtures({ route }: { route: PageRoute }) {
  const project = routeProject(route);
  if (project === null) return <NotFoundPage path={route.currentPath} reason="data" />;
  const data = project ? projectHistoryData(project.name) : historyData;
  return <HistoryPage {...pageFrame(route)} data={data} />;
}
