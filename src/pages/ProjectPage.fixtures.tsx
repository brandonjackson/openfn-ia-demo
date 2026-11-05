import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import type { ProjectPageData } from "../model/page-data";
import type { Project } from "../model/projects";
import { projectWorkOrders } from "../fixtures/history";
import { projectWorkflowItems } from "../fixtures/projects";
import { buildProjectOverviewTiles } from "../fixtures/insights";
import ProjectPage from "./ProjectPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";
import type { FeatureFlags } from "../model/feature-flags";
import { useFlags } from "../app/feature-flags";
import { componentsFor } from "./flagged.fixtures";

/**
 * A project's Overview: its Insights tiles, its workflows (most recently run
 * first), and its services and components, each only with its feature flag on.
 */
function projectPageData(project: Project, flags: FeatureFlags): ProjectPageData {
  const workOrderCount = projectWorkOrders(project).length;

  return {
    pageType: "project",
    projectId: project.id,
    tiles: buildProjectOverviewTiles(project.id, workOrderCount),
    workflows: projectWorkflowItems(project)
      .map((w) => ({ ...w, serviceStatus: flags.serviceCatalog ? w.serviceStatus : undefined }))
      .sort((a, b) => (b.lastRunAt ?? "").localeCompare(a.lastRunAt ?? "")),
    services: flags.serviceCatalog ? project.services : undefined,
    components: flags.components ? componentsFor(project.components, flags) : undefined,
  };
}

/** Feeds a project's Overview from fixtures. */
export default function ProjectPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const project = routeProject(route);
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;
  return (
    <ProjectPage
      {...pageFrame(route, { label: project.name, description: project.description })}
      data={projectPageData(project, flags)}
      onNewWorkflow={() => navigate(`/workflow-editor/new?project=${project.id}`)}
    />
  );
}
