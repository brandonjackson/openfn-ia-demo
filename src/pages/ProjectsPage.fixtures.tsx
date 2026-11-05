import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import { projectsPageData } from "../fixtures";
import ProjectsPage from "./ProjectsPage";
import { pageFrame } from "./route.fixtures";
import { useFlags } from "../app/feature-flags";
import { summaryFor } from "./flagged.fixtures";

/** Feeds the Projects page from fixtures; without the service catalog, projects show no service counts. */
export default function ProjectsPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  return (
    <ProjectsPage
      {...pageFrame(route)}
      data={{ ...projectsPageData, projects: projectsPageData.projects.map((p) => summaryFor(p, flags)) }}
      // Prototype flow: a new project routes the user through to Project A.
      onCreateProject={async () => navigate("/projects/project-a")}
    />
  );
}
