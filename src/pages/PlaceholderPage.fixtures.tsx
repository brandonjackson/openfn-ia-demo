import type { PageRoute } from "../app/ia-utils";
import { connectedSystems } from "../fixtures/connected-systems";
import NotFoundPage from "./NotFoundPage";
import PlaceholderPage from "./PlaceholderPage";
import { pageFrame, routeProject } from "./route.fixtures";

/**
 * Feeds the placeholder shown wherever the IA has a page that hasn't been
 * built yet. Under a connected system it takes the system's name; under a
 * project, the project has to exist.
 */
export default function PlaceholderPageFixtures({ route }: { route: PageRoute }) {
  const systemId = route.params["connected-system"];
  if (systemId) {
    const system = connectedSystems.find((s) => s.id === systemId);
    if (!system) return <NotFoundPage path={route.currentPath} reason="data" />;
    return <PlaceholderPage {...pageFrame(route, { label: system.name, description: system.description })} />;
  }
  if (routeProject(route) === null) return <NotFoundPage path={route.currentPath} reason="data" />;
  return <PlaceholderPage {...pageFrame(route)} />;
}
