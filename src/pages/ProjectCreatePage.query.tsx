import { useLocation } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useProject } from "../api/projects";
import { buildCreatePageData } from "../fixtures/build-ideas";
import ProjectCreatePage from "./ProjectCreatePage";
import { pageFrame } from "./route.fixtures";

/** Feeds a project's Create page: the project from the API, and the ideas from fixtures. */
export default function ProjectCreatePageQuery({ route }: { route: PageRoute }) {
  // A prompt from the project Overview, or a draft from adding a component, arrives in router state.
  const routeState = useLocation().state as { prompt?: string; draft?: string } | null;
  const { status, project } = useProject(route.params["project"]);
  return (
    <Loaded status={status} path={route.currentPath}>
      {() => (
        <ProjectCreatePage
          {...pageFrame(route, {}, project!.name)}
          data={buildCreatePageData(project!.id)}
          initialPrompt={routeState?.prompt}
          initialDraft={routeState?.draft}
        />
      )}
    </Loaded>
  );
}
