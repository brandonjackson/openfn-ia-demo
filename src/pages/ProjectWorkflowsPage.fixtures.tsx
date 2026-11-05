import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import { projectWorkflowItems } from "../fixtures/projects";
import ProjectWorkflowsPage from "./ProjectWorkflowsPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";
import { useFlags } from "../app/feature-flags";

/**
 * Feeds a project's Workflows list from fixtures, with workflows switched on
 * or off and deleted this session; without the service catalog, no workflow
 * backs a service.
 */
export default function ProjectWorkflowsPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  // Changes made this session: the fixtures' stand-in for the server.
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [deleted, setDeleted] = useState<string[]>([]);
  const project = routeProject(route);
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;

  return (
    <ProjectWorkflowsPage
      {...pageFrame(route)}
      data={{
        pageType: "project-workflows",
        projectId: project.id,
        workflows: projectWorkflowItems(project)
          .filter((w) => !deleted.includes(w.id))
          .map((w) => ({
            ...w,
            enabled: enabled[w.id] ?? w.enabled,
            serviceStatus: flags.serviceCatalog ? w.serviceStatus : undefined,
          })),
      }}
      onNewWorkflow={() => navigate(`/workflow-editor/new?project=${project.id}`)}
      onToggleWorkflow={async (id, on) => setEnabled((e) => ({ ...e, [id]: on }))}
      onDeleteWorkflow={async (id) => setDeleted((d) => [...d, id])}
    />
  );
}
