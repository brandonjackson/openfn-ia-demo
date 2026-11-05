import { Navigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import { projects } from "../fixtures/projects";
import { channelDetails } from "../fixtures/channels";
import ChannelPage from "./ChannelPage";
import NotFoundPage from "./NotFoundPage";
import PlaceholderPage from "./PlaceholderPage";
import { pageFrame, routeProject } from "./route.fixtures";

/**
 * Feeds a project component's page from fixtures. A channel gets its channel
 * page; any other kind of component shows the placeholder, under its own
 * name, until it has a page of its own. Opening a workflow (even by a direct
 * or old URL) drops you into the full-screen editor instead.
 */
export default function ChannelPageFixtures({ route }: { route: PageRoute }) {
  const componentMatch = route.currentPath.match(/^\/projects\/[^/]+\/components\/([^/]+)$/);
  if (componentMatch) {
    const componentId = componentMatch[1];
    const isWorkflow = projects.some((p) =>
      p.components.some((c) => c.id === componentId && c.type === "Workflow")
    );
    if (isWorkflow) return <Navigate to={`/workflow-editor/${componentId}`} replace />;
  }

  const project = routeProject(route);
  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;
  const component = project.components.find((c) => c.id === route.params["component"]);

  if (component?.type === "Channel") {
    return (
      <ChannelPage
        {...pageFrame(route, { label: component.name, description: component.description })}
        data={{
          pageType: "channel",
          projectId: project.id,
          projectName: project.name,
          component,
          channel: channelDetails(component),
        }}
      />
    );
  }
  if (component) {
    return <PlaceholderPage {...pageFrame(route, { label: component.name, description: component.description })} />;
  }
  return <PlaceholderPage {...pageFrame(route)} />;
}
