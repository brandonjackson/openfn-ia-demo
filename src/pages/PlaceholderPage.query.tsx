import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useProject } from "../api/projects";
import { useConnectedSystems } from "../api/connected-systems";
import { apiSystemId } from "../fixtures/ids";
import NotFoundPage from "./NotFoundPage";
import PlaceholderPage from "./PlaceholderPage";
import { pageFrame } from "./route.fixtures";

/**
 * Feeds the placeholder shown wherever the IA has a page that hasn't been
 * built yet. Under a connected system it takes the system's name; under a
 * project, the project has to exist. Both come from the API.
 */
export default function PlaceholderPageQuery({ route }: { route: PageRoute }) {
  const systemId = route.params["connected-system"];
  const projectId = route.params["project"];
  const { status: systemsStatus, systems } = useConnectedSystems();
  const { status: projectStatus, project } = useProject(projectId);
  if (systemId) {
    return (
      <Loaded status={systemsStatus} path={route.currentPath}>
        {() => {
          // By its id, or an old link by its slug.
          const system = systems.find((s) => s.id === systemId || s.id === apiSystemId(systemId));
          if (!system) return <NotFoundPage path={route.currentPath} reason="data" />;
          return <PlaceholderPage {...pageFrame(route, { label: system.name, description: system.description })} />;
        }}
      </Loaded>
    );
  }
  if (!projectId) return <PlaceholderPage {...pageFrame(route)} />;
  return <Loaded status={projectStatus} path={route.currentPath}>{() => <PlaceholderPage {...pageFrame(route, {}, project!.name)} />}</Loaded>;
}
