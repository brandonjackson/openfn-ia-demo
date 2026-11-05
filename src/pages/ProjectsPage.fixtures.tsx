import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import { projectsPageData } from "../fixtures";
import ProjectsPage from "./ProjectsPage";
import { pageFrame } from "./route.fixtures";

/** Feeds the Projects page from fixtures. */
export default function ProjectsPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  return (
    <ProjectsPage
      {...pageFrame(route)}
      data={projectsPageData}
      // Prototype flow: a new project routes the user through to Project A.
      onCreateProject={async () => navigate("/projects/project-a")}
    />
  );
}
