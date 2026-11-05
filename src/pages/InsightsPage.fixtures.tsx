import type { PageRoute } from "../app/ia-utils";
import { buildProjectInsightsData, insightsData } from "../fixtures/insights";
import InsightsPage from "./InsightsPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/** Feeds Insights from fixtures: the organisation's, or one project's. */
export default function InsightsPageFixtures({ route }: { route: PageRoute }) {
  const project = routeProject(route);
  if (project === null) return <NotFoundPage path={route.currentPath} reason="data" />;
  const data = project ? buildProjectInsightsData(project.id) : insightsData;
  return <InsightsPage {...pageFrame(route)} data={data} />;
}
