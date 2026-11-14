import { Navigate, useNavigate } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useFlags } from "../../app/feature-flags";
import { useProject } from "../../api/projects";
import { useProjectWorkflows } from "../../api/workflows";
import { useCollectionItems } from "../../api/collections";
import { combine } from "../../api/status";
import { isContentComponentType } from "../../model/project-components";
import ChannelPage from "./ChannelPage";
import ComponentPage from "./ComponentPage";
import NotFoundPage from "../NotFoundPage";
import { componentsFor } from "../../model/component-types";
import { pageFrame } from "../../app/page-frame";
import { channelDraft } from "../channel-records.query";
import { useProjectComponents } from "../component-records.query";
import { useAnnounceOutcome } from "../../app/announce";

/**
 * Feeds a project component's page, from the API. A channel opens
 * `ChannelPage`: editing, switching it on or off and deleting it go through
 * the API, which refuses a change made over someone else's. A collection
 * opens `ComponentPage` with its keys, which editors write and delete, and
 * which owners and admins rename or delete. A form, artifact, AI skill,
 * document or static website opens `ComponentPage` with its file, which
 * editors save, rename or delete. A workflow (even by an old URL) opens the
 * full-screen editor, and a kind the feature flags turn off isn't there.
 * An old link by a fixture component's slug is sent on by routing
 * (`src/app/component-links.ts`), so this reads no fixtures.
 */
export default function ComponentPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const projectId = route.params["project"];
  const componentId = route.params["component"] ?? "";
  const { status: projectStatus, project } = useProject(projectId);
  const records = useProjectComponents(project);
  const announcing = useAnnounceOutcome();
  const { status: workflowsStatus, workflows } = useProjectWorkflows(projectId);
  const collection = records.collections.find((c) => c.id === componentId);
  const { status: itemsStatus, items } = useCollectionItems(project?.id, collection?.name);

  // Workflows open in the editor.
  const workflow = workflows.find((w) => w.id === componentId);
  if (workflow) return <Navigate to={`/workflow-editor/${workflow.id}`} replace />;

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
              key={componentId}
              {...pageFrame(route, { label: channel.component.name, description: channel.component.description }, project!.name)}
              data={{ projectId: project!.id, projectName: project!.name, component: channel.component, channel: channel.details }}
              draft={channelDraft(channel)}
              takenNames={records.channels.channels.filter((c) => c !== channel).map((c) => c.component.name)}
              credentials={credentialNames}
              onEditChannel={permissions.update_channel ? (draft) => saves.update(channel, draft) : undefined}
              onSetEnabled={
                permissions.update_channel
                  ? (enabled) =>
                      announcing(saves.setEnabled(channel, enabled), {
                        success: `Turned ${channel.component.name} ${enabled ? "on" : "off"}.`,
                        failure: `The channel wasn't turned ${enabled ? "on" : "off"}`,
                      })
                  : undefined
              }
              onDeleteChannel={
                permissions.delete_channel
                  ? async () => {
                      await announcing(saves.remove(channel.component.id), {
                        success: `Deleted ${channel.component.name}.`,
                        failure: "The channel wasn't deleted",
                      });
                      navigate(listPath);
                    }
                  : undefined
              }
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
              key={componentId}
              {...frame}
              data={{ projectId: project!.id, component, collection: { items, itemCount: collection.itemCount, byteSize: collection.byteSize } }}
              takenNames={takenNames}
              onSaveItem={canEdit ? (key, value) => itemSaves.save(collection.name, key, value) : undefined}
              onDeleteItem={canEdit ? (key) => itemSaves.remove(collection.name, key) : undefined}
              onRenameCollection={records.canManageCollections ? (name) => collectionSaves.rename(project!.id, collection.id, name) : undefined}
              onDelete={
                records.canManageCollections
                  ? async () => {
                      await announcing(collectionSaves.remove(project!.id, collection.id), {
                        success: `Deleted ${component.name}.`,
                        failure: `${component.name} wasn't deleted`,
                      });
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
            key={componentId}
            {...frame}
            data={{ projectId: project!.id, component, content: resource.details }}
            takenNames={takenNames}
            onSaveContent={canEdit ? (content) => saves.saveContent(resource, content) : undefined}
            onEditDetails={canEdit ? (draft) => saves.rename(resource, draft) : undefined}
            onDelete={
              canEdit
                ? async () => {
                    await announcing(saves.remove(resource.component.id), {
                      success: `Deleted ${component.name}.`,
                      failure: `${component.name} wasn't deleted`,
                    });
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
