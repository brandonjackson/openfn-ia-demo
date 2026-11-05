import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useFlags } from "../app/feature-flags";
import { useProjectList, useProjectSaves } from "../api/projects";
import ProjectsPage from "./ProjectsPage";
import { pageFrame } from "./route.fixtures";
import { asSummary, isOpenable } from "./project-records.query";

/**
 * Feeds the Projects page from the API: the projects you're a member of
 * (not those being deleted), and a create that makes you the owner and opens
 * the new project.
 */
export default function ProjectsPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const { status, projects } = useProjectList();
  const { create } = useProjectSaves();
  return (
    <Loaded status={status} path={route.currentPath}>
      {() => (
        <ProjectsPage
          {...pageFrame(route)}
          data={{ pageType: "projects", projects: projects.filter(isOpenable).map((p) => asSummary(p, flags)) }}
          onCreateProject={async ({ name, environment, description }) => {
            const project = await create({ name, description, env: environment || undefined });
            navigate(`/projects/${project.id}`);
          }}
        />
      )}
    </Loaded>
  );
}
