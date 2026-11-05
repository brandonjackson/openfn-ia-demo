import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import ProjectComponentsPage from "./ProjectComponentsPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/** Feeds a project's Components list from fixtures. */
export default function ProjectComponentsPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const project = routeProject(route);
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;
  return (
    <ProjectComponentsPage
      {...pageFrame(route)}
      data={{ pageType: "project-components", projectId: project.id, components: project.components }}
      // Like the editor's: drafted from a plain-words description on Create.
      onAddComponent={(type) =>
        navigate(`/projects/${project.id}/create`, {
          state: { draft: `Add ${/^[aeiou]/i.test(type) ? "an" : "a"} ${type.toLowerCase()} to this project that ` },
        })
      }
    />
  );
}
