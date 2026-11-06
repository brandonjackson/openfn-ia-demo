import { Navigate, useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useFlags } from "../app/feature-flags";
import { useProject } from "../api/projects";
import { useProjectWorkflows } from "../api/workflows";
import { combine } from "../api/status";
import { fixtureProject, fixtureWorkflow } from "../fixtures/projects";
import { apiChannelId, apiWorkflowId } from "../fixtures/ids";
import ChannelPage from "./ChannelPage";
import NotFoundPage from "./NotFoundPage";
import PlaceholderPage from "./PlaceholderPage";
import { componentsFor } from "./flagged.fixtures";
import { pageFrame } from "./route.fixtures";
import { channelDraft, useProjectChannels } from "./channel-records.query";

/**
 * Feeds a project component's page. A channel comes from the API: editing,
 * switching it on or off and deleting it go through the API, which refuses a
 * change made over someone else's. A workflow (even by an old URL) opens the
 * full-screen editor; any other kind of component shows the placeholder,
 * under its own name, until it has a page of its own. An old link by a
 * fixture channel's slug still lands.
 */
export default function ChannelPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const projectId = route.params["project"];
  const componentId = route.params["component"] ?? "";
  const { status: projectStatus, project } = useProject(projectId);
  const { status, channels, credentialNames, saves } = useProjectChannels(projectId);
  const { status: workflowsStatus, workflows } = useProjectWorkflows(projectId);
  const fixture = fixtureProject(projectId);

  // Workflows open in the editor, whether named by id or by an old slug.
  const workflow = workflows.find((w) => w.id === componentId) ?? (fixtureWorkflow(componentId) && workflows.find((w) => w.id === apiWorkflowId(componentId)));
  if (workflow) return <Navigate to={`/workflow-editor/${workflow.id}`} replace />;
  // An old link by a fixture channel's slug.
  if (fixture && fixture.components.some((c) => c.id === componentId && c.type === "Channel")) {
    return <Navigate to={route.currentPath.replace(componentId, apiChannelId(fixture.id, componentId))} replace />;
  }

  return (
    <Loaded status={combine(projectStatus, status, workflowsStatus)} path={route.currentPath}>
      {() => {
        const channel = channels.find((c) => c.component.id === componentId);
        if (channel) {
          const listPath = `/projects/${project!.id}/components`;
          const workflowPath = channel.details.workflowId ? `/workflow-editor/${channel.details.workflowId}` : undefined;
          return (
            <ChannelPage
              {...pageFrame(route, { label: channel.component.name, description: channel.component.description }, project!.name)}
              data={{ pageType: "channel", projectId: project!.id, projectName: project!.name, component: channel.component, channel: channel.details }}
              draft={channelDraft(channel)}
              takenNames={channels.filter((c) => c !== channel).map((c) => c.component.name)}
              credentials={credentialNames}
              onEditChannel={(draft) => saves.update(channel, draft)}
              onSetEnabled={(enabled) => saves.setEnabled(channel, enabled)}
              onDeleteChannel={async () => {
                await saves.remove(channel.component.id);
                navigate(listPath);
              }}
              onOpenWorkflow={workflowPath ? () => navigate(workflowPath) : undefined}
              onOpenRun={workflowPath ? (runId) => navigate(`${workflowPath}?run=${runId}`) : undefined}
            />
          );
        }
        const component = fixture?.components.find((c) => c.id === componentId && c.type !== "Channel" && c.type !== "Workflow");
        // A component whose kind the feature flags turn off isn't there.
        if (component && componentsFor([component], flags).length === 0) {
          return <NotFoundPage path={route.currentPath} reason="flag" feature={`${component.type} components`} />;
        }
        if (component) return <PlaceholderPage {...pageFrame(route, { label: component.name, description: component.description }, project!.name)} />;
        return <NotFoundPage path={route.currentPath} reason="data" />;
      }}
    </Loaded>
  );
}
