import { useLocation } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useProject } from "../../api/projects";
import { useBuildIdeas } from "../../api/build-ideas";
import { combine } from "../../api/status";
import ProjectCreatePage from "./ProjectCreatePage";
import { pageFrame } from "../../app/page-frame";

/**
 * Feeds a project's Create page from the API: the project, and the starter
 * ideas from the demo's own route (Lightning has no AI building). The page
 * is behind the AI building flag, so the route table leaves it out when
 * that's off.
 */
export default function ProjectCreatePageQuery({ route }: { route: PageRoute }) {
  // A prompt from the project Overview, or a draft from adding a component, arrives in router state.
  const routeState = useLocation().state as { prompt?: string; draft?: string } | null;
  const { status: projectStatus, project } = useProject(route.params["project"]);
  const { status: ideasStatus, ideas } = useBuildIdeas();
  return (
    <Loaded status={combine(projectStatus, ideasStatus)} path={route.currentPath}>
      {() => (
        <ProjectCreatePage
          {...pageFrame(route, {}, project!.name)}
          data={{ ideas }}
          initialPrompt={routeState?.prompt}
          initialDraft={routeState?.draft}
        />
      )}
    </Loaded>
  );
}
