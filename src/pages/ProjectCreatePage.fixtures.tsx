import { useLocation } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import { buildCreatePageData } from "../fixtures/build-ideas";
import ProjectCreatePage from "./ProjectCreatePage";
import NotFoundPage from "./NotFoundPage";
import { pageFrame, routeProject } from "./route.fixtures";

/** Feeds a project's Create page from fixtures. */
export default function ProjectCreatePageFixtures({ route }: { route: PageRoute }) {
  // A prompt from the project Overview, or a draft from adding a component, arrives in router state.
  const routeState = useLocation().state as { prompt?: string; draft?: string } | null;
  const project = routeProject(route);
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;
  return (
    <ProjectCreatePage
      {...pageFrame(route)}
      data={buildCreatePageData(project.id)}
      initialPrompt={routeState?.prompt}
      initialDraft={routeState?.draft}
    />
  );
}
