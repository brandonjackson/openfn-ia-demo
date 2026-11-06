import { Navigate, useNavigate } from "react-router-dom";
import type { PageRoute } from "../app/ia-utils";
import Loaded from "../app/Loaded";
import { useFlags } from "../app/feature-flags";
import { useProject } from "../api/projects";
import { useProjectWorkflows } from "../api/workflows";
import { useCollectionItems } from "../api/collections";
import { combine } from "../api/status";
import { fixtureProject, fixtureWorkflow } from "../fixtures/projects";
import { apiChannelId, apiCollectionId, apiComponentId, apiWorkflowId } from "../fixtures/ids";
import { isContentComponentType } from "../model/project-components";
import ChannelPage from "./ChannelPage";
import ComponentPage from "./ComponentPage";
import NotFoundPage from "./NotFoundPage";
import { componentsFor } from "./flagged.fixtures";
import { pageFrame } from "./route.fixtures";
import { channelDraft } from "./channel-records.query";
import { useProjectComponents } from "./component-records.query";

/**
 * Feeds a project component's page, from the API. A channel opens
 * `ChannelPage`: editing, switching it on or off and deleting it go through
 * the API, which refuses a change made over someone else's. A collection
 * opens `ComponentPage` with its keys, which editors write and delete, and
 * which owners and admins rename or delete. A form, artifact, AI skill,
 * document or static website opens `ComponentPage` with its file, which
 * editors save, rename or delete. A workflow (even by an old URL) opens the
 * full-screen editor, and a kind the feature flags turn off isn't there. An
 * old link by a fixture component's slug still lands.
 */
export default function ComponentPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const projectId = route.params["project"];
  const componentId = route.params["component"] ?? "";
  const { status: projectStatus, project } = useProject(projectId);
  const records = useProjectComponents(project);
  const { status: workflowsStatus, workflows } = useProjectWorkflows(projectId);
  const collection = records.collections.find((c) => c.id === componentId);
  const { status: itemsStatus, items } = useCollectionItems(project?.id, collection?.name);
  const fixture = fixtureProject(projectId);

  // Workflows open in the editor, whether named by id or by an old slug.
  const workflow = workflows.find((w) => w.id === componentId) ?? (fixtureWorkflow(componentId) && workflows.find((w) => w.id === apiWorkflowId(componentId)));
  if (workflow) return <Navigate to={`/workflow-editor/${workflow.id}`} replace />;
  // An old link by a fixture component's slug.
  const legacy = fixture?.components.find((c) => c.id === componentId && c.type !== "Workflow");
  if (fixture && legacy) {
    const id =
      legacy.type === "Channel"
        ? apiChannelId(fixture.id, legacy.id)
        : legacy.type === "Collection"
          ? apiCollectionId(fixture.id, legacy.name)
          : apiComponentId(fixture.id, legacy.id);
    return <Navigate to={route.currentPath.replace(componentId, id)} replace />;
  }

  return (
    <Loaded status={combine(projectStatus, records.status, workflowsStatus, itemsStatus)} path={route.currentPath}>
      {() => {
        const listPath = `/projects/${project!.id}/components`;
        const permissions = project!.permissions ?? {};
        // Editors and up change a project's components, as they do its workflows.
        const canEdit = !!permissions.edit_workflow;
        const channel = records.channels.channels.find((c) => c.component.id === componentId);
        if (channel) {
          const { saves, credentialNames } = records.channels;
          const workflowPath = channel.details.workflowId ? `/workflow-editor/${channel.details.workflowId}` : undefined;
          return (
            <ChannelPage
              {...pageFrame(route, { label: channel.component.name, description: channel.component.description }, project!.name)}
              data={{ pageType: "channel", projectId: project!.id, projectName: project!.name, component: channel.component, channel: channel.details }}
              draft={channelDraft(channel)}
              takenNames={records.channels.channels.filter((c) => c !== channel).map((c) => c.component.name)}
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

        const component = records.items.find((c) => c.id === componentId);
        if (!component) return <NotFoundPage path={route.currentPath} reason="data" />;
        // A component whose kind the feature flags turn off isn't there.
        if (componentsFor([component], flags).length === 0) {
          return <NotFoundPage path={route.currentPath} reason="flag" feature={`${component.type} components`} />;
        }
        const frame = pageFrame(route, { label: component.name, description: component.description }, project!.name);
        const takenNames = records.items.filter((c) => c.type === component.type && c.id !== component.id).map((c) => c.name);

        if (collection) {
          const { collections: collectionSaves, items: itemSaves } = records.saves;
          return (
            <ComponentPage
              {...frame}
              data={{ pageType: "component", projectId: project!.id, component, collection: { items, itemCount: collection.itemCount, byteSize: collection.byteSize } }}
              takenNames={takenNames}
              onSaveItem={canEdit ? (key, value) => itemSaves.save(collection.name, key, value) : undefined}
              onDeleteItem={canEdit ? (key) => itemSaves.remove(collection.name, key) : undefined}
              onRenameCollection={records.canManageCollections ? (name) => collectionSaves.rename(project!.id, collection.id, name) : undefined}
              onDelete={
                records.canManageCollections
                  ? async () => {
                      await collectionSaves.remove(project!.id, collection.id);
                      navigate(listPath);
                    }
                  : undefined
              }
            />
          );
        }

        const resource = records.contents.find((c) => c.component.id === componentId);
        if (!resource || !isContentComponentType(component.type)) return <NotFoundPage path={route.currentPath} reason="data" />;
        const saves = records.saves.components;
        return (
          <ComponentPage
            {...frame}
            data={{ pageType: "component", projectId: project!.id, component, content: resource.details }}
            takenNames={takenNames}
            onSaveContent={canEdit ? (content) => saves.saveContent(resource, content) : undefined}
            onEditDetails={canEdit ? (draft) => saves.rename(resource, draft) : undefined}
            onDelete={
              canEdit
                ? async () => {
                    await saves.remove(resource.component.id);
                    navigate(listPath);
                  }
                : undefined
            }
          />
        );
      }}
    </Loaded>
  );
}
