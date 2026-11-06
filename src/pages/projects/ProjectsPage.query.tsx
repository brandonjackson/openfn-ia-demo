import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useFlags } from "../../app/feature-flags";
import { pageFrame } from "../../app/page-frame";
import { useProjectSaves, useProjectSummaries } from "../../api/projects";
import ProjectsPage from "./ProjectsPage";

/**
 * Feeds the Projects page from the API: the projects you're a member of
 * (not those being deleted), with their services' counts when the service
 * catalog is on, and a create that makes you the owner and opens the new
 * project.
 */
export default function ProjectsPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const { serviceCatalog } = useFlags();
  const { status, projects } = useProjectSummaries(serviceCatalog);
  const { create } = useProjectSaves();
  return (
    <Loaded status={status} path={route.currentPath}>
      {() => (
        <ProjectsPage
          {...pageFrame(route)}
          data={{ projects }}
          onCreateProject={async ({ name, environment, description }) => {
            const project = await create({ name, description, env: environment || undefined });
            navigate(`/projects/${project.id}`);
          }}
        />
      )}
    </Loaded>
  );
}
