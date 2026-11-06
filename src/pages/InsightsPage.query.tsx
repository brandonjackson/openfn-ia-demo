import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useProject } from "../api/projects";
import { fixtureProject } from "../fixtures/projects";
import { buildProjectInsightsData, insightsData } from "../fixtures/insights";
import InsightsPage from "./InsightsPage";
import { pageFrame } from "./route.fixtures";

/**
 * Feeds Insights: the organisation's, or one project's. The project comes
 * from the API; its numbers are still the fixtures' (a project made on the
 * API has none yet).
 */
export default function InsightsPageQuery({ route }: { route: PageRoute }) {
  const projectId = route.params["project"];
  const { status, project } = useProject(projectId);
  if (!projectId) return <InsightsPage {...pageFrame(route)} data={insightsData} />;
  return (
    <Loaded status={status} path={route.currentPath}>
      {() => <InsightsPage {...pageFrame(route, {}, project!.name)} data={buildProjectInsightsData(fixtureProject(project!.id)?.id ?? project!.id)} />}
    </Loaded>
  );
}
