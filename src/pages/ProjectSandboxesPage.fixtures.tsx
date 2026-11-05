import type { PageRoute } from "../app/ia-utils";
import { projectSandboxes } from "../fixtures/projects";
import ProjectSandboxesPage from "./ProjectSandboxesPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/** Feeds a project's Sandboxes page from fixtures. */
export default function ProjectSandboxesPageFixtures({ route }: { route: PageRoute }) {
  const project = routeProject(route);
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;
  return (
    <ProjectSandboxesPage
      {...pageFrame(route)}
      data={{ pageType: "project-sandboxes", projectId: project.id, sandboxes: projectSandboxes(project) }}
    />
  );
}
