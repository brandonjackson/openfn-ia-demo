import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import ProjectComponentsPage from "./ProjectComponentsPage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";
import { useFlags } from "../app/feature-flags";
import { componentTypesFor, componentsFor } from "./flagged.fixtures";

/**
 * Feeds a project's Components list from fixtures, with the kinds of
 * component the feature flags leave: without Components, just channels.
 * Adding one goes through Create, so without it there's nothing to add from.
 */
export default function ProjectComponentsPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const project = routeProject(route);
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;
  const components = componentsFor(project.components, flags);
  const types = componentTypesFor(flags);
  return (
    <ProjectComponentsPage
      {...pageFrame(route)}
      data={{ pageType: "project-components", projectId: project.id, components, types }}
      // Like the editor's: drafted from a plain-words description on Create.
      onAddComponent={
        flags.aiBuild
          ? (type) =>
              navigate(`/projects/${project.id}/create`, {
                state: { draft: `Add ${/^[aeiou]/i.test(type) ? "an" : "a"} ${type.toLowerCase()} to this project that ` },
              })
          : undefined
      }
    />
  );
}
