import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import { projectWorkflowItems } from "../fixtures/projects";
import ProjectWorkflowsPage from "./ProjectWorkflowsPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";
import { useFlags } from "../app/feature-flags";

/** Feeds a project's Workflows list from fixtures; without the service catalog, no workflow backs a service. */
export default function ProjectWorkflowsPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const project = routeProject(route);
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;
  return (
    <ProjectWorkflowsPage
      {...pageFrame(route)}
      data={{
        pageType: "project-workflows",
        projectId: project.id,
        workflows: projectWorkflowItems(project).map((w) => (flags.serviceCatalog ? w : { ...w, serviceStatus: undefined })),
      }}
      onNewWorkflow={() => navigate(`/workflow-editor/new?project=${project.id}`)}
    />
  );
}
