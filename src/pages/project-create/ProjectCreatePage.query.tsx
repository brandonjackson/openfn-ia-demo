import { useLocation, useNavigate } from "react-router-dom";
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
 * that's off. Build makes a new workflow in the project, as "New workflow"
 * does, and hands it the prompt, so the editor opens with the assistant
 * already working on it.
 */
export default function ProjectCreatePageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  // A draft from adding a component arrives in router state.
  const routeState = useLocation().state as { draft?: string } | null;
  const { status: projectStatus, project } = useProject(route.params["project"]);
  const { status: ideasStatus, ideas } = useBuildIdeas();
  return (
    <Loaded status={combine(projectStatus, ideasStatus)} path={route.currentPath}>
      {() => (
        <ProjectCreatePage
          {...pageFrame(route, {}, project!.name)}
          data={{ ideas }}
          initialDraft={routeState?.draft}
          onBuild={(prompt) => navigate(`/workflow-editor/new?project=${project!.id}`, { state: { prompt } })}
        />
      )}
    </Loaded>
  );
}
