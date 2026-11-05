import { Navigate, useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import { projects } from "../fixtures/projects";
import { saveChannels, useSavedChannels } from "../app/channel-state";
import { projectCredentials } from "../fixtures/adaptor-reference";
import { channelDraft, editChannel, fixtureChannels } from "./channel-records.fixtures";
import ChannelPage from "./ChannelPage";
import NotFoundPage from "./NotFoundPage";
import { useFlags } from "../app/feature-flags";
import { componentsFor } from "./flagged.fixtures";
import PlaceholderPage from "./PlaceholderPage";
import { pageFrame, routeProject } from "./route.fixtures";

/**
 * Feeds a project component's page from fixtures. A channel gets its channel
 * page; any other kind of component shows the placeholder, under its own
 * name, until it has a page of its own. Opening a workflow (even by a direct
 * or old URL) drops you into the full-screen editor instead.
 */
export default function ChannelPageFixtures({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const project = routeProject(route);
  const saved = useSavedChannels(project?.id ?? "");
  const componentMatch = route.currentPath.match(/^\/projects\/[^/]+\/components\/([^/]+)$/);
  if (componentMatch) {
    const componentId = componentMatch[1];
    const isWorkflow = projects.some((p) =>
      p.components.some((c) => c.id === componentId && c.type === "Workflow")
    );
    if (isWorkflow) return <Navigate to={`/workflow-editor/${componentId}`} replace />;
  }

  if (!project) return <NotFoundPage path={route.currentPath} reason="data" />;
  // Channels made, edited or deleted this session stand in for the fixtures' own.
  const channels = saved ?? fixtureChannels(project);
  const record = channels.find((c) => c.component.id === route.params["component"]);
  const component = record?.component ?? project.components.find((c) => c.id === route.params["component"] && c.type !== "Channel");

  if (record) {
    const channel = record.details;
    const save = (next: typeof channels) => saveChannels(project.id, next);
    const listPath = `/projects/${project.id}/components`;
    const workflowPath = channel.workflowId ? `/workflow-editor/${channel.workflowId}` : undefined;
    return (
      <ChannelPage
        {...pageFrame(route, { label: record.component.name, description: record.component.description })}
        data={{
          pageType: "channel",
          projectId: project.id,
          projectName: project.name,
          component: record.component,
          channel,
        }}
        draft={channelDraft(record)}
        takenNames={channels.filter((c) => c !== record).map((c) => c.component.name)}
        credentials={projectCredentials.map((c) => c.name)}
        onEditChannel={async (draft) => save(channels.map((c) => (c === record ? editChannel(c, draft) : c)))}
        onSetEnabled={async (enabled) =>
          save(channels.map((c) => (c === record ? { ...c, details: { ...c.details, enabled } } : c)))
        }
        onDeleteChannel={async () => {
          save(channels.filter((c) => c !== record));
          navigate(listPath);
        }}
        onOpenWorkflow={workflowPath ? () => navigate(workflowPath) : undefined}
        onOpenRun={workflowPath ? (runId) => navigate(`${workflowPath}?run=${runId}`) : undefined}
      />
    );
  }
  // A component whose kind the feature flags turn off isn't there.
  if (component && componentsFor([component], flags).length === 0) {
    return <NotFoundPage path={route.currentPath} reason="flag" feature={`${component.type} components`} />;
  }
  if (component) {
    return <PlaceholderPage {...pageFrame(route, { label: component.name, description: component.description })} />;
  }
  return <PlaceholderPage {...pageFrame(route)} />;
}
