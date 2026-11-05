import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import type { ProjectPageData } from "../model/page-data";
import type { Project } from "../model/projects";
import { mockEntries } from "../fixtures/history";
import { buildProjectOverviewTiles } from "../fixtures/insights";
import { buildIdeas } from "../fixtures/build-ideas";
import ProjectPage from "./ProjectPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/** A project's Overview: its Insights tiles, Create's starter ideas, and its services and components. */
function projectPageData(project: Project): ProjectPageData {
  const workOrderCount = mockEntries.filter(
    (e) => e.type === "Work Order" && e.project === project.name
  ).length;

  return {
    pageType: "project",
    projectId: project.id,
    tiles: buildProjectOverviewTiles(project.id, workOrderCount),
    ideas: buildIdeas,
    services: project.services,
    components: project.components,
  };
}

/** Feeds a project's Overview from fixtures. */
export default function ProjectPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const project = routeProject(route);
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;
  return (
    <ProjectPage
      {...pageFrame(route, { label: project.name, description: project.description })}
      data={projectPageData(project)}
      onStartBuilding={(prompt) => navigate(`${route.currentPath}/create`, { state: { prompt } })}
    />
  );
}
