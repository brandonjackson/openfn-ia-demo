import type { PageRoute } from "../app/ia-utils";
import { buildCreatePageData } from "../fixtures/build-ideas";
import ProjectCreatePage from "./ProjectCreatePage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/** Feeds a project's Create page from fixtures. */
export default function ProjectCreatePageFixtures({ route }: { route: PageRoute }) {
  const project = routeProject(route);
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;
  return <ProjectCreatePage {...pageFrame(route)} data={buildCreatePageData(project.id)} />;
}
