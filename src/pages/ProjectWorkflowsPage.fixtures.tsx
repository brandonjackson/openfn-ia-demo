import type { PageRoute } from "../app/ia-utils";
import { projectWorkflowItems } from "../fixtures/projects";
import ProjectWorkflowsPage from "./ProjectWorkflowsPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/** Feeds a project's Workflows list from fixtures. */
export default function ProjectWorkflowsPageFixtures({ route }: { route: PageRoute }) {
  const project = routeProject(route);
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;
  return (
    <ProjectWorkflowsPage
      {...pageFrame(route)}
      data={{ pageType: "project-workflows", projectId: project.id, workflows: projectWorkflowItems(project) }}
    />
  );
}
